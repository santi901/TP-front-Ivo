import { useEffect, useState } from 'react';
import { getUser } from '../lib/auth';

interface Props {
  variant?: 'hero' | 'band';
}

// Botones de la home que cambian según si hay sesión iniciada.
export default function HomeCta({ variant = 'hero' }: Props) {
  const [state, setState] = useState<'loading' | 'in' | 'out'>('loading');

  useEffect(() => {
    setState(getUser() ? 'in' : 'out');
  }, []);

  // Reserva el espacio para evitar saltos de layout mientras lee la sesión.
  if (state === 'loading') {
    return <div className="cta-row" style={{ minHeight: '2.6rem' }} />;
  }

  if (state === 'in') {
    return (
      <div className="cta-row">
        <a href="/dashboard" className="btn btn-primary">Ir a mi dashboard</a>
        {variant === 'hero' && (
          <a href="/profile" className="btn btn-ghost">Mi perfil</a>
        )}
      </div>
    );
  }

  if (variant === 'band') {
    return (
      <div className="cta-row">
        <a href="/register" className="btn btn-primary">Crear mi cuenta</a>
      </div>
    );
  }

  return (
    <div className="cta-row">
      <a href="/register" className="btn btn-primary">Empezar gratis</a>
      <a href="/login" className="btn btn-ghost">Ya tengo cuenta</a>
    </div>
  );
}
