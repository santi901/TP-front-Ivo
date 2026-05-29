import { useEffect, useState } from 'react';
import { getUser } from '../lib/auth';
import { getHabits, getLogs, toggleLog, currentWeek } from '../lib/store';
import type { Habit, HabitLog } from '../lib/types';
import HabitCard from './HabitCard';

// Hábitos de demostración para visitantes sin sesión (no se guardan).
const DEMO_HABITS: Habit[] = [
  { id: 'demo-1', name: 'Hacer ejercicio', description: 'Caminar 10.000 pasos', icon: '💪', color: '#6d8cff', frequency: 'daily', createdAt: '' },
  { id: 'demo-2', name: 'Leer un libro', description: 'Al menos 20 páginas', icon: '📚', color: '#5fd0a8', frequency: 'daily', createdAt: '' },
];

// Marca los días pasados de la semana (deja hoy libre para que el visitante lo pruebe).
function demoLogs(): HabitLog[] {
  const logs: HabitLog[] = [];
  const week = currentWeek();
  for (const h of DEMO_HABITS) {
    week.forEach((d, i) => {
      if (!d.isToday && !d.isFuture && i % 4 !== 2) {
        logs.push({ id: `${h.id}-${d.key}`, habitId: h.id, date: d.key });
      }
    });
  }
  return logs;
}

export default function HomeHabits() {
  const [mode, setMode] = useState<'loading' | 'user' | 'demo'>('loading');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);

  useEffect(() => {
    if (getUser()) {
      setMode('user');
      setHabits(getHabits());
      setLogs(getLogs());
    } else {
      setMode('demo');
      setHabits(DEMO_HABITS);
      setLogs(demoLogs());
    }
  }, []);

  function handleToggle(habitId: string, date: string) {
    if (mode === 'user') {
      toggleLog(habitId, date);
      setLogs(getLogs());
    } else {
      // Demo: solo en memoria, no persiste.
      setLogs((prev) => {
        const existing = prev.find((l) => l.habitId === habitId && l.date === date);
        if (existing) return prev.filter((l) => l !== existing);
        return [...prev, { id: `${habitId}-${date}`, habitId, date }];
      });
    }
  }

  const shown = habits.slice(0, 3);

  return (
    <div className="preview-window">
      <div className="preview-bar">
        <span className="dot-r"></span>
        <span className="dot-y"></span>
        <span className="dot-g"></span>
        <strong style={{ marginLeft: '0.5rem' }}>Mis hábitos</strong>
      </div>

      {mode === 'loading' && <p className="muted" style={{ padding: '1rem', margin: 0 }}>Cargando…</p>}

      {mode !== 'loading' && shown.length === 0 && (
        <div className="hh-empty">
          <p style={{ margin: '0 0 0.75rem' }}>Todavía no tenés hábitos.</p>
          <a href="/dashboard" className="btn btn-sm btn-primary">Crear mi primer hábito →</a>
        </div>
      )}

      {shown.map((h) => (
        <HabitCard key={h.id} habit={h} logs={logs} onToggle={handleToggle} />
      ))}

      {mode !== 'loading' && shown.length > 0 && (
        <div className="hh-foot">
          {mode === 'user' ? (
            <a href="/dashboard">＋ Agregar o editar hábitos en el dashboard →</a>
          ) : (
            <a href="/register">Registrate para guardar tus hábitos →</a>
          )}
        </div>
      )}
    </div>
  );
}
