from fastapi import APIRouter, Query
from app.schemas.dto import SensorEventIn
from app.services.sensor_anomaly import detect_intelligent_alerts
from app.services.sensor_realtime import process_new_sensor_event

router = APIRouter()


@router.get("/sensors")
def get_sensor_alerts(
    period: str = Query("7d", description="Período para análise (ex: '7d', '30d', 'this_week')")
):
    """
    Retorna alertas inteligentes de inconsistências e anomalias dos sensores
    de nível (boias), combinando regras físicas e AutoCloud.
    """
    result = detect_intelligent_alerts(period=period)
    return result

@router.post("/sensor-event")
async def sensor_event_webhook(payload: SensorEventIn):
    """
    Endpoint chamado pela Cloud Function SEMPRE que um doc novo for criado em 'sensores'.
    """
    result = process_new_sensor_event(payload.model_dump())
    return result
