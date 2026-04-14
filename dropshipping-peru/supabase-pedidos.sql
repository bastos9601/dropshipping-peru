-- Tabla de pedidos para el sistema de dropshipping
-- Ejecutar en Supabase SQL Editor

-- Crear tabla de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_pedido TEXT UNIQUE NOT NULL,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  tienda_slug TEXT NOT NULL,
  
  -- Información del cliente
  cliente_nombre TEXT NOT NULL,
  cliente_email TEXT,
  cliente_telefono TEXT NOT NULL,
  cliente_direccion TEXT NOT NULL,
  cliente_ciudad TEXT,
  cliente_referencia TEXT,
  
  -- Detalles del pedido
  productos JSONB NOT NULL, -- Array de productos con {id, nombre, precio, cantidad, imagen}
  subtotal DECIMAL(10,2) NOT NULL,
  envio DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  
  -- Estado y pago
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado')),
  metodo_pago TEXT CHECK (metodo_pago IN ('transferencia', 'yape', 'plin', 'contraentrega', 'tarjeta')),
  pago_confirmado BOOLEAN DEFAULT FALSE,
  
  -- Tracking
  codigo_seguimiento TEXT,
  notas TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_pedidos_usuario ON pedidos(usuario_id);
CREATE INDEX idx_pedidos_tienda ON pedidos(tienda_slug);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedidos_numero ON pedidos(numero_pedido);
CREATE INDEX idx_pedidos_created ON pedidos(created_at DESC);

-- Función para generar número de pedido único
CREATE OR REPLACE FUNCTION generar_numero_pedido()
RETURNS TEXT AS $$
DECLARE
  nuevo_numero TEXT;
  existe BOOLEAN;
BEGIN
  LOOP
    -- Generar número: PED-YYYYMMDD-XXXX (ej: PED-20240414-1234)
    nuevo_numero := 'PED-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    -- Verificar si existe
    SELECT EXISTS(SELECT 1 FROM pedidos WHERE numero_pedido = nuevo_numero) INTO existe;
    
    -- Si no existe, salir del loop
    IF NOT existe THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN nuevo_numero;
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar número de pedido automáticamente
CREATE OR REPLACE FUNCTION set_numero_pedido()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.numero_pedido IS NULL OR NEW.numero_pedido = '' THEN
    NEW.numero_pedido := generar_numero_pedido();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_numero_pedido
  BEFORE INSERT ON pedidos
  FOR EACH ROW
  EXECUTE FUNCTION set_numero_pedido();

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_pedidos_updated_at
  BEFORE UPDATE ON pedidos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Habilitar RLS (Row Level Security)
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propios pedidos
CREATE POLICY "Usuarios ven sus propios pedidos"
  ON pedidos
  FOR SELECT
  USING (auth.uid() = usuario_id);

-- Política: Los usuarios pueden crear pedidos
CREATE POLICY "Usuarios pueden crear pedidos"
  ON pedidos
  FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

-- Política: Los usuarios pueden actualizar sus propios pedidos
CREATE POLICY "Usuarios pueden actualizar sus pedidos"
  ON pedidos
  FOR UPDATE
  USING (auth.uid() = usuario_id);

-- Política: Los usuarios pueden eliminar sus propios pedidos
CREATE POLICY "Usuarios pueden eliminar sus pedidos"
  ON pedidos
  FOR DELETE
  USING (auth.uid() = usuario_id);

-- Política: Permitir inserción sin autenticación (para clientes que hacen pedidos)
CREATE POLICY "Permitir creación de pedidos públicos"
  ON pedidos
  FOR INSERT
  WITH CHECK (true);

-- Comentarios
COMMENT ON TABLE pedidos IS 'Tabla de pedidos del sistema de dropshipping';
COMMENT ON COLUMN pedidos.numero_pedido IS 'Número único de pedido generado automáticamente';
COMMENT ON COLUMN pedidos.productos IS 'Array JSON con los productos del pedido';
COMMENT ON COLUMN pedidos.estado IS 'Estado actual del pedido: pendiente, confirmado, enviado, entregado, cancelado';
