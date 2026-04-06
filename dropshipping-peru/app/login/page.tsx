'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Store, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useConfiguracion } from '@/lib/useConfiguracion';

export default function Login() {
  const router = useRouter();
  const configuracion = useConfiguracion();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [cuentaDesactivada, setCuentaDesactivada] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const manejarLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    setCuentaDesactivada(false);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      // Verificar si el usuario está activo
      if (authData.user) {
        const { data: perfil } = await supabase
          .from('usuarios')
          .select('activo')
          .eq('id', authData.user.id)
          .single();

        if (!perfil?.activo) {
          await supabase.auth.signOut();
          setCuentaDesactivada(true);
          throw new Error('Tu cuenta ha sido desactivada. Contacta al administrador.');
        }
      }

      router.push('/panel');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setCargando(false);
    }
  };

  const contactarAdmin = () => {
    const mensaje = encodeURIComponent('Hola, mi cuenta ha sido desactivada. Email: ' + formData.email);
    const whatsapp = configuracion.whatsapp_admin || '+51987654321';
    window.open(`https://wa.me/${whatsapp}?text=${mensaje}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <Store className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">Iniciar sesión</h2>
          <p className="text-gray-600 mt-2">Accede a {configuracion.nombre_sistema}</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
            {error}
            {cuentaDesactivada && (
              <button
                onClick={contactarAdmin}
                className="mt-3 w-full flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Contactar al administrador por WhatsApp</span>
              </button>
            )}
          </div>
        )}

        <form onSubmit={manejarLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tu contraseña"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {cargando ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          ¿No tienes cuenta?{' '}
          <Link href="/registro" className="text-blue-600 hover:underline font-medium">
            Regístrate gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
