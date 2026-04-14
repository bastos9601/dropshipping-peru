'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Store, ExternalLink, Copy, TrendingUp, Package, DollarSign, Trash2, Edit } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/componentes/Navbar';
import GeneradorFlyer from '@/componentes/GeneradorFlyer';
import { formatearPrecio, calcularGanancia } from '@/lib/utils';

export default function Panel() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [productos, setProductos] = useState<any[]>([]);
  const [estadisticas, setEstadisticas] = useState({
    totalProductos: 0,
    ventasEstimadas: 0,
    gananciasEstimadas: 0
  });
  const [copiado, setCopiado] = useState(false);

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

    if (!perfil) {
      await supabase.auth.signOut();
      router.push('/login');
      return;
    }

    if (!perfil.activo) {
      await supabase.auth.signOut();
      alert('Tu cuenta ha sido desactivada. Contacta al administrador.');
      router.push('/login');
      return;
    }

    setUsuario(perfil);
    cargarProductos(user.id);
  };

  const cargarProductos = async (userId: string) => {
    const { data } = await supabase
      .from('tienda_productos')
      .select(`
        *,
        producto:productos(*)
      `)
      .eq('usuario_id', userId)
      .eq('activo', true);

    if (data) {
      setProductos(data);
      
      // Filtrar productos válidos (que tienen el objeto producto asociado)
      const productosValidos = data.filter(item => item.producto && item.producto.precio_base);
      
      setEstadisticas({
        totalProductos: productosValidos.length,
        ventasEstimadas: productosValidos.length * 5,
        gananciasEstimadas: productosValidos.reduce((acc, item) => 
          acc + calcularGanancia(item.precio_venta, item.producto.precio_base) * 5, 0
        )
      });
    }
  };

  const copiarEnlace = () => {
    if (usuario) {
      const enlace = `${window.location.origin}/${usuario.slug_tienda}`;
      navigator.clipboard.writeText(enlace);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  const quitarProducto = async (tiendaProductoId: string) => {
    if (confirm('¿Estás seguro de quitar este producto de tu tienda?')) {
      const { error } = await supabase
        .from('tienda_productos')
        .delete()
        .eq('id', tiendaProductoId);

      if (!error && usuario) {
        cargarProductos(usuario.id);
      }
    }
  };

  const editarPrecio = async (tiendaProductoId: string, precioActual: number) => {
    const nuevoPrecio = prompt('Ingresa el nuevo precio de venta:', precioActual.toString());
    
    if (nuevoPrecio && !isNaN(parseFloat(nuevoPrecio))) {
      const { error } = await supabase
        .from('tienda_productos')
        .update({ precio_venta: parseFloat(nuevoPrecio) })
        .eq('id', tiendaProductoId);

      if (!error && usuario) {
        cargarProductos(usuario.id);
      }
    }
  };

  if (!usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <img src="/favicon.png" alt="Logo" className="h-16 w-16 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  const enlaceTienda = `${typeof window !== 'undefined' ? window.location.origin : ''}/${usuario.slug_tienda}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar usuario={usuario} />
      
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            ¡Bienvenido, {usuario.nombre_tienda}!
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Gestiona tu tienda y productos desde aquí</p>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 sm:p-6 mb-6 sm:mb-8">
          <div className="w-full">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              Tu tienda está lista 🎉
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3">Comparte este enlace para que tus clientes vean tus productos</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <code className="bg-white px-3 py-2 rounded border text-xs sm:text-sm break-all flex-1">
                {enlaceTienda}
              </code>
              <div className="flex gap-2">
                <button
                  onClick={copiarEnlace}
                  className="flex items-center justify-center space-x-1 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-blue-700 transition-colors text-xs sm:text-sm flex-1 sm:flex-none whitespace-nowrap"
                >
                  <Copy className="h-4 w-4" />
                  <span>{copiado ? '¡Copiado!' : 'Copiar'}</span>
                </button>
                <Link
                  href={`/${usuario.slug_tienda}`}
                  target="_blank"
                  className="flex items-center justify-center space-x-1 bg-white text-blue-600 px-3 sm:px-4 py-2 rounded border-2 border-blue-600 hover:bg-blue-50 transition-colors text-xs sm:text-sm flex-1 sm:flex-none whitespace-nowrap"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Ver tienda</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">Productos</h3>
              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{estadisticas.totalProductos}</p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">Ventas estimadas</h3>
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{estadisticas.ventasEstimadas}</p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md sm:col-span-2 md:col-span-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">Ganancias estimadas</h3>
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
              {formatearPrecio(estadisticas.gananciasEstimadas)}
            </p>
          </div>
        </div>

        {/* Acceso rápido a pedidos */}
        <Link href="/dashboard/pedidos" className="block mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">📦 Gestiona tus Pedidos</h3>
                <p className="text-purple-100">Ver y administrar todos los pedidos de tu tienda</p>
              </div>
              <ExternalLink className="h-8 w-8" />
            </div>
          </div>
        </Link>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Mis productos</h2>
            <Link
              href="/catalogo"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-center text-sm sm:text-base"
            >
              Agregar productos
            </Link>
          </div>

          {productos.length === 0 ? (
            <div className="text-center py-12">
              <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aún no tienes productos
              </h3>
              <p className="text-gray-600 mb-4">
                Agrega productos del catálogo para empezar a vender
              </p>
              <Link
                href="/catalogo"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Explorar catálogo
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {productos.map((item) => {
                if (!item.producto) return null;
                
                return (
                <div key={item.id} className="border rounded-lg p-3 sm:p-4 relative">
                  {item.producto.imagen_url && (
                    <img
                      src={item.producto.imagen_url}
                      alt={item.producto.nombre}
                      className="w-full h-32 sm:h-40 object-cover rounded mb-3"
                    />
                  )}
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                    {item.producto.nombre}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">
                    Precio: {formatearPrecio(item.precio_venta)}
                  </p>
                  <p className="text-xs sm:text-sm text-green-600 font-medium mb-3">
                    Ganancia: {formatearPrecio(calcularGanancia(item.precio_venta, item.producto.precio_base))}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-2 mb-3">
                    <button
                      onClick={() => editarPrecio(item.id, item.precio_venta)}
                      className="flex items-center justify-center space-x-1 bg-blue-100 text-blue-700 px-3 py-2 rounded hover:bg-blue-200 transition-colors text-xs sm:text-sm"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Editar precio</span>
                    </button>
                    <button
                      onClick={() => quitarProducto(item.id)}
                      className="flex items-center justify-center space-x-1 bg-red-100 text-red-700 px-3 py-2 rounded hover:bg-red-200 transition-colors text-xs sm:text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sm:hidden">Quitar</span>
                      <span className="hidden sm:inline">Quitar producto</span>
                    </button>
                  </div>

                  <div>
                    <GeneradorFlyer
                      producto={{
                        nombre: item.producto.nombre,
                        precio: item.precio_venta,
                        imagen_url: item.producto.imagen_url
                      }}
                      nombreTienda={usuario.nombre_tienda}
                    />
                  </div>
                </div>
              );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
