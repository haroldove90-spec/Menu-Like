import React, { useOptimistic, useTransition } from 'react';
import { Heart, Bookmark, Share2, MoreHorizontal, Edit3, EyeOff, X } from 'lucide-react';
import { motion } from 'motion/react';

export interface Dish {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
  restaurant_id: string;
  categoria?: string;
  disponible?: boolean;
  likes_count?: number;
  saves_count?: number;
  shares_count?: number;
  is_liked_by_me?: boolean;
  is_saved_by_me?: boolean;
}

export interface DishCardProps {
  dish: Dish;
  onLike: (dishId: string) => Promise<void>;
  onSave: (dishId: string) => Promise<void>;
  onShare: (dishId: string) => void;
  isAdmin?: boolean;
  onEdit?: (dish: Dish) => void;
  onToggleVisibility?: (dishId: string, current: boolean) => void;
  onDelete?: (dishId: string) => void;
  key?: string;
}

export default function DishCard({ 
  dish, 
  onLike, 
  onSave, 
  onShare, 
  isAdmin = false,
  onEdit,
  onToggleVisibility,
  onDelete
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

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    startTransition(async () => {
      setOptimisticLike(!optimisticLike.isLiked);
      await onLike(dish.id);
    });
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    startTransition(async () => {
      setOptimisticSave(!optimisticSave);
      await onSave(dish.id);
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 relative flex flex-col h-full"
    >
      {/* Visual Section */}
      <div className="relative aspect-[1/1] overflow-hidden">
        <img
          src={dish.imagen_url}
          alt={dish.nombre}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Floating Price */}
        <div className="absolute top-2 left-2 z-10">
          <div className="bg-white/95 backdrop-blur-md px-2 py-1 rounded-lg border border-slate-100 shadow-sm">
            <span className="text-ink text-[10px] font-bold">
              ${dish.precio.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Interaction Bar Overlay - Adjusted for size */}
        <div className="absolute inset-0 flex items-center justify-center space-x-2 transition-all duration-500">
          <button 
            onClick={handleLikeClick}
            disabled={isPending}
            className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border transition-all ${optimisticLike.isLiked ? 'bg-white border-red-500 text-red-500' : 'bg-white/80 border-slate-100 text-slate-400'}`}
          >
            <Heart className={`w-4 h-4 ${optimisticLike.isLiked ? 'fill-current' : ''}`} />
          </button>
          
          <button 
            onClick={handleSaveClick}
            disabled={isPending}
            className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border transition-all ${optimisticSave ? 'bg-primary border-primary text-white' : 'bg-white/80 border-slate-100 text-slate-400'}`}
          >
            <Bookmark className={`w-4 h-4 ${optimisticSave ? 'fill-current' : ''}`} />
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); onShare(dish.id); }}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/80 backdrop-blur-md border border-slate-100 text-slate-400"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Admin Floaties - Restored and Compacted */}
        {isAdmin && (
          <div className="absolute top-2 right-2 flex flex-col space-y-1 z-20">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit?.(dish); }}
              className="w-6 h-6 bg-white/90 border border-slate-100 rounded-full flex items-center justify-center text-slate-600 shadow-sm"
            >
              <Edit3 className="w-3 h-3" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onToggleVisibility?.(dish.id, !!dish.disponible); }}
              className={`w-6 h-6 bg-white/90 border border-slate-100 rounded-full flex items-center justify-center shadow-sm ${dish.disponible === false ? 'bg-amber-500 text-white' : 'text-slate-600'}`}
            >
              <EyeOff className="w-3 h-3" />
            </button>
            <button 
              onClick={(e) => { 
                e.stopPropagation();
                if (window.confirm('¿Estás seguro de eliminar este platillo?')) {
                  onDelete?.(dish.id);
                }
              }}
              className="w-6 h-6 bg-white/90 border border-slate-100 rounded-full flex items-center justify-center text-slate-600 shadow-sm"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Content Section - Compact */}
      <div className="p-3 flex flex-col flex-grow bg-white">
        <div className="flex-grow">
          <span className="text-primary text-[7px] font-bold uppercase tracking-widest block mb-1">
            {dish.categoria || 'Gourmet'}
          </span>
          <h3 className="font-serif text-sm font-bold text-ink leading-tight line-clamp-1">
            {dish.nombre}
          </h3>
          <p className="text-slate-400 text-[10px] line-clamp-1 italic font-serif mt-1">
            {dish.descripcion}
          </p>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Heart className={`w-3 h-3 ${optimisticLike.isLiked ? 'text-red-500 fill-red-500' : 'text-slate-300'}`} />
            <span className="text-ink text-[9px] font-bold">{optimisticLike.count}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Bookmark className={`w-3 h-3 ${optimisticSave ? 'text-primary fill-primary' : 'text-slate-300'}`} />
            <span className="text-ink text-[9px] font-bold">{dish.saves_count || 0}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Share2 className="w-3 h-3 text-slate-300" />
            <span className="text-ink text-[9px] font-bold">{dish.shares_count || 0}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
