'use client';

import Image from 'next/image';
import { Plus, Check } from 'lucide-react';
import { formatearPrecio } from '@/lib/utils';
import { Producto } from '@/lib/tipos';

interface TarjetaProductoProps {
  producto: Producto;
  agregado?: boolean;
  onAgregar?: (productoId: string) => void;
}

export default function TarjetaProducto({ producto, agregado, onAgregar }: TarjetaProductoProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative h-48 bg-gray-200">
        <Image
          src={producto.imagen_url}
          alt={producto.nombre}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{producto.nombre}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{producto.descripcion}</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-blue-600">
            {formatearPrecio(producto.precio_base)}
          </span>
          {onAgregar && (
            <button
              onClick={() => onAgregar(producto.id)}
              disabled={agregado}
              className={`flex items-center space-x-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                agregado
                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {agregado ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Agregado</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Agregar</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
