import { createClient } from '@supabase/supabase-js';

// Obtener las variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Verificar que las claves sean válidas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Faltan las variables de entorno de Supabase. Revisa tu archivo .env.local');
}

// Crear y exportar el cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Función de utilidad para manejar errores de Supabase
export const handleSupabaseError = (error: any) => {
  console.error('Error de Supabase:', error);
  
  // Determinar mensaje de error para mostrar al usuario
  if (error.message) {
    return `Error: ${error.message}`;
  }
  
  return 'Ocurrió un error al comunicarse con la base de datos';
};
