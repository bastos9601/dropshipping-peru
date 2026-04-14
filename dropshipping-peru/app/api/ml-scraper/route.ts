import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  console.log('[ML-SCRAPER-API] Búsqueda:', query);

  if (!query) {
    return NextResponse.json({ error: 'Query required' }, { status: 400 });
  }

  try {
    // Hacer búsqueda en la página pública de Mercado Libre
    const url = `https://listado.mercadolibre.com.pe/${encodeURIComponent(query)}`;
    console.log('[ML-SCRAPER-API] URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-PE,es;q=0.9',
      },
    });

    console.log('[ML-SCRAPER-API] Status:', response.status);

    if (!response.ok) {
      return NextResponse.json({ 
        error: 'Failed to fetch',
        status: response.status 
      }, { status: response.status });
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    const productos: any[] = [];
    
    // Extraer productos del HTML
    $('.ui-search-result').each((i, elem) => {
      if (i >= 30) return false; // Limitar a 30 productos
      
      const $elem = $(elem);
      const title = $elem.find('.ui-search-item__title').text().trim();
      const priceText = $elem.find('.andes-money-amount__fraction').first().text().trim();
      const price = parseFloat(priceText.replace(/[,.]/g, ''));
      const thumbnail = $elem.find('.ui-search-result-image__element').attr('src') || '';
      const permalink = $elem.find('.ui-search-link').attr('href') || '';
      const id = permalink.match(/MPE-(\d+)/)?.[1] || `temp-${i}`;
      
      if (title && price && thumbnail) {
        productos.push({
          id: `MPE${id}`,
          title,
          price,
          thumbnail,
          permalink,
          condition: 'new',
          available_quantity: 1,
          shipping: {
            free_shipping: $elem.find('.ui-search-item__shipping').text().includes('Envío gratis')
          }
        });
      }
    });

    console.log('[ML-SCRAPER-API] Productos extraídos:', productos.length);
    
    return NextResponse.json(productos);
  } catch (error: any) {
    console.error('[ML-SCRAPER-API] Exception:', error);
    return NextResponse.json({ 
      error: 'Failed to scrape',
      message: error.message 
    }, { status: 500 });
  }
}
