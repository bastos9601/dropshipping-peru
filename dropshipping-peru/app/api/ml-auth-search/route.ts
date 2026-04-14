import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Cache del access token
let cachedToken: { token: string; expires: number } | null = null;

async function getAccessToken(): Promise<string | null> {
  // Si tenemos un token en cache y no ha expirado, usarlo
  if (cachedToken && cachedToken.expires > Date.now()) {
    console.log('[ML-AUTH] Usando token en cache');
    return cachedToken.token;
  }

  const appId = process.env.ML_APP_ID;
  const clientSecret = process.env.ML_CLIENT_SECRET;

  if (!appId || !clientSecret) {
    console.error('[ML-AUTH] Credenciales no configuradas');
    return null;
  }

  try {
    console.log('[ML-AUTH] Obteniendo nuevo access token...');
    
    const response = await fetch('https://api.mercadolibre.com/oauth/token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: appId,
        client_secret: clientSecret,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ML-AUTH] Error obteniendo token:', errorText);
      return null;
    }

    const data = await response.json();
    console.log('[ML-AUTH] Token obtenido exitosamente');

    // Guardar en cache (expira en 6 horas, pero lo guardamos por 5 horas para estar seguros)
    cachedToken = {
      token: data.access_token,
      expires: Date.now() + (5 * 60 * 60 * 1000), // 5 horas
    };

    return data.access_token;
  } catch (error: any) {
    console.error('[ML-AUTH] Exception:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const limit = searchParams.get('limit') || '50';

  console.log('[ML-AUTH-SEARCH] ===== INICIO BÚSQUEDA =====');
  console.log('[ML-AUTH-SEARCH] Query:', query);
  console.log('[ML-AUTH-SEARCH] Limit:', limit);

  if (!query) {
    return NextResponse.json({ error: 'Query required' }, { status: 400 });
  }

  try {
    console.log('[ML-AUTH-SEARCH] Obteniendo access token...');
    const accessToken = await getAccessToken();

    if (!accessToken) {
      console.error('[ML-AUTH-SEARCH] ❌ No se pudo obtener access token');
      return NextResponse.json({ 
        error: 'No se pudo obtener access token de Mercado Libre',
        details: 'Verifica que ML_APP_ID y ML_CLIENT_SECRET estén configurados correctamente'
      }, { status: 500 });
    }

    console.log('[ML-AUTH-SEARCH] ✅ Access token obtenido:', accessToken.substring(0, 20) + '...');

    const url = `https://api.mercadolibre.com/sites/MPE/search?q=${encodeURIComponent(query)}&limit=${limit}`;
    console.log('[ML-AUTH-SEARCH] URL completa:', url);
    
    console.log('[ML-AUTH-SEARCH] Haciendo petición a ML API...');
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    console.log('[ML-AUTH-SEARCH] Response status:', response.status);
    console.log('[ML-AUTH-SEARCH] Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ML-AUTH-SEARCH] ❌ Error response body:', errorText);
      
      return NextResponse.json({ 
        error: 'ML API error',
        status: response.status,
        details: errorText,
        url: url
      }, { status: response.status });
    }

    const data = await response.json();
    console.log('[ML-AUTH-SEARCH] ✅ Resultados:', data.results?.length || 0);
    console.log('[ML-AUTH-SEARCH] Total disponible:', data.paging?.total || 0);
    console.log('[ML-AUTH-SEARCH] ===== FIN BÚSQUEDA =====');
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[ML-AUTH-SEARCH] ❌ Exception:', error);
    console.error('[ML-AUTH-SEARCH] Stack:', error.stack);
    return NextResponse.json({ 
      error: 'Failed to fetch',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
