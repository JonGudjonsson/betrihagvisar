import type { UserIdentity } from "../types";
import { readJSON, removeKey, writeJSON } from "../lib/storage";

/** Production would implement this with Auðkenni / OIDC. */
export interface AuthProvider {
  login(options?: { identityId?: string }): Promise<UserIdentity>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<UserIdentity | null>;
}

export const DEMO_IDENTITIES: UserIdentity[] = [
  {
    id: "demo-gunnar",
    name: "Gunnar Ólafsson",
    email: "gunnar@example.is",
    maskedId: "120481-••••",
    initials: "GÓ",
    description: "Þrjú vistuð söfn",
  },
  {
    id: "demo-sigridur",
    name: "Sigríður Helgadóttir",
    email: "sigridur@example.is",
    maskedId: "030377-••••",
    initials: "SH",
    description: "Söfn með virkum uppfærslum",
  },
  {
    id: "demo-anna",
    name: "Anna Jónsdóttir",
    email: "anna@example.is",
    maskedId: "250699-••••",
    initials: "AJ",
    description: "Nýr notandi, engin söfn",
  },
];

const SESSION_KEY = "session";

export class MockAuthProvider implements AuthProvider {
  async login(options?: { identityId?: string }): Promise<UserIdentity> {
    const identity = DEMO_IDENTITIES.find((d) => d.id === options?.identityId) ?? DEMO_IDENTITIES[0];
    writeJSON(SESSION_KEY, { userId: identity.id, at: new Date().toISOString() });
    return identity;
  }

  async logout(): Promise<void> {
    removeKey(SESSION_KEY);
  }

  async getCurrentUser(): Promise<UserIdentity | null> {
    const session = readJSON<{ userId: string } | null>(SESSION_KEY, null);
    return DEMO_IDENTITIES.find((d) => d.id === session?.userId) ?? null;
  }

  /** Synchronous variant for first render. */
  currentUserSync(): UserIdentity | null {
    const session = readJSON<{ userId: string } | null>(SESSION_KEY, null);
    return DEMO_IDENTITIES.find((d) => d.id === session?.userId) ?? null;
  }
}

export const authProvider = new MockAuthProvider();
