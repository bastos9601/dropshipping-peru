import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const itemId = searchParams.get('id');

  console.log('[ML-ITEM-API] Item:', itemId);

  if (!itemId) {
    return NextResponse.json({ error: 'Item ID required' }, { status: 400 });
  }

  try {
    const itemResponse = await fetch(`https://api.mercadolibre.com/items/${itemId}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'es-PE,es;q=0.9',
      },
    });

    console.log('[ML-ITEM-API] Status:', itemResponse.status);

    if (!itemResponse.ok) {
      const errorText = await itemResponse.text();
      console.error('[ML-ITEM-API] Error:', errorText);
      return NextResponse.json({ 
        error: 'ML API error',
        details: errorText 
      }, { status: itemResponse.status });
    }

    const item = await itemResponse.json();
    console.log('[ML-ITEM-API] Item obtenido:', item.title);

    // Intentar obtener descripción
    let description = '';
    try {
      const descResponse = await fetch(`https://api.mercadolibre.com/items/${itemId}/description`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
      });

      if (descResponse.ok) {
        const descData = await descResponse.json();
        description = descData.plain_text || '';
      }
    } catch (e) {
      console.log('[ML-ITEM-API] Sin descripción');
    }

    return NextResponse.json({
      ...item,
      description: description || item.description || '',
    });
  } catch (error: any) {
    console.error('[ML-ITEM-API] Exception:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch item',
      message: error.message 
    }, { status: 500 });
  }
}
