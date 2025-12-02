from pydantic import BaseModel, Field
from typing import List, Literal, Optional, Any
from datetime import datetime


# ===== Chat =====
class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(..., description="Histórico no formato OpenAI")
    stream: bool = False
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    content: str
    model: Optional[str] = None
    provider: Optional[str] = None
    usage: Optional[Any] = None

# ===== Reports =====
class ReportRequest(BaseModel):
    period: Literal["7d", "30d", "90d"] = "7d"

class ReportSummary(BaseModel):
    total_events: int
    by_sensor: dict
    by_action: dict

class ReportResponse(BaseModel):
    period: str
    summary: ReportSummary
    pdf_url: Optional[str] = None   # caso for salvar em Storage no futuro


# ===== Agent =====
class AquaIntent(BaseModel):
    """
    Representa a intenção interpretada da pergunta do usuário no contexto AquaMonitor.
    """

    # Ação principal que o usuário está pedindo
    kind: Literal[
        "summary_all",      # resumo de todos os sensores
        "summary_low",      # resumo focado no sensor de nível baixo
        "count_events_all", # contar todos os eventos (alto/baixo, subiu/desceu)
        "count_low",        # quantas vezes a caixa ficou vazia (sensor baixo DESCEU)
        "count_full",       # quantas vezes a caixa ficou cheia (sensor alto SUBIU)
        "duration_empty",   # tempo total em que a caixa ficou vazia
        "duration_full",    # tempo total em que a caixa ficou cheia
        "unknown",
    ] = "unknown"

    # Período em código compacto:
    # - "2d", "7d", "20d", "30d" -> últimos X dias
    # - "this_week" -> semana atual (a partir de domingo)
    # - "this_month" -> mês atual
    period: Optional[str] = None

    # Filtros opcionais (nem toda ação usa)
    sensor: Optional[Literal["baixo", "alto"]] = None
    estado: Optional[Literal["subiu", "desceu"]] = None

class AgentRequest(BaseModel):
    question: str

class AgentResponse(BaseModel):
    answer: str
    intent: AquaIntent


# ==== Alerts ====
class SensorEventIn(BaseModel):
    sensor: str           # "baixo" ou "alto"
    estado: str           # "subiu" ou "desceu"
    timestamp: datetime   # ISO8601 vindo do Cloud Function
    device_id: Optional[str] = None


# ==== Cloud Function====
class SensorEventIn(BaseModel):
    sensor: str           # "baixo" ou "alto"
    estado: str           # "subiu" ou "desceu"
    timestamp: datetime   # ISO8601 vindo do Cloud Function
    device_id: Optional[str] = None