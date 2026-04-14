import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Función para generar firma de AliExpress API oficial
function generateSign(appSecret: string, params: Record<string, any>): string {
  const sortedKeys = Object.keys(params).sort();
  let signStr = appSecret;
  
  for (const key of sortedKeys) {
    signStr += key + params[key];
  }
  
  signStr += appSecret;
  
  return crypto.createHash('md5').update(signStr).digest('hex').toUpperCase();
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  console.log('[ALIEXPRESS-ITEM] 🔍 ID:', id);

  if (!id) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
  }

  // Intentar primero con API oficial de AliExpress
  const appKey = process.env.ALIEXPRESS_APP_KEY;
  const appSecret = process.env.ALIEXPRESS_APP_SECRET;
  const trackingId = process.env.ALIEXPRESS_TRACKING_ID;

  if (appKey && appSecret) {
    console.log('[ALIEXPRESS-ITEM] 🔑 Usando API Oficial de AliExpress');
    
    try {
      const timestamp = Date.now().toString();
      
      const params: Record<string, any> = {
        app_key: appKey,
        method: 'aliexpress.affiliate.productdetail.get',
        timestamp,
        format: 'json',
        v: '2.0',
        sign_method: 'md5',
        product_ids: id,
        target_currency: 'USD',
        target_language: 'ES',
      };

      if (trackingId) {
        params.tracking_id = trackingId;
      }

      const sign = generateSign(appSecret, params);
      params.sign = sign;

      const queryString = new URLSearchParams(params).toString();
      const url = `https://api-sg.aliexpress.com/sync?${queryString}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('[ALIEXPRESS-ITEM] 📡 Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ALIEXPRESS-ITEM] ❌ Error API Oficial:', errorText);
        throw new Error('Error en API oficial');
      }

      const data = await response.json();
      const item = data.aliexpress_affiliate_productdetail_get_response?.resp_result?.result?.products?.product?.[0];
      
      if (!item) {
        throw new Error('Producto no encontrado');
      }

      // Transformar respuesta de API oficial
      const product = {
        id: item.product_id || id,
        title: item.product_title,
        price: parseFloat(item.target_sale_price || item.sale_price || 0),
        originalPrice: parseFloat(item.target_original_price || item.original_price || 0),
        imageUrl: item.product_main_image_url,
        productUrl: item.promotion_link || `https://www.aliexpress.com/item/${id}.html`,
        rating: parseFloat(item.evaluate_rate || 0),
        orders: parseInt(item.volume || 0),
        description: item.product_detail_url || '',
        images: item.product_video_url ? [item.product_main_image_url] : [item.product_main_image_url],
        specifications: [],
        shipping: {
          isFree: item.free_shipping || false
        }
      };

      console.log('[ALIEXPRESS-ITEM] ✅ Producto obtenido (API Oficial):', product.title);
      
      return NextResponse.json(product);
    } catch (error: any) {
      console.error('[ALIEXPRESS-ITEM] Error en API Oficial, intentando RapidAPI...', error.message);
    }
  }

  // Fallback a RapidAPI
  const rapidApiKey = process.env.RAPIDAPI_KEY;
  
  if (!rapidApiKey) {
    console.error('[ALIEXPRESS-ITEM] ❌ No hay credenciales configuradas');
    return NextResponse.json({ 
      error: 'API no configurada',
      message: 'Por favor configura ALIEXPRESS_APP_KEY y ALIEXPRESS_APP_SECRET (API Oficial) o RAPIDAPI_KEY en .env.local'
    }, { status: 500 });
  }

  console.log('[ALIEXPRESS-ITEM] 🔑 Usando RapidAPI');

  try {
    // Usar RapidAPI - AliExpress DataHub
    const url = `https://aliexpress-datahub.p.rapidapi.com/item_detail?itemId=${id}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'aliexpress-datahub.p.rapidapi.com',
      },
    });

    console.log('[ALIEXPRESS-ITEM] 📡 Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ALIEXPRESS-ITEM] ❌ Error:', errorText);
      
      return NextResponse.json({ 
        error: 'Error al obtener producto',
        status: response.status,
        details: errorText
      }, { status: response.status });
    }

    const data = await response.json();
    const item = data.result || data;
    
    // Transformar al formato esperado
    const product = {
      id: String(item.itemId || item.productId || id),
      title: item.title || item.subject || item.productTitle,
      price: parseFloat(item.salePrice?.min || item.sale_price || item.price || 0),
      originalPrice: parseFloat(item.originalPrice?.min || item.original_price || 0),
      imageUrl: item.imageUrl || item.image || item.productImage,
      productUrl: item.itemUrl || item.productUrl || item.detailUrl || `https://www.aliexpress.com/item/${id}.html`,
      rating: parseFloat(item.averageStar || item.rating || 0),
      orders: parseInt(item.tradeCount || item.orders || item.volume || 0),
      description: item.description || item.productDescription || '',
      images: item.images || item.imageUrls || [item.imageUrl],
      specifications: item.specifications || item.props || [],
      shipping: {
        isFree: item.freeShipping || false
      }
    };

    console.log('[ALIEXPRESS-ITEM] ✅ Producto obtenido (RapidAPI):', product.title);
    
    return NextResponse.json(product);
  } catch (error: any) {
    console.error('[ALIEXPRESS-ITEM] 💥 Error:', error);
    return NextResponse.json({ 
      error: 'Error al obtener producto',
      message: error.message 
    }, { status: 500 });
  }
}
