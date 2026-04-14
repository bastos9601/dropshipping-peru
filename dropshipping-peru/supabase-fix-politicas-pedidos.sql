-- Corregir políticas RLS para permitir que clientes creen pedidos
-- Ejecutar en Supabase SQL Editor

-- Primero, eliminar las políticas existentes que causan conflicto
DROP POLICY IF EXISTS "Usuarios pueden crear pedidos" ON pedidos;
DROP POLICY IF EXISTS "Permitir creación de pedidos públicos" ON pedidos;

-- Crear nueva política que permite a CUALQUIERA crear pedidos
-- (Los clientes no están autenticados cuando hacen pedidos)
CREATE POLICY "Permitir creación de pedidos públicos"
  ON pedidos
  FOR INSERT
  WITH CHECK (true);

-- Mantener la política de que los usuarios solo ven sus propios pedidos
-- (Esta ya existe, pero la recreamos por si acaso)
DROP POLICY IF EXISTS "Usuarios ven sus propios pedidos" ON pedidos;
CREATE POLICY "Usuarios ven sus propios pedidos"
  ON pedidos
  FOR SELECT
  USING (auth.uid() = usuario_id);

-- Mantener la política de actualización
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus pedidos" ON pedidos;
CREATE POLICY "Usuarios pueden actualizar sus pedidos"
  ON pedidos
  FOR UPDATE
  USING (auth.uid() = usuario_id);

-- Verificar las políticas creadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'pedidos'
ORDER BY policyname;
