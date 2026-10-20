import type { FigureSet, NotificationPreferences } from "../types";
import { readJSON, writeJSON } from "../lib/storage";

/** Production would persist via a user-set API. */
export interface SetRepository {
  list(): Promise<FigureSet[]>;
  get(id: string): Promise<FigureSet | null>;
  save(set: FigureSet): Promise<void>;
  remove(id: string): Promise<void>;
}

export class LocalStorageSetRepository implements SetRepository {
  constructor(private userId: string) {
    seedDemoUser(userId);
  }

  private key() {
    return `sets:${this.userId}`;
  }

  listSync(): FigureSet[] {
    return readJSON<FigureSet[]>(this.key(), []);
  }

  async list(): Promise<FigureSet[]> {
    return this.listSync();
  }

  async get(id: string): Promise<FigureSet | null> {
    return this.listSync().find((s) => s.id === id) ?? null;
  }

  async save(set: FigureSet): Promise<void> {
    const all = this.listSync();
    const idx = all.findIndex((s) => s.id === set.id);
    if (idx >= 0) all[idx] = set;
    else all.push(set);
    writeJSON(this.key(), all);
  }

  async remove(id: string): Promise<void> {
    writeJSON(
      this.key(),
      this.listSync().filter((s) => s.id !== id),
    );
  }
}

/* ---------------- Demo seed data ---------------- */

const SEEDS: Record<string, { sets: FigureSet[]; prefs?: NotificationPreferences[] }> = {
  "demo-gunnar": {
    sets: [
      {
        id: "peningastefna",
        name: "Peningastefna",
        figureIds: ["VIII-8", "I-1", "I-2", "VIII-5", "I-6", "VIII-7"],
        spotlightFigureId: "VIII-8",
        updatedAt: "2026-10-17T09:12:00Z",
      },
      {
        id: "husnaedismarkadur",
        name: "Húsnæðismarkaður",
        figureIds: ["VI-1", "I-4", "VI-3", "VII-1", "VII-2", "VI-4", "VIII-6", "II-4"],
        updatedAt: "2026-10-12T14:30:00Z",
      },
      {
        id: "vinnumarkadur",
        name: "Vinnumarkaður",
        figureIds: ["IV-1", "IV-2", "IV-3", "II-1"],
        updatedAt: "2026-09-28T08:05:00Z",
      },
    ],
  },
  "demo-sigridur": {
    sets: [
      {
        id: "ytri-skilyrdi",
        name: "Ytri skilyrði",
        figureIds: ["III-1", "III-3", "III-2", "VIII-1", "X-1", "X-5"],
        updatedAt: "2026-10-15T11:00:00Z",
      },
      {
        id: "fjarmalastodugleiki",
        name: "Fjármálastöðugleiki",
        figureIds: ["IX-1", "IX-2", "IX-3", "VII-1", "VII-3"],
        spotlightFigureId: "IX-1",
        updatedAt: "2026-10-09T16:40:00Z",
      },
    ],
    prefs: [
      { setId: "ytri-skilyrdi", enabled: true, scope: "all", figureIds: [], frequency: "daily", email: "sigridur@example.is" },
      { setId: "fjarmalastodugleiki", enabled: true, scope: "selected", figureIds: ["IX-1", "IX-2"], frequency: "weekly", email: "sigridur@example.is" },
    ],
  },
};

export function seedDemoUser(userId: string) {
  const flag = `seeded:${userId}`;
  if (readJSON<boolean>(flag, false)) return;
  const seed = SEEDS[userId];
  if (seed) {
    writeJSON(`sets:${userId}`, seed.sets);
    seed.prefs?.forEach((p) => writeJSON(`notify:${userId}:${p.setId}`, p));
  }
  writeJSON(flag, true);
}
