// ============================================================================
// SESIÓN MOCK — TEMPORAL (solo para el flujo de UI del front)
// ----------------------------------------------------------------------------
// Simula login/registro/logout guardando un usuario en localStorage. NO valida
// credenciales reales. Cuando Supabase Auth esté listo, se reemplaza el cuerpo
// de estas funciones por supabase.auth.signInWithPassword / signUp / signOut.
// ============================================================================

import type { User } from './types';

const SESSION_KEY = 'ht_session';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function getUser(): User | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return getUser() !== null;
}

/** "Inicia sesión" guardando un usuario derivado del email (mock). */
export function login(email: string, _password: string): User {
  const name = email.split('@')[0] || 'Usuario';
  const user: User = { id: `local_${name}`, name, email, createdAt: new Date().toISOString() };
  if (isBrowser()) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

/** "Registra" un usuario (mock) y deja la sesión iniciada. */
export function register(name: string, email: string, _password: string): User {
  const user: User = {
    id: `local_${name}`,
    name: name.trim(),
    email,
    createdAt: new Date().toISOString(),
  };
  if (isBrowser()) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export function updateUser(patch: Partial<Pick<User, 'name' | 'email' | 'avatar' | 'bio'>>): User | null {
  const current = getUser();
  if (!current) return null;
  const updated = { ...current, ...patch };
  if (isBrowser()) localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  return updated;
}

export function logout(): void {
  if (isBrowser()) localStorage.removeItem(SESSION_KEY);
}
