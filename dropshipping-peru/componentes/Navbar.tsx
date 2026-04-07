'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Store, LogOut, User, ChevronDown, Menu } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useConfiguracion } from '@/lib/useConfiguracion';
import { useState } from 'react';

export default function Navbar({ usuario }: { usuario: any }) {
  const pathname = usePathname();
  const router = useRouter();
  const configuracion = useConfiguracion();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-md relative">
      <div className="w-full px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link href="/panel" className="flex items-center space-x-2 flex-shrink-0">
            <Store className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <span className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900 truncate max-w-[120px] sm:max-w-none">
              {configuracion.nombre_sistema}
            </span>
          </Link>

          {usuario && (
            <>
              {/* Navegación desktop */}
              <div className="hidden md:flex items-center gap-4">
                <Link
                  href="/panel"
                  className={`px-3 py-2 rounded text-sm font-medium ${
                    pathname === '/panel'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Panel
                </Link>
                <Link
                  href="/catalogo"
                  className={`px-3 py-2 rounded text-sm font-medium ${
                    pathname === '/catalogo'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Catálogo
                </Link>
                <Link
                  href="/mis-productos"
                  className={`px-3 py-2 rounded text-sm font-medium ${
                    pathname === '/mis-productos'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Mis Productos
                </Link>
                <Link
                  href="/mis-categorias"
                  className={`px-3 py-2 rounded text-sm font-medium ${
                    pathname === '/mis-categorias'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Mis Categorías
                </Link>
                <Link
                  href="/mis-banners"
                  className={`px-3 py-2 rounded text-sm font-medium ${
                    pathname === '/mis-banners'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Mis Banners
                </Link>
                {usuario.es_admin && (
                  <Link
                    href="/admin"
                    className={`px-3 py-2 rounded text-sm font-medium ${
                      pathname === '/admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    Admin
                  </Link>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-700 px-2 max-w-[150px]">
                  <User className="h-4 w-4" />
                  <span className="truncate">{usuario.email}</span>
                </div>
                <button
                  onClick={cerrarSesion}
                  className="flex items-center gap-2 px-3 py-2 rounded text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Salir</span>
                </button>
              </div>

              {/* Botón menú móvil */}
              <div className="md:hidden">
                <button
                  onClick={() => setMenuAbierto(!menuAbierto)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                    menuAbierto 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  <Menu className="h-5 w-5" />
                  <span className="text-sm">Menú</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${menuAbierto ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Menú desplegable móvil */}
        {usuario && menuAbierto && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t z-50">
            <div className="px-4 py-2 space-y-1">
              <Link
                href="/panel"
                onClick={() => setMenuAbierto(false)}
                className={`block px-3 py-2 rounded text-sm font-medium ${
                  pathname === '/panel'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Panel
              </Link>
              <Link
                href="/catalogo"
                onClick={() => setMenuAbierto(false)}
                className={`block px-3 py-2 rounded text-sm font-medium ${
                  pathname === '/catalogo'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Catálogo
              </Link>
              <Link
                href="/mis-productos"
                onClick={() => setMenuAbierto(false)}
                className={`block px-3 py-2 rounded text-sm font-medium ${
                  pathname === '/mis-productos'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Mis Productos
              </Link>
              <Link
                href="/mis-categorias"
                onClick={() => setMenuAbierto(false)}
                className={`block px-3 py-2 rounded text-sm font-medium ${
                  pathname === '/mis-categorias'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Mis Categorías
              </Link>
              <Link
                href="/mis-banners"
                onClick={() => setMenuAbierto(false)}
                className={`block px-3 py-2 rounded text-sm font-medium ${
                  pathname === '/mis-banners'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Mis Banners
              </Link>
              {usuario.es_admin && (
                <Link
                  href="/admin"
                  onClick={() => setMenuAbierto(false)}
                  className={`block px-3 py-2 rounded text-sm font-medium ${
                    pathname === '/admin'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  Admin
                </Link>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-700 px-3 py-2 border-t">
                <User className="h-4 w-4" />
                <span className="truncate">{usuario.email}</span>
              </div>
              <button
                onClick={() => {
                  setMenuAbierto(false);
                  cerrarSesion();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm font-medium text-red-600 hover:bg-red-50 border-t"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
