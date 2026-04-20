import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, Save, Loader2, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminSettings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [restName, setRestName] = useState('Menú Like');
  const [categories, setCategories] = useState<{id: string, nombre: string}[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSettings();
    fetchCategories();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('restaurantes')
        .select('*')
        .eq('id', 'rest-1')
        .single();
      
      if (data) {
        setLogoUrl(data.logo_url);
        setRestName(data.nombre);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (data) setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from('categorias')
        .insert([{ nombre: newCategory.trim() }])
        .select();
      
      if (error) throw error;
      if (data) {
        setCategories([...categories, data[0]]);
        setNewCategory('');
      }
    } catch (err: any) {
      alert('Error al añadir categoría: ' + err.message);
    }
  };

  const handleDeleteCategory = async (id: string, nombre: string) => {
    if (!window.confirm(`¿Seguro que quieres eliminar la categoría "${nombre}"?`)) return;

    try {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setCategories(categories.filter(c => c.id !== id));
    } catch (err: any) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('platillos') // Reutilizamos el bucket platillos o podrías crear uno 'logos'
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('platillos')
        .getPublicUrl(fileName);
      
      setLogoUrl(publicUrl);
    } catch (err: any) {
      alert('Error al subir logo: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('restaurantes')
        .upsert({
          id: 'rest-1',
          nombre: restName,
          logo_url: logoUrl
        });

      if (error) throw error;
      alert('Configuración guardada correctamente');
    } catch (err: any) {
      alert('Error al guardar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 md:py-12 px-2 md:px-6">
      <header className="mb-8 md:mb-12 px-2">
        <h1 className="font-serif text-3xl md:text-5xl font-bold text-ink mb-4 italic">Ajustes del Restaurante</h1>
        <p className="text-primary/60 uppercase tracking-[0.3em] text-[8px] md:text-[10px] font-bold">Personaliza la identidad visual de tu menú</p>
      </header>

      <div className="space-y-6 md:space-y-12">
        {/* Identidad Visual */}
        <div className="bg-white p-5 md:p-12 border border-slate-200 shadow-xl rounded-[1.5rem] md:rounded-[2rem] space-y-8 md:space-y-12">
          {/* Logo Section */}
          <div className="space-y-6">
            <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Logotipo del Restaurante</label>
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
              <div className="relative w-40 h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center overflow-hidden group">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo preview" className="w-full h-full object-contain p-4" />
                ) : (
                  <ImageIcon className="w-12 h-12 text-slate-200" />
                )}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Upload className="text-white w-6 h-6" />
                </div>
              </div>
              <div className="space-y-4 flex-grow">
                <p className="text-sm text-slate-500 italic font-serif">Sube una imagen con fondo transparente para un mejor acabado profesional.</p>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={saving}
                  className="bg-slate-100 px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  Cambiar Imagen
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleLogoChange} 
                  className="hidden" 
                  accept="image/*" 
                />
              </div>
            </div>
          </div>

          {/* Name Section */}
          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Nombre Comercial</label>
            <input 
              type="text"
              className="w-full bg-slate-50 border-b border-slate-200 py-3 text-ink focus:border-primary outline-none transition-colors text-2xl font-serif italic"
              value={restName}
              onChange={(e) => setRestName(e.target.value)}
              placeholder="Nombre de tu restaurante"
            />
          </div>

          <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-primary py-5 text-white font-bold uppercase tracking-[0.4em] text-[11px] hover:bg-ink transition-all flex items-center justify-center space-x-3 disabled:bg-primary/50 disabled:cursor-not-allowed rounded-xl"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Guardando...' : 'Guardar Configuración'}</span>
          </button>
        </div>

        {/* Gestión de Categorías */}
        <div className="bg-white p-5 md:p-12 border border-slate-200 shadow-xl rounded-[1.5rem] md:rounded-[2rem] space-y-8">
          <div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-ink mb-2">Gestión de Categorías</h2>
            <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Crea y organiza las secciones de tu menú</p>
          </div>

          <div className="flex gap-4">
            <input 
              type="text"
              className="flex-grow bg-slate-50 border-b border-slate-200 py-3 px-4 text-ink focus:border-primary outline-none transition-colors"
              placeholder="Nueva categoría (ej: Especialidades)"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
            />
            <button 
              onClick={handleAddCategory}
              className="bg-primary text-white p-3 rounded-xl hover:bg-ink transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            <AnimatePresence>
              {categories.map((cat) => (
                <motion.div 
                  key={cat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group"
                >
                  <span className="font-medium text-slate-700">{cat.nombre}</span>
                  <button 
                    onClick={() => handleDeleteCategory(cat.id, cat.nombre)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-lg opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
