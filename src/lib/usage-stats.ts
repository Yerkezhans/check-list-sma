"use client";

import { db } from "./firebase";
import { doc, onSnapshot, setDoc, increment, serverTimestamp } from "firebase/firestore";

const USAGE_REF = doc(db, "stats", "usage");

export function subscribeUsageCount(cb: (count: number) => void) {
  return onSnapshot(USAGE_REF, (snap) => {
    const total = (snap.data()?.total as number | undefined) ?? 0;
    cb(total);
  });
}

export async function incrementUsageOncePerSession(key = "sma-usage-incremented") {
  if (typeof window === "undefined") return;
  if (sessionStorage.getItem(key) === "1") return;

  sessionStorage.setItem(key, "1");

  // ✅ всегда работает: создаст док, если нет, и увеличит total
  await setDoc(
    USAGE_REF,
    { total: increment(1), updatedAt: serverTimestamp() },
    { merge: true }
  );
}
