import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Tarea 1: Lógica de 'Like' y 'Save' (Simulando Server Actions)
 * En una aplicación Next.js real, estas llevarían 'use server' al inicio.
 */

const getSessionId = (): string => {
  let sessionId = localStorage.getItem('social_menu_session');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('social_menu_session', sessionId);
  }
  return sessionId;
};

export async function toggleLikePlatillo(platilloId: string) {
  if (!isSupabaseConfigured) return;
  const sessionId = getSessionId();

  try {
    // Verificar si ya existe el like
    const { data: existing } = await supabase
      .from('interacciones')
      .select('id')
      .match({ platillo_id: platilloId, user_session_id: sessionId, tipo: 'like' })
      .single();

    if (existing) {
      await supabase.from('interacciones').delete().eq('id', existing.id);
      return { action: 'removed' };
    } else {
      await supabase.from('interacciones').insert({
        platillo_id: platilloId,
        user_session_id: sessionId,
        tipo: 'like'
      });
      return { action: 'added' };
    }
  } catch (error) {
    console.error('Error in toggleLike:', error);
    throw error;
  }
}

export async function toggleSavePlatillo(platilloId: string) {
  if (!isSupabaseConfigured) return;
  const sessionId = getSessionId();

  try {
    const { data: existing } = await supabase
      .from('interacciones')
      .select('id')
      .match({ platillo_id: platilloId, user_session_id: sessionId, tipo: 'save' })
      .single();

    if (existing) {
      await supabase.from('interacciones').delete().eq('id', existing.id);
      return { action: 'removed' };
    } else {
      await supabase.from('interacciones').insert({
        platillo_id: platilloId,
        user_session_id: sessionId,
        tipo: 'save'
      });
      return { action: 'added' };
    }
  } catch (error) {
    console.error('Error in toggleSave:', error);
    throw error;
  }
}

/**
 * Tarea 3: Obtener favoritos del usuario
 */
export async function getUserFavorites() {
  if (!isSupabaseConfigured) return [];
  const sessionId = getSessionId();

  const { data, error } = await supabase
    .from('interacciones')
    .select('platillo_id, platillos(*)')
    .match({ user_session_id: sessionId, tipo: 'save' });

  if (error) throw error;
  
  // Mapear para devolver solo los platillos con meta-información
  return data.map(item => ({
    ...item.platillos,
    is_saved_by_me: true
  }));
}
