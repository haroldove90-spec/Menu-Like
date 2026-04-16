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
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <header className="mb-16 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/10 text-gold mb-6">
          <Star className="w-6 h-6 fill-current" />
        </div>
        <h1 className="font-serif text-5xl md:text-7xl font-light text-white mb-4">Mis Favoritos</h1>
        <p className="text-white/40 font-light tracking-[0.2em] uppercase text-[10px]">Your personal culinary curation</p>
      </header>

      <AnimatePresence mode="popLayout">
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 gap-12">
            {favorites.map((dish) => (
              <DishCard
                key={dish.id}
                dish={dish}
                onLike={async (id) => { await toggleLikePlatillo(id); }}
                onSave={async (id) => { 
                  await toggleSavePlatillo(id); 
                  // Remover de la vista si se des-guarda
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
            className="text-center py-24 border border-dashed border-white/10 rounded-3xl"
          >
            <p className="text-white/20 font-serif italic text-xl">Aún no has guardado ninguna joya culinaria.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
