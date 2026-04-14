'use client';

import { forwardRef, useImperativeHandle, useState } from 'react';
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';
import { formatearPrecio } from '@/lib/utils';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface ProductoCarrito {
  id: string;
  nombre: string;
  precio: number;
  imagen_url: string;
  cantidad: number;
}

interface CarritoComprasProps {
  tienda: any;
}

const CarritoCompras = forwardRef((props: CarritoComprasProps, ref) => {
  const { tienda } = props;
  const router = useRouter();
  const [mostrar, setMostrar] = useState(false);
  const [items, setItems] = useState<ProductoCarrito[]>([]);

  useImperativeHandle(ref, () => ({
    agregarAlCarrito(producto: any, precio: number) {
      setItems((prevItems) => {
        const itemExistente = prevItems.find((item) => item.id === producto.id);
        
        if (itemExistente) {
          return prevItems.map((item) =>
            item.id === producto.id
              ? { ...item, cantidad: item.cantidad + 1 }
              : item
          );
        } else {
          return [
            ...prevItems,
            {
              id: producto.id,
              nombre: producto.nombre,
              precio: precio,
              imagen_url: producto.imagen_url,
              cantidad: 1,
            },
          ];
        }
      });
      setMostrar(true);
    },
  }));

  const eliminarItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const actualizarCantidad = (id: string, cantidad: number) => {
    if (cantidad <= 0) {
      eliminarItem(id);
      return;
    }
    
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, cantidad } : item
      )
    );
  };

  const total = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const cantidadTotal = items.reduce((sum, item) => sum + item.cantidad, 0);

  const irAlCheckout = () => {
    // Guardar carrito en localStorage
    localStorage.setItem('carrito', JSON.stringify(items));
    localStorage.setItem('tienda_slug', tienda.slug_tienda);
    
    // Redirigir a checkout
    router.push(`/${tienda.slug_tienda}/checkout`);
  };

  return (
    <>
      {/* Botón flotante del carrito */}
      <button
        onClick={() => setMostrar(!mostrar)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-2xl transition-all hover:scale-110 z-40"
      >
        <ShoppingCart className="h-6 w-6" />
        {cantidadTotal > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
            {cantidadTotal}
          </span>
        )}
      </button>

      {/* Panel lateral del carrito */}
      {mostrar && (
        <>
          {/* Panel */}
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l-4 border-blue-600">
            {/* Header */}
            <div className="bg-blue-600 text-white p-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ShoppingCart className="h-6 w-6" />
                <h2 className="text-xl font-bold">Mi Carrito</h2>
              </div>
              <button
                onClick={() => setMostrar(false)}
                className="hover:bg-blue-700 rounded-full p-2 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Tu carrito está vacío</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 bg-gray-50 rounded-lg p-4"
                    >
                      <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden">
                        <Image
                          src={item.imagen_url}
                          alt={item.nombre}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                          {item.nombre}
                        </h3>
                        <p className="text-blue-600 font-bold mb-2">
                          {formatearPrecio(item.precio)}
                        </p>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                            className="bg-white border border-gray-300 rounded-md p-1 hover:bg-gray-100"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="font-semibold w-8 text-center">
                            {item.cantidad}
                          </span>
                          <button
                            onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                            className="bg-white border border-gray-300 rounded-md p-1 hover:bg-gray-100"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => eliminarItem(item.id)}
                            className="ml-auto text-red-500 hover:text-red-700"
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

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t p-6 space-y-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-blue-600">{formatearPrecio(total)}</span>
                </div>
                <button
                  onClick={irAlCheckout}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  Proceder al pago
                </button>
                <button
                  onClick={() => setMostrar(false)}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition-colors"
                >
                  Seguir comprando
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
});

CarritoCompras.displayName = 'CarritoCompras';

export default CarritoCompras;
