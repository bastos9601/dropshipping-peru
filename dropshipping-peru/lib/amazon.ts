// Integración con Amazon Product Data API (RapidAPI)
// Productos REALES de Amazon para dropshipping

export interface AmazonProducto {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  productUrl: string;
  rating?: number;
  reviews?: number;
  shipping?: {
    isFree: boolean;
  };
}

export interface AmazonProductoDetalle extends AmazonProducto {
  description?: string;
  images?: string[];
  specifications?: Array<{
    name: string;
    value: string;
  }>;
}

// Buscar productos en Amazon
export async function buscarProductosAmazon(query: string, limit: number = 30): Promise<AmazonProducto[]> {
  try {
    console.log('[AMAZON] Buscando:', query);
    
    const response = await fetch(`/api/amazon-search?q=${encodeURIComponent(query)}&limit=${limit}`);
    
    console.log('[AMAZON] Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('[AMAZON] Error:', errorData);
      return [];
    }
    
    const data = await response.json();
    console.log('[AMAZON] ✅ Resultados:', data.products?.length || 0);
    
    return data.products || [];
  } catch (error: any) {
    console.error('[AMAZON] Error en búsqueda:', error);
    return [];
  }
}

// Obtener detalles de un producto
export async function obtenerDetalleProductoAmazon(productId: string): Promise<AmazonProductoDetalle | null> {
  try {
    console.log('[AMAZON] Obteniendo detalle:', productId);
    
    const response = await fetch(`/api/amazon-item?id=${productId}`);
    
    if (!response.ok) {
      console.error('[AMAZON] Error obteniendo detalle');
      return null;
    }
    
    const producto = await response.json();
    console.log('[AMAZON] ✅ Detalle obtenido:', producto.title);
    
    return producto;
  } catch (error) {
    console.error('[AMAZON] Error al obtener detalle:', error);
    return null;
  }
}
