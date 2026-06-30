// ============================================================================
// CAPA DE DATOS LOCAL (MOCK) — TEMPORAL
// ----------------------------------------------------------------------------
// Guarda hábitos y registros en localStorage para que el front sea totalmente
// funcional sin backend. Cuando Supabase esté listo, se reemplaza el CUERPO de
// estas funciones por llamadas al cliente de Supabase (src/lib/supabase.ts).
// La FIRMA de cada función está pensada para no tener que cambiar los componentes.
// ============================================================================

import type { Habit, HabitLog, Frequency } from './types';

const HABITS_KEY = 'ht_habits';
const LOGS_KEY = 'ht_logs';

export const PALETTE = ['#6d8cff', '#ff6d9c', '#5fd0a8', '#ffb454', '#b08cff', '#54c7ff'];
export const ICONS = ['🔥', '💪', '📚', '💧', '🏃', '🧘', '🎯', '🛏️', '🥗', '✍️'];

// ---------- Utilidades de fecha (día local en formato YYYY-MM-DD) ----------

export function toKey(date: Date): string {
  const y = date.getFullYear();
  // BUG INTENCIONAL (solo para demostrar que el pipeline falla en rojo):
  // se quitó el "+ 1" del mes, así el test de toKey detecta la regresión.
  // ⚠️ ESTA RAMA NO DEBE MERGEARSE.
  const m = String(date.getMonth()).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayKey(): string {
  return toKey(new Date());
}

function addDays(key: string, delta: number): string {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + delta);
  return toKey(date);
}

// ---------- Helpers de almacenamiento ----------

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function genId(): string {
  if (isBrowser() && typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `id_${Math.floor(Math.random() * 1e9)}_${Date.now()}`;
}

function read<T>(key: string): T[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

// ============================================================================
// API pública del store (lo que usan los componentes)
// ============================================================================

export function getHabits(): Habit[] {
  return read<Habit>(HABITS_KEY).sort(
    (a, b) => a.createdAt.localeCompare(b.createdAt),
  );
}

export function getLogs(): HabitLog[] {
  return read<HabitLog>(LOGS_KEY);
}

export function addHabit(data: {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  frequency?: Frequency;
}): Habit {
  const habits = getHabits();
  const habit: Habit = {
    id: genId(),
    name: data.name.trim(),
    description: data.description?.trim() || undefined,
    icon: data.icon || ICONS[habits.length % ICONS.length],
    color: data.color || PALETTE[habits.length % PALETTE.length],
    frequency: data.frequency || 'daily',
    createdAt: new Date().toISOString(),
  };
  write(HABITS_KEY, [...habits, habit]);
  return habit;
}

export function updateHabit(id: string, patch: Partial<Omit<Habit, 'id' | 'createdAt'>>): void {
  const habits = getHabits().map((h) => (h.id === id ? { ...h, ...patch } : h));
  write(HABITS_KEY, habits);
}

export function deleteHabit(id: string): void {
  write(HABITS_KEY, getHabits().filter((h) => h.id !== id));
  write(LOGS_KEY, getLogs().filter((l) => l.habitId !== id));
}

/** Marca o desmarca el cumplimiento de un hábito en una fecha (toggle). */
export function toggleLog(habitId: string, date: string = todayKey()): void {
  const logs = getLogs();
  const existing = logs.find((l) => l.habitId === habitId && l.date === date);
  if (existing) {
    write(LOGS_KEY, logs.filter((l) => l !== existing));
  } else {
    write(LOGS_KEY, [...logs, { id: genId(), habitId, date }]);
  }
}

export function isDone(habitId: string, date: string = todayKey(), logs?: HabitLog[]): boolean {
  const all = logs ?? getLogs();
  return all.some((l) => l.habitId === habitId && l.date === date);
}

/** Racha actual: días consecutivos cumplidos terminando hoy (o ayer si hoy aún no). */
export function currentStreak(habitId: string, logs?: HabitLog[]): number {
  const all = logs ?? getLogs();
  const done = new Set(all.filter((l) => l.habitId === habitId).map((l) => l.date));

  let streak = 0;
  let cursor = todayKey();
  // Si hoy todavía no se marcó, la racha sigue viva contando desde ayer.
  if (!done.has(cursor)) cursor = addDays(cursor, -1);
  while (done.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/** Devuelve las últimas N fechas (claves) terminando hoy, de más vieja a más nueva. */
export function lastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) days.push(addDays(todayKey(), -i));
  return days;
}

export interface WeekDay {
  key: string; // YYYY-MM-DD
  label: string; // L, M, M, J, V, S, D
  isToday: boolean;
  isFuture: boolean;
}

/** Días de la semana actual, de lunes a domingo. */
export function currentWeek(): WeekDay[] {
  const labels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const now = new Date();
  const dow = now.getDay(); // 0 = domingo … 6 = sábado
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);

  const today = todayKey();
  const week: WeekDay[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = toKey(d);
    week.push({ key, label: labels[i], isToday: key === today, isFuture: key > today });
  }
  return week;
}
