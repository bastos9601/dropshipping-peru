'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Store, MessageCircle, Plus, Filter, ChevronDown, Package, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatearPrecio, generarMensajeWhatsApp } from '@/lib/utils';
import { useConfiguracion } from '@/lib/useConfiguracion';
import CarritoCompras from '@/componentes/CarritoCompras';
import IconoCategoria from '@/componentes/IconoCategoria';

interface Categoria {
  id: string;
  nombre: string;
  icono: string;
}

export default function TiendaPublica() {
  const params = useParams();
  const slugTienda = params.tienda as string;
  const configuracion = useConfiguracion();
  const carritoRef = useRef<any>(null);
  
  const [tienda, setTienda] = useState<any>(null);
  const [productos, setProductos] = useState<any[]>([]);
  const [productosFiltrados, setProductosFiltrados] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [todasCategorias, setTodasCategorias] = useState<Categoria[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('todas');
  const [cargando, setCargando] = useState(true);
  const [banners, setBanners] = useState<any[]>([]);
  const [bannerActual, setBannerActual] = useState(0);
  const [busqueda, setBusqueda] = useState<string>('');

  useEffect(() => {
    cargarTienda();
  }, [slugTienda]);

  useEffect(() => {
    filtrarProductos();
  }, [categoriaSeleccionada, productos, busqueda]);

  useEffect(() => {
    if (productos.length > 0 && todasCategorias.length > 0) {
      filtrarCategoriasConProductos();
    }
  }, [productos, todasCategorias]);

  // Auto-avance del carrusel
  useEffect(() => {
    if (banners.length <= 1) return;

    const intervalo = setInterval(() => {
      setBannerActual((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 5000); // Cambiar cada 5 segundos

    return () => clearInterval(intervalo);
  }, [banners.length]);

  const cargarCategorias = async () => {
    const { data } = await supabase
      .from('categorias')
      .select('id, nombre, icono')
      .eq('activo', true)
      .order('orden', { ascending: true });

    if (data) {
      setTodasCategorias(data);
    }
  };

  const filtrarCategoriasConProductos = () => {
    // Obtener IDs únicos de categorías que tienen productos
    const categoriasConProductos = new Set(
      productos
        .map(p => p.producto?.categoria_id)
        .filter(id => id !== null && id !== undefined)
    );

    // Filtrar solo las categorías que tienen productos
    const categoriasFiltradas = todasCategorias.filter(cat => 
      categoriasConProductos.has(cat.id)
    );

    setCategorias(categoriasFiltradas);
  };

  const filtrarProductos = () => {
    let productosFiltrar = productos;

    // Filtrar por categoría
    if (categoriaSeleccionada !== 'todas') {
      productosFiltrar = productosFiltrar.filter(
        p => p.producto?.categoria_id === categoriaSeleccionada
      );
    }

    // Filtrar por búsqueda
    if (busqueda.trim() !== '') {
      const terminoBusqueda = busqueda.toLowerCase().trim();
      productosFiltrar = productosFiltrar.filter(p => 
        p.producto?.nombre.toLowerCase().includes(terminoBusqueda) ||
        p.producto?.descripcion?.toLowerCase().includes(terminoBusqueda)
      );
    }

    setProductosFiltrados(productosFiltrar);
  };

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

    // Cargar banners
    const { data: bannersData } = await supabase
      .from('banners')
      .select('*')
      .eq('usuario_id', usuario.id)
      .eq('activo', true)
      .order('orden', { ascending: true });

    if (bannersData && bannersData.length > 0) {
      setBanners(bannersData);
    }

    // Cargar categorías después de tener los productos
    await cargarCategorias();

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

  const agregarAlCarrito = (producto: any, precio: number) => {
    if (carritoRef.current) {
      carritoRef.current.agregarAlCarrito(producto, precio);
    }
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
        {/* Carrusel de banners */}
        {banners.length > 0 && (
          <div className="mb-12 relative">
            <div className="relative h-[200px] md:h-[280px] lg:h-[350px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={banners[bannerActual].imagen_url}
                alt="Banner promocional"
                fill
                className="object-cover"
                priority
              />
              
              {/* Badge OFERTA */}
              <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-red-500 text-white px-4 py-2 md:px-6 md:py-3 rounded-xl shadow-lg transform -rotate-3 hover:rotate-0 transition-transform z-10">
                <span className="font-bold text-lg md:text-2xl">¡OFERTA!</span>
              </div>
              
              {/* Controles del carrusel */}
              {banners.length > 1 && (
                <>
                  <button
                    onClick={() => setBannerActual((prev) => (prev === 0 ? banners.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all hover:scale-110"
                    aria-label="Banner anterior"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setBannerActual((prev) => (prev === banners.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all hover:scale-110"
                    aria-label="Banner siguiente"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  {/* Indicadores */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                    {banners.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setBannerActual(index)}
                        className={`h-3 rounded-full transition-all ${
                          index === bannerActual
                            ? 'bg-white w-8'
                            : 'bg-white/50 hover:bg-white/75 w-3'
                        }`}
                        aria-label={`Ir al banner ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

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
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Nuestros productos
              </h2>
              <p className="text-gray-600">
                Compra fácil y rápido por WhatsApp
              </p>
            </div>

            {/* Buscador y Filtros */}
            <div className="mb-8 flex flex-col md:flex-row gap-4">
              {/* Buscador */}
              <div className="flex-1">
                <label className="flex items-center space-x-2 mb-2 text-sm font-medium text-gray-700">
                  <Search className="h-4 w-4" />
                  <span>Buscar productos</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por nombre o descripción..."
                    className="w-full bg-white border border-gray-300 rounded-lg pl-11 pr-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:border-blue-400 transition-colors"
                  />
                  <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  {busqueda && (
                    <button
                      onClick={() => setBusqueda('')}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Filtros por categoría */}
              {categorias.length > 0 && (
                <div className="md:w-64">
                  <label className="flex items-center space-x-2 mb-2 text-sm font-medium text-gray-700">
                    <Filter className="h-4 w-4" />
                    <span>Filtrar por categoría</span>
                  </label>
                  <div className="relative">
                    <select
                      value={categoriaSeleccionada}
                      onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                      className="w-full appearance-none bg-white border border-gray-300 rounded-lg pl-11 pr-10 py-3 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer shadow-sm hover:border-blue-400 transition-colors"
                    >
                      <option value="todas">Todas las categorías</option>
                      {categorias.map((categoria) => (
                        <option key={categoria.id} value={categoria.id}>
                          {categoria.nombre}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                      {categoriaSeleccionada === 'todas' ? (
                        <Package className="h-5 w-5 text-gray-900" />
                      ) : (
                        <IconoCategoria 
                          icono={categorias.find(c => c.id === categoriaSeleccionada)?.icono || 'Package'} 
                          className="h-5 w-5 text-gray-900" 
                        />
                      )}
                    </div>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-600">
                      <ChevronDown className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {productosFiltrados.map((item) => {
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
                    <div className="space-y-2">
                      <button
                        onClick={() => agregarAlCarrito(item.producto, item.precio_venta)}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Agregar al carrito</span>
                      </button>
                      <button
                        onClick={() => comprarPorWhatsApp(item.producto, item.precio_venta)}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>Comprar ahora</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
              })}
            </div>

            {productosFiltrados.length === 0 && productos.length > 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600">No hay productos en esta categoría</p>
              </div>
            )}
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

      {/* Componente del carrito */}
      {tienda && <CarritoCompras ref={carritoRef} tienda={tienda} />}
    </div>
  );
}
