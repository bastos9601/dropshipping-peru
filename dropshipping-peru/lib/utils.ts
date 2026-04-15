export function generarSlug(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatearPrecio(precio: number): string {
  return `S/ ${precio.toFixed(2)}`;
}

export function generarMensajeWhatsApp(
  nombreProducto: string,
  precio: number,
  nombreTienda: string,
  imagenUrl?: string
): string {
  let mensaje = `¡Hola! 👋\n\nEstoy interesado en:\n📦 ${nombreProducto}\n💰 Precio: S/ ${precio.toFixed(2)}`;
  
  if (imagenUrl) {
    mensaje += `\n\n🖼️ Ver producto: ${imagenUrl}`;
  }
  
  mensaje += `\n\n🏪 Tienda: ${nombreTienda}\n\n¿Está disponible?`;
  
  return encodeURIComponent(mensaje);
}

export function calcularGanancia(precioVenta: number, precioBase: number): number {
  return precioVenta - precioBase;
}
