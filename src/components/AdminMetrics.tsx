import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Dish } from './DishCard';
import { Heart, Bookmark, Share2, TrendingUp, BarChart3, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminMetrics() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  async function fetchMetrics() {
    try {
      // Obtenemos los platillos y sus métricas
      // En un caso real, podríamos sumarlos de la tabla de interacciones
      // Para este demo, usaremos las columnas de conteo que el usuario pidió activar
      const { data, error } = await supabase
        .from('platillos')
        .select('*')
        .order('likes_count', { ascending: false });

      if (error) throw error;
      setDishes(data || []);
    } catch (err) {
      console.error('Error fetching metrics:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalLikes = dishes.reduce((acc, dish) => acc + (dish.likes_count || 0), 0);
  const totalSaves = dishes.reduce((acc, dish) => acc + (dish.saves_count || 0), 0);
  const totalShares = dishes.reduce((acc, dish) => acc + (dish.shares_count || 0), 0);

  return (
    <div className="max-w-6xl mx-auto py-8 md:py-12 px-4 md:px-6">
      <header className="mb-8 md:mb-12">
        <h1 className="font-serif text-3xl md:text-5xl font-bold text-ink mb-4 italic">Métricas de Rendimiento</h1>
        <p className="text-primary/60 uppercase tracking-[0.3em] text-[8px] md:text-[10px] font-bold">Analiza el impacto de tu carta gourmet</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 mb-12 md:mb-16">
        <div className="bg-white p-6 md:p-8 border border-slate-100 rounded-3xl shadow-sm flex items-center space-x-6">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0">
            <Heart className="w-6 h-6 md:w-7 md:h-7 fill-current" />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-widest block mb-1">Total Likes</span>
            <span className="text-2xl md:text-3xl font-bold text-ink">{totalLikes}</span>
          </div>
        </div>
        <div className="bg-white p-6 md:p-8 border border-slate-100 rounded-3xl shadow-sm flex items-center space-x-6">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
            <Bookmark className="w-6 h-6 md:w-7 md:h-7 fill-current" />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-widest block mb-1">Guardados</span>
            <span className="text-2xl md:text-3xl font-bold text-ink">{totalSaves}</span>
          </div>
        </div>
        <div className="bg-white p-6 md:p-8 border border-slate-100 rounded-3xl shadow-sm flex items-center space-x-6 sm:col-span-2 lg:col-span-1">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0">
            <Share2 className="w-6 h-6 md:w-7 md:h-7" />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-widest block mb-1">Compartidos</span>
            <span className="text-2xl md:text-3xl font-bold text-ink">{totalShares}</span>
          </div>
        </div>
      </div>

      {/* Dishes Table */}
      <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold">Platillo</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold">Categoría</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold text-center"><Heart className="w-4 h-4 mx-auto" /></th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold text-center"><Bookmark className="w-4 h-4 mx-auto" /></th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold text-center"><Share2 className="w-4 h-4 mx-auto" /></th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold text-right">Rendimiento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-ink">
              {dishes.map((dish) => {
                const totalInteractions = (dish.likes_count || 0) + (dish.saves_count || 0) + (dish.shares_count || 0);
                const percentage = totalInteractions > 0 ? (totalInteractions / (totalLikes + totalSaves + totalShares) * 100).toFixed(1) : 0;

                return (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    key={dish.id} 
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={dish.imagen_url} 
                          className="w-12 h-12 rounded-lg object-cover"
                          alt={dish.nombre}
                        />
                        <span className="font-serif italic font-bold">{dish.nombre}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/5 px-3 py-1 rounded-full">
                        {dish.categoria}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center font-bold">{dish.likes_count || 0}</td>
                    <td className="px-8 py-6 text-center font-bold">{dish.saves_count || 0}</td>
                    <td className="px-8 py-6 text-center font-bold">{dish.shares_count || 0}</td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-primary h-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">{percentage}%</span>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
