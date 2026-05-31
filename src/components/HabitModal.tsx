import { useState, type FormEvent } from 'react';
import { ICONS, PALETTE } from '../lib/store';
import type { Habit, Frequency } from '../lib/types';

interface Props {
  habit?: Habit | null; // si viene, es edición
  onSave: (data: {
    name: string;
    description: string;
    icon: string;
    color: string;
    frequency: Frequency;
  }) => void;
  onClose: () => void;
}

export default function HabitModal({ habit, onSave, onClose }: Props) {
  const [name, setName] = useState(habit?.name ?? '');
  const [description, setDescription] = useState(habit?.description ?? '');
  const [icon, setIcon] = useState(habit?.icon ?? ICONS[0]);
  const [color, setColor] = useState(habit?.color ?? PALETTE[0]);
  const [frequency, setFrequency] = useState<Frequency>(habit?.frequency ?? 'daily');
  const [error, setError] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Poné un nombre para el hábito.');
      return;
    }
    onSave({ name: name.trim(), description: description.trim(), icon, color, frequency });
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>{habit ? 'Editar hábito' : 'Nuevo hábito'}</h2>

        {error && <p className="form-error">{error}</p>}

        <div className="field">
          <label htmlFor="habit-name">Nombre</label>
          <input
            id="habit-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Meditar 10 minutos"
            autoFocus
          />
        </div>

        <div className="field">
          <label htmlFor="habit-desc">Descripción (opcional)</label>
          <textarea
            id="habit-desc"
            className="input"
            rows={2}
            value={description}
            maxLength={120}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Escribir 500 palabras todos los días de semana"
          />
          <span className="muted" style={{ fontSize: '0.78rem' }}>{description.length}/120</span>
        </div>

        <div className="field">
          <label>Ícono</label>
          <div className="picker">
            {ICONS.map((ic) => (
              <button
                key={ic}
                type="button"
                className={ic === icon ? 'selected' : ''}
                onClick={() => setIcon(ic)}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Color</label>
          <div className="picker">
            {PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                className={`swatch ${c === color ? 'selected' : ''}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </div>

        <div className="field">
          <label htmlFor="habit-freq">Frecuencia</label>
          <select
            id="habit-freq"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as Frequency)}
          >
            <option value="daily">Diario</option>
            <option value="weekly">Semanal</option>
          </select>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            {habit ? 'Guardar' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  );
}
