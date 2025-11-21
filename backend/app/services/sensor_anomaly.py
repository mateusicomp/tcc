from datetime import datetime
from typing import Dict, List, Any, Tuple

import numpy as np

from .firestore import fetch_sensor_events
from .autocloud_core import AutoCloud


# ---------------------------
# 1. Codificação dos eventos
# ---------------------------

def _encode_event(event: Dict, last_timestamp_by_sensor: Dict[str, datetime]) -> np.ndarray:
    """
    Converte um evento do Firestore em um vetor numérico para o AutoCloud.

    event: {
      "sensor": "baixo" | "alto",
      "estado": "subiu" | "desceu",
      "timestamp": datetime (timezone-aware)
    }
    """

    sensor_str = (event.get("sensor") or "").strip().lower()
    estado_str = (event.get("estado") or "").strip().lower()
    ts: datetime = event.get("timestamp")

    # 0 = baixo, 1 = alto
    if sensor_str == "alto":
        sensor_num = 1.0
    else:
        sensor_num = 0.0

    # -1 = desceu, +1 = subiu
    if estado_str == "subiu":
        estado_num = 1.0
    else:
        estado_num = -1.0

    # delta t em segundos desde o ÚLTIMO evento desse mesmo sensor
    last_ts = last_timestamp_by_sensor.get(sensor_str)
    if last_ts is None:
        delta_t = 0.0
    else:
        delta_t = (ts - last_ts).total_seconds()

    last_timestamp_by_sensor[sensor_str] = ts

    # Podemos normalizar ou apenas usar log(1 + delta_t) para ficar mais suave
    delta_t_feat = np.log1p(delta_t)  # log(1 + x)

    return np.array([sensor_num, estado_num, delta_t_feat], dtype=float)


# -----------------------------------------
# 2. Treinar / rodar o AutoCloud nos dados
# -----------------------------------------

def run_autocloud_on_events(events: List[Dict], m: float = 2.5) -> Tuple[AutoCloud, List[int]]:
    """
    Executa o AutoCloud em cima da sequência de eventos.

    Retorna:
      - o objeto AutoCloud (com as nuvens aprendidas)
      - a lista de índices de classe para cada evento
    """
    if not events:
        return AutoCloud(m), []

    auto = AutoCloud(m)
    last_timestamp_by_sensor: Dict[str, datetime] = {}

    for ev in events:
        x = _encode_event(ev, last_timestamp_by_sensor)
        auto.run(x)

    return auto, list(auto.classIndex)


# -------------------------------------------------
# 3. Regras físicas de consistência (baixo/alto)
# -------------------------------------------------

def detect_rule_based_inconsistencies(events: List[Dict]) -> List[Dict[str, Any]]:
    """
    Aplica REGRAS LÓGICAS baseadas na física do sistema:

    - Sensor 'alto' não pode subir ('subiu') se o 'baixo' ainda está 'desceu'
    - Sensor 'baixo' não pode descer ('desceu') se o 'alto' está 'subiu'
    - Em geral: como 'alto' é fisicamente acima de 'baixo', não pode haver
      estado 'alto=subiu' com 'baixo=desceu' ao mesmo tempo.

    Retorna uma lista de alertas com explicação.
    """
    alerts: List[Dict[str, Any]] = []

    # Estado atual de cada sensor (inicialmente desconhecido)
    current_state = {
        "baixo": None,  # "subiu" | "desceu" | None
        "alto": None,
    }

    for ev in events:
        sensor = (ev.get("sensor") or "").strip().lower()
        estado = (ev.get("estado") or "").strip().lower()
        ts: datetime = ev.get("timestamp")

        # Estado anterior (antes de aplicar este evento)
        prev_low = current_state.get("baixo")
        prev_high = current_state.get("alto")

        # Regras:

        # 1) Se o sensor ALTO subir, o sensor BAIXO já deveria estar subido.
        if sensor == "alto" and estado == "subiu":
            if prev_low is not None and prev_low != "subiu":
                alerts.append({
                    "tipo": "inconsistencia_sequencia",
                    "descricao": (
                        "Sensor ALTO subiu enquanto o sensor BAIXO ainda não havia subido. "
                        "Isso não é fisicamente coerente com o enchimento da caixa."
                    ),
                    "evento_problema": ev,
                    "estado_anterior": {"baixo": prev_low, "alto": prev_high},
                    "timestamp": ts,
                })

        # 2) Se o sensor BAIXO descer, o sensor ALTO não pode estar subido.
        if sensor == "baixo" and estado == "desceu":
            if prev_high == "subiu":
                alerts.append({
                    "tipo": "inconsistencia_sequencia",
                    "descricao": (
                        "Sensor BAIXO desceu enquanto o sensor ALTO ainda estava subido. "
                        "Isso sugere leitura incorreta ou problema na boia alta."
                    ),
                    "evento_problema": ev,
                    "estado_anterior": {"baixo": prev_low, "alto": prev_high},
                    "timestamp": ts,
                })

        # Atualiza o estado atual com o novo evento:
        if sensor in current_state:
            current_state[sensor] = estado

    return alerts


# ---------------------------------------------------------
# 4. Detecção de anomalias com AutoCloud + Regras
# ---------------------------------------------------------

def detect_intelligent_alerts(period: str = "7d") -> Dict[str, Any]:
    """
    Pipeline completo:
      1. Busca eventos no Firestore (já em ordem cronológica)
      2. Aplica AutoCloud para aprender padrões típicos de sequência
      3. Aplica regras lógicas de consistência física
      4. Junta tudo em um dicionário de retorno
    """
    events = fetch_sensor_events(period=period)

    # 2. AutoCloud
    auto, labels = run_autocloud_on_events(events, m=2.5)

    # Ideia simples de anomalia: classes muito raras (poucas ocorrências)
    class_counts: Dict[int, int] = {}
    for c in labels:
        class_counts[c] = class_counts.get(c, 0) + 1

    # Define como "raro" tudo que aparece menos que, por ex., 1% dos eventos
    total = max(len(labels), 1)
    rare_threshold = max(int(0.01 * total), 1)
    rare_classes = {c for c, count in class_counts.items() if count <= rare_threshold}

    autocloud_anomalies: List[Dict[str, Any]] = []
    for ev, c in zip(events, labels):
        if c in rare_classes:
            autocloud_anomalies.append({
                "tipo": "autocloud_anomalia",
                "classe": int(c),
                "descricao": (
                    "Evento associado a uma nuvem de dados rara segundo o AutoCloud, "
                    "potencialmente caracterizando um comportamento atípico do sistema."
                ),
                "evento": ev,
            })

    # 3. Regras físicas
    rule_alerts = detect_rule_based_inconsistencies(events)

    return {
        "periodo_analisado": period,
        "total_eventos": len(events),
        "total_classes_autocloud": len(class_counts),
        "rare_classes": list(map(int, rare_classes)),
        "autocloud_anomalies": autocloud_anomalies,
        "rule_based_alerts": rule_alerts,
    }
