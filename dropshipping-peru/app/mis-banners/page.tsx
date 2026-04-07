'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/componentes/Navbar';
import { Image as ImageIcon, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';
import { formatearPrecio } from '@/lib/utils';
import Image from 'next/image';

export default function MisBanners() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [banners, setBanners] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<string>('');
  const [generandoBanner, setGenerandoBanner] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    verificarUsuario();
  }, []);

  const verificarUsuario = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/login');
      return;
    }

    const { data: perfil } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!perfil || !perfil.activo) {
      await supabase.auth.signOut();
      router.push('/login');
      return;
    }

    setUsuario(perfil);
    cargarBanners(user.id);
    cargarProductos(user.id);
  };

  const cargarBanners = async (userId: string) => {
    const { data } = await supabase
      .from('banners')
      .select(`
        *,
        producto:productos(*)
      `)
      .eq('usuario_id', userId)
      .order('orden', { ascending: true });

    if (data) {
      setBanners(data);
    }
  };

  const cargarProductos = async (userId: string) => {
    // Cargar productos de la tienda del usuario
    const { data } = await supabase
      .from('tienda_productos')
      .select(`
        *,
        producto:productos(*)
      `)
      .eq('usuario_id', userId)
      .eq('activo', true);

    if (data) {
      setProductos(data.filter(item => item.producto));
    }
  };

  const generarFlyer = (producto: any, precio: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        reject('Canvas no disponible');
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject('Contexto no disponible');
        return;
      }

      // Configurar canvas HORIZONTAL (1920x1080 - Full HD)
      canvas.width = 1920;
      canvas.height = 1080;

      // Fondo degradado moderno
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(0.5, '#764ba2');
      gradient.addColorStop(1, '#f093fb');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Patrón de círculos decorativos
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * 150 + 50;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Cargar y dibujar imagen del producto
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = producto.imagen_url;
      
      img.onload = () => {
        // LADO IZQUIERDO: Imagen del producto
        const imgSize = 800;
        const imgX = 100;
        const imgY = (canvas.height - imgSize) / 2;
        
        // Sombra
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 40;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 20;
        
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

        // LADO DERECHO: Información del producto
        const infoX = 1050;
        const centerY = canvas.height / 2;

        // Nombre del producto
        ctx.fillStyle = 'white';
        ctx.font = 'bold 80px Arial';
        ctx.textAlign = 'left';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 8;
        
        // Dividir texto si es muy largo
        const maxWidth = 800;
        const words = producto.nombre.split(' ');
        let line = '';
        let lineY = centerY - 150;
        const lineHeight = 90;
        
        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i] + ' ';
          const metrics = ctx.measureText(testLine);
          
          if (metrics.width > maxWidth && i > 0) {
            ctx.fillText(line, infoX, lineY);
            line = words[i] + ' ';
            lineY += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, infoX, lineY);
        
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // Precio con diseño destacado
        const precioY = centerY + 100;
        
        // Fondo del precio
        ctx.fillStyle = '#FCD34D';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 20;
        roundRect(ctx, infoX - 20, precioY - 90, 600, 150, 30);
        ctx.fill();
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        
        // Texto del precio
        ctx.fillStyle = '#1F2937';
        ctx.font = 'bold 110px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(formatearPrecio(precio), infoX + 20, precioY + 20);

        // Nombre de la tienda en la parte inferior derecha
        ctx.fillStyle = 'white';
        ctx.font = 'bold 50px Arial';
        ctx.textAlign = 'left';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 5;
        ctx.fillText(`📱 ${usuario.nombre_tienda}`, infoX, canvas.height - 100);
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // Badge "OFERTA" en la esquina superior izquierda (dibujado al final para que esté encima)
        ctx.fillStyle = '#EF4444';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 5;
        roundRect(ctx, 80, 80, 280, 110, 20);
        ctx.fill();
        
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 55px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('¡OFERTA!', 220, 150);

        // Convertir a blob y resolver
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          } else {
            reject('Error al generar imagen');
          }
        }, 'image/png');
      };

      img.onerror = () => {
        reject('Error al cargar imagen del producto');
      };
    });
  };

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

  const crearBanner = async () => {
    if (!productoSeleccionado) {
      alert('Selecciona un producto');
      return;
    }

    setGenerandoBanner(true);

    try {
      const productoData = productos.find(p => p.producto_id === productoSeleccionado);
      if (!productoData) {
        throw new Error('Producto no encontrado');
      }

      // Generar el flyer
      const imagenUrl = await generarFlyer(productoData.producto, productoData.precio_venta);

      // Convertir blob URL a blob
      const response = await fetch(imagenUrl);
      const blob = await response.blob();

      // Subir a Supabase Storage (usando bucket 'productos' que ya existe)
      const nombreArchivo = `${usuario.id}/banner-${Date.now()}.png`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('productos')
        .upload(nombreArchivo, blob, {
          contentType: 'image/png',
          upsert: false
        });

      if (uploadError) {
        console.error('Error al subir:', uploadError);
        throw new Error(`Error al subir imagen: ${uploadError.message}`);
      }

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('productos')
        .getPublicUrl(nombreArchivo);

      // Guardar en la base de datos
      const { error: insertError } = await supabase
        .from('banners')
        .insert([{
          usuario_id: usuario.id,
          producto_id: productoSeleccionado,
          imagen_url: urlData.publicUrl,
          orden: banners.length,
          activo: true
        }]);

      if (insertError) {
        console.error('Error al insertar:', insertError);
        throw new Error(`Error al guardar banner: ${insertError.message}`);
      }

      alert('Banner creado exitosamente');
      setProductoSeleccionado('');
      cargarBanners(usuario.id);
    } catch (error: any) {
      console.error('Error completo:', error);
      alert(`Error al crear el banner: ${error.message || 'Error desconocido'}`);
    } finally {
      setGenerandoBanner(false);
    }
  };

  const toggleActivo = async (banner: any) => {
    await supabase
      .from('banners')
      .update({ activo: !banner.activo })
      .eq('id', banner.id);
    cargarBanners(usuario.id);
  };

  const eliminarBanner = async (banner: any) => {
    if (confirm('¿Estás seguro de eliminar este banner?')) {
      await supabase
        .from('banners')
        .delete()
        .eq('id', banner.id);
      cargarBanners(usuario.id);
    }
  };

  const cambiarOrden = async (banner: any, direccion: 'arriba' | 'abajo') => {
    const indiceActual = banners.findIndex(b => b.id === banner.id);
    const nuevoIndice = direccion === 'arriba' ? indiceActual - 1 : indiceActual + 1;

    if (nuevoIndice < 0 || nuevoIndice >= banners.length) return;

    const bannerIntercambio = banners[nuevoIndice];

    await supabase
      .from('banners')
      .update({ orden: nuevoIndice })
      .eq('id', banner.id);

    await supabase
      .from('banners')
      .update({ orden: indiceActual })
      .eq('id', bannerIntercambio.id);

    cargarBanners(usuario.id);
  };

  if (!usuario) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar usuario={usuario} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Banners</h1>
          <p className="text-gray-600">Crea banners promocionales para tu tienda usando los flyers de tus productos</p>
        </div>

        {/* Formulario para crear banner */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Crear Nuevo Banner</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecciona un producto
              </label>
              <select
                value={productoSeleccionado}
                onChange={(e) => setProductoSeleccionado(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Seleccionar producto --</option>
                {productos.map((item) => (
                  <option key={item.producto_id} value={item.producto_id}>
                    {item.producto.nombre} - {formatearPrecio(item.precio_venta)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={crearBanner}
                disabled={!productoSeleccionado || generandoBanner}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <ImageIcon className="h-4 w-4" />
                <span>{generandoBanner ? 'Generando...' : 'Crear Banner'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Lista de banners */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Banners Creados</h2>
          </div>

          <div className="p-6">
            {banners.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Aún no tienes banners</p>
                <p className="text-sm text-gray-500">
                  Crea tu primer banner seleccionando un producto arriba
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {banners.map((banner, index) => (
                  <div key={banner.id} className="border rounded-lg overflow-hidden">
                    <div className="relative h-64 bg-gray-100">
                      <Image
                        src={banner.imagen_url}
                        alt={banner.producto?.nombre || 'Banner'}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {banner.producto?.nombre}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => cambiarOrden(banner, 'arriba')}
                          disabled={index === 0}
                          className="flex items-center justify-center bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Mover arriba"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => cambiarOrden(banner, 'abajo')}
                          disabled={index === banners.length - 1}
                          className="flex items-center justify-center bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Mover abajo"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleActivo(banner)}
                          className={`flex items-center justify-center px-3 py-2 rounded ${
                            banner.activo
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-orange-500 text-white hover:bg-orange-600'
                          }`}
                          title={banner.activo ? 'Desactivar' : 'Activar'}
                        >
                          {banner.activo ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => eliminarBanner(banner)}
                          className="flex items-center justify-center bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Canvas oculto para generar flyers */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
