'use client';

import Link from 'next/link';
import { Store, Zap, TrendingUp, Smartphone } from 'lucide-react';
import { useConfiguracion } from '@/lib/useConfiguracion';

export default function Home() {
  const configuracion = useConfiguracion();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Store className="h-20 w-20 text-blue-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            {configuracion.nombre_sistema}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {configuracion.descripcion_sistema}
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/registro"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Crear mi tienda gratis
            </Link>
            <Link
              href="/login"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors border-2 border-blue-600"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Zap className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Rápido y fácil</h3>
            <p className="text-gray-600">
              Crea tu tienda en menos de 5 minutos. Solo elige productos y empieza a vender.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <TrendingUp className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Sin inversión</h3>
            <p className="text-gray-600">
              No necesitas comprar inventario. Vende primero, compra después.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Smartphone className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Vende por WhatsApp</h3>
            <p className="text-gray-600">
              Tus clientes compran directamente por WhatsApp. Simple y efectivo.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            ¿Cómo funciona?
          </h2>
          <div className="grid md:grid-cols-4 gap-6 mt-8">
            <div>
              <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                1
              </div>
              <h4 className="font-semibold mb-2">Regístrate</h4>
              <p className="text-sm text-gray-600">Crea tu cuenta gratis</p>
            </div>
            <div>
              <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                2
              </div>
              <h4 className="font-semibold mb-2">Elige productos</h4>
              <p className="text-sm text-gray-600">Selecciona del catálogo</p>
            </div>
            <div>
              <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                3
              </div>
              <h4 className="font-semibold mb-2">Comparte tu tienda</h4>
              <p className="text-sm text-gray-600">Obtén tu enlace único</p>
            </div>
            <div>
              <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                4
              </div>
              <h4 className="font-semibold mb-2">Vende y gana</h4>
              <p className="text-sm text-gray-600">Recibe pedidos por WhatsApp</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
