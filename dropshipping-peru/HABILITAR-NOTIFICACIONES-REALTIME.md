# 🔔 Habilitar Notificaciones en Tiempo Real

Para que las notificaciones de pedidos funcionen automáticamente sin recargar la página, necesitas habilitar **Supabase Realtime**.

## 📋 Pasos para Habilitar Realtime

### Opción 1: Desde la Interfaz de Supabase (Recomendado)

1. **Ve a tu proyecto en Supabase**
   - Abre https://supabase.com/dashboard
   - Selecciona tu proyecto

2. **Navega a Database > Replication**
   - En el menú lateral, haz clic en **Database**
   - Luego haz clic en **Replication**

3. **Habilita Realtime para la tabla `pedidos`**
   - Busca la tabla `pedidos` en la lista
   - Verás un toggle (interruptor) al lado
   - **Activa el toggle** para habilitar Realtime
   - Asegúrate de que diga "Enabled" o "Habilitado"

4. **Guarda los cambios**
   - Los cambios se aplican automáticamente
   - Puede tomar unos segundos

### Opción 2: Usando SQL

Si prefieres usar SQL, ejecuta el script `supabase-habilitar-realtime.sql`:

1. Ve a **SQL Editor** en Supabase
2. Copia y pega el contenido del archivo
3. Haz clic en **Run**

```sql
-- Habilitar replicación para la tabla pedidos
ALTER TABLE pedidos REPLICA IDENTITY FULL;

-- Habilitar publicación de cambios
ALTER PUBLICATION supabase_realtime ADD TABLE pedidos;
```

## ✅ Verificar que Funciona

Después de habilitar Realtime:

1. **Abre tu panel de pedidos** en una pestaña del navegador
2. **Abre tu tienda** en otra pestaña (modo incógnito o navegador diferente)
3. **Haz un pedido de prueba** desde la tienda
4. **Observa el panel de pedidos** - Deberías ver:
   - 🔴 El contador de la campanita aumenta
   - 🔔 Una notificación del navegador (si diste permiso)
   - 📋 El nuevo pedido aparece en la lista automáticamente

## 🔧 Solución de Problemas

### La notificación no aparece automáticamente

**Verifica:**

1. ✅ Realtime está habilitado en Supabase (Database > Replication)
2. ✅ La tabla `pedidos` tiene el toggle activado
3. ✅ Ejecutaste el SQL de habilitación
4. ✅ Refrescaste la página después de habilitar Realtime

### Error: "cannot add postgres_changes callbacks"

**Solución:**
- Este error ya está corregido en el código
- Asegúrate de tener la última versión del componente `NotificacionesPedidos.tsx`
- Cada instancia del componente ahora usa un canal único

### Las notificaciones del navegador no aparecen

**Verifica:**

1. **Permisos del navegador:**
   - Haz clic en el ícono de candado en la barra de direcciones
   - Busca "Notificaciones"
   - Asegúrate de que esté en "Permitir"

2. **Solicitar permisos:**
   - La primera vez que abras el panel, el navegador te pedirá permiso
   - Haz clic en "Permitir"

3. **Navegadores compatibles:**
   - Chrome: ✅ Soportado
   - Firefox: ✅ Soportado
   - Safari: ✅ Soportado (macOS)
   - Edge: ✅ Soportado

## 📱 Notificaciones en Móvil

Las notificaciones en tiempo real funcionan en móvil, pero las notificaciones del navegador pueden no estar disponibles en todos los navegadores móviles.

**Alternativas:**
- El contador de la campanita se actualiza automáticamente
- El panel de notificaciones muestra los pedidos nuevos
- Puedes usar notificaciones push (requiere configuración adicional)

## 🎯 Cómo Funciona

1. **Cliente hace un pedido** → Se inserta en la tabla `pedidos`
2. **Supabase Realtime detecta el cambio** → Envía evento a todos los clientes suscritos
3. **Tu navegador recibe el evento** → Actualiza la campanita y muestra notificación
4. **Todo en tiempo real** → Sin necesidad de recargar la página

## 🔐 Seguridad

Las notificaciones están protegidas por Row Level Security (RLS):
- Solo recibes notificaciones de TUS pedidos
- Otros usuarios no pueden ver tus pedidos
- Los filtros se aplican automáticamente por `usuario_id`

## 📊 Límites de Realtime

Supabase Realtime tiene algunos límites en el plan gratuito:
- **Conexiones simultáneas**: 200 (plan gratuito)
- **Mensajes por segundo**: 100 (plan gratuito)

Para la mayoría de tiendas pequeñas y medianas, estos límites son más que suficientes.

## 🚀 ¡Listo!

Una vez habilitado Realtime, las notificaciones funcionarán automáticamente. No necesitas hacer nada más en el código - todo ya está implementado.

**¿Necesitas ayuda?**
- Revisa la consola del navegador (F12) para ver errores
- Verifica que Realtime esté habilitado en Supabase
- Asegúrate de que los permisos del navegador estén correctos
