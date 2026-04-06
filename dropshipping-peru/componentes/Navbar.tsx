'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Store, LogOut, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useConfiguracion } from '@/lib/useConfiguracion';

export default function Navbar({ usuario }: { usuario: any }) {
  const pathname = usePathname();
  const router = useRouter();
  const configuracion = useConfiguracion();

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/panel" className="flex items-center space-x-2">
              <Store className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">{configuracion.nombre_sistema}</span>
            </Link>
          </div>

          {usuario && (
            <div className="flex items-center space-x-4">
              <Link
                href="/panel"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/panel'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Mi Panel
              </Link>
              <Link
                href="/catalogo"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/catalogo'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Catálogo
              </Link>
              <Link
                href="/mis-productos"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/mis-productos'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Mis Productos
              </Link>
              {usuario.es_admin && (
                <Link
                  href="/admin"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/admin'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  Admin
                </Link>
              )}
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <User className="h-4 w-4" />
                <span>{usuario.email}</span>
              </div>
              <button
                onClick={cerrarSesion}
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                <span>Salir</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
