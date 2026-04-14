import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Tipo de cambio USD a PEN (actualizar periódicamente)
const USD_TO_PEN = 3.70;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const page = searchParams.get('page') || '1';

  console.log('[AMAZON] 🔍 Búsqueda:', query);

  if (!query) {
    return NextResponse.json({ error: 'Query requerido' }, { status: 400 });
  }

  const rapidApiKey = process.env.RAPIDAPI_KEY;
  
  if (!rapidApiKey) {
    console.error('[AMAZON] ❌ No hay RAPIDAPI_KEY configurada');
    return NextResponse.json({ 
      error: 'API no configurada',
      message: 'Por favor configura RAPIDAPI_KEY en .env.local. Ve a https://rapidapi.com/ y suscríbete a "Real-Time Amazon Data"'
    }, { status: 500 });
  }

  try {
    // Usar RapidAPI - Real-Time Amazon Data (USA con conversión a PEN)
    // Nota: La API no soporta Amazon Perú directamente, usamos USA y convertimos precios
    const url = `https://real-time-amazon-data.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=${page}&country=US&sort_by=RELEVANCE&product_condition=ALL`;
    
    console.log('[AMAZON] 📡 Consultando Amazon USA (convertiremos a PEN)...');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'real-time-amazon-data.p.rapidapi.com',
      },
    });

    console.log('[AMAZON] 📡 Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AMAZON] ❌ Error:', errorText);
      
      if (response.status === 403) {
        return NextResponse.json({ 
          error: 'No estás suscrito a la API',
          message: 'Ve a https://rapidapi.com/letscrape-6bRBa3QguO5/api/real-time-amazon-data y suscríbete al plan gratuito (100 requests/mes)',
          status: 403
        }, { status: 403 });
      }
      
      return NextResponse.json({ 
        error: 'Error al consultar Amazon',
        status: response.status,
        details: errorText
      }, { status: response.status });
    }

    const data = await response.json();
    
    // Transformar los datos de Amazon USA y convertir a PEN
    const products = (data.data?.products || []).map((item: any) => {
      const priceUSD = parseFloat(item.product_price?.replace(/[^0-9.]/g, '') || 0);
      const originalPriceUSD = parseFloat(item.product_original_price?.replace(/[^0-9.]/g, '') || 0);
      
      return {
        id: item.asin || String(item.product_id),
        title: item.product_title || item.title,
        price: priceUSD * USD_TO_PEN, // Convertir a PEN
        originalPrice: originalPriceUSD > 0 ? originalPriceUSD * USD_TO_PEN : 0,
        priceUSD: priceUSD,
        imageUrl: item.product_photo || item.product_main_image_url,
        productUrl: item.product_url || `https://www.amazon.com/dp/${item.asin}`,
        rating: parseFloat(item.product_star_rating || item.rating || 0),
        reviews: parseInt(item.product_num_ratings || item.reviews || 0),
        shipping: {
          isFree: item.is_prime || item.free_shipping || false,
          international: true // Amazon Global envía a Perú
        }
      };
    });

    console.log('[AMAZON] ✅ Resultados:', products.length, '(precios convertidos a PEN)');
    
    return NextResponse.json({ products });
  } catch (error: any) {
    console.error('[AMAZON] 💥 Error:', error);
    return NextResponse.json({ 
      error: 'Error al consultar Amazon',
      message: error.message 
    }, { status: 500 });
  }
}
