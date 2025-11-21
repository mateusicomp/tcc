from fastapi import APIRouter
from pydantic import BaseModel
from app.services.agent_langchain import handle_analytics_question
from app.models.dto import AquaIntent

router = APIRouter()

class AgentRequest(BaseModel):
    question: str

class AgentResponse(BaseModel):
    answer: str
    intent: AquaIntent

@router.post("/agent", response_model=AgentResponse)
def agent_endpoint(req: AgentRequest):
    """
    Endpoint que usa LangChain para entender a pergunta
    e consultar o Firestore via funções existentes.
    """
    answer, intent = handle_analytics_question(req.question)
    return AgentResponse(answer=answer, intent=intent)
