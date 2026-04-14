// Funciones para integración con Mercado Libre API

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

// Buscar productos en Mercado Libre
export async function buscarProductosML(query: string, limit: number = 50): Promise<MLProducto[]> {
  try {
    console.log('[ML-CLIENT] Buscando:', query);
    
    const response = await fetch(`/api/ml-public-search?q=${encodeURIComponent(query)}&limit=${limit}`);
    
    console.log('[ML-CLIENT] Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('[ML-CLIENT] Error:', errorData);
      return [];
    }
    
    const data = await response.json();
    console.log('[ML-CLIENT] ✅ Resultados reales:', data.results?.length || 0);
    
    return data.results || [];
  } catch (error: any) {
    console.error('[ML-CLIENT] Error en búsqueda:', error);
    return [];
  }
}

// Obtener detalles de un producto
export async function obtenerDetalleProductoML(itemId: string): Promise<MLProductoDetalle | null> {
  try {
    console.log('[ML-CLIENT] Obteniendo detalle:', itemId);
    
    const response = await fetch(`/api/ml-public-item?id=${itemId}`);
    
    if (!response.ok) {
      console.error('[ML-CLIENT] Error obteniendo detalle');
      return null;
    }
    
    const producto = await response.json();
    console.log('[ML-CLIENT] ✅ Detalle obtenido:', producto.title);
    
    return producto;
  } catch (error) {
    console.error('[ML-CLIENT] Error al obtener detalle:', error);
    return null;
  }
}
