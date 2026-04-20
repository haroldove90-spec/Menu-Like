import React from 'react';
import { LayoutDashboard, PlusCircle, BarChart3, LogOut, Settings, QrCode } from 'lucide-react';

interface AdminNavProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
}

export default function AdminNav({ activeView, onViewChange, onLogout }: AdminNavProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Inicio', icon: BarChart3 },
    { id: 'new', label: 'Inventario', icon: PlusCircle },
    { id: 'qrcode', label: 'Código QR', icon: QrCode },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-slate-200 md:border-t-0 md:border-r md:left-0 md:top-0 md:bottom-0 md:w-64 md:h-full flex md:flex-col items-center justify-around md:justify-start md:py-10 z-[100] px-4 md:px-0 shadow-lg md:shadow-none">
      <div className="hidden md:block mb-20 px-4 text-center cursor-pointer" onClick={() => onViewChange('dashboard')}>
        <h2 className="font-serif italic text-primary text-2xl font-bold tracking-tight">Menú Like Admin</h2>
        <p className="text-[8px] uppercase tracking-[0.3em] text-slate-400 mt-1 font-bold">Gestión Gourmet</p>
      </div>

      <nav className="flex md:flex-col md:space-y-4 w-full md:px-4 justify-around md:justify-start items-center">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex flex-col md:flex-row items-center md:space-x-4 p-2 md:p-4 rounded-xl transition-all group md:w-full ${
                isActive 
                  ? 'text-primary md:bg-primary md:text-white md:shadow-lg md:shadow-primary/20' 
                  : 'text-slate-400 hover:text-ink md:hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary md:text-white' : 'group-hover:text-primary'}`} />
              <span className={`text-[8px] md:text-[11px] mt-1 md:mt-0 font-bold uppercase tracking-wider md:tracking-widest ${isActive ? 'text-primary md:text-white font-extrabold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
        
        {/* Mobile Logout - Small Icon */}
        <button 
          onClick={onLogout}
          className="md:hidden flex flex-col items-center p-2 text-red-400"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[8px] mt-1 font-bold uppercase">Salir</span>
        </button>
      </nav>

      <div className="hidden md:block mt-auto w-full px-4">
        <button 
          onClick={onLogout}
          className="w-full flex items-center space-x-4 p-4 rounded-xl text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-all group"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="text-[11px] font-bold uppercase tracking-widest">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}
