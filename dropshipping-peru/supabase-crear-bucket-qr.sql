-- Crear bucket para almacenar QR de pagos
-- Ejecutar en Supabase SQL Editor o en Storage

-- Nota: Este bucket se debe crear desde la interfaz de Supabase Storage
-- Ve a: Storage > Create a new bucket
-- Nombre: qr-pagos
-- Public: Yes (marcar como público)

-- Alternativamente, puedes ejecutar esto si tienes permisos:
INSERT INTO storage.buckets (id, name, public)
VALUES ('qr-pagos', 'qr-pagos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de seguridad para el bucket
-- Permitir que usuarios autenticados suban archivos
CREATE POLICY "Usuarios pueden subir QR"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'qr-pagos');

-- Permitir que usuarios autenticados actualicen sus archivos
CREATE POLICY "Usuarios pueden actualizar sus QR"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'qr-pagos');

-- Permitir que usuarios autenticados eliminen sus archivos
CREATE POLICY "Usuarios pueden eliminar sus QR"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'qr-pagos');

-- Permitir lectura pública (para mostrar los QR en las tiendas)
CREATE POLICY "QR son públicos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'qr-pagos');
