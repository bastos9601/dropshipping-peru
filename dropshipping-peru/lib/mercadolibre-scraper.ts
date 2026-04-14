// Alternativa: Scraping ligero de la página pública de Mercado Libre
// Esto evita problemas de autenticación con la API

export interface MLProductoSimple {
  id: string;
  title: string;
  price: number;
  thumbnail: string;
  permalink: string;
  condition: string;
  shipping?: {
    free_shipping: boolean;
  };
}

// Función para obtener productos desde la búsqueda pública
export async function buscarProductosMLPublico(query: string): Promise<MLProductoSimple[]> {
  try {
    console.log('[ML-SCRAPER] Buscando:', query);
    
    // Usar la ruta API que hace el scraping
    const response = await fetch(`/api/ml-scraper?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      console.error('[ML-SCRAPER] Error:', response.status);
      return [];
    }
    
    const data = await response.json();
    console.log('[ML-SCRAPER] Productos encontrados:', data.length);
    
    return data;
  } catch (error) {
    console.error('[ML-SCRAPER] Error:', error);
    return [];
  }
}

// Función para obtener detalles de un producto
export async function obtenerDetalleMLPublico(itemId: string) {
  try {
    console.log('[ML-SCRAPER] Obteniendo detalle:', itemId);
    
    const response = await fetch(`/api/ml-scraper-item?id=${itemId}`);
    
    if (!response.ok) {
      console.error('[ML-SCRAPER] Error:', response.status);
      return null;
    }
    
    const data = await response.json();
    console.log('[ML-SCRAPER] Detalle obtenido');
    
    return data;
  } catch (error) {
    console.error('[ML-SCRAPER] Error:', error);
    return null;
  }
}
