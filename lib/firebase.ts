// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Config (ok)
const firebaseConfig = {
  apiKey: "AIzaSyDzoRxitIG0Jq9q7iekGZcoEWwhNPqMvIA",
  authDomain: "clinica-dental-62439.firebaseapp.com",
  projectId: "clinica-dental-62439",
  storageBucket: "clinica-dental-62439.firebasestorage.app", // <- Storage correcto en web SDK
  messagingSenderId: "740160113057",
  appId: "1:740160113057:web:ecdada5ff393cd71c163e0",
};

// App singleton
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Auth - usa la persistencia por defecto de la plataforma
export const auth: Auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
