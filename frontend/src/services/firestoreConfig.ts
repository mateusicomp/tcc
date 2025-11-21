import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyD-3x3bJH3r2n0hyngOOC7_WOuvPBHo_T4",
  authDomain: "tcc1-155fa.firebaseapp.com",
  databaseURL: "https://tcc1-155fa-default-rtdb.firebaseio.com",
  projectId: "tcc1-155fa",
  storageBucket: "tcc1-155fa.firebasestorage.app",
  messagingSenderId: "42021048757",
  appId: "1:42021048757:web:c13807fb87694e3b0709fc",
  measurementId: "G-KGHNFS1LEX"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
