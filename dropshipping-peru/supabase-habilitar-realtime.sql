-- Habilitar Realtime para la tabla de pedidos
-- Ejecutar en Supabase SQL Editor

-- Habilitar replicación para la tabla pedidos
ALTER TABLE pedidos REPLICA IDENTITY FULL;

-- Habilitar publicación de cambios
ALTER PUBLICATION supabase_realtime ADD TABLE pedidos;

-- Verificar que está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'pedidos';

-- Nota: También debes habilitar Realtime desde la interfaz de Supabase:
-- 1. Ve a Database > Replication en tu proyecto de Supabase
-- 2. Busca la tabla "pedidos"
-- 3. Activa el toggle para habilitar Realtime
-- 4. Guarda los cambios
