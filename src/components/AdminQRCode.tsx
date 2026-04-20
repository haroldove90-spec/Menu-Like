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
    
    // Create a temporary canvas to add padding and background if needed
    const link = document.createElement('a');
    link.download = `QR-${restaurant?.nombre || 'Menu'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
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
        const file = new File([blob], 'menu-qr.png', { type: 'image/png' });
        
        if (navigator.share) {
          await navigator.share({
            title: `Menú de ${restaurant?.nombre}`,
            text: 'Escanea para ver nuestro menú digital',
            files: [file],
          });
        } else {
          alert('Tu navegador no soporta la función de compartir archivos.');
        }
      });
    } catch (err) {
      console.error('Error sharing:', err);
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
    <div className="max-w-4xl mx-auto py-8 md:py-12 px-4 md:px-6">
      <header className="mb-12">
        <h1 className="font-serif text-3xl md:text-5xl font-bold text-ink mb-4 italic">Código QR del Menú</h1>
        <p className="text-primary/60 uppercase tracking-[0.3em] text-[8px] md:text-[10px] font-bold">Genera el acceso directo para tus clientes</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* QR Preview Card */}
        <div className="bg-white p-8 md:p-12 border border-slate-200 shadow-2xl rounded-[2.5rem] flex flex-col items-center text-center space-y-8 sticky top-8">
          <div className="bg-slate-50 p-8 rounded-[2rem] border-4 border-double border-slate-100 shadow-inner" id="printable-qr">
            <QRCodeCanvas
              value={menuUrl}
              size={280}
              level="H"
              includeMargin={true}
              imageSettings={restaurant?.logo_url ? {
                src: restaurant.logo_url,
                x: undefined,
                y: undefined,
                height: 60,
                width: 60,
                excavate: true,
              } : undefined}
            />
          </div>
          
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-ink">{restaurant?.nombre || 'Tu Restaurante'}</h2>
            <p className="text-slate-400 text-xs font-serif italic text-balance">Escanea para descubrir nuestra carta digital y disfrutar de una experiencia gourmet única.</p>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          
          <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-primary">
            <QrCode className="w-4 h-4" />
            <span>Desarrollado por Menú Like</span>
          </div>
        </div>

        {/* Actions & Instructions */}
        <div className="space-y-8">
          <div className="bg-white p-8 border border-slate-100 rounded-3xl shadow-sm space-y-6">
            <h3 className="font-bold text-ink text-lg">Acciones Rápidas</h3>
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={downloadQR}
                className="flex items-center justify-between w-full p-4 bg-slate-50 hover:bg-primary hover:text-white transition-all rounded-2xl group"
              >
                <div className="flex items-center space-x-3">
                  <Download className="w-5 h-5" />
                  <span className="font-bold text-sm uppercase tracking-widest">Descargar Imagen</span>
                </div>
                <div className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">PNG</div>
              </button>

              <button 
                onClick={shareQR}
                className="flex items-center justify-between w-full p-4 bg-slate-50 hover:bg-primary hover:text-white transition-all rounded-2xl group"
              >
                <div className="flex items-center space-x-3">
                  <Share2 className="w-5 h-5" />
                  <span className="font-bold text-sm uppercase tracking-widest">Compartir</span>
                </div>
                <div className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">Móvil</div>
              </button>

              <button 
                onClick={printQR}
                className="flex items-center justify-between w-full p-4 bg-slate-50 hover:bg-ink hover:text-white transition-all rounded-2xl group"
              >
                <div className="flex items-center space-x-3">
                  <Printer className="w-5 h-5" />
                  <span className="font-bold text-sm uppercase tracking-widest">Imprimir</span>
                </div>
                <div className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">A4 / Carta</div>
              </button>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-3xl text-white space-y-4">
            <h3 className="font-serif italic text-xl">¿Dónde usar tu QR?</h3>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li className="flex items-start space-x-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <span>Colócalo en cada mesa para un acceso sin contacto.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <span>Publícalo en tus redes sociales para pedidos programados.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <span>Inclúyelo en la entrada de tu establecimiento.</span>
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
