-- Agregar política para permitir eliminar pedidos
-- Ejecutar este script en Supabase SQL Editor

-- Política: Los usuarios pueden eliminar sus propios pedidos
CREATE POLICY "Usuarios pueden eliminar sus pedidos"
  ON pedidos
  FOR DELETE
  USING (auth.uid() = usuario_id);

-- Verificar que la política se creó correctamente
SELECT * FROM pg_policies WHERE tablename = 'pedidos';
