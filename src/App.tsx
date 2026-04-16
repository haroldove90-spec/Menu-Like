import React, { useState, useEffect } from 'react';
import DishCard, { Dish } from './components/DishCard';
import FavoritesView from './components/FavoritesView';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import { toggleLikePlatillo, toggleSavePlatillo } from './lib/social';
import { AlertCircle, Menu as MenuIcon, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'feed' | 'favorites'>('feed');
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSupabaseConfigured) {
      loadDishes();
    } else {
      setLoading(false);
    }
  }, []);

  async function loadDishes() {
    try {
      const { data, error } = await supabase
        .from('platillos')
        .select('*');
      
      if (error) throw error;

      // In a real app, we would join with interactions for the 'Me' status.
      // For now we map the basic data.
      setDishes(data || []);
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
    alert(`Compartiendo platillo ${id}`);
  };

  return (
    <div className="min-h-screen bg-editorial-bg text-white font-sans selection:bg-gold/30">
      {/* Config Warning */}
      {!isSupabaseConfigured && (
        <div className="bg-red-500/20 border-b border-red-500/50 p-4 flex items-center justify-center space-x-3 backdrop-blur-sm sticky top-0 z-[100]">
          <AlertCircle className="text-red-500 w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium text-red-200">
            Faltan variables de entorno para Supabase. Usando modo demostración.
          </p>
        </div>
      )}

      {/* Header - Editorial Style */}
      <header className="sticky top-0 z-50 bg-editorial-bg/80 backdrop-blur-md border-b border-white/10 px-8 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 
            onClick={() => setActiveTab('feed')}
            className="font-serif italic text-2xl tracking-[0.2em] uppercase text-white cursor-pointer"
          >
            Vogue Gusto
          </h1>
          <nav>
            <ul className="flex space-x-8 text-[11px] font-bold uppercase tracking-[0.3em] text-white/40">
              <li 
                onClick={() => setActiveTab('feed')}
                className={`transition-colors cursor-pointer hover:text-gold ${activeTab === 'feed' ? 'text-gold' : ''}`}
              >
                Explorar
              </li>
              <li 
                onClick={() => setActiveTab('favorites')}
                className={`transition-colors cursor-pointer hover:text-gold ${activeTab === 'favorites' ? 'text-gold' : ''}`}
              >
                Favoritos
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="pb-32">
        {activeTab === 'feed' ? (
          <div className="py-12 px-6">
            <div className="max-w-6xl mx-auto flex flex-col items-center mb-16 space-y-4">
              <span className="text-gold text-[10px] font-bold uppercase tracking-[0.5em]">The Spring Edit</span>
              <h2 className="font-serif text-white/50 text-xl font-light italic">Curating the city's most refined culinary experiences</h2>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-16">
                {dishes.length > 0 ? dishes.map((dish) => (
                  <DishCard 
                    key={dish.id} 
                    dish={dish} 
                    onLike={handleLike}
                    onSave={handleSave}
                    onShare={handleShare}
                  />
                )) : (
                  <div className="text-center py-20 text-white/20 font-serif italic text-xl">
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
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-editorial-bg/95 backdrop-blur-lg border-t border-white/5 flex items-center justify-around z-50">
        <button 
          onClick={() => setActiveTab('feed')}
          className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'feed' ? 'text-gold' : 'text-white/40'}`}
        >
          <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Discover</span>
        </button>
        <button 
          onClick={() => setActiveTab('favorites')}
          className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'favorites' ? 'text-gold' : 'text-white/40'}`}
        >
          <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Curated</span>
        </button>
      </nav>
    </div>
  );
}
