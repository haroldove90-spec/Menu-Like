import React, { useState } from 'react';
import { Heart, Bookmark, Share2, MoreHorizontal } from 'lucide-react';
import { motion } from 'motion/react';

export interface Dish {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
  restaurant_id: string;
}

export interface DishCardProps {
  key?: string;
  dish: Dish;
  onLike: (dishId: string) => Promise<void>;
  onSave: (dishId: string) => Promise<void>;
  onShare: (dishId: string) => void;
}

export default function DishCard({ dish, onLike, onSave, onShare }: DishCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleLike = async () => {
    setIsLiked(!isLiked);
    await onLike(dish.id);
  };

  const handleSave = async () => {
    setIsSaved(!isSaved);
    await onSave(dish.id);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[600px_1fr] bg-surface overflow-hidden mb-12 border border-white/5 shadow-2xl"
      id={`dish-card-${dish.id}`}
    >
      {/* Visual Section */}
      <div className="relative aspect-[4/5] md:aspect-auto md:h-[600px] overflow-hidden group">
        <img
          src={dish.imagen_url}
          alt={dish.nombre}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0"
          referrerPolicy="no-referrer"
        />
        
        {/* Editorial Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

        {/* Floating Price Badge */}
        <div className="absolute top-6 left-6 bg-black/70 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20 shadow-xl">
          <span className="text-white text-sm font-light tracking-[0.1em]">
            ${dish.precio.toFixed(2)}
          </span>
        </div>

        {/* Interaction Bar - Vertical Floating */}
        <div className="absolute bottom-8 right-8 flex flex-col space-y-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLike}
            className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 transition-all ${isLiked ? 'bg-red-500/80 border-red-400' : 'bg-white/10 text-white'}`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSave}
            className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 transition-all ${isSaved ? 'bg-gold/80 border-gold' : 'bg-white/10 text-white'}`}
          >
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onShare(dish.id)}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 text-white transition-all"
          >
            <Share2 className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-8 md:p-12 flex flex-col justify-center bg-surface relative">
        <div className="space-y-6">
          <header className="space-y-2">
            <span className="text-gold text-[11px] font-bold uppercase tracking-[0.4em] block">
              Entradas Signature
            </span>
            <h2 className="font-serif text-4xl md:text-6xl font-light leading-[1.1] text-white tracking-tight">
              {dish.nombre}
            </h2>
          </header>

          <p className="text-white/60 text-base md:text-lg leading-relaxed font-light max-w-sm">
            {dish.descripcion}
          </p>

          <div className="stats flex gap-8 pt-8 border-t border-white/10">
            <div className="flex flex-col">
              <span className="text-white text-lg font-medium">1.2k</span>
              <span className="text-white/40 text-[10px] uppercase tracking-widest mt-1">Likes</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white text-lg font-medium">482</span>
              <span className="text-white/40 text-[10px] uppercase tracking-widest mt-1">Saves</span>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-12 flex items-center justify-between">
          <span className="font-serif italic text-gold text-sm">
            Por Chef Alessandro M.
          </span>
          <button className="text-white/20 hover:text-gold transition-colors">
            <MoreHorizontal className="w-6 h-6" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
