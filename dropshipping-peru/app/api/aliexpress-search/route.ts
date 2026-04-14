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
  const query = searchParams.get('q');
  const page = searchParams.get('page') || '1';

  console.log('[ALIEXPRESS] 🔍 Búsqueda:', query);

  if (!query) {
    return NextResponse.json({ error: 'Query requerido' }, { status: 400 });
  }

  // Intentar primero con API oficial de AliExpress
  const appKey = process.env.ALIEXPRESS_APP_KEY;
  const appSecret = process.env.ALIEXPRESS_APP_SECRET;
  const trackingId = process.env.ALIEXPRESS_TRACKING_ID;

  if (appKey && appSecret) {
    console.log('[ALIEXPRESS] 🔑 Usando API Oficial de AliExpress');
    
    try {
      const timestamp = Date.now().toString();
      
      const params: Record<string, any> = {
        app_key: appKey,
        method: 'aliexpress.affiliate.product.query',
        timestamp,
        format: 'json',
        v: '2.0',
        sign_method: 'md5',
        keywords: query,
        page_no: page,
        page_size: '30',
        target_currency: 'USD',
        target_language: 'ES',
        sort: 'SALE_PRICE_ASC',
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

      console.log('[ALIEXPRESS] 📡 Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ALIEXPRESS] ❌ Error API Oficial:', errorText);
        throw new Error('Error en API oficial');
      }

      const data = await response.json();
      
      // Transformar respuesta de API oficial
      const products = (data.aliexpress_affiliate_product_query_response?.resp_result?.result?.products?.product || []).map((item: any) => ({
        id: item.product_id || String(item.promotion_link?.match(/\/(\d+)\.html/)?.[1] || ''),
        title: item.product_title,
        price: parseFloat(item.target_sale_price || item.sale_price || 0),
        originalPrice: parseFloat(item.target_original_price || item.original_price || 0),
        imageUrl: item.product_main_image_url,
        productUrl: item.promotion_link || `https://www.aliexpress.com/item/${item.product_id}.html`,
        rating: parseFloat(item.evaluate_rate || 0),
        orders: parseInt(item.volume || 0),
        shipping: {
          isFree: item.free_shipping || false
        }
      }));

      console.log('[ALIEXPRESS] ✅ Resultados (API Oficial):', products.length);
      
      return NextResponse.json({ products });
    } catch (error: any) {
      console.error('[ALIEXPRESS] Error en API Oficial, intentando método alternativo...', error.message);
    }
  }

  // Método alternativo: Productos de ejemplo realistas
  console.log('[ALIEXPRESS] 🌐 Usando productos de ejemplo (configura API para productos reales)');

  try {
    // Productos de ejemplo realistas de AliExpress
    const ejemploProductos = [
      {
        id: '1005004791234567',
        title: 'Wireless Earbuds Bluetooth 5.3 TWS Headphones with Charging Case',
        price: 12.99,
        originalPrice: 29.99,
        imageUrl: 'https://ae01.alicdn.com/kf/S8d9c8f5e5f5e4c5e9f5e5f5e5f5e5f5e/Wireless-Earbuds-Bluetooth-5-3-TWS.jpg',
        productUrl: 'https://www.aliexpress.com/item/1005004791234567.html',
        rating: 4.7,
        orders: 15234,
        shipping: { isFree: true }
      },
      {
        id: '1005005123456789',
        title: 'Smart Watch Men Women Fitness Tracker Heart Rate Monitor',
        price: 24.99,
        originalPrice: 59.99,
        imageUrl: 'https://ae01.alicdn.com/kf/S8d9c8f5e5f5e4c5e9f5e5f5e5f5e5f5e/Smart-Watch-Fitness-Tracker.jpg',
        productUrl: 'https://www.aliexpress.com/item/1005005123456789.html',
        rating: 4.5,
        orders: 8932,
        shipping: { isFree: true }
      },
      {
        id: '1005006234567890',
        title: 'Phone Case Shockproof Silicone Cover for iPhone 14 Pro Max',
        price: 3.99,
        originalPrice: 12.99,
        imageUrl: 'https://ae01.alicdn.com/kf/S8d9c8f5e5f5e4c5e9f5e5f5e5f5e5f5e/Phone-Case-iPhone-14.jpg',
        productUrl: 'https://www.aliexpress.com/item/1005006234567890.html',
        rating: 4.8,
        orders: 23456,
        shipping: { isFree: true }
      },
      {
        id: '1005007345678901',
        title: 'USB C Cable Fast Charging 3A Type C Charger Cable 2M',
        price: 2.49,
        originalPrice: 8.99,
        imageUrl: 'https://ae01.alicdn.com/kf/S8d9c8f5e5f5e4c5e9f5e5f5e5f5e5f5e/USB-C-Cable-Fast-Charging.jpg',
        productUrl: 'https://www.aliexpress.com/item/1005007345678901.html',
        rating: 4.6,
        orders: 34567,
        shipping: { isFree: true }
      },
      {
        id: '1005008456789012',
        title: 'Bluetooth Speaker Portable Wireless Waterproof IPX7 Bass',
        price: 18.99,
        originalPrice: 45.99,
        imageUrl: 'https://ae01.alicdn.com/kf/S8d9c8f5e5f5e4c5e9f5e5f5e5f5e5f5e/Bluetooth-Speaker-Portable.jpg',
        productUrl: 'https://www.aliexpress.com/item/1005008456789012.html',
        rating: 4.7,
        orders: 12345,
        shipping: { isFree: true }
      },
      {
        id: '1005009567890123',
        title: 'Wireless Charger 15W Fast Charging Pad for iPhone Samsung',
        price: 8.99,
        originalPrice: 24.99,
        imageUrl: 'https://ae01.alicdn.com/kf/S8d9c8f5e5f5e4c5e9f5e5f5e5f5e5f5e/Wireless-Charger-15W.jpg',
        productUrl: 'https://www.aliexpress.com/item/1005009567890123.html',
        rating: 4.5,
        orders: 9876,
        shipping: { isFree: true }
      },
      {
        id: '1005010678901234',
        title: 'Gaming Mouse RGB Wireless Rechargeable 7200 DPI',
        price: 15.99,
        originalPrice: 39.99,
        imageUrl: 'https://ae01.alicdn.com/kf/S8d9c8f5e5f5e4c5e9f5e5f5e5f5e5f5e/Gaming-Mouse-RGB-Wireless.jpg',
        productUrl: 'https://www.aliexpress.com/item/1005010678901234.html',
        rating: 4.6,
        orders: 7654,
        shipping: { isFree: true }
      },
      {
        id: '1005011789012345',
        title: 'Mechanical Keyboard RGB Backlit Gaming Keyboard 87 Keys',
        price: 32.99,
        originalPrice: 79.99,
        imageUrl: 'https://ae01.alicdn.com/kf/S8d9c8f5e5f5e4c5e9f5e5f5e5f5e5f5e/Mechanical-Keyboard-RGB.jpg',
        productUrl: 'https://www.aliexpress.com/item/1005011789012345.html',
        rating: 4.7,
        orders: 5432,
        shipping: { isFree: true }
      },
      {
        id: '1005012890123456',
        title: 'Webcam 1080P Full HD with Microphone USB Camera for PC',
        price: 19.99,
        originalPrice: 49.99,
        imageUrl: 'https://ae01.alicdn.com/kf/S8d9c8f5e5f5e4c5e9f5e5f5e5f5e5f5e/Webcam-1080P-Full-HD.jpg',
        productUrl: 'https://www.aliexpress.com/item/1005012890123456.html',
        rating: 4.5,
        orders: 6789,
        shipping: { isFree: true }
      },
      {
        id: '1005013901234567',
        title: 'Power Bank 20000mAh Fast Charging Portable Charger',
        price: 16.99,
        originalPrice: 42.99,
        imageUrl: 'https://ae01.alicdn.com/kf/S8d9c8f5e5f5e4c5e9f5e5f5e5f5e5f5e/Power-Bank-20000mAh.jpg',
        productUrl: 'https://www.aliexpress.com/item/1005013901234567.html',
        rating: 4.8,
        orders: 18765,
        shipping: { isFree: true }
      }
    ];

    // Filtrar por búsqueda
    const filtrados = ejemploProductos.filter(p => 
      p.title.toLowerCase().includes(query.toLowerCase())
    );

    const products = filtrados.length > 0 ? filtrados : ejemploProductos;

    console.log('[ALIEXPRESS] ✅ Productos de ejemplo:', products.length);
    console.warn('[ALIEXPRESS] ⚠️ Estos son productos de EJEMPLO. Para productos REALES:');
    console.warn('[ALIEXPRESS] 1. Regístrate en https://portals.aliexpress.com/');
    console.warn('[ALIEXPRESS] 2. Obtén App Key y App Secret');
    console.warn('[ALIEXPRESS] 3. Agrégalos a .env.local');
    
    return NextResponse.json({ 
      products,
      isExample: true,
      message: '⚠️ Estos son productos de EJEMPLO. Para productos REALES de AliExpress, configura ALIEXPRESS_APP_KEY y ALIEXPRESS_APP_SECRET en .env.local. Ve a CONFIGURAR-ALIEXPRESS.md para instrucciones.'
    });

  } catch (error: any) {
    console.error('[ALIEXPRESS] 💥 Error:', error);
    return NextResponse.json({ 
      products: [],
      error: 'Error al consultar AliExpress',
      message: 'Por favor configura las credenciales de la API oficial de AliExpress en .env.local. Ve a CONFIGURAR-ALIEXPRESS.md para instrucciones.',
      details: error.message 
    }, { status: 500 });
  }
}
