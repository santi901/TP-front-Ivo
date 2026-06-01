import { useEffect, useRef, useState, type FormEvent, type ChangeEvent } from 'react';
import { getUser, updateUser, logout } from '../lib/auth';
import { getHabits, getLogs, currentStreak } from '../lib/store';
import type { User } from '../lib/types';

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function ProfileForm() {
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<string>('');
  const [createdAt, setCreatedAt] = useState<string | undefined>();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ habits: 0, bestStreak: 0, checkins: 0 });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getUser().then((user) => {
      if (!user) {
        window.location.href = '/login';
        return;
      }
      setName(user.name);
      setEmail(user.email);
      setBio(user.bio ?? '');
      setAvatar(user.avatar ?? '');
      setCreatedAt(user.createdAt);

      const habits = getHabits();
      const logs = getLogs();
      const best = habits.reduce((max, h) => Math.max(max, currentStreak(h.id, logs)), 0);
      setStats({ habits: habits.length, bestStreak: best, checkins: logs.length });

      setLoaded(true);
    });
  }, []);

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('El archivo tiene que ser una imagen.');
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      setError('La imagen es muy pesada (máx. 1.5 MB).');
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre no puede estar vacío.');
      return;
    }
    setError('');
    try {
      await updateUser({ name: name.trim(), email: email.trim(), bio: bio.trim(), avatar } as Partial<User>);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err?.message ?? 'No se pudieron guardar los cambios.');
    }
  }

  async function handleLogout() {
    await logout();
    window.location.href = '/login';
  }

  if (!loaded) return <p className="muted">Cargando…</p>;

  const memberSince = createdAt
    ? new Date(createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  return (
    <div className="profile-layout">
      {/* Tarjeta resumen */}
      <aside className="panel profile-summary">
        <div className="avatar avatar-lg">
          {avatar ? <img src={avatar} alt="Foto de perfil" /> : <span>{initials(name)}</span>}
        </div>
        <h2 style={{ margin: '0.75rem 0 0' }}>{name}</h2>
        <p className="muted" style={{ margin: 0 }}>{email}</p>
        {bio && <p style={{ marginTop: '0.75rem' }}>{bio}</p>}
        <p className="muted" style={{ fontSize: '0.82rem', marginTop: '0.75rem' }}>
          📅 Miembro desde {memberSince}
        </p>

        <div className="profile-stats">
          <div>
            <div className="value">{stats.habits}</div>
            <div className="label">Hábitos</div>
          </div>
          <div>
            <div className="value">🔥 {stats.bestStreak}</div>
            <div className="label">Mejor racha</div>
          </div>
          <div>
            <div className="value">{stats.checkins}</div>
            <div className="label">Check-ins</div>
          </div>
        </div>
      </aside>

      {/* Formulario de edición */}
      <form className="panel" onSubmit={handleSubmit}>
        <h1>Editar perfil</h1>
        {error && <p className="form-error">{error}</p>}
        {saved && <p style={{ color: 'var(--success)' }}>✓ Cambios guardados</p>}

        <div className="field">
          <label>Foto de perfil</label>
          <div className="avatar-edit">
            <div className="avatar">
              {avatar ? <img src={avatar} alt="Foto de perfil" /> : <span>{initials(name)}</span>}
            </div>
            <div className="row" style={{ gap: '0.5rem' }}>
              <button type="button" className="btn btn-sm" onClick={() => fileRef.current?.click()}>
                Subir foto
              </button>
              {avatar && (
                <button type="button" className="btn btn-sm btn-danger" onClick={() => setAvatar('')}>
                  Quitar
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="p-name">Nombre</label>
          <input id="p-name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="p-email">Email</label>
          <input id="p-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="p-bio">Tu objetivo (opcional)</label>
          <textarea
            id="p-bio"
            className="input"
            rows={3}
            value={bio}
            maxLength={140}
            placeholder="Ej: Quiero ser más constante con el ejercicio y la lectura."
            onChange={(e) => setBio(e.target.value)}
          />
          <span className="muted" style={{ fontSize: '0.78rem' }}>{bio.length}/140</span>
        </div>

        <button type="submit" className="btn btn-primary btn-block">Guardar cambios</button>
        <button
          type="button"
          className="btn btn-ghost btn-block"
          style={{ marginTop: '0.75rem' }}
          onClick={handleLogout}
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
