import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const limit = searchParams.get('limit') || '50';

  console.log('[ML-SEARCH-API] Búsqueda:', query);

  if (!query) {
    return NextResponse.json({ error: 'Query required' }, { status: 400 });
  }

  try {
    const url = `https://api.mercadolibre.com/sites/MPE/search?q=${encodeURIComponent(query)}&limit=${limit}`;
    console.log('[ML-SEARCH-API] URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'es-PE,es;q=0.9',
        'Referer': 'https://www.mercadolibre.com.pe/',
        'Origin': 'https://www.mercadolibre.com.pe',
      },
    });

    console.log('[ML-SEARCH-API] Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ML-SEARCH-API] Error:', errorText);
      
      // Si falla, intentar con una URL alternativa
      console.log('[ML-SEARCH-API] Intentando método alternativo...');
      
      const altResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!altResponse.ok) {
        return NextResponse.json({ 
          error: 'ML API error',
          status: response.status,
          details: errorText
        }, { status: response.status });
      }
      
      const altData = await altResponse.json();
      return NextResponse.json(altData);
    }

    const data = await response.json();
    console.log('[ML-SEARCH-API] Resultados:', data.results?.length || 0);
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[ML-SEARCH-API] Exception:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch',
      message: error.message 
    }, { status: 500 });
  }
}
