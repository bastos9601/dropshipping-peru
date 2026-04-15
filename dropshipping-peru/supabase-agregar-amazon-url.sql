-- Agregar campo amazon_url a la tabla productos
-- Ejecutar en Supabase SQL Editor

-- Agregar columna amazon_url a productos
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS amazon_url TEXT;

-- Agregar comentario
COMMENT ON COLUMN productos.amazon_url IS 'URL del producto en Amazon para que el vendedor pueda comprarlo';

-- Verificar que se agregó correctamente
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'productos' 
AND column_name = 'amazon_url';
