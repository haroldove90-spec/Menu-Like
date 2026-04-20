import React, { useEffect, useState } from 'react';
import DishCard, { Dish } from './DishCard';
import { getUserFavorites, toggleLikePlatillo, toggleSavePlatillo } from '../lib/social';
import { motion, AnimatePresence } from 'motion/react';
import { Star } from 'lucide-react';

export default function FavoritesView() {
  const [favorites, setFavorites] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  async function loadFavorites() {
    try {
      const data = await getUserFavorites();
      setFavorites(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleShare = (id: string) => {
    alert(`Enlace copiado para platillo ${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mb-4">
          <Star className="w-5 h-5 fill-current" />
        </div>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-ink mb-2">Mi Menú</h1>
        <p className="text-slate-400 font-light tracking-[0.3em] uppercase text-[8px]">Personal</p>
      </header>

      <AnimatePresence mode="popLayout">
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-[1200px] mx-auto px-4">
            {favorites.map((dish) => (
              <DishCard
                key={dish.id}
                dish={dish}
                onLike={async (id) => { 
                  await toggleLikePlatillo(id);
                  loadFavorites();
                }}
                onSave={async (id) => { 
                  await toggleSavePlatillo(id); 
                  // Remover de la vista localmente para un feedback instantáneo
                  setFavorites(prev => prev.filter(d => d.id !== id));
                }}
                onShare={handleShare}
              />
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 border border-dashed border-slate-200 rounded-3xl"
          >
            <p className="text-slate-300 font-serif italic text-xl">Aún no has guardado ninguna joya culinaria.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
