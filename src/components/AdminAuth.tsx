import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, Loader2, LogIn, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminAuth() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        alert('Registro exitoso. Revisa tu correo o inicia sesión.');
        setMode('login');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Error en la autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-8 md:p-12 border border-slate-200 shadow-2xl rounded-[2.5rem] relative overflow-hidden"
      >
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[100px] -mr-16 -mt-16" />
        
        <header className="mb-8 text-center relative z-10">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-ink mb-2 italic">
            {mode === 'login' ? 'Acceso Privado' : 'Crear Cuenta'}
          </h1>
          <p className="text-primary/60 uppercase tracking-[0.2em] text-[9px] font-bold">
            {mode === 'login' ? 'Panel de Administración Gourmet' : 'Únete a la gestión Menú Like'}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Correo Electrónico</label>
            <input 
              required
              type="email"
              className="w-full bg-slate-50 border-b border-slate-200 py-3 text-ink focus:border-primary outline-none transition-colors"
              placeholder="admin@restaurante.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2 relative">
            <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Contraseña</label>
            <div className="relative">
              <input 
                required
                type={showPassword ? 'text' : 'password'}
                className="w-full bg-slate-50 border-b border-slate-200 py-3 text-ink focus:border-primary outline-none transition-colors pr-10"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-500 text-[10px] font-bold uppercase tracking-widest bg-red-50 p-3 rounded-lg text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary py-5 text-white font-bold uppercase tracking-[0.4em] text-[11px] hover:bg-ink transition-all flex items-center justify-center space-x-3 disabled:bg-primary/50 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-primary/10"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />
            )}
            <span>{mode === 'login' ? 'Entrar al Panel' : 'Registrar Cuenta'}</span>
          </button>
        </form>

        <div className="mt-8 text-center relative z-10">
          <button 
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
          >
            {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
