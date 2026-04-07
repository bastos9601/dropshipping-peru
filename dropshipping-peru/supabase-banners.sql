-- Tabla de banners para tiendas
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE NOT NULL,
  producto_id UUID REFERENCES productos(id) ON DELETE CASCADE NOT NULL,
  imagen_url TEXT NOT NULL,
  orden INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_banners_usuario ON banners(usuario_id);
CREATE INDEX idx_banners_activo ON banners(activo);

-- Habilitar Row Level Security
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Políticas para banners
CREATE POLICY "Los usuarios pueden ver sus propios banners"
  ON banners FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden crear sus propios banners"
  ON banners FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios banners"
  ON banners FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios banners"
  ON banners FOR DELETE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Todos pueden ver banners activos de tiendas públicas"
  ON banners FOR SELECT
  USING (activo = true);

-- Comentarios
COMMENT ON TABLE banners IS 'Almacena los banners/flyers que los usuarios crean para promocionar productos en sus tiendas';
COMMENT ON COLUMN banners.orden IS 'Orden de visualización del banner (menor número = mayor prioridad)';
