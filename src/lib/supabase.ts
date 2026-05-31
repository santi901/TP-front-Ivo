import { createClient } from '@supabase/supabase-js';

// Las variables con prefijo PUBLIC_ quedan disponibles también en el navegador
// (las islas React las necesitan). La anon key es pública por diseño; la seguridad
// real la dan las políticas RLS configuradas en Supabase.
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan las variables de entorno de Supabase. Copiá .env.example a .env y completá los valores.',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
