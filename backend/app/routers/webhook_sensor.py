from datetime import datetime
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.sensor_realtime import process_new_sensor_event

router = APIRouter()


class SensorEventIn(BaseModel):
    sensor: str           # "baixo" ou "alto"
    estado: str           # "subiu" ou "desceu"
    timestamp: datetime   # ISO8601 vindo do Cloud Function
    device_id: Optional[str] = None


@router.post("/sensor-event")
async def sensor_event_webhook(payload: SensorEventIn):
    """
    Endpoint chamado pela Cloud Function SEMPRE que um doc novo for criado em 'sensores'.
    """
    result = process_new_sensor_event(payload.model_dump())
    return result
