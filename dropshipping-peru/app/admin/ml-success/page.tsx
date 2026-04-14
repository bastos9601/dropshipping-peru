'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function MLSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const accessToken = searchParams.get('token');
    const refresh = searchParams.get('refresh');
    
    if (accessToken) {
      setToken(accessToken);
      setRefreshToken(refresh || '');
    }
  }, [searchParams]);

  const copiarToken = () => {
    navigator.clipboard.writeText(token);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Autorización Exitosa!
          </h1>
          <p className="text-gray-600">
            Has conectado exitosamente con Mercado Libre
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-green-900 mb-2">✅ Token de Acceso Obtenido</h2>
          <p className="text-sm text-green-700">
            Ahora puedes usar la API de Mercado Libre sin restricciones
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Access Token:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={token}
                readOnly
                className="flex-1 px-3 py-2 border rounded-md bg-gray-50 text-sm font-mono"
              />
              <button
                onClick={copiarToken}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {copiado ? '✓ Copiado' : 'Copiar'}
              </button>
            </div>
          </div>

          {refreshToken && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Refresh Token:
              </label>
              <input
                type="text"
                value={refreshToken}
                readOnly
                className="w-full px-3 py-2 border rounded-md bg-gray-50 text-sm font-mono"
              />
            </div>
          )}
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">📝 Siguiente Paso:</h3>
          <ol className="text-sm text-yellow-800 space-y-2 list-decimal list-inside">
            <li>Copia el Access Token de arriba</li>
            <li>Abre el archivo <code className="bg-yellow-100 px-1 rounded">.env.local</code></li>
            <li>Pega el token en la variable <code className="bg-yellow-100 px-1 rounded">ML_ACCESS_TOKEN</code></li>
            <li>Reinicia el servidor (<code className="bg-yellow-100 px-1 rounded">npm run dev</code>)</li>
            <li>¡Ya puedes importar productos de Mercado Libre!</li>
          </ol>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => router.push('/importar-ml')}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Ir a Importar Productos
          </button>
          <button
            onClick={() => router.push('/admin')}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Volver al Admin
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MLSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <MLSuccessContent />
    </Suspense>
  );
}
