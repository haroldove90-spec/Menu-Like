import React from 'react';
import { LayoutDashboard, PlusCircle, BarChart3, LogOut, Settings } from 'lucide-react';

interface AdminNavProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
}

export default function AdminNav({ activeView, onViewChange, onLogout }: AdminNavProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new', label: 'Nuevo Platillo', icon: PlusCircle },
    { id: 'metrics', label: 'Métricas', icon: BarChart3 },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <div className="fixed left-0 top-0 bottom-0 w-24 md:w-64 bg-surface border-r border-white/5 flex flex-col items-center py-10 z-[100]">
      <div className="mb-20 px-4 text-center">
        <h2 className="hidden md:block font-serif italic text-gold text-2xl">Vogue Admin</h2>
        <div className="md:hidden w-10 h-10 bg-gold rounded-sm mx-auto" />
      </div>

      <nav className="flex-grow space-y-6 w-full px-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center space-x-4 p-4 rounded-xl transition-all group ${
                isActive 
                  ? 'bg-gold text-black shadow-lg shadow-gold/20' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-black' : 'group-hover:text-gold'}`} />
              <span className={`hidden md:block text-[11px] font-bold uppercase tracking-widest ${isActive ? 'text-black font-extrabold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto w-full px-4">
        <button 
          onClick={onLogout}
          className="w-full flex items-center space-x-4 p-4 rounded-xl text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-all group"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="hidden md:block text-[11px] font-bold uppercase tracking-widest">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}
