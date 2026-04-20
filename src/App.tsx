import React, { useState, useEffect } from 'react';
import DishCard, { Dish } from './components/DishCard';
import FavoritesView from './components/FavoritesView';
import AdminDishForm from './components/AdminDishForm';
import AdminSettings from './components/AdminSettings';
import AdminMetrics from './components/AdminMetrics';
import AdminQRCode from './components/AdminQRCode';
import AdminNav from './components/AdminNav';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import { toggleLikePlatillo, toggleSavePlatillo } from './lib/social';
import { AlertCircle, Menu as MenuIcon, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'feed' | 'favorites' | 'admin'>('feed');
  const [adminView, setAdminView] = useState('dashboard');
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [categories, setCategories] = useState<{id: string, nombre: string}[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  useEffect(() => {
    // Asegurar que exista una sesión para interacciones sociales desde el inicio
    if (!localStorage.getItem('social_menu_session')) {
      localStorage.setItem('social_menu_session', crypto.randomUUID());
    }
    fetchRestaurant();
    fetchCategories();
    if (isSupabaseConfigured) {
      loadDishes();
    } else {
      setLoading(false);
    }
  }, [activeTab]);

  async function fetchRestaurant() {
    try {
      const { data } = await supabase.from('restaurantes').select('*').eq('id', 'rest-1').single();
      if (data) setRestaurant(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchCategories() {
    try {
      const { data } = await supabase.from('categorias').select('*').order('created_at', { ascending: true });
      if (data) setCategories(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadDishes() {
    // Solo mostrar el spinner si no hay platos previos para evitar parpadeos molestos
    if (dishes.length === 0) setLoading(true);
    
    try {
      const sessionId = localStorage.getItem('social_menu_session');
      
      // Consulta base
      let query = supabase.from('platillos').select('*');
      
      // Aplicar filtros de forma segura
      if (activeTab !== 'admin') {
        // En lugar de un .or complejo que puede fallar si la columna no existe 
        // o si Supabase tiene problemas con esa sintaxis, traemos y filtramos localmente
        // o usamos un filtro más simple.
        query = query.filter('disponible', 'neq', false);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error de Supabase:", error);
        // Si hay error (ej: columna no existe), intentamos traer todo sin filtros
        const { data: fallbackData } = await supabase.from('platillos').select('*').order('created_at', { ascending: false });
        if (fallbackData) {
          setDishes(fallbackData);
          return;
        }
        throw error;
      }

      const rawDishes = data || [];

      // Enriquecer con estados de interacción si hay sesión
      if (sessionId && rawDishes.length > 0) {
        const { data: interactions, error: intError } = await supabase
          .from('interacciones')
          .select('platillo_id, tipo')
          .eq('user_session_id', sessionId);
        
        if (intError) {
          console.warn("Error cargando interacciones:", intError);
          setDishes(rawDishes);
          return;
        }

        const enriched = rawDishes.map(dish => ({
          ...dish,
          is_liked_by_me: interactions?.some(i => i.platillo_id === dish.id && i.tipo === 'like'),
          is_saved_by_me: interactions?.some(i => i.platillo_id === dish.id && i.tipo === 'save')
        }));
        setDishes(enriched);
      } else {
        setDishes(rawDishes);
      }
    } catch (err) {
      console.error("Error crítico cargando platillos:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleLike = async (id: string) => {
    await toggleLikePlatillo(id);
    loadDishes();
  };

  const handleSave = async (id: string) => {
    await toggleSavePlatillo(id);
    loadDishes();
  };

  const handleShare = async (id: string) => {
    try {
      const shareUrl = `${window.location.origin}/dish/${id}`;
      const dish = dishes.find(d => d.id === id);
      const text = `¡Mira este platillo delicioso: ${dish?.nombre}!`;

      // Intentar Web Share API si está disponible (mejor para móviles)
      if (navigator.share) {
        await navigator.share({
          title: 'Gourmet Share',
          text: text,
          url: shareUrl,
        });
      } else {
        // Fallback a WhatsApp y Clipboard
        const waUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + shareUrl)}`;
        window.open(waUrl, '_blank');
        await navigator.clipboard.writeText(shareUrl);
        alert('¡Enlace copiado al portapapeles y preparando WhatsApp!');
      }
      
      // Incrementar contador de compartidos en DB
      const { data: dishData } = await supabase.from('platillos').select('shares_count').eq('id', id).single();
      const currentShares = dishData?.shares_count || 0;
      
      await supabase
        .from('platillos')
        .update({ shares_count: currentShares + 1 })
        .eq('id', id);

      loadDishes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (dish: Dish) => {
    setEditingDish(dish);
    setAdminView('new'); 
  };

  const handleToggleVisibility = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase
        .from('platillos')
        .update({ disponible: !current })
        .eq('id', id);
      
      if (error) throw error;
      await loadDishes();
    } catch (err) {
      console.error(err);
      alert('Error al cambiar visibilidad');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('platillos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await loadDishes();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar platillo');
    }
  };

  const handleLogout = () => {
    setActiveTab('feed');
  };

  if (activeTab === 'admin') {
    return (
      <div className="min-h-screen bg-page-bg text-ink font-sans selection:bg-primary/20 flex">
        <AdminNav 
          activeView={adminView} 
          onViewChange={setAdminView} 
          onLogout={handleLogout} 
        />
        
        <main className="flex-grow md:ml-64 pb-32 md:pb-12 pt-8 md:pt-12 px-2 md:px-8 min-h-screen w-full overflow-x-hidden">
          {adminView === 'new' ? (
            <AdminDishForm 
              dishToEdit={editingDish} 
              onSuccess={() => {
                setEditingDish(null);
                setAdminView('dashboard');
                loadDishes();
              }} 
              onCancel={() => {
                setEditingDish(null);
                setAdminView('dashboard');
              }}
            />
          ) : adminView === 'settings' ? (
            <AdminSettings />
          ) : adminView === 'metrics' ? (
            <AdminMetrics />
          ) : adminView === 'qrcode' ? (
            <AdminQRCode />
          ) : (
            <div className="max-w-6xl mx-auto px-2 md:px-0">
              <header className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif text-ink text-3xl md:text-5xl font-bold italic">Editar Inventario</h1>
                  <p className="text-primary uppercase tracking-widest text-[8px] md:text-[9px] mt-2 font-bold">Gestionar el catálogo gourmet</p>
                </div>
                <button 
                  onClick={() => {
                    setEditingDish(null);
                    setAdminView('new');
                  }}
                  className="bg-primary w-full md:w-auto px-8 py-3 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-ink transition-all rounded-full shadow-lg"
                >
                  Agregar Nuevo
                </button>
              </header>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {dishes.map((dish) => (
                  <DishCard 
                    key={dish.id} 
                    dish={dish} 
                    isAdmin={true}
                    onLike={async () => {}}
                    onSave={async () => {}}
                    onShare={handleShare}
                    onEdit={handleEdit}
                    onToggleVisibility={handleToggleVisibility}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-bg text-ink font-sans selection:bg-primary/20">
      {/* Config Warning */}
      {!isSupabaseConfigured && (
        <div className="bg-red-50 border-b border-red-200 p-4 flex items-center justify-center space-x-3 sticky top-0 z-[100]">
          <AlertCircle className="text-red-500 w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium text-red-800">
            Modo demostración: Faltan variables de entorno para Supabase.
          </p>
        </div>
      )}

      {/* Header - Menulike Branding */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div 
            onClick={() => setActiveTab('feed')}
            className="cursor-pointer transition-transform hover:scale-105"
          >
            <img 
              src={restaurant?.logo_url || "https://appdesignproyectos.com/menulike.png"} 
              alt={restaurant?.nombre || "Logotipo Menú Like"} 
              className="h-10 md:h-12 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <nav>
            <ul className="flex space-x-6 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
              <li 
                onClick={() => setActiveTab('feed')}
                className={`transition-colors cursor-pointer hover:text-primary ${activeTab === 'feed' ? 'text-primary' : ''}`}
              >
                Menú
              </li>
              <li 
                onClick={() => setActiveTab('favorites')}
                className={`transition-colors cursor-pointer hover:text-primary ${activeTab === 'favorites' ? 'text-primary' : ''}`}
              >
                Mi Menú
              </li>
              <li 
                onClick={() => setActiveTab('admin')}
                className={`transition-colors cursor-pointer hover:text-primary ${activeTab === 'admin' ? 'text-primary' : ''}`}
              >
                Panel
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="pb-32">
        {activeTab === 'feed' ? (
          <div className="py-12 px-6">
            <div className="max-w-6xl mx-auto flex flex-col items-center mb-12 px-4">
              {restaurant?.logo_url ? (
                <img 
                  src={restaurant.logo_url} 
                  alt={restaurant.nombre} 
                  className="h-24 md:h-40 object-contain mb-8"
                />
              ) : (
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-8">
                  <span className="text-slate-300 font-serif italic">Logo</span>
                </div>
              )}

              {/* Categorías Filter */}
              <div className="flex items-center space-x-3 overflow-x-auto pb-4 w-full justify-start md:justify-center no-scrollbar">
                <button
                  onClick={() => setSelectedCategory('todos')}
                  className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap transition-all border ${
                    selectedCategory === 'todos' 
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105' 
                      : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                  }`}
                >
                  Todos
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.nombre)}
                    className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap transition-all border ${
                      selectedCategory === cat.nombre 
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105' 
                        : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    {cat.nombre}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-[1200px] mx-auto px-4">
                {dishes.filter(d => selectedCategory === 'todos' || d.categoria === selectedCategory).length > 0 ? 
                  dishes
                    .filter(d => selectedCategory === 'todos' || d.categoria === selectedCategory)
                    .map((dish) => (
                      <DishCard 
                        key={dish.id} 
                        dish={dish} 
                        onLike={handleLike}
                        onSave={handleSave}
                        onShare={handleShare}
                      />
                    )) : (
                  <div className="text-center py-20 px-6 bg-white rounded-[2rem] border border-dashed border-slate-200 w-full col-span-full">
                    <p className="text-slate-400 font-serif italic text-xl mb-6">
                      No se encontraron platillos en esta categoría.
                    </p>
                    <button 
                      onClick={() => setSelectedCategory('todos')}
                      className="px-8 py-3 bg-slate-900 text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-primary transition-all"
                    >
                      Ver todos los platillos
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <FavoritesView />
        )}
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/95 backdrop-blur-xl border-t border-slate-200 flex items-center justify-around z-50">
        <button 
          onClick={() => setActiveTab('feed')}
          className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'feed' ? 'text-primary' : 'text-slate-400'}`}
        >
          <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Cerca de ti</span>
        </button>
        <button 
          onClick={() => setActiveTab('favorites')}
          className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'favorites' ? 'text-primary' : 'text-slate-400'}`}
        >
          <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Mi Menú</span>
        </button>
      </nav>
    </div>
  );
}
