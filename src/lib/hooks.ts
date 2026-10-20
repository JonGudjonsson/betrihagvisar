import { useEffect, useRef, useState } from "react";
import type { FigureDefinition } from "../types";
import { loadFigureData, peekFigureData } from "../data/figures";

export function useMediaQuery(query: string): boolean {
  const get = () => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia(query).matches : false);
  const [matches, setMatches] = useState(get);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

export const useReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");
export const useIsMobile = () => useMediaQuery("(max-width: 699px)");

/** True once the element has come near the viewport (and stays true). */
export function useInView<T extends Element>(rootMargin = "300px"): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (seen) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen, rootMargin]);
  return [ref, seen];
}

/* ---------------- Figure data ---------------- */

export type LoadState = "loading" | "ready" | "error";

/**
 * Fetches a figure's values (once per session) when `active` and returns the figure with
 * its series filled in. `figure` is undefined until the values have arrived.
 */
export function useFigureData(fig: FigureDefinition | undefined, active: boolean): { state: LoadState; figure?: FigureDefinition; retry: () => void } {
  const [full, setFull] = useState<FigureDefinition | undefined>(() => (fig ? peekFigureData(fig.id) : undefined));
  const [state, setState] = useState<LoadState>(full ? "ready" : "loading");
  const [attempt, setAttempt] = useState(0);
  const id = fig?.id;
  useEffect(() => {
    if (!id || !active) return;
    const hit = peekFigureData(id);
    if (hit) {
      setFull(hit);
      setState("ready");
      return;
    }
    let live = true;
    setState("loading");
    loadFigureData(id).then(
      (f) => {
        if (!live) return;
        setFull(f);
        setState("ready");
      },
      () => live && setState("error"),
    );
    return () => {
      live = false;
    };
  }, [id, active, attempt]);
  const current = full && full.id === id ? full : undefined;
  return { state: current ? "ready" : state === "ready" ? "loading" : state, figure: current, retry: () => setAttempt((a) => a + 1) };
}

/** Close on outside click / Escape. */
export function useDismiss(open: boolean, onClose: () => void, refs: React.RefObject<HTMLElement>[]) {
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (refs.some((r) => r.current?.contains(target))) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, onClose]);
}
