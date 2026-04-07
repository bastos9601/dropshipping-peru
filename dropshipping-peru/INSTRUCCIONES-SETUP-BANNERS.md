# Configuración del Sistema de Banners

## Paso 1: Crear la tabla en Supabase

Ejecuta el script SQL en tu base de datos de Supabase:

```sql
-- Ejecutar el contenido de supabase-banners.sql
```

O copia y pega este código en el SQL Editor de Supabase:

```sql
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
```

## Paso 2: Verificar Storage

El sistema usa el bucket "productos" que ya existe para almacenar los banners.

Si prefieres crear un bucket separado para banners:

1. Ve a Storage en Supabase Dashboard
2. Crea un nuevo bucket llamado "banners"
3. Configúralo como público
4. Actualiza el código en `app/mis-banners/page.tsx` para usar `.from('banners')` en lugar de `.from('productos')`

## Paso 3: Probar el Sistema

1. Inicia sesión en tu cuenta
2. Ve a "Mis Banners" en el menú
3. Selecciona un producto de tu tienda
4. Haz clic en "Crear Banner"
5. El banner se generará automáticamente

## Solución de Problemas

### Error: "Error al crear el banner"

Verifica en la consola del navegador (F12) el mensaje de error específico:

- **"Producto no encontrado"**: Asegúrate de tener productos activos en tu tienda
- **"Error al subir imagen"**: Verifica que el bucket de storage existe y tiene permisos públicos
- **"Error al guardar banner"**: Verifica que la tabla banners existe y tiene las políticas RLS correctas

### Error: "relation banners does not exist"

Ejecuta el script SQL del Paso 1 en Supabase.

### Los banners no aparecen en la tienda

1. Verifica que el banner esté activo (ícono de ojo)
2. Verifica que la política RLS permita lectura pública
3. Revisa la consola del navegador para errores

## Notas

- Los banners se almacenan en el mismo bucket que las imágenes de productos
- El sistema genera automáticamente flyers profesionales
- Los banners se muestran en orden según lo configurado
- El carrusel avanza automáticamente cada 5 segundos
