// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getAuth, type Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importación de getReactNativePersistence con manejo de TypeScript
// @ts-ignore - Esta función existe en tiempo de ejecución en firebase/auth
import { getReactNativePersistence } from "firebase/auth";

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

// Auth con persistencia de AsyncStorage para React Native
// Usamos try/catch porque initializeAuth solo puede llamarse una vez
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  // Si ya fue inicializado, obtenemos la instancia existente
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
