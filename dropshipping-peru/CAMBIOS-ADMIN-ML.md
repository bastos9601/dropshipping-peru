# 📝 Cambios Realizados - Sistema Admin para Mercado Libre

## 🎯 Objetivo

Modificar el sistema para que **solo el administrador** pueda importar productos desde Mercado Libre, y estos productos se agreguen al catálogo global para que todos los usuarios puedan venderlos.

---

## ✅ Cambios Implementados

### 1. Página de Importación (`app/importar-ml/page.tsx`)

#### Verificación de Admin
```typescript
// Ahora verifica que el usuario sea admin
if (!perfil.es_admin) {
  alert('Solo los administradores pueden importar productos desde Mercado Libre');
  router.push('/panel');
  return;
}
```

#### Importación al Catálogo Global
```typescript
// Antes: Producto personal del usuario
es_catalogo: false,
usuario_id: usuario.id,

// Ahora: Producto del catálogo global
es_catalogo: true,
usuario_id: null,
```

#### Cambios en la UI
- Título: "Importar de Mercado Libre (Admin)"
- Descripción: "Busca y agrega productos de Mercado Libre Perú al catálogo global"
- Aviso: "Los productos que importes se agregarán al catálogo y estarán disponibles para todos los usuarios"
- Botón: "Importar al catálogo global" (antes: "Importar a mi tienda")

### 2. Navbar (`componentes/Navbar.tsx`)

#### Visibilidad Condicional
```typescript
// Desktop
{usuario.es_admin && (
  <Link href="/importar-ml">
    Importar ML
  </Link>
)}

// Móvil
{usuario.es_admin && (
  <Link href="/importar-ml">
    Importar ML
  </Link>
)}
```

**Resultado**: Solo los administradores ven el botón "Importar ML"

### 3. Documentación Actualizada

#### Archivos modificados:
- `INSTRUCCIONES-MERCADOLIBRE.md` - Guía completa con roles
- `INICIO-RAPIDO-ML.md` - Guía rápida separada por roles
- `LEEME-PRIMERO-ML.md` - Resumen ejecutivo con tabla de permisos

#### Nuevos archivos:
- `CAMBIOS-ADMIN-ML.md` - Este archivo

---

## 🔄 Flujo Actualizado

### Antes (Sistema anterior)
```
Usuario → Importar ML → Buscar → Importar → Su tienda personal
```

### Ahora (Sistema nuevo)
```
Admin → Importar ML → Buscar → Importar → Catálogo Global
                                              ↓
Usuario → Catálogo → Ver producto → Agregar a su tienda → Configurar margen
```

---

## 👥 Roles y Permisos

### Administrador (`es_admin = true`)

**Puede hacer:**
- ✅ Ver botón "Importar ML"
- ✅ Buscar productos en Mercado Libre
- ✅ Importar productos al catálogo global
- ✅ Ver todos los productos del catálogo
- ✅ Agregar productos del catálogo a su tienda
- ✅ Crear productos personalizados
- ✅ Gestionar categorías globales
- ✅ Acceder al panel de admin

**No puede hacer:**
- ❌ Importar productos a su tienda personal directamente
  (Debe importar al catálogo y luego agregar a su tienda como cualquier usuario)

### Usuario Regular (`es_admin = false`)

**Puede hacer:**
- ✅ Ver productos del catálogo
- ✅ Agregar productos del catálogo a su tienda
- ✅ Configurar su propio margen de ganancia
- ✅ Crear productos personalizados
- ✅ Gestionar sus propias categorías
- ✅ Vender productos

**No puede hacer:**
- ❌ Ver botón "Importar ML"
- ❌ Acceder a `/importar-ml`
- ❌ Buscar en Mercado Libre desde el sistema
- ❌ Importar productos al catálogo global

---

## 🗄️ Cambios en Base de Datos

### Productos importados desde ML

