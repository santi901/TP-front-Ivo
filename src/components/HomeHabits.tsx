import { useEffect, useState } from 'react';
import { getUser } from '../lib/auth';
import { getHabits, getLogs, toggleLog } from '../lib/store';
import type { Habit, HabitLog } from '../lib/types';
import HabitCard from './HabitCard';

const dayLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

// Imagen de muestra (estática) que se ve cuando NO hay sesión iniciada.
const PREVIEW = [
  { icon: '💪', name: 'Hacer ejercicio', desc: 'Caminar 10.000 pasos', streak: 39, week: [1, 1, 1, 0, 1, 1, 1] },
  { icon: '📚', name: 'Leer un libro', desc: 'Al menos 20 páginas', streak: 7, week: [1, 1, 0, 1, 1, 1, 0] },
  { icon: '💧', name: 'Tomar agua', desc: '3 vasos por día', streak: 12, week: [1, 1, 1, 1, 0, 1, 1] },
];

function StaticPreview() {
  return (
    <div className="preview-window preview-static" aria-hidden="true">
      <div className="preview-bar">
        <span className="dot-r"></span>
        <span className="dot-y"></span>
        <span className="dot-g"></span>
        <strong style={{ marginLeft: '0.5rem' }}>Mis hábitos</strong>
      </div>
      {PREVIEW.map((h, idx) => (
        <div className="preview-habit" key={idx}>
          <div className="row between">
            <div className="row" style={{ gap: '0.6rem' }}>
              <span className="habit-icon">{h.icon}</span>
              <div>
                <div className="habit-name">{h.name}</div>
                <div className="habit-desc">{h.desc}</div>
              </div>
            </div>
            <span className="streak-badge">🔥 {h.streak}</span>
          </div>
          <div className="preview-week">
            {h.week.map((on, i) => (
              <div className="pday" key={i}>
                <span className="pday-label">{dayLabels[i]}</span>
                <span className={`pday-mark ${on ? 'on' : ''}`}>{on ? '✓' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomeHabits() {
  const [mode, setMode] = useState<'loading' | 'user' | 'guest'>('loading');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);

  useEffect(() => {
    if (getUser()) {
      setMode('user');
      setHabits(getHabits());
      setLogs(getLogs());
    } else {
      setMode('guest');
    }
  }, []);

  function handleToggle(habitId: string, date: string) {
    toggleLog(habitId, date);
    setLogs(getLogs());
  }

  // Visitante sin sesión (o mientras se resuelve): mostramos la imagen de muestra.
  if (mode !== 'user') {
    return <StaticPreview />;
  }

  // Usuario logueado: panel interactivo con sus hábitos reales.
  const shown = habits.slice(0, 3);
  return (
    <div className="preview-window">
      <div className="preview-bar">
        <span className="dot-r"></span>
        <span className="dot-y"></span>
        <span className="dot-g"></span>
        <strong style={{ marginLeft: '0.5rem' }}>Mis hábitos</strong>
      </div>

      {shown.length === 0 ? (
        <div className="hh-empty">
          <p style={{ margin: '0 0 0.75rem' }}>Todavía no tenés hábitos.</p>
          <a href="/dashboard" className="btn btn-sm btn-primary">Crear mi primer hábito →</a>
        </div>
      ) : (
        shown.map((h) => <HabitCard key={h.id} habit={h} logs={logs} onToggle={handleToggle} />)
      )}

      {shown.length > 0 && (
        <div className="hh-foot">
          <a href="/dashboard">＋ Agregar o editar hábitos en el dashboard →</a>
        </div>
      )}
    </div>
  );
}
