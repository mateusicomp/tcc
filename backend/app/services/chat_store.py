import uuid
from datetime import datetime, timezone
from typing import Dict, List
from firebase_admin import firestore as fs
from app.services.firestore import _init_firebase_admin_once  # já existe


def _db():
    _init_firebase_admin_once()
    return fs.client()

def create_session(title: str = "AquaMonitor Chat") -> str:
    sid = uuid.uuid4().hex
    db = _db()
    db.collection("chat_sessions").document(sid).set({
        "title": title,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    })
    return sid

def append_message(session_id: str, role: str, content: str) -> None:
    db = _db()
    doc = db.collection("chat_sessions").document(session_id)
    doc.collection("messages").add({
        "role": role,
        "content": content,
        "ts": datetime.now(timezone.utc),
    })
    doc.update({"updated_at": datetime.now(timezone.utc)})

def get_messages(session_id: str) -> List[Dict]:
    db = _db()
    doc = db.collection("chat_sessions").document(session_id)
    msgs = (doc.collection("messages")
            .order_by("ts", direction=fs.Query.ASCENDING)
            .stream())
    return [{"id": m.id, **m.to_dict()} for m in msgs]
