import os
import requests
from typing import List, Dict, Generator, Optional
from app.schemas.dto import ChatMessage


PROVIDER = os.getenv("LLM_PROVIDER", "ollama").lower()

# ====== OLLAMA ======
OLLAMA_BASE = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2:0.5b")

def _ollama_chat(messages: List[ChatMessage], stream: bool = False):
    # Conversa estilo "chat" do Ollama
    url = f"{OLLAMA_BASE}/api/chat"
    payload = {
        "model": OLLAMA_MODEL,
        "messages": [m.model_dump() for m in messages],
        "stream": stream,
        "options": {"temperature": 0.3},
    }
    if not stream:
        r = requests.post(url, json=payload, timeout=600)
        r.raise_for_status()
        data = r.json()
        # A resposta completa vem no último chunk; aqui simplificamos:
        content = data.get("message", {}).get("content", "")
        return content, {"model": OLLAMA_MODEL, "provider": "ollama", "usage": None}

    def gen() -> Generator[str, None, None]:
        with requests.post(url, json=payload, stream=True, timeout=600) as r:
            r.raise_for_status()
            for line in r.iter_lines(decode_unicode=True):
                if not line:
                    continue
                # Cada linha é um JSON com campos "message": {"content": "...", "role":"assistant"}, "done": bool
                try:
                    obj = requests.utils.json.loads(line)
                    chunk = obj.get("message", {}).get("content", "")
                    if chunk:
                        yield chunk
                    if obj.get("done"):
                        break
                except Exception:
                    # Se vier lixo, ignore
                    continue
    return gen(), {"model": OLLAMA_MODEL, "provider": "ollama", "usage": None}

# ====== OPENAI (opcional) ======
def _openai_chat(messages: List[ChatMessage], stream: bool = False):
    from openai import OpenAI
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    if not stream:
        resp = client.chat.completions.create(
            model=model,
            messages=[m.model_dump() for m in messages],
            temperature=0.3,
        )
        content = resp.choices[0].message.content or ""
        usage = getattr(resp, "usage", None)
        return content, {"model": model, "provider": "openai", "usage": usage.model_dump() if usage else None}

    def gen() -> Generator[str, None, None]:
        with client.chat.completions.create(
            model=model,
            messages=[m.model_dump() for m in messages],
            temperature=0.3,
            stream=True,
        ) as stream_resp:
            for event in stream_resp:
                delta = event.choices[0].delta.content or ""
                if delta:
                    yield delta
    return gen(), {"model": model, "provider": "openai", "usage": None}

# ====== FACHADA ======
def chat(messages: List[ChatMessage], stream: bool = False):
    if PROVIDER == "openai":
        return _openai_chat(messages, stream)
    return _ollama_chat(messages, stream)
