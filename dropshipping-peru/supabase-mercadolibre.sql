-- Agregar campos para productos de Mercado Libre
-- Ejecuta este script en tu panel de Supabase (SQL Editor)

-- Agregar columnas para tracking de productos de ML
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS ml_item_id TEXT,
ADD COLUMN IF NOT EXISTS ml_permalink TEXT,
ADD COLUMN IF NOT EXISTS ml_precio_original DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS ml_fecha_importacion TIMESTAMP DEFAULT NOW();

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_productos_ml_item_id ON productos(ml_item_id);

-- Comentarios para documentación
COMMENT ON COLUMN productos.ml_item_id IS 'ID del producto en Mercado Libre';
COMMENT ON COLUMN productos.ml_permalink IS 'URL del producto original en Mercado Libre';
COMMENT ON COLUMN productos.ml_precio_original IS 'Precio original del producto en ML al momento de importar';
COMMENT ON COLUMN productos.ml_fecha_importacion IS 'Fecha en que se importó el producto desde ML';
