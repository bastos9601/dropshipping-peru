-- Tabla de usuarios (perfiles)
CREATE TABLE usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nombre_tienda TEXT NOT NULL,
  slug_tienda TEXT UNIQUE NOT NULL,
  whatsapp TEXT NOT NULL,
  es_admin BOOLEAN DEFAULT false,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de productos (catálogo general)
CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio_base DECIMAL(10,2) NOT NULL,
  imagen_url TEXT,
  categoria TEXT,
  activo BOOLEAN DEFAULT true,
  es_catalogo BOOLEAN DEFAULT true,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de productos por tienda
CREATE TABLE tienda_productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
  precio_venta DECIMAL(10,2) NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(usuario_id, producto_id)
);

-- Tabla de ventas (para tracking)
CREATE TABLE ventas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id),
  cantidad INTEGER DEFAULT 1,
  precio_total DECIMAL(10,2) NOT NULL,
  ganancia DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de configuración del sistema
CREATE TABLE configuracion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave TEXT UNIQUE NOT NULL,
  valor TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar configuración inicial
INSERT INTO configuracion (clave, valor) VALUES
  ('nombre_sistema', 'DropShip Perú'),
  ('descripcion_sistema', 'Plataforma de dropshipping para emprendedores'),
  ('email_contacto', 'contacto@dropshipperu.com'),
  ('whatsapp_admin', '+51987654321');

-- Habilitar Row Level Security
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tienda_productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios
CREATE POLICY "Los usuarios pueden crear su propio perfil durante el registro"
  ON usuarios FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Los usuarios pueden ver su propio perfil"
  ON usuarios FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
  ON usuarios FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Cualquiera puede ver perfiles públicos"
  ON usuarios FOR SELECT
  USING (true);

CREATE POLICY "Los admins pueden actualizar cualquier usuario"
  ON usuarios FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND es_admin = true
    )
  );

CREATE POLICY "Los admins pueden eliminar usuarios"
  ON usuarios FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND es_admin = true
    )
  );

-- Políticas para productos
CREATE POLICY "Todos pueden ver productos activos"
  ON productos FOR SELECT
  USING (activo = true);

CREATE POLICY "Los usuarios pueden ver sus propios productos"
  ON productos FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden crear sus propios productos"
  ON productos FOR INSERT
  WITH CHECK (auth.uid() = usuario_id AND es_catalogo = false);

CREATE POLICY "Los usuarios pueden actualizar sus propios productos"
  ON productos FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios productos"
  ON productos FOR DELETE
  USING (auth.uid() = usuario_id AND es_catalogo = false);

-- Políticas para tienda_productos
CREATE POLICY "Los usuarios pueden ver sus propios productos"
  ON tienda_productos FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden insertar sus propios productos"
  ON tienda_productos FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios productos"
  ON tienda_productos FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios productos"
  ON tienda_productos FOR DELETE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Todos pueden ver productos de tiendas"
  ON tienda_productos FOR SELECT
  USING (activo = true);

-- Políticas para ventas
CREATE POLICY "Los usuarios pueden ver sus propias ventas"
  ON ventas FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden insertar sus propias ventas"
  ON ventas FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

-- Políticas para configuración
CREATE POLICY "Todos pueden ver la configuración"
  ON configuracion FOR SELECT
  USING (true);

CREATE POLICY "Solo admins pueden actualizar la configuración"
  ON configuracion FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND es_admin = true
    )
  );

-- Índices para mejorar rendimiento
CREATE INDEX idx_usuarios_slug ON usuarios(slug_tienda);
CREATE INDEX idx_tienda_productos_usuario ON tienda_productos(usuario_id);
CREATE INDEX idx_tienda_productos_producto ON tienda_productos(producto_id);
CREATE INDEX idx_ventas_usuario ON ventas(usuario_id);
