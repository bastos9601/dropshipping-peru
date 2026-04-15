'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/componentes/Navbar';
import { Search, Plus, ExternalLink, ShoppingCart, TrendingUp, Package } from 'lucide-react';
import { formatearPrecio } from '@/lib/utils';
import { buscarProductosAmazon, obtenerDetalleProductoAmazon, AmazonProducto, AmazonProductoDetalle } from '@/lib/amazon';
import Image from 'next/image';

export default function ImportarML() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [busqueda, setBusqueda] = useState('');
  const [productos, setProductos] = useState<AmazonProducto[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<AmazonProductoDetalle | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [margenGanancia, setMargenGanancia] = useState(80);
  const [categoriaAsignada, setCategoriaAsignada] = useState('');
  const [importando, setImportando] = useState(false);

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

    // Verificar que sea admin
    if (!perfil.es_admin) {
      alert('Solo los administradores pueden importar productos');
      router.push('/panel');
      return;
    }

    setUsuario(perfil);
    cargarCategorias(user.id);
  };

  const cargarCategorias = async (userId: string) => {
    const { data } = await supabase
      .from('categorias')
      .select('*')
      .or(`usuario_id.is.null,usuario_id.eq.${userId}`)
      .eq('activo', true)
      .order('orden', { ascending: true });

    if (data) {
      setCategorias(data);
    }
  };

  const buscarProductos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!busqueda.trim()) return;

    setBuscando(true);
    try {
      console.log('Buscando productos en Amazon:', busqueda);
      const resultados = await buscarProductosAmazon(busqueda, 30);
      console.log('Resultados obtenidos:', resultados.length);
      
      if (resultados.length === 0) {
        alert('No se encontraron productos. Verifica que hayas configurado RAPIDAPI_KEY en .env.local\n\nVe a https://rapidapi.com/letscrape-6bRBa3QguO5/api/real-time-amazon-data y suscríbete al plan gratuito.');
      }
      
      setProductos(resultados);
    } catch (error: any) {
      console.error('Error al buscar productos:', error);
      alert(`Error al buscar productos: ${error.message}\n\nAsegúrate de haber configurado RAPIDAPI_KEY en .env.local`);
    } finally {
      setBuscando(false);
    }
  };

  const seleccionarProducto = async (producto: AmazonProducto) => {
    const detalle = await obtenerDetalleProductoAmazon(producto.id);
    if (detalle) {
      setProductoSeleccionado(detalle);
      setMostrarModal(true);
    }
  };

  const calcularPrecioVenta = () => {
    if (!productoSeleccionado) return 0;
    return productoSeleccionado.price * (1 + margenGanancia / 100);
  };

  const importarProducto = async () => {
    if (!productoSeleccionado || !usuario) return;

    setImportando(true);
    try {
      // Crear el producto en la base de datos como producto de CATÁLOGO
      const { data: nuevoProducto, error } = await supabase
        .from('productos')
        .insert([{
          nombre: productoSeleccionado.title,
          descripcion: productoSeleccionado.description || '',
          precio_base: productoSeleccionado.price,
          imagen_url: productoSeleccionado.images?.[0] || productoSeleccionado.imageUrl,
          categoria_id: categoriaAsignada || null,
          activo: true,
          es_catalogo: true, // IMPORTANTE: Es producto de catálogo
          usuario_id: null, // NULL porque es del catálogo global
          ml_item_id: productoSeleccionado.id,
          ml_permalink: productoSeleccionado.productUrl,
          ml_precio_original: productoSeleccionado.price,
          amazon_url: productoSeleccionado.productUrl // Agregar URL de Amazon
        }])
        .select()
        .single();

      if (error) throw error;

      alert('¡Producto importado al catálogo! Ahora todos los usuarios podrán agregarlo a sus tiendas.');
      setMostrarModal(false);
      setProductoSeleccionado(null);
      
      // Remover el producto de la lista
      setProductos(productos.filter(p => p.id !== productoSeleccionado.id));
    } catch (error) {
      console.error('Error al importar:', error);
      alert('Error al importar el producto');
    } finally {
      setImportando(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar usuario={usuario} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Importar Productos (Admin)</h1>
          <p className="text-gray-600">Busca y agrega productos de Amazon al catálogo global</p>
          <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              ℹ️ Los productos que importes se agregarán al catálogo y estarán disponibles para todos los usuarios
            </p>
          </div>
          <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              💰 Precios convertidos a soles (S/). La mayoría de productos Amazon Prime envían a Perú vía Amazon Global.
            </p>
          </div>
        </div>

        {/* Buscador */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={buscarProductos} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar productos en Amazon Perú (ej: laptop, audífonos, mouse)"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={buscando}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center space-x-2"
            >
              {buscando ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Buscando...</span>
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  <span>Buscar</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Sugerencias:</span>
            {['laptop', 'audífonos', 'mouse', 'teclado', 'celular'].map((sugerencia) => (
              <button
                key={sugerencia}
                onClick={() => {
                  setBusqueda(sugerencia);
                  buscarProductos({ preventDefault: () => {} } as React.FormEvent);
                }}
                className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200"
              >
                {sugerencia}
              </button>
            ))}
          </div>
        </div>

        {/* Resultados */}
        {productos.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Resultados ({productos.length})
            </h2>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
              {productos.map((producto) => (
                <div key={producto.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <div className="relative h-40 mb-3">
                    <Image
                      src={producto.imageUrl}
                      alt={producto.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <h3 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2 h-10">
                    {producto.title}
                  </h3>
                  <div className="mb-3">
                    <p className="text-lg font-bold text-green-600">
                      {formatearPrecio(producto.price)}
                    </p>
                    {producto.originalPrice && producto.originalPrice > producto.price && (
                      <p className="text-xs text-gray-500 line-through">
                        {formatearPrecio(producto.originalPrice)}
                      </p>
                    )}
                    {producto.shipping?.isFree && (
                      <span className="text-xs text-green-600">Envío gratis en USA</span>
                    )}
                    {producto.reviews && (
                      <p className="text-xs text-gray-500">⭐ {producto.rating} ({producto.reviews} reviews)</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => seleccionarProducto(producto)}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 flex items-center justify-center space-x-1"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Importar</span>
                    </button>
                    <a
                      href={producto.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-100 text-gray-700 px-3 py-2 rounded hover:bg-gray-200"
                      title="Verificar envío a Perú en Amazon"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {productos.length === 0 && !buscando && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Busca productos para importar
            </h3>
            <p className="text-gray-600 mb-6">
              Usa el buscador para encontrar productos de Amazon Perú que quieras vender en tu tienda
            </p>
            <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
              <div className="bg-blue-50 p-4 rounded-lg">
                <ShoppingCart className="h-8 w-8 text-blue-600 mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">Busca productos</h4>
                <p className="text-sm text-gray-600">Encuentra productos populares en Amazon Perú</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">Define tu margen</h4>
                <p className="text-sm text-gray-600">Establece tu ganancia sobre el precio original</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <Plus className="h-8 w-8 text-purple-600 mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">Importa a tu tienda</h4>
                <p className="text-sm text-gray-600">Agrega productos con un solo clic</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de importación */}
      {mostrarModal && productoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Importar Producto</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="relative h-64 mb-4">
                    <Image
                      src={productoSeleccionado.images?.[0] || productoSeleccionado.imageUrl}
                      alt={productoSeleccionado.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{productoSeleccionado.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-4">
                    {productoSeleccionado.description}
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    {productoSeleccionado.rating && (
                      <p><span className="font-medium">Rating:</span> ⭐ {productoSeleccionado.rating}/5</p>
                    )}
                    {productoSeleccionado.reviews && (
                      <p><span className="font-medium">Reviews:</span> {productoSeleccionado.reviews}</p>
                    )}
                    <p className="text-green-600 font-medium">✓ Envío internacional disponible (Amazon Global)</p>
                    {productoSeleccionado.shipping?.isFree && (
                      <p className="text-green-600 font-medium">✓ Envío gratis con Prime</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Margen de ganancia (%)
                  </label>
                  <input
                    type="number"
                    value={margenGanancia}
                    onChange={(e) => setMargenGanancia(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md"
                    min="0"
                    max="500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Recomendado: 50-100% para productos de tecnología
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Precio en Amazon:</span>
                    <span className="font-semibold">{formatearPrecio(productoSeleccionado.price)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Tu margen ({margenGanancia}%):</span>
                    <span className="font-semibold text-green-600">
                      +{formatearPrecio(productoSeleccionado.price * margenGanancia / 100)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg border-t pt-2">
                    <span className="font-bold">Precio de venta:</span>
                    <span className="font-bold text-blue-600">
                      {formatearPrecio(calcularPrecioVenta())}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría (opcional)
                  </label>
                  <select
                    value={categoriaAsignada}
                    onChange={(e) => setCategoriaAsignada(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Sin categoría</option>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={importarProducto}
                  disabled={importando}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
                >
                  {importando ? 'Importando...' : 'Importar al catálogo global'}
                </button>
                <button
                  onClick={() => {
                    setMostrarModal(false);
                    setProductoSeleccionado(null);
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
