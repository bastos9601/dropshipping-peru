'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/componentes/Navbar';
import { ExternalLink, Key, CheckCircle } from 'lucide-react';

export default function ConectarML() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    verificarAdmin();
  }, []);

  const verificarAdmin = async () => {
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

    if (!perfil || !perfil.es_admin) {
      router.push('/panel');
      return;
    }

    setUsuario(perfil);
  };

  const conectarML = () => {
    const clientId = process.env.NEXT_PUBLIC_ML_CLIENT_ID || '497265314413017';
    const redirectUri = 'http://localhost:3000/api/auth/ml/callback';
    const url = `https://auth.mercadolibre.com.pe/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    
    console.log('[CONECTAR-ML] Redirigiendo a:', url);
    window.location.href = url;
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
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Conectar con Mercado Libre</h1>
          <p className="text-gray-600">Autoriza la aplicación para importar productos sin restricciones</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-4">
              <Key className="h-10 w-10 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Autorización OAuth
            </h2>
            <p className="text-gray-600">
              Necesitas autorizar la aplicación para acceder a la API de Mercado Libre
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3">¿Por qué necesito esto?</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>Evita errores 403 (Forbidden) al buscar productos</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>Acceso completo a la API de Mercado Libre</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>Importa productos reales sin limitaciones</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>Token válido por 6 horas (renovable)</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Pasos a seguir:</h3>
            <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
              <li>Haz clic en el botón "Conectar con Mercado Libre"</li>
              <li>Serás redirigido a Mercado Libre para autorizar</li>
              <li>Inicia sesión con tu cuenta de Mercado Libre</li>
              <li>Autoriza la aplicación</li>
              <li>Serás redirigido de vuelta con el token</li>
              <li>Copia el token y agrégalo a tu archivo .env.local</li>
              <li>Reinicia el servidor</li>
              <li>¡Listo para importar productos!</li>
            </ol>
          </div>

          <button
            onClick={conectarML}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-4 px-6 rounded-lg flex items-center justify-center space-x-3 transition-colors"
          >
            <ExternalLink className="h-6 w-6" />
            <span className="text-lg">Conectar con Mercado Libre</span>
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Al conectar, aceptas que la aplicación acceda a la API pública de Mercado Libre
          </p>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Importante:</h3>
          <p className="text-sm text-yellow-800">
            Después de obtener el token, deberás agregarlo manualmente al archivo <code className="bg-yellow-100 px-1 rounded">.env.local</code> 
            en la variable <code className="bg-yellow-100 px-1 rounded">ML_ACCESS_TOKEN</code> y reiniciar el servidor.
          </p>
        </div>
      </div>
    </div>
  );
}
