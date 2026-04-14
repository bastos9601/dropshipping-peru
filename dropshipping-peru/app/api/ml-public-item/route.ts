import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  console.log('[ML-ITEM] 🔍 ID:', id);

  if (!id) {
    return NextResponse.json(
      { error: 'ID requerido' },
      { status: 400 }
    );
  }

  try {
    const url = `https://api.mercadolibre.com/items/${id}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json',
        'Accept-Language': 'es-PE,es;q=0.9',
        'Referer': 'https://www.mercadolibre.com.pe/',
      },
      cache: 'no-store',
    });

    console.log('[ML-ITEM] 📡 Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();

      console.error('[ML-ITEM] ❌ Error:', errorText);

      return NextResponse.json(
        {
          error: 'Error al obtener producto',
          status: response.status,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('[ML-ITEM] 💥 Error:', error);

    return NextResponse.json(
      {
        error: 'Error interno',
        message: error.message,
      },
      { status: 500 }
    );
  }
}