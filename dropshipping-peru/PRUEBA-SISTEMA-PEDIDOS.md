# 🧪 Cómo Probar el Sistema de Pedidos

## Paso a Paso para Probar

### 1️⃣ Preparación

Antes de probar, asegúrate de:

```bash
# 1. Ejecutar el SQL en Supabase
# Ve a: https://supabase.com/dashboard
# Abre SQL Editor
# Copia y pega el contenido de: supabase-pedidos.sql
# Ejecuta el script

# 2. Verifica que tienes productos en tu tienda
# Si no tienes, agrega algunos desde /catalogo
```

---

### 2️⃣ Prueba como CLIENTE

#### A. Agregar productos al carrito

1. Abre tu tienda: `http://localhost:3000/tu-slug-tienda`
2. Verás tus productos publicados
3. Haz clic en **"Agregar al carrito"** en varios productos
4. Observa el botón flotante en la esquina inferior derecha
5. El contador debe aumentar con cada producto agregado

#### B. Revisar el carrito

1. Haz clic en el **botón flotante del carrito**
2. Se abrirá un panel lateral
3. Verás todos los productos agregados
4. Prueba:
   - Aumentar cantidad con el botón **+**
   - Disminuir cantidad con el botón **-**
   - Eliminar un producto con el ícono de basura
5. Observa que el total se actualiza automáticamente

#### C. Ir al checkout

1. En el carrito, haz clic en **"Proceder al pago"**
2. Serás redirigido a `/tu-slug-tienda/checkout`
3. Verás:
   - Formulario de datos personales
   - Formulario de dirección de envío
   - Opciones de método de pago
   - Resumen del pedido a la derecha

#### D. Completar el pedido

1. Llena el formulario:
   ```
   Nombre: Juan Pérez
   Teléfono: 999888777
   Email: juan@ejemplo.com (opcional)
   Dirección: Av. Principal 123, Dpto 456
   Ciudad: Lima, Perú
   Referencia: Frente al parque
   ```

2. Selecciona un método de pago:
   - ○ Transferencia Bancaria
   - ○ Yape / Plin
   - ○ Contra Entrega

3. Haz clic en **"Realizar pedido"**

4. Verás una pantalla de confirmación con:
   - ✅ Mensaje de éxito
   - 📦 Número de pedido (ej: `PED-20240414-1234`)
   - ℹ️ Instrucciones siguientes

---

### 3️⃣ Prueba como VENDEDOR

#### A. Ver el pedido en tu panel

1. Inicia sesión con tu cuenta de vendedor
2. Ve a: `http://localhost:3000/dashboard/pedidos`
3. Verás:
   - 📊 Estadísticas rápidas (Pendientes, Confirmados, Enviados, Entregados)
   - 📋 Lista de todos tus pedidos
   - 🔍 Filtros y búsqueda

#### B. Ver detalles del pedido

1. Haz clic en **"Ver detalles"** en cualquier pedido
2. Se abrirá un modal con:
   - Estado actual del pedido
   - Información del cliente
   - Productos solicitados
   - Totales (subtotal, envío, total)
   - Botones de acción

#### C. Confirmar pago

1. En el modal de detalles
2. Si el estado es "Pendiente"
3. Haz clic en **"Confirmar pago recibido"**
4. El estado cambiará a "Confirmado"
5. El badge se pondrá azul

#### D. Marcar como enviado

1. En un pedido "Confirmado"
2. Ingresa un código de seguimiento: `TRACK-123456`
3. Haz clic en **"Marcar como enviado"**
4. El estado cambiará a "Enviado"
5. El badge se pondrá morado
6. El código de seguimiento se mostrará

#### E. Marcar como entregado

1. En un pedido "Enviado"
2. Haz clic en **"Marcar como entregado"**
3. El estado cambiará a "Entregado"
4. El badge se pondrá verde

#### F. Cancelar pedido

1. En cualquier pedido (excepto Entregado o Cancelado)
2. Haz clic en **"Cancelar pedido"**
3. Confirma la acción
4. El estado cambiará a "Cancelado"
5. El badge se pondrá rojo

#### G. Usar filtros

1. En la página de pedidos
2. Prueba el **buscador**:
   - Busca por número de pedido
   - Busca por nombre de cliente
   - Busca por teléfono

3. Prueba el **filtro de estado**:
   - Selecciona "Pendiente"
   - Selecciona "Confirmado"
   - Selecciona "Todos los estados"

---

### 4️⃣ Prueba como ADMIN

#### A. Ver todos los pedidos

1. Inicia sesión con una cuenta admin
2. Ve a: `http://localhost:3000/admin/pedidos`
3. Verás:
   - 📊 Estadísticas globales del sistema
   - 📋 Todos los pedidos de todas las tiendas
   - 🏪 Nombre de la tienda de cada pedido

#### B. Ver estadísticas

Observa las tarjetas superiores:
- **Total Pedidos**: Cantidad total de pedidos
- **Total Ventas**: Suma de todos los pedidos (excepto cancelados)
- **Pendientes**: Pedidos esperando confirmación
- **Tiendas Activas**: Cantidad de tiendas con pedidos

