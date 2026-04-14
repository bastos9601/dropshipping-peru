-- SOLUCIÓN COMPLETA: Configurar RLS correctamente para pedidos
-- Ejecutar en Supabase SQL Editor

-- Paso 1: Eliminar TODAS las políticas existentes
DROP POLICY IF EXISTS "Usuarios pueden crear pedidos" ON pedidos;
DROP POLICY IF EXISTS "Permitir creación de pedidos públicos" ON pedidos;
DROP POLICY IF EXISTS "Usuarios ven sus propios pedidos" ON pedidos;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus pedidos" ON pedidos;
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus pedidos" ON pedidos;
DROP POLICY IF EXISTS "Permitir eliminación de pedidos" ON pedidos;

-- Paso 2: Asegurarse de que RLS está habilitado
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

-- Paso 3: Crear política para INSERTAR (cualquiera puede crear pedidos)
CREATE POLICY "Permitir creación pública de pedidos"
  ON pedidos
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Paso 4: Crear política para LEER (usuarios ven solo sus pedidos)
CREATE POLICY "Usuarios ven sus pedidos"
  ON pedidos
  FOR SELECT
  TO authenticated
  USING (auth.uid() = usuario_id);

-- Paso 5: Crear política para ACTUALIZAR (usuarios actualizan solo sus pedidos)
CREATE POLICY "Usuarios actualizan sus pedidos"
  ON pedidos
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

-- Paso 6: Crear política para ELIMINAR (usuarios eliminan solo sus pedidos)
CREATE POLICY "Usuarios eliminan sus pedidos"
  ON pedidos
  FOR DELETE
  TO authenticated
  USING (auth.uid() = usuario_id);

-- Paso 7: Verificar las políticas creadas
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN 'USING: ' || qual::text
    ELSE 'No USING clause'
  END as using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check::text
    ELSE 'No WITH CHECK clause'
  END as with_check_clause
FROM pg_policies
WHERE tablename = 'pedidos'
ORDER BY policyname;

-- Paso 8: Verificar que RLS está habilitado
SELECT 
  schemaname,
  tablename, 
  CASE 
    WHEN rowsecurity THEN 'RLS HABILITADO ✓'
    ELSE 'RLS DESHABILITADO ✗'
  END as estado_rls
FROM pg_tables 
WHERE tablename = 'pedidos';
