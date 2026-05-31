import { useEffect, useState } from 'react';
import {
  getHabits,
  getLogs,
  addHabit,
  updateHabit,
  deleteHabit,
  toggleLog,
  currentStreak,
  isDone,
  todayKey,
} from '../lib/store';
import { getUser } from '../lib/auth';
import type { Habit, HabitLog, Frequency, User } from '../lib/types';
import HabitCard from './HabitCard';
import HabitModal from './HabitModal';

function initials(name: string): string {
  return name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

function motivation(done: number, total: number): string {
  if (total === 0) return 'Creá tu primer hábito para empezar 🌱';
  if (done === 0) return '¡Arrancá el día marcando tu primer hábito! 💪';
  if (done === total) return '¡Completaste todo por hoy! Crack total 🎉';
  if (done / total >= 0.5) return '¡Vas muy bien, seguí así! 🔥';
  return 'Buen comienzo, te quedan algunos más 👏';
}

export default function HabitDashboard() {
  const [loaded, setLoaded] = useState(false);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [user, setUser] = useState<User | null>(null);

  function refresh() {
    setHabits(getHabits());
    setLogs(getLogs());
  }

  useEffect(() => {
    const u = getUser();
    if (!u) {
      window.location.href = '/login';
      return;
    }
    setUser(u);
    refresh();
    setLoaded(true);
  }, []);

  function handleToggle(habitId: string, date: string) {
    toggleLog(habitId, date);
    setLogs(getLogs());
  }

  function handleSave(data: {
    name: string;
    description: string;
    icon: string;
    color: string;
    frequency: Frequency;
  }) {
    if (editing) {
      updateHabit(editing.id, data);
    } else {
      addHabit(data);
    }
    setModalOpen(false);
    setEditing(null);
    refresh();
  }

  function handleEdit(habit: Habit) {
    setEditing(habit);
    setModalOpen(true);
  }

  function handleDelete(habit: Habit) {
    if (window.confirm(`¿Eliminar "${habit.name}"? Se borrarán también sus registros.`)) {
      deleteHabit(habit.id);
      refresh();
    }
  }

  function openNew() {
    setEditing(null);
    setModalOpen(true);
  }

  if (!loaded || !user) {
    return <p className="muted">Cargando…</p>;
  }

  const doneToday = habits.filter((h) => isDone(h.id, todayKey(), logs)).length;
  const bestStreak = habits.reduce((max, h) => Math.max(max, currentStreak(h.id, logs)), 0);
  const pct = habits.length ? Math.round((doneToday / habits.length) * 100) : 0;
  const today = new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div>
      {/* Encabezado */}
      <div className="dash-header">
        <div className="row" style={{ gap: '0.9rem' }}>
          <span className="avatar avatar-md">
            {user.avatar ? <img src={user.avatar} alt="" /> : <span>{initials(user.name)}</span>}
          </span>
          <div>
            <h1 style={{ margin: 0 }}>Hola, {user.name} 👋</h1>
            <p className="muted" style={{ margin: 0, textTransform: 'capitalize' }}>{today}</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Nuevo hábito</button>
      </div>

      {/* Progreso del día */}
      {habits.length > 0 && (
        <div className="panel progress-panel">
          <div className="row between">
            <strong>Progreso de hoy</strong>
            <span className="muted">{doneToday}/{habits.length} hábitos</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <p className="muted" style={{ margin: '0.5rem 0 0' }}>{motivation(doneToday, habits.length)}</p>
        </div>
      )}

      {/* Stats */}
      <div className="stats">
        <div className="stat">
          <div className="value">{habits.length}</div>
          <div className="label">Hábitos</div>
        </div>
        <div className="stat">
          <div className="value">{doneToday}</div>
          <div className="label">Hechos hoy</div>
        </div>
        <div className="stat">
          <div className="value">🔥 {bestStreak}</div>
          <div className="label">Mejor racha</div>
        </div>
      </div>

      {/* Lista / estado vacío */}
      {habits.length === 0 ? (
        <div className="empty-state panel">
          <div style={{ fontSize: '2.5rem' }}>🌱</div>
          <p>Todavía no tenés hábitos.<br />Empezá creando el primero y construí tu racha.</p>
          <button className="btn btn-primary" onClick={openNew}>+ Crear mi primer hábito</button>
        </div>
      ) : (
        <>
          <h2 className="list-title">Mis hábitos</h2>
          <div className="habit-list">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                logs={logs}
                onToggle={handleToggle}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </>
      )}

      {modalOpen && (
        <HabitModal
          habit={editing}
          onSave={handleSave}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
