from pydantic import BaseModel, Field
from typing import List, Literal, Optional, Any


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
    pdf_url: Optional[str] = None   # se você for salvar em Storage no futuro
