import {
  REMEMBERED_CENTER_KEY,
  REMEMBERED_USER_KEY,
  ROLES,
  SESSION_STORAGE_KEY,
} from "@/lib/constants";
import type { LoginCredentials, RoleId, Session } from "@/types/auth";

/**
 * Placeholder auth. Everything here is client-side and accepts any credentials
 * so the UI can be built ahead of the backend — swap the body of `signIn` for a
 * real API call and move the session onto an httpOnly cookie before shipping.
 */

const MIN_PASSWORD_LENGTH = 6;
const MIN_CENTER_ID_LENGTH = 4;

/** Centre IDs are issued uppercase; normalise so casing never blocks a login. */
export function normalizeCenterId(value: string): string {
  return value.trim().toUpperCase();
}

export function validate(credentials: LoginCredentials): string | null {
  if (normalizeCenterId(credentials.centerId).length < MIN_CENTER_ID_LENGTH) {
    return "Enter the Center ID issued to your clinic.";
  }
  if (!credentials.role) return "Select the role you're signing in as.";
  if (!credentials.username.trim()) return "Enter your username.";
  if (credentials.password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return null;
}

function prettyName(username: string): string {
  return username
    .replace(/[._-]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function signIn(credentials: LoginCredentials): Promise<Session> {
  // Stand-in for the network round trip, so loading states are exercised.
  await new Promise((resolve) => setTimeout(resolve, 700));

  const role = ROLES.find((entry) => entry.id === credentials.role);
  if (!role) throw new Error("Unknown role.");

  const session: Session = {
    username: credentials.username.trim(),
    displayName: prettyName(credentials.username),
    role: role.id,
    roleLabel: role.label,
    centerId: normalizeCenterId(credentials.centerId),
    issuedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));

  // A workstation stays with one centre even when the operator changes, so the
  // centre is remembered independently of "keep me signed in".
  window.localStorage.setItem(REMEMBERED_CENTER_KEY, session.centerId);

  if (credentials.remember) {
    window.localStorage.setItem(REMEMBERED_USER_KEY, session.username);
  } else {
    window.localStorage.removeItem(REMEMBERED_USER_KEY);
  }

  return session;
}

export function readSession(): Session | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<Session>;
    if (!parsed.username || !parsed.role) return null;
    return parsed as Session;
  } catch {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

export function readRememberedUser(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(REMEMBERED_USER_KEY) ?? "";
}

export function readRememberedCenter(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(REMEMBERED_CENTER_KEY) ?? "";
}

export function signOut(): void {
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function isRoleId(value: string): value is RoleId {
  return ROLES.some((role) => role.id === value);
}
