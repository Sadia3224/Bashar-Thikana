import { useEffect, useState } from "react";

// Everything this demo stores lives in localStorage under this prefix, in this browser only.
const PREFIX = "bt_v1_";

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function clearAll() {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(PREFIX))
      .forEach((key) => localStorage.removeItem(key));
  } catch {
    // Storage unavailable: nothing to clear.
  }
}

export function usePersistentState(key, initial) {
  const [value, setValue] = useState(() => load(key, typeof initial === "function" ? initial() : initial));
  useEffect(() => {
    save(key, value);
  }, [key, value]);
  return [value, setValue];
}

export const uid = (prefix) => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export const wait = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));
