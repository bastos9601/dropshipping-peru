'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Store, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatearPrecio, generarMensajeWhatsApp } from '@/lib/utils';
import { useConfiguracion } from '@/lib/useConfiguracion';

export default function TiendaPublica() {
  const params = useParams();
  const slugTienda = params.tienda as string;
  const configuracion = useConfiguracion();
  
  const [tienda, setTienda] = useState<any>(null);
  const [productos, setProductos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarTienda();
  }, [slugTienda]);

  const cargarTienda = async () => {
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('*')
      .eq('slug_tienda', slugTienda)
      .single();

    if (!usuario) {
      setCargando(false);
      return;
    }

    // Verificar si el usuario está activo
    if (!usuario.activo) {
      setTienda(null);
      setCargando(false);
      return;
    }

    setTienda(usuario);

    const { data: productosData } = await supabase
      .from('tienda_productos')
      .select(`
        *,
        producto:productos(*)
      `)
      .eq('usuario_id', usuario.id)
      .eq('activo', true);

    if (productosData) {
      setProductos(productosData);
    }

    setCargando(false);
  };

  const comprarPorWhatsApp = (producto: any, precio: number) => {
    const mensaje = generarMensajeWhatsApp(
      producto.nombre,
      precio,
      tienda.nombre_tienda
    );
    window.open(`https://wa.me/${tienda.whatsapp}?text=${mensaje}`, '_blank');
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Store className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Cargando tienda...</p>
        </div>
      </div>
    );
  }

  if (!tienda) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tienda no disponible</h2>
          <p className="text-gray-600 mb-4">
            Esta tienda no existe o ha sido desactivada temporalmente
          </p>
          <a
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <Store className="h-10 w-10 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{tienda.nombre_tienda}</h1>
              <p className="text-sm text-gray-600">Tienda online - Envíos a todo Perú</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {productos.length === 0 ? (
          <div className="text-center py-16">
            <Store className="h-20 w-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Próximamente nuevos productos
            </h2>
            <p className="text-gray-600">
              Esta tienda está configurando su catálogo
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Nuestros productos
              </h2>
              <p className="text-gray-600">
                Compra fácil y rápido por WhatsApp
              </p>
            </div>

            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {productos.map((item) => {
                if (!item.producto) return null;
                
                return (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="relative h-56 bg-gray-200">
                    {item.producto.imagen_url && (
                      <Image
                        src={item.producto.imagen_url}
                        alt={item.producto.nombre}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {item.producto.nombre}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {item.producto.descripcion}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-blue-600">
                        {formatearPrecio(item.precio_venta)}
                      </span>
                    </div>
                    <button
                      onClick={() => comprarPorWhatsApp(item.producto, item.precio_venta)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span>Comprar por WhatsApp</span>
                    </button>
                  </div>
                </div>
              );
              })}
            </div>
          </>
        )}
      </main>

      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-gray-600">
            © {new Date().getFullYear()} {tienda.nombre_tienda} - Powered by {configuracion.nombre_sistema}
          </p>
        </div>
      </footer>
    </div>
  );
}
