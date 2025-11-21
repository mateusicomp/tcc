import os
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from fastapi import FastAPI

from app.services.firestore import fetch_sensor_events, build_summary
from app.services.pdf import generate_report_pdf

def _job_generate_weekly():
    events = fetch_sensor_events("7d")
    summary = build_summary(events)
    path = generate_report_pdf("7d", summary)
    print(f"[scheduler] Weekly report generated: {path}")

def _job_generate_monthly():
    events = fetch_sensor_events("30d")
    summary = build_summary(events)
    path = generate_report_pdf("30d", summary)
    print(f"[scheduler] Monthly report generated: {path}")

def start_scheduler_if_enabled(app: FastAPI):
    if os.getenv("ENABLE_SCHEDULER", "0") != "1":
        return

    sched = BackgroundScheduler(timezone="UTC")
    cron_weekly = os.getenv("SCHEDULE_CRON_WEEKLY", "0 7 * * 1")   # seg 07:00 UTC
    cron_monthly = os.getenv("SCHEDULE_CRON_MONTHLY", "0 7 1 * *") # dia 1 07:00 UTC

    sched.add_job(_job_generate_weekly, CronTrigger.from_crontab(cron_weekly))
    sched.add_job(_job_generate_monthly, CronTrigger.from_crontab(cron_monthly))
    sched.start()

    @app.on_event("shutdown")
    def _shutdown():
        sched.shutdown(wait=False)
