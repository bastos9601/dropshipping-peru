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
      setEstadisticas({
        totalProductos: data.length,
        ventasEstimadas: data.length * 5,
        gananciasEstimadas: data.reduce((acc, item) => 
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
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  const enlaceTienda = `${typeof window !== 'undefined' ? window.location.origin : ''}/${usuario.slug_tienda}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar usuario={usuario} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Bienvenido, {usuario.nombre_tienda}!
          </h1>
          <p className="text-gray-600">Gestiona tu tienda y productos desde aquí</p>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tu tienda está lista 🎉
              </h3>
              <p className="text-sm text-gray-600 mb-3">Comparte este enlace para que tus clientes vean tus productos</p>
              <div className="flex items-center space-x-2">
                <code className="bg-white px-4 py-2 rounded border text-sm">
                  {enlaceTienda}
                </code>
                <button
                  onClick={copiarEnlace}
                  className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  <Copy className="h-4 w-4" />
                  <span>{copiado ? '¡Copiado!' : 'Copiar'}</span>
                </button>
                <Link
                  href={`/${usuario.slug_tienda}`}
                  target="_blank"
                  className="flex items-center space-x-1 bg-white text-blue-600 px-4 py-2 rounded border-2 border-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Ver tienda</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Productos</h3>
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{estadisticas.totalProductos}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Ventas estimadas</h3>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{estadisticas.ventasEstimadas}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Ganancias estimadas</h3>
              <DollarSign className="h-5 w-5 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatearPrecio(estadisticas.gananciasEstimadas)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Mis productos</h2>
            <Link
              href="/catalogo"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
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
            <div className="grid md:grid-cols-3 gap-6">
              {productos.map((item) => {
                if (!item.producto) return null;
                
                return (
                <div key={item.id} className="border rounded-lg p-4 relative">
                  {item.producto.imagen_url && (
                    <img
                      src={item.producto.imagen_url}
                      alt={item.producto.nombre}
                      className="w-full h-40 object-cover rounded mb-3"
                    />
                  )}
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {item.producto.nombre}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Precio: {formatearPrecio(item.precio_venta)}
                  </p>
                  <p className="text-sm text-green-600 font-medium mb-3">
                    Ganancia: {formatearPrecio(calcularGanancia(item.precio_venta, item.producto.precio_base))}
                  </p>
                  
                  <div className="flex space-x-2 mb-3">
                    <button
                      onClick={() => editarPrecio(item.id, item.precio_venta)}
                      className="flex-1 flex items-center justify-center space-x-1 bg-blue-100 text-blue-700 px-3 py-2 rounded hover:bg-blue-200 transition-colors text-sm"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Editar precio</span>
                    </button>
                    <button
                      onClick={() => quitarProducto(item.id)}
                      className="flex items-center justify-center bg-red-100 text-red-700 px-3 py-2 rounded hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
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
