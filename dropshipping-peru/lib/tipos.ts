export interface Usuario {
  id: string;
  email: string;
  nombre_tienda: string;
  slug_tienda: string;
  whatsapp: string;
  es_admin: boolean;
  activo: boolean;
  created_at: string;
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio_base: number;
  imagen_url: string;
  categoria: string;
  activo: boolean;
  es_catalogo: boolean;
  usuario_id?: string;
}

export interface TiendaProducto {
  id: string;
  usuario_id: string;
  producto_id: string;
  precio_venta: number;
  activo: boolean;
  producto?: Producto;
}

export interface Venta {
  id: string;
  usuario_id: string;
  producto_id: string;
  cantidad: number;
  precio_total: number;
  ganancia: number;
  created_at: string;
}
