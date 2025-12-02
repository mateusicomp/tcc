import os
import re
from datetime import datetime
from typing import List, Dict, Tuple
from langchain_ollama import ChatOllama
from app.schemas.dto import AquaIntent
from app.services.firestore import fetch_sensor_events


# ----------------- AJUDANTES DE PERÍODO ----------------- #

def parse_period_from_text(text: str) -> str:
    """
    Converte expressões em português em códigos de período:

    - "últimos 2 dias", "nos últimos dois dias" -> "2d"
    - "últimos 20 dias"                         -> "20d"
    - "essa semana", "nesta semana"             -> "this_week"
    - "nesse mês", "neste mês", "esse mês"      -> "this_month"
    - fallback -> "7d"
    """
    t = text.lower()

    # número explícito de dias
    m = re.search(r"(\d+)\s*dias?", t)
    if m:
        return f"{m.group(1)}d"

    # semana
    if "essa semana" in t or "nesta semana" in t or "nessa semana" in t:
        return "this_week"

    # mês atual
    if "nesse mês" in t or "neste mês" in t or "esse mês" in t:
        return "this_month"

    # "últimos dias" sem número -> assuma 7d
    if "últimos dias" in t:
        return "7d"

    # casos mais comuns explícitos
    if "últimos 7 dias" in t or "últimos sete dias" in t:
        return "7d"
    if "últimos 30 dias" in t or "últimos trinta dias" in t:
        return "30d"
    if "últimos 90 dias" in t or "últimos noventa dias" in t:
        return "90d"

    # fallback
    return "7d"


def period_human_label(period: str) -> str:
    """Só para escrever bonito na resposta."""
    p = (period or "").lower()
    if p.endswith("d") and p[:-1].isdigit():
        dias = int(p[:-1])
        if dias == 1:
            return "no último dia"
        return f"nos últimos {dias} dias"
    if p == "this_week":
        return "nesta semana"
    if p == "this_month":
        return "neste mês"
    return f"no período ({period})"


# ----------------- LLM PARA INTENÇÃO ----------------- #

def _get_intent_llm() -> ChatOllama:
    """
    Cria o modelo Ollama via LangChain com saída estruturada AquaIntent.
    """
    base_llm = ChatOllama(
        model=os.getenv("OLLAMA_MODEL", "qwen2:0.5b"),
        temperature=0.0,
        base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
        num_predict=256,
    )
    # LangChain converte a resposta diretamente em AquaIntent
    return base_llm.with_structured_output(AquaIntent)


def detect_intent(question: str) -> AquaIntent:
    """
    Usa a LLM (via LangChain) para inferir a intenção da pergunta.
    Depois aplica regras de período pra garantir que period não fique em branco.
    """
    llm = _get_intent_llm()

    system_prompt = (
        "Você é um classificador de perguntas do sistema AquaMonitor.\n"
        "Receba perguntas em português sobre sensores de nível (alto/baixo) e reservatórios.\n"
        "Preencha o modelo AquaIntent com os campos corretos.\n\n"
        "Regras de mapeamento (kind):\n"
        "- Se o usuário pedir um resumo geral de eventos -> kind='summary_all'.\n"
        "- Se pedir resumo focado em nível baixo -> kind='summary_low', sensor='baixo'.\n"
        "- Se perguntar 'quantas vezes os sensores emitiram eventos' -> kind='count_events_all'.\n"
        "- Se perguntar 'quantas vezes a caixa ficou vazia' (sensor baixo desceu) -> kind='count_low', sensor='baixo', estado='desceu'.\n"
        "- Se perguntar 'quantas vezes a caixa ficou cheia' (sensor alto subiu) -> kind='count_full', sensor='alto', estado='subiu'.\n"
        "- Se perguntar 'quanto tempo a caixa ficou vazia' -> kind='duration_empty', sensor='baixo'.\n"
        "- Se perguntar 'quanto tempo a caixa ficou cheia' -> kind='duration_full', sensor='alto'.\n"
        "- Se não tiver certeza -> kind='unknown'.\n\n"
        "Regras de período (period):\n"
        "- 'nos últimos 2 dias', 'nos últimos dois dias' -> '2d'.\n"
        "- 'nos últimos 20 dias' -> '20d'.\n"
        "- 'nos últimos 30 dias' -> '30d'.\n"
        "- 'essa semana', 'nesta semana' -> 'this_week'.\n"
        "- 'nesse mês', 'neste mês', 'esse mês' -> 'this_month'.\n"
        "- Se o usuário só disser 'últimos dias' sem número -> '7d'.\n"
        "- Se não entender, deixe period=None e o backend ajusta.\n\n"
        "Não invente sensores que não existem. Use apenas 'baixo' ou 'alto' quando fizer sentido.\n"
    )

    messages = [
        ("system", system_prompt),
        ("human", question),
    ]

    intent: AquaIntent = llm.invoke(messages)

    # força período a partir de regras se veio vazio ou estranho
    if not intent.period:
        intent.period = parse_period_from_text(question)

    # fallback final
    if not intent.period:
        intent.period = "7d"

    return intent


