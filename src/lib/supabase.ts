import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Tarea 1: Esquema de Base de Datos (SQL para Supabase)
 * 
 * -- Tabla de Platillos
 * CREATE TABLE platillos (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   restaurant_id UUID NOT NULL,
 *   nombre TEXT NOT NULL,
 *   descripcion TEXT,
 *   precio DECIMAL(10, 2) NOT NULL,
 *   imagen_url TEXT NOT NULL,
 *   categoria TEXT,
 *   disponible BOOLEAN DEFAULT true,
 *   created_at TIMESTAMPTZ DEFAULT now()
 * );
 * 
 * -- Tabla de Interacciones
 * CREATE TABLE interacciones (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   platillo_id UUID REFERENCES platillos(id) ON DELETE CASCADE,
 *   user_session_id TEXT NOT NULL, -- Puede ser un ID de usuario o un ID de sesión/huella digital
 *   tipo TEXT CHECK (tipo IN ('like', 'save', 'share')),
 *   created_at TIMESTAMPTZ DEFAULT now(),
 *   UNIQUE(platillo_id, user_session_id, tipo) -- Evita duplicidad por sesión/usuario para un mismo tipo
 * );
 * 
 * -- Índices para métricas rápidas
 * CREATE INDEX idx_interacciones_platillo_id ON interacciones(platillo_id);
 * CREATE INDEX idx_interacciones_tipo ON interacciones(tipo);
 */

// Función para obtener o crear un ID de sesión persistente (Tarea 3)
const getSessionId = (): string => {
  let sessionId = localStorage.getItem('social_menu_session');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('social_menu_session', sessionId);
  }
  return sessionId;
};

/**
 * Tarea 3: Función para registrar un "Like" (u otra interacción) asegurando no duplicidad
 */
export async function recordInteraction(platilloId: string, tipo: 'like' | 'save' | 'share') {
  const sessionId = getSessionId();

  try {
    // Si es un like o save, usamos 'upsert' o simplemente intentamos insertar.
    // El 'UNIQUE' constraint en la base de datos se encargará de rechazar duplicados.
    // Para 'share', tal vez queramos permitir múltiples o no. Aquí seguimos la lógica de no duplicados.
    
    const { data, error } = await supabase
      .from('interacciones')
      .insert([
        { 
          platillo_id: platilloId, 
          user_session_id: sessionId, 
          tipo: tipo 
        }
      ])
      .select();

    if (error) {
      // Manejar el caso de que ya exista (código de error 23505 en PostgreSQL para violación de unicidad)
      if (error.code === '23505') {
        console.log(`Interaction ${tipo} already exists for this session.`);
        // Podríamos eliminarlo si queremos un comportamiento de "toggle"
        if (tipo !== 'share') {
          const { error: deleteError } = await supabase
            .from('interacciones')
            .delete()
            .match({ platillo_id: platilloId, user_session_id: sessionId, tipo: tipo });
          
          if (deleteError) throw deleteError;
          return { status: 'removed' };
        }
      } else {
        throw error;
      }
    }

    return { status: 'created', data };
  } catch (error) {
    console.error('Error recording interaction:', error);
    throw error;
  }
}
