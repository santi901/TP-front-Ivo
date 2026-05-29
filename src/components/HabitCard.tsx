import { currentStreak, isDone, currentWeek } from '../lib/store';
import type { Habit, HabitLog } from '../lib/types';

interface Props {
  habit: Habit;
  logs: HabitLog[];
  onToggle: (habitId: string, date: string) => void;
  onEdit?: (habit: Habit) => void;
  onDelete?: (habit: Habit) => void;
}

export default function HabitCard({ habit, logs, onToggle, onEdit, onDelete }: Props) {
  const streak = currentStreak(habit.id, logs);
  const week = currentWeek();

  return (
    <div className="habit-card" style={{ borderLeftColor: habit.color }}>
      <div className="hc-head">
        <div className="habit-icon" style={{ background: `${habit.color}22` }}>{habit.icon}</div>
        <div className="hc-info">
          <div className="habit-name">{habit.name}</div>
          {habit.description && <div className="habit-desc">{habit.description}</div>}
        </div>
        <div className="hc-right">
          <span className="streak-badge">🔥 {streak}</span>
          {onEdit && (
            <button className="icon-btn" onClick={() => onEdit(habit)} aria-label="Editar" title="Editar">
              ✏️
            </button>
          )}
          {onDelete && (
            <button className="icon-btn" onClick={() => onDelete(habit)} aria-label="Eliminar" title="Eliminar">
              🗑️
            </button>
          )}
        </div>
      </div>

      <div className="hc-week">
        {week.map((d) => {
          const done = isDone(habit.id, d.key, logs);
          return (
            <div className="hc-day" key={d.key}>
              <span className="hc-day-label">{d.label}</span>
              <button
                className={`day-mark ${done ? 'on' : ''} ${d.isToday ? 'today' : ''}`}
                onClick={() => !d.isFuture && onToggle(habit.id, d.key)}
                disabled={d.isFuture}
                aria-pressed={done}
                aria-label={`${d.label}${done ? ' — hecho' : ''}`}
                title={d.isFuture ? 'Día futuro' : done ? 'Cumplido' : 'Marcar'}
              >
                {done ? '✓' : ''}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
