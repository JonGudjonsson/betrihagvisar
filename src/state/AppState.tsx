import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { FigureFilters, FigureSet, UserIdentity } from "../types";
import { authProvider } from "../services/auth";
import { LocalStorageSetRepository } from "../services/sets";
import { MockNotificationService } from "../services/notifications";
import { EMPTY_FILTERS } from "../lib/filters";
import { readJSON, uid, writeJSON } from "../lib/storage";

/* ------------------------------------------------------------------ */
/*  Auth                                                               */
/* ------------------------------------------------------------------ */

interface AuthCtx {
  user: UserIdentity | null;
  login(identityId?: string): Promise<UserIdentity>;
  logout(): Promise<void>;
}
const AuthContext = createContext<AuthCtx | null>(null);

/* ------------------------------------------------------------------ */
/*  Sets                                                               */
/* ------------------------------------------------------------------ */

interface SetsCtx {
  sets: FigureSet[];
  getSet(id: string | undefined): FigureSet | undefined;
  createSet(name: string, figureIds?: string[]): FigureSet;
  saveSet(set: FigureSet): void;
  deleteSet(id: string): void;
  toggleFigure(setId: string, figureId: string): boolean;
  setsContaining(figureId: string): FigureSet[];
  notifications: MockNotificationService | null;
}
const SetsContext = createContext<SetsCtx | null>(null);

/* ------------------------------------------------------------------ */
/*  Toasts                                                             */
/* ------------------------------------------------------------------ */

interface Toast {
  id: string;
  message: string;
  action?: { label: string; onClick: () => void };
}
interface ToastCtx {
  show(message: string, action?: Toast["action"]): void;
}
const ToastContext = createContext<ToastCtx | null>(null);

/* ------------------------------------------------------------------ */
/*  Browsing filters + demo updates                                    */
/* ------------------------------------------------------------------ */

interface BrowseCtx {
  filters: FigureFilters;
  setFilters(f: FigureFilters): void;
  clearFilters(): void;
  updated: Set<string>;
  markUpdated(id: string): void;
  clearUpdated(id: string): void;
}
const BrowseContext = createContext<BrowseCtx | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  /* auth */
  const [user, setUser] = useState<UserIdentity | null>(() => authProvider.currentUserSync());
  const login = useCallback(async (identityId?: string) => {
    const u = await authProvider.login({ identityId });
    setUser(u);
    return u;
  }, []);
  const logout = useCallback(async () => {
    await authProvider.logout();
    setUser(null);
  }, []);

  /* sets */
  const repo = useMemo(() => (user ? new LocalStorageSetRepository(user.id) : null), [user]);
  const notifications = useMemo(() => (user ? new MockNotificationService(user.id) : null), [user]);
  const [sets, setSets] = useState<FigureSet[]>(() => repo?.listSync() ?? []);
  useEffect(() => {
    setSets(repo?.listSync() ?? []);
  }, [repo]);

  const persist = useCallback(
    (next: FigureSet[], changed?: FigureSet, removedId?: string) => {
      setSets(next);
      if (!repo) return;
      if (changed) void repo.save(changed);
      if (removedId) void repo.remove(removedId);
    },
    [repo],
  );

  const setsApi = useMemo<SetsCtx>(
    () => ({
      sets,
      notifications,
      getSet: (id) => sets.find((s) => s.id === id),
      createSet: (name, figureIds = []) => {
        const set: FigureSet = { id: uid("safn"), name: name.trim() || "Nýtt safn", figureIds, updatedAt: new Date().toISOString() };
        persist([...sets, set], set);
        return set;
      },
      saveSet: (set) => {
        const next = { ...set, updatedAt: new Date().toISOString() };
        persist(
          sets.map((s) => (s.id === set.id ? next : s)),
          next,
        );
      },
      deleteSet: (id) =>
        persist(
          sets.filter((s) => s.id !== id),
          undefined,
          id,
        ),
      toggleFigure: (setId, figureId) => {
        const set = sets.find((s) => s.id === setId);
        if (!set) return false;
        const has = set.figureIds.includes(figureId);
        const next: FigureSet = {
          ...set,
          figureIds: has ? set.figureIds.filter((f) => f !== figureId) : [...set.figureIds, figureId],
          spotlightFigureId: has && set.spotlightFigureId === figureId ? undefined : set.spotlightFigureId,
          updatedAt: new Date().toISOString(),
        };
        persist(
          sets.map((s) => (s.id === setId ? next : s)),
          next,
        );
        return !has;
      },
      setsContaining: (figureId) => sets.filter((s) => s.figureIds.includes(figureId)),
    }),
    [sets, persist, notifications],
  );

  /* toasts */
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, number>());
  const dismiss = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
    const tm = timers.current.get(id);
    if (tm) window.clearTimeout(tm);
    timers.current.delete(id);
  }, []);
  const show = useCallback(
    (message: string, action?: Toast["action"]) => {
      const id = uid("t");
      setToasts((t) => [...t.slice(-2), { id, message, action }]);
      timers.current.set(id, window.setTimeout(() => dismiss(id), action ? 6500 : 4200));
    },
    [dismiss],
  );

  /* filters */
  const [filters, setFilters] = useState<FigureFilters>(EMPTY_FILTERS);
  const [updated, setUpdated] = useState<Set<string>>(() => new Set(readJSON<string[]>("updated", [])));
  const browse = useMemo<BrowseCtx>(
    () => ({
      filters,
      setFilters,
      clearFilters: () => setFilters(EMPTY_FILTERS),
      updated,
      markUpdated: (id) =>
        setUpdated((u) => {
          const n = new Set(u);
          n.add(id);
          writeJSON("updated", [...n]);
          return n;
        }),
      clearUpdated: (id) =>
        setUpdated((u) => {
          if (!u.has(id)) return u;
          const n = new Set(u);
          n.delete(id);
          writeJSON("updated", [...n]);
          return n;
        }),
    }),
    [filters, updated],
  );

  const auth = useMemo(() => ({ user, login, logout }), [user, login, logout]);

  return (
    <AuthContext.Provider value={auth}>
      <SetsContext.Provider value={setsApi}>
        <BrowseContext.Provider value={browse}>
          <ToastContext.Provider value={useMemo(() => ({ show }), [show])}>
            {children}
            <div className="toasts" role="status" aria-live="polite">
              {toasts.map((t) => (
                <div key={t.id} className="toast">
                  <span>{t.message}</span>
                  {t.action && (
                    <button
                      type="button"
                      className="toast__action"
                      onClick={() => {
                        t.action?.onClick();
                        dismiss(t.id);
                      }}
                    >
                      {t.action.label}
                    </button>
                  )}
                  <button type="button" className="toast__close" aria-label="Loka tilkynningu" onClick={() => dismiss(t.id)}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          </ToastContext.Provider>
        </BrowseContext.Provider>
      </SetsContext.Provider>
    </AuthContext.Provider>
  );
}

function must<T>(v: T | null, name: string): T {
  if (!v) throw new Error(`${name} must be used inside AppStateProvider`);
  return v;
}

export const useAuth = () => must(useContext(AuthContext), "useAuth");
export const useSets = () => must(useContext(SetsContext), "useSets");
export const useToast = () => must(useContext(ToastContext), "useToast");
export const useBrowse = () => must(useContext(BrowseContext), "useBrowse");
