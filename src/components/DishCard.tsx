import React, { useOptimistic, useTransition } from 'react';
import { Heart, Bookmark, Share2, MoreHorizontal } from 'lucide-react';
import { motion } from 'motion/react';

export interface Dish {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
  restaurant_id: string;
  likes_count?: number;
  is_liked_by_me?: boolean;
  is_saved_by_me?: boolean;
}

export interface DishCardProps {
  dish: Dish;
  onLike: (dishId: string) => Promise<void>;
  onSave: (dishId: string) => Promise<void>;
  onShare: (dishId: string) => void;
  key?: string;
}

export default function DishCard({ dish, onLike, onSave, onShare }: DishCardProps) {
  const [isPending, startTransition] = useTransition();
  
  // Optimistic state for Like
  const [optimisticLike, setOptimisticLike] = useOptimistic(
    { isLiked: !!dish.is_liked_by_me, count: dish.likes_count || 0 },
    (state, action: boolean) => ({
      isLiked: action,
      count: action ? state.count + 1 : Math.max(0, state.count - 1)
    })
  );

  // Optimistic state for Save
  const [optimisticSave, setOptimisticSave] = useOptimistic(
    dish.is_saved_by_me,
    (_, action: boolean) => action
  );

  const handleLikeClick = () => {
    startTransition(async () => {
      setOptimisticLike(!optimisticLike.isLiked);
      await onLike(dish.id);
    });
  };

  const handleSaveClick = () => {
    startTransition(async () => {
      setOptimisticSave(!optimisticSave);
      await onSave(dish.id);
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[600px_1fr] bg-surface overflow-hidden mb-16 border border-white/5 shadow-2xl group/card"
    >
      {/* Visual Section */}
      <div className="relative aspect-[4/5] md:aspect-auto md:h-[650px] overflow-hidden group">
        <img
          src={dish.imagen_url}
          alt={dish.nombre}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[0.3] group-hover:grayscale-0"
          referrerPolicy="no-referrer"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

        {/* Floating Price Badge */}
        <div className="absolute top-8 left-8 bg-black/60 backdrop-blur-2xl px-5 py-2.5 rounded-full border border-white/10 shadow-2xl">
          <span className="text-white text-sm font-light tracking-[0.2em]">
            ${dish.precio.toFixed(2)}
          </span>
        </div>

        {/* Interaction Bar - Editorial Style */}
        <div className="absolute bottom-10 right-10 flex flex-col space-y-5 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLikeClick}
            disabled={isPending}
            className={`w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/10 transition-all duration-500 shadow-2xl ${optimisticLike.isLiked ? 'bg-red-500 border-red-400 shadow-red-500/20' : 'bg-white/5 hover:bg-white/20 text-white'}`}
          >
            <Heart className={`w-6 h-6 ${optimisticLike.isLiked ? 'fill-current' : ''}`} />
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSaveClick}
            disabled={isPending}
            className={`w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/10 transition-all duration-500 shadow-2xl ${optimisticSave ? 'bg-gold border-gold/50 shadow-gold/20' : 'bg-white/5 hover:bg-white/20 text-white'}`}
          >
            <Bookmark className={`w-6 h-6 ${optimisticSave ? 'fill-current' : ''}`} />
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onShare(dish.id)}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/20 backdrop-blur-xl border border-white/10 text-white transition-all shadow-2xl"
          >
            <Share2 className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-10 md:p-16 flex flex-col justify-center bg-surface relative border-l border-white/5">
        <div className="space-y-8">
          <header className="space-y-3">
            <div className="flex items-center space-x-3 text-gold">
              <span className="w-8 h-px bg-gold/50" />
              <span className="text-[10px] font-bold uppercase tracking-[0.5em] block">
                Signature Selection
              </span>
            </div>
            <h2 className="font-serif text-5xl md:text-7xl font-light leading-[1] text-white tracking-tight">
              {dish.nombre}
            </h2>
          </header>

          <p className="text-white/50 text-lg md:text-xl leading-relaxed font-light max-w-md italic font-serif">
            "{dish.descripcion}"
          </p>

          <div className="stats flex gap-12 pt-10 border-t border-white/5">
            <div className="flex flex-col">
              <span className="text-white text-2xl font-light tracking-tight">{optimisticLike.count}</span>
              <span className="text-white/30 text-[9px] uppercase tracking-[0.3em] mt-2 font-bold">Appreciations</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white text-2xl font-light tracking-tight">24</span>
              <span className="text-white/30 text-[9px] uppercase tracking-[0.3em] mt-2 font-bold">Reservations</span>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-16 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-gold/40 text-[9px] uppercase tracking-widest font-bold mb-1">Executive Chef</span>
            <span className="font-serif italic text-gold text-lg">Alessandro Milano</span>
          </div>
          <button className="text-white/10 hover:text-gold transition-colors p-2">
            <MoreHorizontal className="w-7 h-7" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