# ----------------- CÁLCULOS EM CIMA DOS EVENTOS ----------------- #

def _compute_summary(events: List[Dict], only_sensor: str | None = None) -> Dict:
    total = 0
    by_sensor = {}
    by_estado = {}

    for e in events:
        sensor = str(e.get("sensor") or "").strip().lower()
        estado = str(e.get("estado") or "").strip().lower()

        if only_sensor and sensor != only_sensor:
            continue

        total += 1
        by_sensor[sensor] = by_sensor.get(sensor, 0) + 1
        by_estado[estado] = by_estado.get(estado, 0) + 1

    return {
        "total": total,
        "by_sensor": by_sensor,
        "by_estado": by_estado,
    }


def _format_duration(seconds: float) -> str:
    if seconds <= 0:
        return "0 minutos"
    minutos = int(seconds // 60)
    horas = minutos // 60
    minutos = minutos % 60
    dias = horas // 24
    horas = horas % 24

    partes = []
    if dias:
        partes.append(f"{dias} dia(s)")
    if horas:
        partes.append(f"{horas} hora(s)")
    if minutos:
        partes.append(f"{minutos} minuto(s)")
    return " e ".join(partes)


def _duration_for_sensor_state(
    events: List[Dict],
    sensor_alvo: str,
    estado_down: str,
    estado_up: str,
) -> float:
    """
    Calcula o tempo total (em segundos) em que o sensor_alvo ficou no estado "baixo" ou "alto",
    considerando pares estado_down -> estado_up.

    Exemplo:
    - Para caixa vazia: sensor='baixo', estado_down='desceu', estado_up='subiu'.
    """
    # ordena cronologicamente
    events_sorted = sorted(events, key=lambda e: e.get("timestamp"))

    last_down_ts: datetime | None = None
    total_seconds = 0.0

    for e in events_sorted:
        sensor = str(e.get("sensor") or "").strip().lower()
        estado = str(e.get("estado") or "").strip().lower()
        ts = e.get("timestamp")

        if not isinstance(ts, datetime):
            continue

        if sensor == sensor_alvo and estado == estado_down:
            last_down_ts = ts

        elif sensor == sensor_alvo and estado == estado_up:
            if last_down_ts is not None:
                total_seconds += (ts - last_down_ts).total_seconds()
                last_down_ts = None

    # se terminar o período ainda "baixo"/"alto", poderíamos opcionalmente contar até o fim do período;
    # por simplicidade, vamos ignorar esse caso por enquanto.
    return total_seconds


# ----------------- FUNÇÃO PRINCIPAL USADA PELO ENDPOINT ----------------- #

def handle_analytics_question(question: str) -> Tuple[str, AquaIntent]:
    """
    Fluxo completo:
    1) Detecta intenção com LangChain + AquaIntent.
    2) Carrega eventos do Firestore no período.
    3) Executa o cálculo adequado.
    4) Monta uma resposta textual.
    """
    intent = detect_intent(question)
    period = intent.period or "7d"
    label_period = period_human_label(period)

    # Busca eventos no Firestore
    events = fetch_sensor_events(period)

    # Se a LLM não souber o que fazer:
    if intent.kind == "unknown":
        return (
            "Ainda não consegui entender bem o tipo de análise que você quer. "
            "Tente perguntar, por exemplo: "
            "'Quantas vezes a caixa ficou vazia nos últimos 20 dias?' "
            "ou 'Me dê um resumo dos eventos nesta semana'.",
            intent,
        )

    # -------- summary_all --------
    if intent.kind == "summary_all":
        summary = _compute_summary(events)
        linhas = [
            f"Resumo de eventos {label_period}:",
            f"- Total de eventos registrados: {summary['total']}",
            "",
            "Por sensor:",
        ]
        for sensor, cnt in summary["by_sensor"].items():
            linhas.append(f"  • {sensor}: {cnt} evento(s)")
        linhas.append("")
        linhas.append("Por estado:")
        for estado, cnt in summary["by_estado"].items():
            linhas.append(f"  • {estado}: {cnt} evento(s)")
        return ("\n".join(linhas), intent)

    # -------- summary_low --------
    if intent.kind == "summary_low":
        summary = _compute_summary(events, only_sensor="baixo")
        linhas = [
            f"Resumo do sensor de nível BAIXO {label_period}:",
            f"- Total de eventos do sensor baixo: {summary['total']}",
        ]
        if summary["total"] > 0:
            linhas.append("Por estado:")
            for estado, cnt in summary["by_estado"].items():
                linhas.append(f"  • {estado}: {cnt} evento(s)")
        return ("\n".join(linhas), intent)

    # -------- count_events_all --------
    if intent.kind == "count_events_all":
        total = len(events)
        resposta = (
            f"{label_period}, todos os sensores registraram um total de "
            f"{total} evento(s) (considerando alto/baixo, subiu/desceu)."
        )
        return resposta, intent

    # -------- count_low -------- (sensor baixo DESCEU)
    if intent.kind == "count_low":
        cnt = sum(
            1
            for e in events
            if str(e.get("sensor") or "").strip().lower() == "baixo"
            and str(e.get("estado") or "").strip().lower() == "desceu"
        )
        resposta = (
            f"{label_period}, a caixa ficou VAZIA (sensor baixo DESCEU) "
            f"{cnt} vez(es)."
        )
        return resposta, intent

    # -------- count_full -------- (sensor alto SUBIU)
    if intent.kind == "count_full":
        cnt = sum(
            1
            for e in events
            if str(e.get("sensor") or "").strip().lower() == "alto"
            and str(e.get("estado") or "").strip().lower() == "subiu"
        )
        resposta = (
            f"{label_period}, a caixa ficou CHEIA (sensor alto SUBIU) "
            f"{cnt} vez(es)."
        )
        return resposta, intent

    # -------- duration_empty -------- (tempo caixa vazia)
    if intent.kind == "duration_empty":
        seconds = _duration_for_sensor_state(
            events,
            sensor_alvo="baixo",
            estado_down="desceu",
            estado_up="subiu",
        )
        resposta = (
            f"{label_period}, a caixa ficou VAZIA por aproximadamente "
            f"{_format_duration(seconds)} no total."
        )
        return resposta, intent

    # -------- duration_full -------- (tempo caixa cheia)
    if intent.kind == "duration_full":
        seconds = _duration_for_sensor_state(
            events,
            sensor_alvo="alto",
            estado_down="subiu",
            estado_up="desceu",
        )
        resposta = (
            f"{label_period}, a caixa ficou CHEIA por aproximadamente "
            f"{_format_duration(seconds)} no total."
        )
        return resposta, intent

    # fallback genérico
    return (
        "Ainda não implementei este tipo de análise, mas já entendi que você quer algo mais avançado. "
        "Podemos adicionar novos tipos de relatório facilmente no backend.",
        intent,
    )
