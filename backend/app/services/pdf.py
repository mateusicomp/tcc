import os
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from datetime import datetime
from typing import Dict

OUTPUT_DIR = os.getenv("PDF_OUTPUT_DIR", "./generated")

def ensure_output_dir():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

def generate_report_pdf(period: str, summary: Dict) -> str:
    ensure_output_dir()
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"relatorio_{period}_{ts}.pdf"
    path = os.path.join(OUTPUT_DIR, filename)

    c = canvas.Canvas(path, pagesize=A4)
    width, height = A4

    y = height - 50
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, y, "AquaMonitor - Relatório de Sensores")
    y -= 25
    c.setFont("Helvetica", 12)
    c.drawString(50, y, f"Período: {period}")
    y -= 15
    c.drawString(50, y, f"Gerado em: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    y -= 30

    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, f"Total de eventos: {summary['total_events']}")
    y -= 20

    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "Eventos por Sensor:")
    y -= 18
    c.setFont("Helvetica", 11)
    for sensor, cnt in summary["by_sensor"].items():
        c.drawString(70, y, f"- {sensor}: {cnt}")
        y -= 16
        if y < 60:
            c.showPage(); y = height - 50

    y -= 10
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "Eventos por Ação:")
    y -= 18
    c.setFont("Helvetica", 11)
    for action, cnt in summary["by_action"].items():
        c.drawString(70, y, f"- {action}: {cnt}")
        y -= 16
        if y < 60:
            c.showPage(); y = height - 50

    c.showPage()
    c.save()
    return path
