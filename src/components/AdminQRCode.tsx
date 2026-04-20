import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Share2, Printer, Loader2, QrCode } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminQRCode() {
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<any>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRestaurant();
  }, []);

  async function fetchRestaurant() {
    try {
      const { data } = await supabase.from('restaurantes').select('*').eq('id', 'rest-1').single();
      if (data) setRestaurant(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const downloadQR = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    
    try {
      // Intentar crear un canvas temporal con fondo blanco para asegurar calidad
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) throw new Error('No se pudo obtener el contexto del canvas');

      tempCanvas.width = canvas.width + 40;
      tempCanvas.height = canvas.height + 40;
      
      // Fondo blanco
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      
      // Dibujar QR original en el centro
      ctx.drawImage(canvas, 20, 20);

      const link = document.createElement('a');
      link.download = `QR-${restaurant?.nombre || 'Menu'}.png`;
      link.href = tempCanvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading QR:', err);
      // Fallback simple si falla el canvas decorado
      try {
        const link = document.createElement('a');
        link.download = `QR-${restaurant?.nombre || 'Menu'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (innerErr) {
        alert('Error al descargar la imagen. Asegúrate de que el navegador permita descargas.');
      }
    }
  };

  const printQR = () => {
    window.print();
  };

  const shareQR = async () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'codigo-qr-menu.png', { type: 'image/png' });
        
        // Verificar soporte básico de compartir archivos
        const canShare = navigator.canShare && navigator.canShare({ files: [file] });

        if (navigator.share && canShare) {
          await navigator.share({
            title: `Menú de ${restaurant?.nombre || 'Restaurante'}`,
            text: 'Descubre nuestra carta digital escaneando este código QR.',
            files: [file],
          });
        } else if (navigator.share) {
          // Si puede compartir texto pero no archivos
          await navigator.share({
            title: `Menú de ${restaurant?.nombre || 'Restaurante'}`,
            text: `Consulta nuestro menú digital aquí: ${menuUrl}`,
          });
        } else {
          // Copiar al portapapeles como último recurso
          await navigator.clipboard.writeText(menuUrl);
          alert('Enlace copiado al portapapeles. (Tu navegador no admite compartir imágenes directamente)');
        }
      });
    } catch (err) {
      console.error('Error sharing:', err);
      try {
        await navigator.clipboard.writeText(menuUrl);
        alert('Enlace copiado al portapapeles.');
      } catch (e) {
        alert('No se pudo compartir el código');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Use the development URL or a clean production URL
  const menuUrl = window.location.origin;

  return (
    <div className="max-w-4xl mx-auto py-8 md:py-12 px-2 md:px-6 overflow-x-hidden">
      <header className="mb-8 md:mb-12 px-2">
        <h1 className="font-serif text-3xl md:text-5xl font-bold text-ink mb-2 italic break-words leading-tight">Código QR del Menú</h1>
        <p className="text-primary/60 uppercase tracking-[0.3em] text-[8px] md:text-[10px] font-bold">Genera el acceso directo para tus clientes</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start">
        {/* QR Preview Card */}
        <div className="bg-white p-4 md:p-12 border border-slate-200 shadow-2xl rounded-[2rem] md:rounded-[2.5rem] flex flex-col items-center text-center space-y-6 md:space-y-8 md:sticky md:top-8">
          <div className="bg-slate-50 p-4 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border-4 border-double border-slate-100 shadow-inner w-full flex justify-center" id="printable-qr">
            <QRCodeCanvas
              value={menuUrl}
              size={typeof window !== 'undefined' && window.innerWidth < 400 ? 200 : 280}
              level="H"
              includeMargin={true}
              style={{ maxWidth: '100%', height: 'auto' }}
              imageSettings={restaurant?.logo_url ? {
                src: restaurant.logo_url,
                x: undefined,
                y: undefined,
                height: 60,
                width: 60,
                excavate: true,
                crossOrigin: 'anonymous'
              } : undefined}
            />
          </div>
          
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-ink italic">{restaurant?.nombre || 'Tu Restaurante'}</h2>
            <p className="text-slate-400 text-xs font-serif italic text-balance px-4">Escanea para descubrir nuestra carta digital y disfrutar de una experiencia gourmet única.</p>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          
          <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-primary">
            <QrCode className="w-4 h-4" />
            <span>Desarrollado por Menú Like</span>
          </div>
        </div>

        {/* Actions & Instructions */}
        <div className="space-y-6 md:space-y-8 pb-12">
          <div className="bg-white p-6 md:p-8 border border-slate-100 rounded-3xl shadow-sm space-y-6">
            <h3 className="font-bold text-ink text-lg italic font-serif">Acciones Rápidas</h3>
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={downloadQR}
                className="flex items-center justify-between w-full p-4 bg-slate-50 hover:bg-primary hover:text-white transition-all rounded-2xl group"
              >
                <div className="flex items-center space-x-3">
                  <Download className="w-5 h-5" />
                  <span className="font-bold text-xs md:text-sm uppercase tracking-widest">Descargar Imagen</span>
                </div>
                <div className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">PNG</div>
              </button>

              <button 
                onClick={shareQR}
                className="flex items-center justify-between w-full p-4 bg-slate-50 hover:bg-primary hover:text-white transition-all rounded-2xl group"
              >
                <div className="flex items-center space-x-3">
                  <Share2 className="w-5 h-5" />
                  <span className="font-bold text-xs md:text-sm uppercase tracking-widest">Compartir</span>
                </div>
                <div className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">Móvil</div>
              </button>

              <button 
                onClick={printQR}
                className="flex items-center justify-between w-full p-4 bg-slate-50 hover:bg-ink hover:text-white transition-all rounded-2xl group"
              >
                <div className="flex items-center space-x-3">
                  <Printer className="w-5 h-5" />
                  <span className="font-bold text-xs md:text-sm uppercase tracking-widest">Imprimir</span>
                </div>
                <div className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">A4 / Carta</div>
              </button>
            </div>
          </div>

          <div className="bg-[#0f172a] p-6 md:p-10 rounded-[2rem] text-white shadow-2xl relative overflow-hidden border border-blue-500/20">
            {/* Decorative element */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
            
            <h3 className="font-serif italic text-2xl md:text-3xl mb-6 relative z-10 text-blue-200">¿Dónde usar tu QR?</h3>
            <ul className="space-y-4 text-slate-300 text-sm md:text-base relative z-10">
              <li className="flex items-start space-x-4">
                <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                <span>Colócalo en cada mesa para un acceso sin contacto.</span>
              </li>
              <li className="flex items-start space-x-4">
                <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                <span>Publícalo en tus redes sociales para pedidos programados.</span>
              </li>
              <li className="flex items-start space-x-4">
                <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                <span>Inclúyelo en la entrada de tu establecimiento para que los clientes vean el menú antes de entrar.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          #printable-qr, #printable-qr * { visibility: visible; }
          #printable-qr { 
            position: absolute; 
            left: 50%; 
            top: 50%; 
            transform: translate(-50%, -50%);
            border: none;
            box-shadow: none;
          }
        }
      `}} />
    </div>
  );
}
