'use client';

import { useState, useRef } from 'react';
import { Download, Image as ImageIcon } from 'lucide-react';
import { formatearPrecio } from '@/lib/utils';

interface GeneradorFlyerProps {
  producto: {
    nombre: string;
    precio: number;
    imagen_url: string;
  };
  nombreTienda: string;
}

export default function GeneradorFlyer({ producto, nombreTienda }: GeneradorFlyerProps) {
  const [mostrar, setMostrar] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generarFlyer = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar canvas
    canvas.width = 1080;
    canvas.height = 1080;

    // Fondo degradado
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#3B82F6');
    gradient.addColorStop(1, '#1E40AF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Cargar y dibujar imagen del producto
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = producto.imagen_url;
    
    img.onload = () => {
      // Dibujar imagen centrada
      const imgSize = 600;
      const imgX = (canvas.width - imgSize) / 2;
      const imgY = 150;
      
      // Fondo blanco para la imagen
      ctx.fillStyle = 'white';
      ctx.fillRect(imgX - 20, imgY - 20, imgSize + 40, imgSize + 40);
      
      ctx.drawImage(img, imgX, imgY, imgSize, imgSize);

      // Nombre del producto
      ctx.fillStyle = 'white';
      ctx.font = 'bold 60px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(producto.nombre, canvas.width / 2, 850);

      // Precio
      ctx.fillStyle = '#FCD34D';
      ctx.font = 'bold 80px Arial';
      ctx.fillText(formatearPrecio(producto.precio), canvas.width / 2, 950);

      // Nombre de la tienda
      ctx.fillStyle = 'white';
      ctx.font = '40px Arial';
      ctx.fillText(nombreTienda, canvas.width / 2, 1020);
    };
  };

  const descargarFlyer = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `flyer-${producto.nombre.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div>
      <button
        onClick={() => {
          setMostrar(!mostrar);
          if (!mostrar) {
            setTimeout(generarFlyer, 100);
          }
        }}
        className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
      >
        <ImageIcon className="h-4 w-4" />
        <span>Generar Flyer</span>
      </button>

      {mostrar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-xl font-bold mb-4">Vista previa del Flyer</h3>
            <div className="flex justify-center mb-4">
              <canvas
                ref={canvasRef}
                className="border border-gray-300 max-w-full h-auto"
                style={{ maxHeight: '500px' }}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setMostrar(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cerrar
              </button>
              <button
                onClick={descargarFlyer}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                <span>Descargar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
