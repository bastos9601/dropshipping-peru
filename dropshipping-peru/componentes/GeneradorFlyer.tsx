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
    canvas.height = 1350;

    // Fondo degradado moderno
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(0.5, '#764ba2');
    gradient.addColorStop(1, '#f093fb');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Patrón de círculos decorativos
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = Math.random() * 100 + 50;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cargar y dibujar imagen del producto
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = producto.imagen_url;
    
    img.onload = () => {
      // Contenedor de imagen con sombra y borde redondeado
      const imgSize = 700;
      const imgX = (canvas.width - imgSize) / 2;
      const imgY = 180;
      
      // Sombra
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 15;
      
      // Fondo blanco con bordes redondeados
      ctx.fillStyle = 'white';
      roundRect(ctx, imgX - 30, imgY - 30, imgSize + 60, imgSize + 60, 30);
      ctx.fill();
      
      // Resetear sombra
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      // Dibujar imagen con bordes redondeados
      ctx.save();
      roundRect(ctx, imgX, imgY, imgSize, imgSize, 20);
      ctx.clip();
      ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
      ctx.restore();

      // Badge "OFERTA" en la esquina
      ctx.fillStyle = '#EF4444';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 10;
      roundRect(ctx, 80, 120, 200, 80, 15);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('¡OFERTA!', 180, 170);

      // Nombre del producto con fondo semi-transparente
      const nombreY = 980;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      roundRect(ctx, 80, nombreY - 60, canvas.width - 160, 100, 20);
      ctx.fill();
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 55px Arial';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 5;
      
      // Dividir texto si es muy largo
      const maxWidth = canvas.width - 200;
      const words = producto.nombre.split(' ');
      let line = '';
      let lineY = nombreY;
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && i > 0) {
          ctx.fillText(line, canvas.width / 2, lineY);
          line = words[i] + ' ';
          lineY += 60;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, canvas.width / 2, lineY);
      
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Precio con diseño destacado
      const precioY = 1150;
      
      // Fondo del precio
      ctx.fillStyle = '#FCD34D';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 15;
      roundRect(ctx, 200, precioY - 70, canvas.width - 400, 120, 25);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      
      // Texto del precio
      ctx.fillStyle = '#1F2937';
      ctx.font = 'bold 90px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(formatearPrecio(producto.precio), canvas.width / 2, precioY + 10);

      // Nombre de la tienda con icono
      ctx.fillStyle = 'white';
      ctx.font = 'bold 45px Arial';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 5;
      ctx.fillText(`📱 ${nombreTienda}`, canvas.width / 2, 1280);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    };
  };

  // Función auxiliar para dibujar rectángulos con bordes redondeados
  const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
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
