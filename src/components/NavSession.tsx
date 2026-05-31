import { useEffect, useState } from 'react';
import { getUser, logout } from '../lib/auth';
import type { User } from '../lib/types';

function initials(name: string): string {
  return name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

// Navegación que se adapta a si hay sesión iniciada (mock local).
export default function NavSession() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getUser().then((u) => {
      setUser(u);
      setReady(true);
    });
  }, []);

  async function handleLogout() {
    await logout();
    window.location.href = '/';
  }

  // Evita parpadeo de links incorrectos antes de leer localStorage.
  if (!ready) return <span className="nav-links" />;

  if (!user) {
    return (
      <div className="nav-links">
        <a href="/login">Iniciar sesión</a>
        <a href="/register" className="btn btn-sm btn-primary">Registrarse</a>
      </div>
    );
  }

  return (
    <div className="nav-links">
      <a href="/dashboard">Dashboard</a>
      <a href="/profile" className="nav-user" title="Mi perfil">
        <span className="avatar avatar-sm">
          {user.avatar ? <img src={user.avatar} alt="" /> : <span>{initials(user.name)}</span>}
        </span>
        <span>{user.name}</span>
      </a>
      <button className="btn btn-sm btn-ghost" onClick={handleLogout}>Salir</button>
    </div>
  );
}
