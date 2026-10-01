import { useEffect, useState } from "react";
// Small localStorage-backed state (replaces the Express + MongoDB layer so the app runs on Vercel with no server)
export function usePersist(key, initial) {
  const [v, setV] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial; } catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }, [key, v]);
  return [v, setV];
}
