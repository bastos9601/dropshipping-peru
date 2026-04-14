// Funciones para integración con Mercado Libre API - DESDE EL CLIENTE (navegador)
// Esto evita problemas de CORS y bloqueos de IP del servidor

export interface MLProducto {
  id: string;
  title: string;
  price: number;
  thumbnail: string;
  pictures?: { url: string }[];
  permalink: string;
  seller_id?: number;
  available_quantity: number;
  condition: string;
  shipping?: {
    free_shipping: boolean;
  };
}

export interface MLProductoDetalle extends MLProducto {
  description?: string;
  attributes?: Array<{
    name: string;
    value_name: string;
  }>;
}

// Buscar productos directamente desde el navegador
export async function buscarProductosMLCliente(query: string, limit: number = 50): Promise<MLProducto[]> {
  try {
    console.log('[ML-CLIENTE] Buscando desde navegador:', query);
    
    // Hacer la petición directamente a ML desde el navegador
    const url = `https://api.mercadolibre.com/sites/MPE/search?q=${encodeURIComponent(query)}&limit=${limit}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors',
    });
    
    console.log('[ML-CLIENTE] Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('[ML-CLIENTE] Error:', errorData);
      throw new Error(`Error ${response.status}: ${errorData}`);
    }
    
    const data = await response.json();
    console.log('[ML-CLIENTE] ✅ Resultados:', data.results?.length || 0);
    
    return data.results || [];
  } catch (error: any) {
    console.error('[ML-CLIENTE] Error en búsqueda:', error);
    throw error;
  }
}

// Obtener detalles de un producto directamente desde el navegador
export async function obtenerDetalleProductoMLCliente(itemId: string): Promise<MLProductoDetalle | null> {
  try {
    console.log('[ML-CLIENTE] Obteniendo detalle desde navegador:', itemId);
    
    const url = `https://api.mercadolibre.com/items/${itemId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors',
    });
    
    if (!response.ok) {
      console.error('[ML-CLIENTE] Error obteniendo detalle');
      return null;
    }
    
    const producto = await response.json();
    console.log('[ML-CLIENTE] ✅ Detalle obtenido:', producto.title);
    
    // Obtener descripción por separado
    try {
      const descResponse = await fetch(`https://api.mercadolibre.com/items/${itemId}/description`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
      });
      
      if (descResponse.ok) {
        const descData = await descResponse.json();
        producto.description = descData.plain_text || descData.text || '';
      }
    } catch (e) {
      console.warn('[ML-CLIENTE] No se pudo obtener descripción');
    }
    
    return producto;
  } catch (error) {
    console.error('[ML-CLIENTE] Error al obtener detalle:', error);
    return null;
  }
}
