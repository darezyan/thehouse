import { useSyncExternalStore } from "react";
import type { CartItem } from "./types";

const KEY = "buyNowItem";
const listeners = new Set<() => void>();
let snapshot: CartItem | null = null;

function read(): CartItem | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CartItem) : null;
  } catch {
    return null;
  }
}

if (typeof window !== "undefined") {
  snapshot = read();
}

export function setBuyNowItem(item: CartItem) {
  snapshot = item;
  window.sessionStorage.setItem(KEY, JSON.stringify(item));
  listeners.forEach((listener) => listener());
}

export function clearBuyNowItem() {
  snapshot = null;
  window.sessionStorage.removeItem(KEY);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot() {
  return null;
}

export function useBuyNowItem() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
