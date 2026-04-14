// Integración con AliExpress para dropshipping
// Usa la API pública de búsqueda de AliExpress

export interface AliExpressProducto {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  productUrl: string;
  rating?: number;
  orders?: number;
  shipping?: {
    isFree: boolean;
  };
}

export interface AliExpressProductoDetalle extends AliExpressProducto {
  description?: string;
  images?: string[];
  specifications?: Array<{
    name: string;
    value: string;
  }>;
}

// Buscar productos en AliExpress usando web scraping ligero
export async function buscarProductosAliExpress(query: string, limit: number = 30): Promise<AliExpressProducto[]> {
  try {
    console.log('[ALIEXPRESS] Buscando:', query);
    
    // Usar la API de búsqueda de AliExpress
    const response = await fetch(`/api/aliexpress-search?q=${encodeURIComponent(query)}&limit=${limit}`);
    
    console.log('[ALIEXPRESS] Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('[ALIEXPRESS] Error:', errorData);
      return [];
    }
    
    const data = await response.json();
    console.log('[ALIEXPRESS] ✅ Resultados:', data.products?.length || 0);
    
    return data.products || [];
  } catch (error: any) {
    console.error('[ALIEXPRESS] Error en búsqueda:', error);
    return [];
  }
}

// Obtener detalles de un producto
export async function obtenerDetalleProductoAliExpress(productId: string): Promise<AliExpressProductoDetalle | null> {
  try {
    console.log('[ALIEXPRESS] Obteniendo detalle:', productId);
    
    const response = await fetch(`/api/aliexpress-item?id=${productId}`);
    
    if (!response.ok) {
      console.error('[ALIEXPRESS] Error obteniendo detalle');
      return null;
    }
    
    const producto = await response.json();
    console.log('[ALIEXPRESS] ✅ Detalle obtenido:', producto.title);
    
    return producto;
  } catch (error) {
    console.error('[ALIEXPRESS] Error al obtener detalle:', error);
    return null;
  }
}
