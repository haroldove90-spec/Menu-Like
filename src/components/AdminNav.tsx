import React from 'react';
import { LayoutDashboard, PlusCircle, BarChart3, LogOut, Settings, QrCode } from 'lucide-react';
import { motion } from 'motion/react';

interface AdminNavProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  customBgColor?: string;
}

export default function AdminNav({ activeView, onViewChange, onLogout, customBgColor }: AdminNavProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Inicio', icon: BarChart3 },
    { id: 'new', label: 'Inventario', icon: PlusCircle },
    { id: 'qrcode', label: 'Código QR', icon: QrCode },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 h-20 bg-ink border-t border-white/5 md:border-t-0 md:border-r md:left-0 md:top-0 md:bottom-0 md:w-64 md:h-full flex md:flex-col items-center justify-around md:justify-start md:py-10 z-[100] px-2 md:px-0 shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.3)] md:shadow-none pb-2 md:pb-0 transition-colors duration-500"
      style={customBgColor ? { backgroundColor: customBgColor } : {}}
    >
      <div className="hidden md:block mb-20 px-4 text-center cursor-pointer" onClick={() => onViewChange('dashboard')}>
        <h2 className="font-serif italic text-primary text-2xl font-bold tracking-tight">Menú Like Admin</h2>
        <p className="text-[8px] uppercase tracking-[0.3em] text-slate-300 mt-1 font-bold">Gestión Gourmet</p>
      </div>

      <nav className="flex md:flex-col md:space-y-4 w-full md:px-4 justify-around md:justify-start items-center relative">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`relative flex flex-col md:flex-row items-center md:space-x-4 p-2 md:p-4 rounded-xl transition-all group md:w-full h-full md:h-auto ${
                isActive 
                  ? 'text-primary md:bg-primary/20 md:text-primary' 
                  : 'text-slate-500 hover:text-slate-200 md:hover:bg-white/5'
              }`}
            >
              {/* Mobile Active Background */}
              {isActive && (
                <motion.div 
                  layoutId="admin-bubble"
                  className="absolute inset-x-0 inset-y-1 bg-white/10 rounded-2xl md:hidden -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isActive ? 'text-primary scale-110' : 'group-hover:text-primary group-hover:scale-110'}`} />
              <span className={`text-[7px] md:text-[11px] mt-1 md:mt-0 font-bold uppercase tracking-wider md:tracking-widest transition-colors duration-300 ${isActive ? 'text-white font-extrabold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
        
        {/* Mobile Logout - Pro Style */}
        <button 
          onClick={onLogout}
          className="md:hidden flex flex-col items-center justify-center p-2 text-red-400/40 hover:text-red-400 transition-colors w-16"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[7px] mt-1 font-bold uppercase tracking-wider">Salir</span>
        </button>
      </nav>

      <div className="hidden md:block mt-auto w-full px-4">
        <button 
          onClick={onLogout}
          className="w-full flex items-center space-x-4 p-4 rounded-xl text-red-400/40 hover:text-red-400 hover:bg-red-500/5 transition-all group"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="text-[11px] font-bold uppercase tracking-widest">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}
