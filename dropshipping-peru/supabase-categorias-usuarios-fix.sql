-- Script para agregar políticas de administrador a categorías
-- NOTA: Solo ejecuta este script si ya ejecutaste supabase-categorias-usuarios.sql
-- y obtuviste el error de que la columna ya existe

-- Primero, eliminar las políticas existentes si existen
DROP POLICY IF EXISTS "Los admins pueden ver todas las categorías" ON categorias;
DROP POLICY IF EXISTS "Los admins pueden actualizar cualquier categoría" ON categorias;
DROP POLICY IF EXISTS "Los admins pueden eliminar cualquier categoría" ON categorias;

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
