import os
from datetime import datetime
from threading import Lock
from typing import Any, Dict, Optional
import numpy as np
from firebase_admin import firestore
from .autocloud_core import AutoCloud
from .firestore import _init_firebase_admin_once


ALERTS_COLLECTION = os.getenv("FIRESTORE_ALERTS_COLLECTION", "alerts")


class SensorRealtimeEngine:
    """
    Mantém um AutoCloud em memória + estado atual dos sensores.
    É usado pelo webhook para processar CADA evento novo.
    """

    def __init__(self, m: float = 2.5, rare_min_count: int = 3):
        self.auto = AutoCloud(m)
        self.lock = Lock()

        self.last_timestamp_by_sensor: Dict[str, datetime] = {}
        self.current_state: Dict[str, Optional[str]] = {
            "baixo": None,
            "alto": None,
        }

        # Contagem por classe para tentar marcar classes raras
        self.class_counts: Dict[int, int] = {}
        self.rare_min_count = rare_min_count

    # ---------- ENCODE EVENTO EM VETOR NUMÉRICO ----------

    def _encode_event(self, event: Dict[str, Any]) -> np.ndarray:
        sensor_str = (event.get("sensor") or "").strip().lower()
        estado_str = (event.get("estado") or "").strip().lower()
        ts: datetime = event["timestamp"]  # já garantido pelo Pydantic

        # 0 = baixo, 1 = alto
        sensor_num = 1.0 if sensor_str == "alto" else 0.0

        # -1 = desceu, +1 = subiu
        estado_num = 1.0 if estado_str == "subiu" else -1.0

        last_ts = self.last_timestamp_by_sensor.get(sensor_str)
        if last_ts is None:
            delta_t = 0.0
        else:
            delta_t = (ts - last_ts).total_seconds()

        self.last_timestamp_by_sensor[sensor_str] = ts

        delta_t_feat = np.log1p(delta_t)  # log(1 + x) para suavizar

        return np.array([sensor_num, estado_num, delta_t_feat], dtype=float)

    # ---------- REGRAS FÍSICAS (baixo/alto, subiu/desceu) ----------

    def _check_rule_based(self, event: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        sensor = (event.get("sensor") or "").strip().lower()
        estado = (event.get("estado") or "").strip().lower()
        ts: datetime = event["timestamp"]

        prev_low = self.current_state.get("baixo")
        prev_high = self.current_state.get("alto")

        alert: Optional[Dict[str, Any]] = None

        # regra 1: ALTO subiu mas BAIXO ainda não subiu
        if sensor == "alto" and estado == "subiu":
            if prev_low is not None and prev_low != "subiu":
                alert = {
                    "tipo": "inconsistencia_sequencia",
                    "descricao": (
                        "Sensor ALTO 'subiu' enquanto o sensor BAIXO ainda não "
                        "estava 'subiu'. Isso é inconsistente com o enchimento da caixa."
                    ),
                    "evento_problema": event,
                    "estado_anterior": {"baixo": prev_low, "alto": prev_high},
                    "timestamp": ts,
                }

        # regra 2: BAIXO desceu mas ALTO ainda está subido
        if sensor == "baixo" and estado == "desceu":
            if prev_high == "subiu":
                alert = {
                    "tipo": "inconsistencia_sequencia",
                    "descricao": (
                        "Sensor BAIXO 'desceu' enquanto o sensor ALTO ainda estava "
                        "'subiu'. Isso sugere leitura incorreta ou problema na boia alta."
                    ),
                    "evento_problema": event,
                    "estado_anterior": {"baixo": prev_low, "alto": prev_high},
                    "timestamp": ts,
                }

        # Atualiza estado atual
        if sensor in self.current_state:
            self.current_state[sensor] = estado

        return alert

    # ---------- SALVAR ALERTA NO FIRESTORE ----------

    def _save_alert(self, alert: Dict[str, Any]) -> None:
        _init_firebase_admin_once()
        db = firestore.client()
        db.collection(ALERTS_COLLECTION).add(alert)

    # ---------- PROCESSAR EVENTO ÚNICO (CHAMADO PELO WEBHOOK) ----------

    def process_event(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processa um único evento (sensor/estado/timestamp).
        Retorna:
           {
             "class_index": int,
             "rule_alert": {...} | None,
             "autocloud_alert": {...} | None
           }
        """
        with self.lock:
            x = self._encode_event(event)
            self.auto.run(x)
            class_idx = int(self.auto.classIndex[-1])

            # atualiza contagem da classe
            self.class_counts[class_idx] = self.class_counts.get(class_idx, 0) + 1

            # regra simples: primeira vez que uma classe aparece -> potencial anomalia
            autocloud_alert: Optional[Dict[str, Any]] = None
            if self.class_counts[class_idx] <= self.rare_min_count and class_idx != 0:
                autocloud_alert = {
                    "tipo": "autocloud_anomalia",
                    "classe": class_idx,
                    "descricao": (
                        "Evento associado a uma nuvem de dados rara segundo o AutoCloud. "
                        "Pode caracterizar um comportamento atípico do sistema."
                    ),
                    "evento": event,
                }

            rule_alert = self._check_rule_based(event)

        # fora do lock, grava os alerts (se existirem)
        if rule_alert is not None:
            self._save_alert(rule_alert)
        if autocloud_alert is not None:
            self._save_alert(autocloud_alert)

        return {
            "class_index": class_idx,
            "rule_alert": rule_alert,
            "autocloud_alert": autocloud_alert,
        }


# Singleton global usado pelo webhook
_engine = SensorRealtimeEngine(m=2.5)


def process_new_sensor_event(event: Dict[str, Any]) -> Dict[str, Any]:
    """
    Função simples que o router vai chamar.
    """
    return _engine.process_event(event)
