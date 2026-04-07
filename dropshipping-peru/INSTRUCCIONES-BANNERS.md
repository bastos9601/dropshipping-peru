# Sistema de Banners Promocionales

## Descripción
Los usuarios pueden crear banners promocionales para sus tiendas usando los flyers generados automáticamente de sus productos. Estos banners se muestran en un carrusel en la página pública de la tienda.

## Características

### 1. Creación de Banners
- Los usuarios pueden crear banners desde la página "Mis Banners"
- Seleccionan un producto de su tienda
- El sistema genera automáticamente un flyer profesional con:
  - Fondo degradado moderno (morado/rosa)
  - Imagen del producto
  - Badge de "¡OFERTA!"
  - Nombre del producto
  - Precio destacado
  - Nombre de la tienda
- El banner se guarda en Supabase Storage

### 2. Gestión de Banners
Los usuarios pueden:
- Ver todos sus banners creados
- Activar/desactivar banners
- Cambiar el orden de visualización (flechas arriba/abajo)
- Eliminar banners

### 3. Visualización en Tienda
- Los banners activos se muestran en un carrusel en la página pública de la tienda
- El carrusel tiene:
  - Auto-avance cada 5 segundos
  - Botones de navegación (anterior/siguiente)
  - Indicadores de posición
  - Diseño responsive
- Solo se muestran banners activos
- El orden se respeta según lo configurado por el usuario

## Base de Datos

### Tabla: banners
```sql
- id: UUID (PK)
- usuario_id: UUID (FK a usuarios)
- producto_id: UUID (FK a productos)
- imagen_url: TEXT (URL del banner en Storage)
- orden: INTEGER (orden de visualización)
- activo: BOOLEAN (si está visible o no)
- created_at: TIMESTAMP
```

### Storage Bucket: banners
- Almacena las imágenes de los banners generados
- Ruta: `{usuario_id}/banner-{timestamp}.png`
- Acceso público para visualización

## Navegación
- Enlace "Mis Banners" en el Navbar
- Disponible para todos los usuarios autenticados
- Accesible desde desktop y móvil

## Flujo de Uso

1. Usuario va a "Mis Banners"
2. Selecciona un producto de su tienda
3. Hace clic en "Crear Banner"
4. El sistema genera el flyer automáticamente
5. El banner se guarda y aparece en la lista
6. El usuario puede reordenar, activar/desactivar o eliminar
7. Los banners activos se muestran automáticamente en su tienda pública

## Tecnologías
- Canvas API para generación de flyers
- Supabase Storage para almacenamiento
- Next.js Image para optimización
- Tailwind CSS para estilos
- Lucide React para iconos

## Notas Técnicas
- Los flyers se generan en el cliente usando Canvas
- Las imágenes se convierten a PNG antes de subir
- El carrusel es completamente responsive
- Auto-avance se pausa cuando hay un solo banner
- Los banners mantienen la relación de aspecto 1080x1350
