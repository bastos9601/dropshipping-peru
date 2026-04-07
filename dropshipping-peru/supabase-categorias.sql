-- Tabla de categorías
CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT UNIQUE NOT NULL,
  descripcion TEXT,
  icono TEXT,
  activo BOOLEAN DEFAULT true,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Modificar la tabla productos para usar categoria_id en lugar de categoria texto
ALTER TABLE productos ADD COLUMN categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL;

-- Habilitar Row Level Security
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;

-- Políticas para categorías
CREATE POLICY "Todos pueden ver categorías activas"
  ON categorias FOR SELECT
  USING (activo = true);

CREATE POLICY "Los admins pueden crear categorías"
  ON categorias FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND es_admin = true
    )
  );

CREATE POLICY "Los admins pueden actualizar categorías"
  ON categorias FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND es_admin = true
    )
  );

CREATE POLICY "Los admins pueden eliminar categorías"
  ON categorias FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND es_admin = true
    )
  );

-- Insertar categorías iniciales
INSERT INTO categorias (nombre, descripcion, icono, orden) VALUES
  ('Electrónica', 'Dispositivos electrónicos y accesorios', 'Smartphone', 1),
  ('Hogar y Cocina', 'Artículos para el hogar y cocina', 'Home', 2),
  ('Moda y Accesorios', 'Ropa, zapatos y accesorios', 'Shirt', 3),
  ('Deportes', 'Artículos deportivos y fitness', 'Dumbbell', 4),
  ('Belleza y Cuidado Personal', 'Productos de belleza y cuidado', 'Sparkles', 5),
  ('Juguetes y Bebés', 'Juguetes y artículos para bebés', 'Baby', 6),
  ('Mascotas', 'Productos para mascotas', 'PawPrint', 7),
  ('Oficina y Papelería', 'Artículos de oficina', 'Briefcase', 8),
  ('Automotriz', 'Accesorios para vehículos', 'Car', 9),
  ('Otros', 'Otros productos', 'Package', 10);

-- Índice para mejorar rendimiento
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_categorias_orden ON categorias(orden);
