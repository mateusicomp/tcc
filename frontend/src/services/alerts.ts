const functions = require("firebase-functions/v2/firestore");
const fetch = require("node-fetch");

// URL pública do seu backend FastAPI
const BACKEND_WEBHOOK_URL = process.env.BACKEND_WEBHOOK_URL || "https://seu-backend.com/alerts/sensor-event";

exports.onSensorCreated = functions.onDocumentCreated("sensores/{docId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;

  const data = snapshot.data();
  if (!data) return;

  // Firestore Timestamp -> ISO string
  const ts = data.timestamp && data.timestamp.toDate
    ? data.timestamp.toDate().toISOString()
    : new Date().toISOString();

  const body = {
    sensor: data.sensor,         // "baixo" ou "alto"
    estado: data.estado,         // "subiu" ou "desceu"
    timestamp: ts,
    device_id: data.device_id || null,
  };

  await fetch(BACKEND_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
});
