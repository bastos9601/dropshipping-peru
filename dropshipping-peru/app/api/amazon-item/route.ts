import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Tipo de cambio USD a PEN (actualizar periódicamente)
const USD_TO_PEN = 3.70;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  console.log('[AMAZON-ITEM] 🔍 ASIN:', id);

  if (!id) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
  }

  const rapidApiKey = process.env.RAPIDAPI_KEY;
  
  if (!rapidApiKey) {
    console.error('[AMAZON-ITEM] ❌ No hay RAPIDAPI_KEY configurada');
    return NextResponse.json({ 
      error: 'API no configurada',
      message: 'Por favor configura RAPIDAPI_KEY en .env.local'
    }, { status: 500 });
  }

  try {
    // Usar RapidAPI - Real-Time Amazon Data (USA con conversión a PEN)
    const url = `https://real-time-amazon-data.p.rapidapi.com/product-details?asin=${id}&country=US`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'real-time-amazon-data.p.rapidapi.com',
      },
    });

    console.log('[AMAZON-ITEM] 📡 Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AMAZON-ITEM] ❌ Error:', errorText);
      
      return NextResponse.json({ 
        error: 'Error al obtener producto',
        status: response.status,
        details: errorText
      }, { status: response.status });
    }

    const data = await response.json();
    const item = data.data;
    
    if (!item) {
      return NextResponse.json({ 
        error: 'Producto no encontrado'
      }, { status: 404 });
    }

    // Convertir precios de USD a PEN
    const priceUSD = parseFloat(item.product_price?.replace(/[^0-9.]/g, '') || 0);
    const originalPriceUSD = parseFloat(item.product_original_price?.replace(/[^0-9.]/g, '') || 0);

    // Transformar al formato esperado
    const product = {
      id: item.asin || id,
      title: item.product_title || item.title,
      price: priceUSD * USD_TO_PEN, // Convertir a PEN
      originalPrice: originalPriceUSD > 0 ? originalPriceUSD * USD_TO_PEN : 0,
      priceUSD: priceUSD,
      imageUrl: item.product_photo || item.product_main_image_url,
      productUrl: item.product_url || `https://www.amazon.com/dp/${id}`,
      rating: parseFloat(item.product_star_rating || item.rating || 0),
      reviews: parseInt(item.product_num_ratings || item.reviews || 0),
      description: item.product_description || item.about_product?.join('\n') || '',
      images: item.product_photos || [item.product_photo],
      specifications: item.product_details ? Object.entries(item.product_details).map(([name, value]) => ({
        name,
        value: String(value)
      })) : [],
      shipping: {
        isFree: item.is_prime || item.free_shipping || false,
        international: true
      }
    };

    console.log('[AMAZON-ITEM] ✅ Producto obtenido (convertido a PEN):', product.title);
    
    return NextResponse.json(product);
  } catch (error: any) {
    console.error('[AMAZON-ITEM] 💥 Error:', error);
    return NextResponse.json({ 
      error: 'Error al obtener producto',
      message: error.message 
    }, { status: 500 });
  }
}
