import React from 'react';
import DishCard, { Dish } from './components/DishCard';
import { recordInteraction } from './lib/supabase';

const SAMPLE_DISHES: Dish[] = [
  {
    id: '1',
    nombre: 'Carpaccio de Remolacha & Trufa',
    descripcion: 'Láminas finas de remolacha orgánica, aceite de trufa blanca, piñones tostados y micro-greens de temporada. Una explosión de frescura y elegancia.',
    precio: 18.50,
    imagen_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1000',
    restaurant_id: 'rest-1'
  },
  {
    id: '2',
    nombre: 'Pulpo al Olivo Boutique',
    descripcion: 'Pulpo tierno braseado, emulsión de aceituna botija, papas nativas confitadas y aire de mar. Un clásico reinterpretado con maestría.',
    precio: 24.00,
    imagen_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=1000',
    restaurant_id: 'rest-1'
  }
];

export default function App() {
  const handleLike = async (id: string) => {
    try {
      await recordInteraction(id, 'like');
    } catch (err) {
      console.error('Error in like action:', err);
    }
  };

  const handleSave = async (id: string) => {
    try {
      await recordInteraction(id, 'save');
    } catch (err) {
      console.error('Error in save action:', err);
    }
  };

  const handleShare = (id: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this dish!',
        url: window.location.href,
      });
    } else {
      console.log('Sharing dish:', id);
      alert('Enlace copiado al portapapeles (Simulado)');
    }
  };

  return (
    <div className="min-h-screen bg-editorial-bg text-white font-sans selection:bg-gold/30">
      {/* Header Ficticio - Vogue Style */}
      <header className="sticky top-0 z-50 bg-editorial-bg/80 backdrop-blur-md border-b border-white/10 px-8 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="font-serif italic text-2xl tracking-[0.2em] uppercase text-white">Vogue Gusto</h1>
          <nav>
            <ul className="flex space-x-8 text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">
              <li className="hover:text-gold transition-colors cursor-pointer">Explorar</li>
              <li className="hover:text-gold transition-colors cursor-pointer">Reservas</li>
              <li className="hover:text-gold transition-colors cursor-pointer">Perfil</li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="py-12 px-6 pb-32">
        <div className="max-w-6xl mx-auto flex flex-col items-center mb-16 space-y-4">
          <span className="text-gold text-[10px] font-bold uppercase tracking-[0.5em]">The Spring Edit</span>
          <h2 className="font-serif text-white/50 text-xl font-light italic">Curating the city's most refined culinary experiences</h2>
        </div>

        <div className="space-y-12">
          {SAMPLE_DISHES.map((dish) => (
            <DishCard 
              key={dish.id} 
              dish={dish} 
              onLike={handleLike}
              onSave={handleSave}
              onShare={handleShare}
            />
          ))}
        </div>
      </main>

      {/* Navigation Bar Ficticia - Dark Style */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-editorial-bg/95 backdrop-blur-lg border-t border-white/5 flex items-center justify-around z-50">
        {['Discover', 'Experience', 'Concierge', 'Settings'].map((item) => (
          <button key={item} className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-gold transition-all">
            {item}
          </button>
        ))}
      </nav>
    </div>
  );
}
