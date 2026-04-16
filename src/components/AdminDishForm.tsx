import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, Plus, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminDishForm() {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: 'Entradas'
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const precioNum = parseFloat(formData.precio);
      if (isNaN(precioNum) || precioNum < 0) {
        throw new Error('El precio debe ser un número positivo');
      }

      let imageUrl = '';
      const file = fileInputRef.current?.files?.[0];

      if (file) {
        // 1. Subir a Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('platillos')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // 2. Obtener URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('platillos')
          .getPublicUrl(fileName);
        
        imageUrl = publicUrl;
      }

      // 3. Insertar en DB
      const { error: insertError } = await supabase.from('platillos').insert({
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: precioNum,
        imagen_url: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1000',
        categoria: formData.categoria,
        restaurant_id: 'rest-1' // ID de ejemplo
      });

      if (insertError) throw insertError;

      alert('¡Platillo publicado con éxito!');
      // Reset
      setFormData({ nombre: '', descripcion: '', precio: '', categoria: 'Entradas' });
      setPreview(null);
    } catch (err: any) {
      alert(err.message || 'Error al publicar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <header className="mb-12">
        <h1 className="font-serif text-5xl font-bold text-ink mb-4">Nueva Creación</h1>
        <p className="text-primary/60 uppercase tracking-[0.3em] text-[10px] font-bold">Publicar platillo en el menú digital</p>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-12 border border-slate-200 shadow-xl relative overflow-hidden rounded-3xl">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[100px] -mr-16 -mt-16" />

        <div className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Nombre del Platillo</label>
            <input 
              required
              className="w-full bg-slate-50 border-b border-slate-200 py-3 text-ink focus:border-primary outline-none transition-colors"
              placeholder="Ej: Carpaccio de Wagyu"
              value={formData.nombre}
              onChange={e => setFormData({...formData, nombre: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Descripción Gourmet</label>
            <textarea 
              required
              rows={3}
              className="w-full bg-slate-50 border-b border-slate-200 py-3 text-ink focus:border-primary outline-none transition-colors resize-none italic font-serif"
              placeholder="Describe los matices y texturas..."
              value={formData.descripcion}
              onChange={e => setFormData({...formData, descripcion: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Precio ($)</label>
              <input 
                required
                type="number"
                step="0.01"
                className="w-full bg-slate-50 border-b border-slate-200 py-3 text-ink focus:border-primary outline-none transition-colors font-mono"
                placeholder="0.00"
                value={formData.precio}
                onChange={e => setFormData({...formData, precio: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Categoría</label>
              <select 
                className="w-full bg-slate-50 border-b border-slate-200 py-3 text-ink focus:border-primary outline-none transition-colors appearance-none"
                value={formData.categoria}
                onChange={e => setFormData({...formData, categoria: e.target.value})}
              >
                <option>Entradas</option>
                <option>Fuertes</option>
                <option>Postres</option>
                <option>Mixología</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-8 flex flex-col">
          <div className="space-y-2 flex-grow">
            <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Visual del Platillo</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative aspect-[4/5] bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer group hover:border-primary/50 transition-all overflow-hidden rounded-2xl"
            >
              <AnimatePresence>
                {preview ? (
                  <motion.img 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    src={preview} 
                    className="absolute inset-0 w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700"
                  />
                ) : (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] uppercase tracking-widest text-slate-300 font-bold">Hacer click para subir</span>
                  </div>
                )}
              </AnimatePresence>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                className="hidden" 
                accept="image/*" 
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary py-5 text-white font-bold uppercase tracking-[0.4em] text-[11px] hover:bg-ink transition-all flex items-center justify-center space-x-3 disabled:bg-primary/50 disabled:cursor-not-allowed rounded-xl"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Publicar Platillo</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
