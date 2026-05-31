// ============================================================================
// AUTENTICACIÓN REAL — Supabase Auth
// ----------------------------------------------------------------------------
// Reemplaza la sesión mock con localStorage por Supabase Auth real.
// Mantiene la API que usan los componentes del front (getUser, updateUser,
// isLoggedIn, login, register, logout) pero ahora todas son ASÍNCRONAS porque
// hablan con el backend. El nombre, avatar y bio del usuario se guardan en
// user_metadata de Supabase.
// ============================================================================

import { supabase } from './supabase';
import type { User } from './types';

/** Normaliza el usuario de Supabase al tipo `User` que usa el front. */
function mapUser(sbUser: any | null): User | null {
  if (!sbUser) return null;
  const meta = sbUser.user_metadata ?? {};
  return {
    id: sbUser.id,
    name: meta.nombre ?? meta.name ?? (sbUser.email?.split('@')[0] ?? 'Usuario'),
    email: sbUser.email ?? '',
    avatar: meta.avatar ?? '',
    bio: meta.bio ?? '',
    createdAt: sbUser.created_at,
  };
}

/** Devuelve el usuario logueado (o null) leyendo la sesión de Supabase. */
export async function getUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return mapUser(data.user);
}

/** True si hay una sesión activa. */
export async function isLoggedIn(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  return data.session !== null;
}

/** Registra un usuario nuevo en Supabase y guarda su nombre en metadata. */
export async function register(name: string, email: string, password: string): Promise<User | null> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nombre: name.trim() },
    },
  });
  if (error) throw error;
  return mapUser(data.user);
}

/** Inicia sesión con email y contraseña. */
export async function login(email: string, password: string): Promise<User | null> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return mapUser(data.user);
}

/** Cierra la sesión actual. */
export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}

/** Actualiza nombre / email / bio / avatar del usuario en Supabase. */
export async function updateUser(
  patch: Partial<Pick<User, 'name' | 'email' | 'avatar' | 'bio'>>,
): Promise<User | null> {
  const payload: { email?: string; data?: Record<string, unknown> } = {};
  if (patch.email) payload.email = patch.email;

  const data: Record<string, unknown> = {};
  if (patch.name !== undefined) data.nombre = patch.name;
  if (patch.bio !== undefined) data.bio = patch.bio;
  if (patch.avatar !== undefined) data.avatar = patch.avatar;
  if (Object.keys(data).length > 0) payload.data = data;

  const { data: result, error } = await supabase.auth.updateUser(payload);
  if (error) throw error;
  return mapUser(result.user);
}
