import { useState, type FormEvent } from 'react';
import { login, register } from '../lib/auth';

interface Props {
  mode: 'login' | 'register';
}

export default function AuthForm({ mode }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim() || (mode === 'register' && !name.trim())) {
      setError('Completá todos los campos.');
      return;
    }

    // NOTA: autenticación simulada (mock local). Reemplazar por Supabase Auth.
    if (mode === 'register') {
      register(name, email, password);
    } else {
      login(email, password);
    }
    window.location.href = '/dashboard';
  }

  return (
    <form className="panel narrow" onSubmit={handleSubmit} style={{ margin: '0 auto' }}>
      <h1>{mode === 'register' ? 'Crear cuenta' : 'Iniciar sesión'}</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        {mode === 'register'
          ? 'Registrate para empezar a seguir tus hábitos.'
          : 'Ingresá para ver tu dashboard.'}
      </p>

      {error && <p className="form-error">{error}</p>}

      {mode === 'register' && (
        <div className="field">
          <label htmlFor="name">Nombre</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
          />
        </div>
      )}

      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
        />
      </div>

      <div className="field">
        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </div>

      <button type="submit" className="btn btn-primary btn-block">
        {mode === 'register' ? 'Crear cuenta' : 'Entrar'}
      </button>

      <p className="muted" style={{ textAlign: 'center', marginBottom: 0, marginTop: '1rem' }}>
        {mode === 'register' ? (
          <>¿Ya tenés cuenta? <a href="/login">Iniciá sesión</a></>
        ) : (
          <>¿No tenés cuenta? <a href="/register">Registrate</a></>
        )}
      </p>
    </form>
  );
}
