-- Agregar campo para QR de Yape en la tabla usuarios
-- Ejecutar en Supabase SQL Editor

ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS yape_qr_url TEXT;

COMMENT ON COLUMN usuarios.yape_qr_url IS 'URL de la imagen del QR de Yape/Plin del usuario';
