import { 
  collection, query, getDocs, where, orderBy, 
  limit, onSnapshot, Unsubscribe, Timestamp 
} from "firebase/firestore";
import { db } from "./firestoreConfig";


export const carregarUltimoEstado = async () => {
  try {
    const sensoresRef = collection(db, "sensores");
    const q = query(sensoresRef, orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);

    const historico: any[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      historico.push({
        id: doc.id,
        sensor: data.sensor,
        estado: data.estado,
        timestamp: data.timestamp
      });
    });

    return historico[0] || null; 
  } catch (error) {
    console.error("Erro ao carregar último estado:", error);
    return null;
  }
};


export const buscarComFiltros = async (sensorFiltro: string, dataInicio: string, dataFim: string) => {
  try {
    const sensoresRef = collection(db, "sensores");
    let filtros: any[] = [];

    if (dataInicio && dataFim) {
      const inicioDate = new Date(dataInicio + "T00:00:00");
      const fimDate = new Date(dataFim + "T23:59:59");
      filtros.push(where("timestamp", ">=", inicioDate));
      filtros.push(where("timestamp", "<=", fimDate));
    }

    if (sensorFiltro.trim() !== "") {
      filtros.push(where("sensor", "==", sensorFiltro.trim().toLowerCase()));
    }

    let q;

    if (filtros.length > 0) {
      q = query(sensoresRef, ...filtros, orderBy("timestamp", "desc"));
    } else {
      q = query(sensoresRef, orderBy("timestamp", "desc"));
    }

    const querySnapshot = await getDocs(q);

    const dados: any[] = [];
    querySnapshot.forEach(doc => {
      const data = doc.data();
      dados.push({
        id: doc.id,
        sensor: data.sensor,
        estado: data.estado,
        timestamp: new Date(data.timestamp.seconds * 1000).toLocaleString()
      });
    });

    return dados;
  } catch (error) {
    console.error("Erro ao buscar dados com filtros:", error);
    return [];
  }
};


// ---------- listener realtime do ÚLTIMO evento da coleção `sensores` ----------
export type UltimoEvento = {
  id: string;
  sensor: string;
  estado: string;
  timestamp: Date;
};

function normalizeTimestamp(ts: any): Date {
  if (ts instanceof Timestamp) return ts.toDate();
  if (typeof ts?.seconds === "number") return new Date(ts.seconds * 1000);
  if (typeof ts === "string") return new Date(ts);
  return new Date();
}

/**
 * Observa em tempo real o último documento de `sensores`.
 * Usa orderBy("timestamp","desc") + limit(1).
 */
export function listenUltimoEstado(
  onChange: (ev: UltimoEvento | null) => void,
  onError?: (e: any) => void
): Unsubscribe {
  const sensoresRef = collection(db, "sensores");
  const q = query(sensoresRef, orderBy("timestamp", "desc"), limit(1));

  return onSnapshot(
    q,
    (snap) => {
      if (snap.empty) {
        onChange(null);
        return;
      }
      const doc = snap.docs[0];
      const data = doc.data() as any;
      onChange({
        id: doc.id,
        sensor: data.sensor,
        estado: data.estado,
        timestamp: normalizeTimestamp(data.timestamp),
      });
    },
    (err) => onError?.(err)
  );
}
