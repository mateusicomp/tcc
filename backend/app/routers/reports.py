from fastapi import APIRouter, Query
from fastapi.responses import FileResponse
from app.services.firestore import fetch_sensor_events, build_summary
from app.services.pdf import generate_report_pdf

router = APIRouter()

@router.get("/weekly")
def weekly_report(period: str = Query("7d", pattern="^(7d|30d|90d)$")):
    events = fetch_sensor_events(period=period)
    summary = build_summary(events)
    pdf_path = generate_report_pdf(period, summary)
    return FileResponse(pdf_path, media_type="application/pdf", filename=pdf_path.split("/")[-1])

@router.get("/monthly")
def monthly_report():
    # equivalente a 30 dias por padrão
    events = fetch_sensor_events(period="30d")
    summary = build_summary(events)
    pdf_path = generate_report_pdf("30d", summary)
    return FileResponse(pdf_path, media_type="application/pdf", filename=pdf_path.split("/")[-1])
