// Tipos del dominio. Coinciden con el modelo de datos previsto en Supabase
// (tablas `habits` y `habit_logs`), para que migrar del mock local al backend
// real sea directo.

export type Frequency = 'daily' | 'weekly';

export interface Habit {
  id: string;
  name: string;
  description?: string; // descripción breve opcional
  icon: string;
  color: string;
  frequency: Frequency;
  createdAt: string; // ISO
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD (día en que se cumplió)
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string; // dataURL de la foto de perfil (o vacío)
  bio?: string; // objetivo o frase personal
  createdAt?: string; // ISO, fecha de alta
}
