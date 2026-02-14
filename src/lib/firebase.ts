// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import type { Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// ✅ логируем ДО инициализации
console.log("ENV apiKey:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
console.log("ENV authDomain:", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);

// ✅ защита: если env не подхватились — сразу понятная ошибка
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  throw new Error("Firebase env vars are missing. Check .env.local and restart dev server.");
}

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);

// ✅ Auth только в браузере, чтобы не ломало сборку/SSR
export let auth: Auth | null = null;

if (typeof window !== "undefined") {
  import("firebase/auth").then(({ getAuth }) => {
    auth = getAuth(app);
  });
}
