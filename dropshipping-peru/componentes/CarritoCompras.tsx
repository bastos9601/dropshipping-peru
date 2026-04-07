'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, MessageCircle, X, ArrowLeft } from 'lucide-react';
import { formatearPrecio } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface ProductoCarrito {
  id: string;
  nombre: string;
  precio: number;
  imagen_url?: string;
  cantidad: number;
}

interface CarritoComprasProps {
  tienda: any;
}

const CarritoCompras = forwardRef<any, CarritoComprasProps>(({ tienda }, ref) => {
  const [carrito, setCarrito] = useState<ProductoCarrito[]>([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const router = useRouter();

  const agregarAlCarrito = (producto: any, precio: number) => {
    setCarrito(prev => {
      const existente = prev.find(item => item.id === producto.id);
      if (existente) {
        return prev.map(item =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      } else {
        return [...prev, {
          id: producto.id,
          nombre: producto.nombre,
          precio: precio,
          imagen_url: producto.imagen_url,
          cantidad: 1
        }];
      }
    });
  };

  // Exponer la función agregarAlCarrito a través del ref
  useImperativeHandle(ref, () => ({
    agregarAlCarrito
  }));

  const actualizarCantidad = (id: string, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(id);
      return;
    }
    setCarrito(prev =>
      prev.map(item =>
        item.id === id ? { ...item, cantidad: nuevaCantidad } : item
      )
    );
  };

  const eliminarDelCarrito = (id: string) => {
    setCarrito(prev => prev.filter(item => item.id !== id));
  };

  const vaciarCarrito = () => {
    setCarrito([]);
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const generarMensajeCarrito = () => {
    let mensaje = `¡Hola! Me interesa hacer un pedido desde ${tienda.nombre_tienda}:\n\n`;
    
    carrito.forEach((item, index) => {
      mensaje += `${index + 1}. ${item.nombre}\n`;
      mensaje += `   Cantidad: ${item.cantidad}\n`;
      mensaje += `   Precio unitario: ${formatearPrecio(item.precio)}\n`;
      mensaje += `   Subtotal: ${formatearPrecio(item.precio * item.cantidad)}\n\n`;
    });
    
    mensaje += `*Total: ${formatearPrecio(calcularTotal())}*\n\n`;
    mensaje += `¿Podrías confirmar la disponibilidad y el costo de envío?`;
    
    return encodeURIComponent(mensaje);
  };

  const enviarPedidoPorWhatsApp = () => {
    if (carrito.length === 0) return;
    
    const mensaje = generarMensajeCarrito();
    window.open(`https://wa.me/${tienda.whatsapp}?text=${mensaje}`, '_blank');
    vaciarCarrito();
    setCarritoAbierto(false);
  };

  const cantidadTotal = carrito.reduce((total, item) => total + item.cantidad, 0);

  return (
    <>
      {/* Botón flotante del carrito */}
      <button
        onClick={() => setCarritoAbierto(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-5 rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 z-40 hover:scale-110"
      >
        <ShoppingCart className="h-7 w-7" />
        {cantidadTotal > 0 && (
          <span className="absolute -top-2 -right-2 bg-gradient-to-br from-red-500 to-pink-600 text-white text-xs font-bold rounded-full h-7 w-7 flex items-center justify-center shadow-lg animate-pulse">
            {cantidadTotal}
          </span>
        )}
      </button>

      {/* Modal del carrito */}
      {carritoAbierto && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm bg-white/30"
          onClick={() => setCarritoAbierto(false)}
        >
          <div 
            className="bg-white w-full sm:max-w-lg rounded-2xl shadow-2xl max-h-[90vh] flex flex-col border border-gray-200/50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                  <ShoppingCart className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Mi Carrito</h3>
                  {cantidadTotal > 0 && (
                    <p className="text-xs text-blue-100">{cantidadTotal} {cantidadTotal === 1 ? 'producto' : 'productos'}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setCarritoAbierto(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 hover:rotate-90"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Contenido del carrito */}
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50/50 to-white">
              {carrito.length === 0 ? (
                <div className="text-center py-16">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full w-28 h-28 flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <ShoppingCart className="h-14 w-14 text-blue-400" />
                  </div>
                  <p className="text-gray-700 text-lg font-semibold mb-2">Tu carrito está vacío</p>
                  <p className="text-gray-500 text-sm">Agrega productos para comenzar tu compra</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {carrito.map((item) => (
                    <div key={item.id} className="group relative flex items-start space-x-4 bg-white p-4 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                      {item.imagen_url && (
                        <div className="relative">
                          <img
                            src={item.imagen_url}
                            alt={item.nombre}
                            className="w-24 h-24 object-cover rounded-xl shadow-md group-hover:shadow-xl transition-shadow"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 mb-1.5 line-clamp-2">
                          {item.nombre}
                        </h4>
                        <p className="text-lg font-bold text-blue-600 mb-3">
                          {formatearPrecio(item.precio)}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-300 p-1 shadow-sm">
                            <button
                              onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                              className="p-2 hover:bg-white rounded-lg transition-all duration-200 hover:shadow-md active:scale-95"
                            >
                              <Minus className="h-4 w-4 text-gray-700" />
                            </button>
                            <span className="w-10 text-center text-base font-bold text-gray-900">
                              {item.cantidad}
                            </span>
                            <button
                              onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                              className="p-2 hover:bg-white rounded-lg transition-all duration-200 hover:shadow-md active:scale-95"
                            >
                              <Plus className="h-4 w-4 text-gray-700" />
                            </button>
                          </div>
                          <button
                            onClick={() => eliminarDelCarrito(item.id)}
                            className="p-2.5 hover:bg-red-50 text-red-500 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                            title="Eliminar producto"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer con total y botones */}
            <div className="border-t border-gray-200 bg-gradient-to-b from-white to-gray-50 p-6 space-y-4 rounded-b-2xl">
              {carrito.length > 0 && (
                <>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-2xl border-2 border-blue-200 shadow-inner">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-semibold text-lg">Total:</span>
                      <span className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {formatearPrecio(calcularTotal())}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={vaciarCarrito}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3.5 px-4 rounded-xl transition-all duration-200 border-2 border-red-600 font-semibold hover:border-red-700 hover:shadow-md hover:shadow-red-500/50 active:scale-95"
                    >
                      Vaciar
                    </button>
                    <button
                      onClick={enviarPedidoPorWhatsApp}
                      className="flex-[2] bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3.5 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-green-500/50 font-bold active:scale-95"
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span>Pedir por WhatsApp</span>
                    </button>
                  </div>
                </>
              )}
              <button
                onClick={() => {
                  setCarritoAbierto(false);
                  router.push(`/${tienda.slug_tienda}`);
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 font-semibold shadow-lg hover:shadow-blue-500/50 active:scale-95"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Regresar a la Tienda</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

CarritoCompras.displayName = 'CarritoCompras';

export default CarritoCompras;
export type { ProductoCarrito };