**Antes:**
```sql
INSERT INTO productos (
  nombre, precio_base, imagen_url,
  es_catalogo, usuario_id,  -- Producto personal
  ml_item_id, ml_permalink
) VALUES (
  'Audífonos', 50, 'url',
  false, 'user-uuid',  -- Del usuario
  'MPE123', 'https://...'
);
```

**Ahora:**
```sql
INSERT INTO productos (
  nombre, precio_base, imagen_url,
  es_catalogo, usuario_id,  -- Producto del catálogo
  ml_item_id, ml_permalink
) VALUES (
  'Audífonos', 50, 'url',
  true, NULL,  -- Del catálogo global
  'MPE123', 'https://...'
);
```

### Identificación de productos ML

Los productos importados desde Mercado Libre se identifican por:
- `es_catalogo = true`
- `usuario_id IS NULL`
- `ml_item_id IS NOT NULL`

---

## 📊 Ejemplo Completo

### Paso 1: Admin importa producto

```
Admin busca: "audífonos bluetooth"
Encuentra: Audífonos TWS Pro - S/ 50
Importa al catálogo

Base de datos:
┌─────────────────────────────────────┐
│ productos                           │
├─────────────────────────────────────┤
│ id: uuid-123                        │
│ nombre: "Audífonos TWS Pro"         │
│ precio_base: 50.00                  │
│ es_catalogo: true                   │
│ usuario_id: NULL                    │
│ ml_item_id: "MPE123456789"          │
│ ml_permalink: "https://..."         │
└─────────────────────────────────────┘
```

### Paso 2: Usuario ve en catálogo

```
Usuario va a "Catálogo"
Ve: Audífonos TWS Pro - S/ 50 (precio base)
Clic en "Agregar a mi tienda"
```

### Paso 3: Usuario configura margen

```
Modal se abre:
- Precio base: S/ 50
- Margen: [80%] (usuario configura)
- Precio venta: S/ 90 (calculado)

Usuario confirma
```

### Paso 4: Producto en tienda del usuario

```
Base de datos:
┌─────────────────────────────────────┐
│ tienda_productos                    │
├─────────────────────────────────────┤
│ usuario_id: user-uuid               │
│ producto_id: uuid-123               │
│ precio_venta: 90.00                 │
│ activo: true                        │
└─────────────────────────────────────┘
```

### Paso 5: Cliente compra

```
Cliente ve en tienda pública: S/ 90
Cliente compra
Usuario recibe: S/ 90
Usuario compra en ML: S/ 50
Usuario gana: S/ 40
```

---

## 🔒 Seguridad

### Verificación en Frontend
```typescript
// En la página de importación
if (!perfil.es_admin) {
  router.push('/panel');
  return;
}
```

### Verificación en Navbar
```typescript
// Solo muestra el botón si es admin
{usuario.es_admin && (
  <Link href="/importar-ml">Importar ML</Link>
)}
```

### Recomendación para Backend (RLS en Supabase)

Agregar política de seguridad:
```sql
-- Solo admins pueden insertar productos de catálogo
CREATE POLICY "Solo admins pueden crear productos de catálogo"
ON productos FOR INSERT
TO authenticated
WITH CHECK (
  es_catalogo = false OR 
  (es_catalogo = true AND auth.uid() IN (
    SELECT id FROM usuarios WHERE es_admin = true
  ))
);
```

---

## 🎨 Cambios Visuales

### Página de Importación

**Antes:**
```
┌─────────────────────────────────────┐
│ Importar de Mercado Libre           │
│ Busca y agrega productos a tu tienda│
└─────────────────────────────────────┘
```

**Ahora:**
```
┌─────────────────────────────────────┐
│ Importar de Mercado Libre (Admin)   │
│ Busca y agrega productos al catálogo│
│ ℹ️ Los productos estarán disponibles│
│    para todos los usuarios          │
└─────────────────────────────────────┘
```

### Botón de Importación

