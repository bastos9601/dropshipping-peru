-- Script para agregar soporte de categorías personalizadas por usuario
-- Este script agrega la columna usuario_id y las políticas necesarias

-- Agregar campo usuario_id solo si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categorias' AND column_name = 'usuario_id'
  ) THEN
    ALTER TABLE categorias ADD COLUMN usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Eliminar políticas existentes si existen (para evitar duplicados)
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propias categorías" ON categorias;
DROP POLICY IF EXISTS "Los usuarios pueden crear sus propias categorías" ON categorias;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar sus propias categorías" ON categorias;
DROP POLICY IF EXISTS "Los usuarios pueden eliminar sus propias categorías" ON categorias;
DROP POLICY IF EXISTS "Los admins pueden ver todas las categorías" ON categorias;
DROP POLICY IF EXISTS "Los admins pueden actualizar cualquier categoría" ON categorias;
DROP POLICY IF EXISTS "Los admins pueden eliminar cualquier categoría" ON categorias;

-- Políticas para usuarios normales
CREATE POLICY "Los usuarios pueden ver sus propias categorías"
  ON categorias FOR SELECT
  USING (usuario_id = auth.uid() OR usuario_id IS NULL);

CREATE POLICY "Los usuarios pueden crear sus propias categorías"
  ON categorias FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden actualizar sus propias categorías"
  ON categorias FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden eliminar sus propias categorías"
  ON categorias FOR DELETE
  USING (auth.uid() = usuario_id);

-- Políticas adicionales para administradores
CREATE POLICY "Los admins pueden ver todas las categorías"
  ON categorias FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND es_admin = true
    )
  );

CREATE POLICY "Los admins pueden actualizar cualquier categoría"
  ON categorias FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND es_admin = true
    )
  );

CREATE POLICY "Los admins pueden eliminar cualquier categoría"
  ON categorias FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND es_admin = true
    )
  );

-- Crear índice solo si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_categorias_usuario'
  ) THEN
    CREATE INDEX idx_categorias_usuario ON categorias(usuario_id);
  END IF;
END $$;

-- Nota: Las categorías con usuario_id NULL son las categorías globales del sistema
-- Las categorías con usuario_id son categorías personalizadas de cada usuario
-- Los administradores pueden gestionar todas las categorías (globales y de usuarios)
