"use client";

import {db} from "./firebase-client";
import {doc, onSnapshot, setDoc, updateDoc, increment, getDoc} from "firebase/firestore";

const USAGE_REF = doc(db, "stats", "usage");

export function subscribeUsageCount(cb: (count: number)=>void) {
  getDoc(USAGE_REF).then(snap => {
    if (!snap.exists()) setDoc(USAGE_REF, {total: 0, updatedAt: Date.now()});
  });
  return onSnapshot(USAGE_REF, (snap) => cb((snap.data()?.total as number) ?? 0));
}

export async function incrementUsageOncePerSession(key = "sma-usage-incremented") {
  if (typeof window !== "undefined" && sessionStorage.getItem(key)) return;
  await updateDoc(USAGE_REF, { total: increment(1), updatedAt: Date.now() }).catch(async () => {
    await setDoc(USAGE_REF, { total: 1, updatedAt: Date.now() }, { merge: true });
  });
  if (typeof window !== "undefined") sessionStorage.setItem(key, "1");
}
export async function incrementEveryResult() {
  try {
    await updateDoc(USAGE_REF, { total: increment(1), updatedAt: Date.now() });
  } catch {
    await setDoc(USAGE_REF, { total: 1, updatedAt: Date.now() }, { merge: true });
  }
}