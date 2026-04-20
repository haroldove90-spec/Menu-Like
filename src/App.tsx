import React, { useState, useEffect } from 'react';
import DishCard, { Dish } from './components/DishCard';
import FavoritesView from './components/FavoritesView';
import AdminDishForm from './components/AdminDishForm';
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

  useEffect(() => {
    if (isSupabaseConfigured) {
      loadDishes();
    } else {
      setLoading(false);
    }
  }, [activeTab]);

  async function loadDishes() {
    try {
      let query = supabase
        .from('platillos')
        .select('*');
      
      // Si no es la pestaña admin, solo mostrar platillos disponibles
      if (activeTab !== 'admin') {
        const { data, error } = await query
          .or('disponible.eq.true,disponible.is.null')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setDishes(data || []);
      } else {
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        setDishes(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleLike = async (id: string) => {
    await toggleLikePlatillo(id);
  };

  const handleSave = async (id: string) => {
    await toggleSavePlatillo(id);
  };

  const handleShare = (id: string) => {
    alert(`Enlace copiado para platillo ${id}`);
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
        
        <main className="flex-grow md:ml-64 pb-32 md:pb-12 pt-8 md:pt-12 px-4 md:px-8 min-h-screen">
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
          ) : adminView === 'metrics' ? (
            <div className="max-w-4xl mx-auto py-20 text-center px-4">
              <h1 className="font-serif text-ink text-3xl md:text-5xl mb-8"> Analíticas Culinarias </h1>
              <p className="text-slate-400 italic">Las métricas de rendimiento estarán disponibles próximamente.</p>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto px-2 md:px-0">
              <header className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif text-ink text-3xl md:text-5xl font-bold">Editar Inventario</h1>
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
              src="https://appdesignproyectos.com/menulike.png" 
              alt="Logotipo Menú Like" 
              className="h-10 md:h-12 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <nav>
            <ul className="flex space-x-8 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
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
                Favoritos
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
            <div className="max-w-6xl mx-auto flex flex-col items-center mb-16 space-y-4">
              <span className="text-primary text-[10px] font-bold uppercase tracking-[0.4em]">Experiencia Gastronómica</span>
              <h2 className="font-serif text-slate-500 text-xl font-light italic">Descubriendo los sabores más auténticos de la ciudad</h2>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {dishes.length > 0 ? dishes.map((dish) => (
                  <DishCard 
                    key={dish.id} 
                    dish={dish} 
                    onLike={handleLike}
                    onSave={handleSave}
                    onShare={handleShare}
                  />
                )) : (
                  <div className="text-center py-20 text-slate-400 font-serif italic text-xl">
                    No se encontraron platillos en la base de datos.
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
          <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Guardados</span>
        </button>
      </nav>
    </div>
  );
}