---

### 5️⃣ Prueba de Notificaciones

#### A. Verificar notificación

1. Cuando creas un pedido como cliente
2. El sistema intenta enviar una notificación
3. Abre la consola del navegador (F12)
4. Ve a la pestaña "Network"
5. Busca la petición a `/api/notificar-pedido`
6. Verifica que retorna:
   ```json
   {
     "success": true,
     "mensaje": "🛒 NUEVO PEDIDO...",
     "whatsappUrl": "https://wa.me/..."
   }
   ```

---

### 6️⃣ Prueba de Navegación

#### A. Desde el panel principal

1. Ve a: `http://localhost:3000/panel`
2. Verás un banner morado destacado: **"📦 Gestiona tus Pedidos"**
3. Haz clic en él
4. Serás redirigido a `/dashboard/pedidos`

#### B. Desde el navbar

1. En cualquier página del dashboard
2. Observa el navbar superior
3. Verás el enlace **"Pedidos"**
4. Haz clic en él
5. Serás redirigido a `/dashboard/pedidos`

---

### 7️⃣ Prueba de Persistencia

#### A. Carrito persiste

1. Agrega productos al carrito
2. Cierra el navegador
3. Vuelve a abrir la tienda
4. Haz clic en el carrito
5. Los productos deben seguir ahí (localStorage)

#### B. Carrito se limpia después del pedido

1. Completa un pedido
2. Vuelve a la tienda
3. Haz clic en el carrito
4. Debe estar vacío

---

### 8️⃣ Prueba de Validaciones

#### A. Formulario de checkout

1. Ve al checkout con productos en el carrito
2. Intenta enviar el formulario vacío
3. Debe mostrar errores de validación
4. Los campos con * son requeridos

#### B. Código de seguimiento

1. Intenta marcar como enviado sin código
2. Debe mostrar un alert pidiendo el código

#### C. Confirmación de cancelación

1. Intenta cancelar un pedido
2. Debe pedir confirmación antes de cancelar

---

### 9️⃣ Prueba de Estados

Crea varios pedidos y prueba el flujo completo:

```
1. PENDIENTE (recién creado)
   ↓ [Confirmar pago]
2. CONFIRMADO (pago verificado)
   ↓ [Marcar como enviado + código]
3. ENVIADO (en camino al cliente)
   ↓ [Marcar como entregado]
4. ENTREGADO (completado)
```

O cancelar en cualquier momento:
```
PENDIENTE/CONFIRMADO/ENVIADO
   ↓ [Cancelar pedido]
CANCELADO
```

---

### 🔟 Prueba de Múltiples Usuarios

#### A. Dos vendedores

1. Crea dos cuentas de vendedor
2. Cada uno crea productos
3. Clientes hacen pedidos en ambas tiendas
4. Cada vendedor solo ve sus propios pedidos
5. Admin ve todos los pedidos

#### B. Seguridad RLS

1. Intenta acceder a `/dashboard/pedidos` sin autenticación
2. Debe redirigir al login
3. Los pedidos están protegidos por Row Level Security

---

## ✅ Checklist de Pruebas

Marca cada item cuando lo hayas probado:

### Cliente
- [ ] Agregar productos al carrito
- [ ] Aumentar/disminuir cantidades
- [ ] Eliminar productos del carrito
- [ ] Ver totales actualizados
- [ ] Ir al checkout
- [ ] Completar formulario
- [ ] Seleccionar método de pago
- [ ] Crear pedido exitosamente
- [ ] Ver número de pedido

### Vendedor
- [ ] Ver lista de pedidos
- [ ] Filtrar por estado
- [ ] Buscar pedidos
- [ ] Ver detalles de pedido
- [ ] Confirmar pago
- [ ] Marcar como enviado
- [ ] Agregar código de seguimiento
- [ ] Marcar como entregado
- [ ] Cancelar pedido
- [ ] Ver estadísticas

### Admin
- [ ] Ver todos los pedidos
- [ ] Ver estadísticas globales
- [ ] Ver pedidos de diferentes tiendas

### Navegación
- [ ] Acceder desde panel principal
- [ ] Acceder desde navbar
- [ ] Volver a la tienda desde checkout

### Persistencia
- [ ] Carrito persiste al cerrar navegador
- [ ] Carrito se limpia después del pedido

---

## 🐛 Problemas Comunes

### "No se puede crear el pedido"
- Verifica que ejecutaste el SQL en Supabase
- Revisa la consola del navegador
- Verifica las credenciales de Supabase

### "No aparecen los pedidos"
- Verifica que estás autenticado
- Revisa las políticas RLS en Supabase
- Verifica que el `usuario_id` coincida

### "El carrito está vacío después de recargar"
- Verifica que localStorage esté habilitado
- Revisa la consola del navegador

### "No se genera el número de pedido"
- Verifica que el trigger esté creado en Supabase
- Revisa la función `generar_numero_pedido()`

---

## 🎉 ¡Listo!

Si todas las pruebas pasaron, tu sistema de pedidos está funcionando perfectamente.

**¡Empieza a recibir pedidos reales!** 🚀
