import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const limit = searchParams.get('limit') || '50';

  console.log('[ML-PUBLIC] 🔍 Búsqueda:', query);

  if (!query) {
    return NextResponse.json({ error: 'Query requerido' }, { status: 400 });
  }

  try {
    const url = `https://api.mercadolibre.com/sites/MPE/search?q=${encodeURIComponent(query)}&limit=${limit}`;
    
    // Usar el access token
    const accessToken = process.env.ML_ACCESS_TOKEN;
    const headers: HeadersInit = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'application/json',
    };
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
      console.log('[ML-PUBLIC] 🔑 Usando access token');
    } else {
      console.log('[ML-PUBLIC] ⚠️ Sin access token - usando API pública');
    }
    
    const response = await fetch(url, { headers, cache: 'no-store' });

    console.log('[ML-PUBLIC] 📡 Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ML-PUBLIC] ❌ Error:', errorText);
      
      return NextResponse.json({ 
        error: 'Error al consultar ML',
        status: response.status,
        details: errorText
      }, { status: response.status });
    }

    const data = await response.json();
    console.log('[ML-PUBLIC] ✅ Resultados:', data.results?.length || 0);
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[ML-PUBLIC] 💥 Error:', error);
    return NextResponse.json({ 
      error: 'Error al consultar ML',
      message: error.message 
    }, { status: 500 });
  }
}
