"use client";

import { useSyncExternalStore } from "react";
import type { CartItem } from "./types";

const STORAGE_KEY = "cart";
const listeners = new Set<() => void>();
const EMPTY_CART: CartItem[] = [];
let snapshot: CartItem[] = [];

function readCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function commit(items: CartItem[]) {
  snapshot = items;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
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
  // Always matches what the server actually rendered (an empty cart) —
  // must stay independent of `snapshot`, which the client mutates from
  // localStorage before hydration runs, or React's hydration check would
  // compare the server's render against post-mutation client state.
  return EMPTY_CART;
}

if (typeof window !== "undefined") {
  snapshot = readCart();
}

function addItem(item: CartItem) {
  const existing = snapshot.find(
    (i) => i.productId === item.productId && i.size === item.size
  );
  if (existing) {
    commit(
      snapshot.map((i) =>
        i === existing ? { ...i, quantity: i.quantity + item.quantity } : i
      )
    );
  } else {
    commit([...snapshot, item]);
  }
}

function removeItem(productId: string, size: string) {
  commit(snapshot.filter((i) => !(i.productId === productId && i.size === size)));
}

function setQuantity(productId: string, size: string, quantity: number) {
  if (quantity <= 0) {
    removeItem(productId, size);
    return;
  }
  commit(
    snapshot.map((i) =>
      i.productId === productId && i.size === size ? { ...i, quantity } : i
    )
  );
}

function clear() {
  commit([]);
}

export function useCart() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  return { items, addItem, removeItem, setQuantity, clear, count, total };
}
