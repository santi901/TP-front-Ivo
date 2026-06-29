import { beforeEach, describe, expect, it } from 'vitest';
import {
  toKey,
  todayKey,
  addHabit,
  getHabits,
  updateHabit,
  deleteHabit,
  toggleLog,
  isDone,
  currentStreak,
  getLogs,
  lastNDays,
} from '../../src/lib/store';
import type { HabitLog } from '../../src/lib/types';

// La capa de datos (store.ts) persiste en localStorage. jsdom nos da uno real,
// pero lo limpiamos antes de cada test para que los casos sean independientes.
beforeEach(() => {
  localStorage.clear();
});

// Helper: arma un día (clave YYYY-MM-DD) desplazado N días respecto de hoy.
function dayOffset(delta: number): string {
  const d = new Date();
  d.setDate(d.getDate() + delta);
  return toKey(d);
}

describe('toKey', () => {
  it('formatea una fecha como YYYY-MM-DD con ceros a la izquierda', () => {
    // 5 de marzo de 2025 -> mes y día deben quedar en dos dígitos.
    const date = new Date(2025, 2, 5);
    expect(toKey(date)).toBe('2025-03-05');
  });

  it('usa el día local (no UTC) para no correrse de día por zona horaria', () => {
    const date = new Date(2025, 11, 31, 23, 59);
    expect(toKey(date)).toBe('2025-12-31');
  });
});

describe('addHabit', () => {
  it('crea un hábito con los datos dados y le asigna id y createdAt', () => {
    const habit = addHabit({ name: 'Leer' });
    expect(habit.id).toBeTruthy();
    expect(habit.name).toBe('Leer');
    expect(habit.createdAt).toBeTruthy();
    expect(getHabits()).toHaveLength(1);
  });

  it('recorta espacios del nombre y aplica frecuencia "daily" por defecto', () => {
    const habit = addHabit({ name: '  Meditar  ' });
    expect(habit.name).toBe('Meditar');
    expect(habit.frequency).toBe('daily');
  });

  it('asigna ícono y color por defecto cuando no se pasan', () => {
    const habit = addHabit({ name: 'Tomar agua' });
    expect(habit.icon).toBeTruthy();
    expect(habit.color).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

describe('updateHabit / deleteHabit', () => {
  it('actualiza solo el hábito indicado', () => {
    const a = addHabit({ name: 'Correr' });
    const b = addHabit({ name: 'Leer' });
    updateHabit(a.id, { name: 'Caminar' });

    const habits = getHabits();
    expect(habits.find((h) => h.id === a.id)?.name).toBe('Caminar');
    expect(habits.find((h) => h.id === b.id)?.name).toBe('Leer');
  });

  it('al borrar un hábito también borra sus registros de cumplimiento', () => {
    const habit = addHabit({ name: 'Correr' });
    toggleLog(habit.id, todayKey());
    expect(getLogs()).toHaveLength(1);

    deleteHabit(habit.id);
    expect(getHabits()).toHaveLength(0);
    expect(getLogs()).toHaveLength(0);
  });
});

describe('toggleLog / isDone', () => {
  it('marca un hábito como cumplido y luego lo desmarca (toggle)', () => {
    const habit = addHabit({ name: 'Estirar' });
    const day = todayKey();

    expect(isDone(habit.id, day)).toBe(false);

    toggleLog(habit.id, day);
    expect(isDone(habit.id, day)).toBe(true);

    toggleLog(habit.id, day);
    expect(isDone(habit.id, day)).toBe(false);
  });

  it('no marca como cumplido un día distinto al registrado', () => {
    const habit = addHabit({ name: 'Estirar' });
    toggleLog(habit.id, todayKey());
    expect(isDone(habit.id, dayOffset(-1))).toBe(false);
  });
});

describe('currentStreak', () => {
  it('cuenta días consecutivos cumplidos terminando hoy', () => {
    const logs: HabitLog[] = [
      { id: '1', habitId: 'h1', date: dayOffset(0) },
      { id: '2', habitId: 'h1', date: dayOffset(-1) },
      { id: '3', habitId: 'h1', date: dayOffset(-2) },
    ];
    expect(currentStreak('h1', logs)).toBe(3);
  });

  it('mantiene viva la racha si hoy todavía no se marcó pero ayer sí', () => {
    const logs: HabitLog[] = [
      { id: '1', habitId: 'h1', date: dayOffset(-1) },
      { id: '2', habitId: 'h1', date: dayOffset(-2) },
    ];
    // Hoy no está marcado, pero la racha sigue contando desde ayer.
    expect(currentStreak('h1', logs)).toBe(2);
  });

  it('corta la racha cuando hay un día sin cumplir en el medio', () => {
    const logs: HabitLog[] = [
      { id: '1', habitId: 'h1', date: dayOffset(0) },
      { id: '2', habitId: 'h1', date: dayOffset(-1) },
      // falta el día -2
      { id: '3', habitId: 'h1', date: dayOffset(-3) },
    ];
    expect(currentStreak('h1', logs)).toBe(2);
  });

  it('devuelve 0 si no hay ningún registro reciente', () => {
    const logs: HabitLog[] = [{ id: '1', habitId: 'h1', date: dayOffset(-5) }];
    expect(currentStreak('h1', logs)).toBe(0);
  });
});

describe('lastNDays', () => {
  it('devuelve N días terminando hoy, ordenados de más viejo a más nuevo', () => {
    const days = lastNDays(3);
    expect(days).toHaveLength(3);
    expect(days[2]).toBe(todayKey());
    expect(days[0]).toBe(dayOffset(-2));
    // Verificamos que estén ordenados ascendentemente.
    expect([...days].sort()).toEqual(days);
  });
});