**Antes:**
```
[Importar a mi tienda]
```

**Ahora:**
```
[Importar al catálogo global]
```

### Navbar

**Antes:**
```
Panel | Catálogo | Importar ML | Mis Productos
(Todos los usuarios veían "Importar ML")
```

**Ahora:**
```
Admin:
Panel | Catálogo | Importar ML | Mis Productos

Usuario:
Panel | Catálogo | Mis Productos
(No ven "Importar ML")
```

---

## 📈 Ventajas del Nuevo Sistema

### Para el Negocio
1. **Catálogo curado**: Solo productos de calidad seleccionados por el admin
2. **Consistencia**: Todos los usuarios venden los mismos productos base
3. **Control de calidad**: El admin verifica productos antes de importar
4. **Escalabilidad**: Un producto importado sirve para todos los usuarios

### Para el Admin
1. **Control total**: Decide qué productos están disponibles
2. **Gestión centralizada**: Actualiza precios base en un solo lugar
3. **Visión global**: Ve qué productos funcionan mejor

### Para los Usuarios
1. **Catálogo listo**: No necesitan buscar productos
2. **Productos verificados**: El admin ya validó la calidad
3. **Fácil de usar**: Solo agregan y configuran margen
4. **Competencia justa**: Todos tienen acceso a los mismos productos

---

## 🧪 Cómo Probar

### Test 1: Como Admin
1. Inicia sesión como admin
2. Verifica que ves "Importar ML" en el menú
3. Haz clic y busca un producto
4. Importa el producto
5. Ve a "Catálogo" y verifica que aparece

### Test 2: Como Usuario Regular
1. Inicia sesión como usuario regular
2. Verifica que NO ves "Importar ML" en el menú
3. Intenta acceder a `/importar-ml` directamente
4. Deberías ser redirigido al panel
5. Ve a "Catálogo" y verifica que ves el producto importado
6. Agrégalo a tu tienda

### Test 3: Flujo Completo
1. Admin importa producto (precio base S/ 50)
2. Usuario agrega a su tienda (margen 80%, precio S/ 90)
3. Verifica que el producto aparece en la tienda del usuario
4. Verifica que el precio es S/ 90
5. Verifica que el link de ML está disponible

---

## 📝 Notas Importantes

1. **Productos existentes**: Los productos ya importados antes de este cambio seguirán funcionando normalmente.

2. **Migración**: Si hay productos ML personales, considera migrarlos al catálogo:
   ```sql
   UPDATE productos 
   SET es_catalogo = true, usuario_id = NULL 
   WHERE ml_item_id IS NOT NULL AND es_catalogo = false;
   ```

3. **Permisos**: Asegúrate de que al menos un usuario tenga `es_admin = true` en la base de datos.

4. **Documentación**: Todos los archivos de documentación han sido actualizados para reflejar estos cambios.

---

## ✅ Checklist de Implementación

- [x] Modificar verificación de usuario en `importar-ml/page.tsx`
- [x] Cambiar lógica de importación a catálogo global
- [x] Actualizar UI de la página de importación
- [x] Agregar verificación de admin en Navbar
- [x] Ocultar botón "Importar ML" para usuarios regulares
- [x] Actualizar `INSTRUCCIONES-MERCADOLIBRE.md`
- [x] Actualizar `INICIO-RAPIDO-ML.md`
- [x] Actualizar `LEEME-PRIMERO-ML.md`
- [x] Crear `CAMBIOS-ADMIN-ML.md`
- [x] Verificar que no hay errores de compilación
- [x] Documentar flujo completo

---

## 🚀 Próximos Pasos

1. **Ejecutar el script SQL** en Supabase
2. **Probar como admin** la importación
3. **Probar como usuario** agregar productos
4. **Importar productos iniciales** al catálogo
5. **Comunicar cambios** a los usuarios

---

**Sistema actualizado y listo para usar! 🎉**
