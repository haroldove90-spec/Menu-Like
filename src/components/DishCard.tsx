import React, { useOptimistic, useTransition } from 'react';
import { Heart, Bookmark, Share2, MoreHorizontal, Edit3, EyeOff } from 'lucide-react';
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
  isAdmin?: boolean;
  onEdit?: (dishId: string) => void;
  onToggleVisibility?: (dishId: string) => void;
  key?: string;
}

export default function DishCard({ 
  dish, 
  onLike, 
  onSave, 
  onShare, 
  isAdmin = false,
  onEdit,
  onToggleVisibility
}: DishCardProps) {
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
      className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[600px_1fr] bg-white overflow-hidden mb-16 border border-slate-200 shadow-sm group/card rounded-3xl"
    >
      {/* Visual Section */}
      <div className="relative aspect-[4/5] md:aspect-auto md:h-[650px] overflow-hidden group">
        <img
          src={dish.imagen_url}
          alt={dish.nombre}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[0.1] group-hover:grayscale-0"
          referrerPolicy="no-referrer"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Admin Shortcuts */}
        {isAdmin && (
          <div className="absolute top-8 right-8 flex space-x-3 z-10">
            <button 
              onClick={() => onEdit?.(dish.id)}
              className="p-3 bg-white/90 backdrop-blur-md border border-slate-200 rounded-full text-slate-600 hover:bg-primary hover:text-white transition-all shadow-lg"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onToggleVisibility?.(dish.id)}
              className="p-3 bg-white/90 backdrop-blur-md border border-slate-200 rounded-full text-slate-600 hover:bg-red-500 hover:text-white transition-all shadow-lg"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Floating Price Badge */}
        <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full border border-slate-100 shadow-lg">
          <span className="text-ink text-sm font-bold tracking-tight">
            ${dish.precio.toFixed(2)}
          </span>
        </div>

        {/* Interaction Bar - Menulike Style */}
        <div className="absolute bottom-10 right-10 flex flex-col space-y-5 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLikeClick}
            disabled={isPending}
            className={`w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-500 shadow-xl ${optimisticLike.isLiked ? 'bg-primary border-primary text-white' : 'bg-white/90 border-slate-200 text-slate-400 hover:text-primary'}`}
          >
            <Heart className={`w-6 h-6 ${optimisticLike.isLiked ? 'fill-current' : ''}`} />
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSaveClick}
            disabled={isPending}
            className={`w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-500 shadow-xl ${optimisticSave ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-white/90 border-slate-200 text-slate-400 hover:text-primary'}`}
          >
            <Bookmark className={`w-6 h-6 ${optimisticSave ? 'fill-current' : ''}`} />
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onShare(dish.id)}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-white/90 backdrop-blur-md border border-slate-200 text-slate-400 hover:text-primary transition-all shadow-xl"
          >
            <Share2 className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-10 md:p-16 flex flex-col justify-center bg-white relative border-l border-slate-100">
        <div className="space-y-8">
          <header className="space-y-3">
            <div className="flex items-center space-x-3 text-primary">
              <span className="w-8 h-px bg-primary/30" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] block">
                Recomendación del Chef
              </span>
            </div>
            <h2 className="font-serif text-5xl md:text-6xl font-black leading-[1.1] text-ink tracking-tight">
              {dish.nombre}
            </h2>
          </header>

          <p className="text-slate-500 text-lg md:text-xl leading-relaxed font-light max-w-md italic font-serif">
            "{dish.descripcion}"
          </p>

          <div className="stats flex gap-12 pt-10 border-t border-slate-100">
            <div className="flex flex-col">
              <span className="text-ink text-2xl font-bold tracking-tight">{optimisticLike.count}</span>
              <span className="text-slate-400 text-[9px] uppercase tracking-[0.2em] mt-2 font-bold">Favoritos</span>
            </div>
            <div className="flex flex-col">
              <span className="text-ink text-2xl font-bold tracking-tight">Platillo Gourmet</span>
              <span className="text-slate-400 text-[9px] uppercase tracking-[0.2em] mt-2 font-bold">Categoría</span>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-16 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-primary/60 text-[9px] uppercase tracking-widest font-bold mb-1">Elaboración artesanal</span>
            <span className="font-serif italic text-ink text-lg">Firma de Menú Like</span>
          </div>
          <button className="text-slate-200 hover:text-primary transition-colors p-2">
            <MoreHorizontal className="w-7 h-7" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
