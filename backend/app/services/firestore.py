import os
import json
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Tuple
import firebase_admin
from firebase_admin import credentials, firestore

SENSORS_COLLECTION = os.getenv("FIRESTORE_SENSORS_COLLECTION", "sensores")

def _init_firebase_admin_once():
    if firebase_admin._apps:
        return
    creds_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    creds_inline = os.getenv("FIREBASE_CREDENTIALS_JSON")

    if creds_path and os.path.exists(creds_path):
        cred = credentials.Certificate(creds_path)
    elif creds_inline:
        cred = credentials.Certificate(json.loads(creds_inline))
    else:
        # Tenta ADC (gcloud / ambiente)
        cred = credentials.ApplicationDefault()
    firebase_admin.initialize_app(cred)

def _period_to_dates(period: str) -> Tuple[datetime, datetime]:
    now = datetime.now(timezone.utc)
    if period == "30d":
        start = now - timedelta(days=30)
    elif period == "90d":
        start = now - timedelta(days=90)
    else:
        start = now - timedelta(days=7)
    return start, now

def fetch_sensor_events(period: str = "7d") -> List[Dict]:
    _init_firebase_admin_once()
    db = firestore.client()

    start, end = _period_to_dates(period)
    q = (
        db.collection(SENSORS_COLLECTION)
          .where("timestamp", ">=", start)
          .where("timestamp", "<=", end)
          .order_by("timestamp", direction=firestore.Query.DESCENDING)
    )

    docs = q.stream()
    results = []
    for d in docs:
        data = d.to_dict()
        results.append({
            "id": d.id,
            "sensor": data.get("sensor"),
            "estado": data.get("estado"),
            "timestamp": data.get("timestamp"),
        })
    return results

def build_summary(events: List[Dict]) -> Dict:
    by_sensor: Dict[str, int] = {}
    by_action: Dict[str, int] = {}
    for e in events:
        s = (e.get("sensor") or "").strip()
        a = (e.get("estado") or "").strip()
        if s:
            by_sensor[s] = by_sensor.get(s, 0) + 1
        if a:
            by_action[a] = by_action.get(a, 0) + 1

    return {
        "total_events": len(events),
        "by_sensor": dict(sorted(by_sensor.items(), key=lambda kv: kv[1], reverse=True)),
        "by_action": dict(sorted(by_action.items(), key=lambda kv: kv[1], reverse=True)),
    }
