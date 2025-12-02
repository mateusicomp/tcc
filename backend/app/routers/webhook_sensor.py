from fastapi import APIRouter

from app.services.sensor_realtime import process_new_sensor_event
from app.schemas.dto import SensorEventIn

router = APIRouter()


@router.post("/sensor-event")
async def sensor_event_webhook(payload: SensorEventIn):
    """
    Endpoint chamado pela Cloud Function SEMPRE que um doc novo for criado em 'sensores'.
    """
    result = process_new_sensor_event(payload.model_dump())
    return result
