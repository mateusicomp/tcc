const BASE_URL = import.meta.env.VITE_AI_BASE_URL || "http://127.0.0.1:8000";

export type Role = "system" | "user" | "assistant";

export async function sendChat(messages: {role: Role; content: string}[], sessionId?: string) {
  const resp = await fetch(`${BASE_URL}/llm/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ messages, session_id: sessionId || null }),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json() as Promise<{ content: string; session_id?: string }>;
}
