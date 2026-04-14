# 🎯 LÉEME PRIMERO - Integración Mercado Libre

## ¿Qué es esto?

Tu sistema de dropshipping ahora permite que el **administrador** importe productos directamente desde Mercado Libre Perú al catálogo global. Los usuarios regulares pueden agregar estos productos a sus tiendas.

## ¿Cómo funciona?

### Para el Administrador:
- ✅ Busca productos en Mercado Libre
- ✅ Importa al catálogo con un clic
- ✅ Los productos quedan disponibles para todos

### Para los Usuarios:
- ✅ Ven productos en el Catálogo
- ✅ Agregan a su tienda
- ✅ Configuran su propio margen de ganancia
- ✅ Venden y ganan dinero

## ¿Quién puede hacer qué?

| Acción | Admin | Usuario |
|--------|-------|---------|
| Ver botón "Importar ML" | ✅ | ❌ |
| Buscar en Mercado Libre | ✅ | ❌ |
| Importar productos al catálogo | ✅ | ❌ |
| Ver productos en Catálogo | ✅ | ✅ |
| Agregar productos a su tienda | ✅ | ✅ |
| Configurar precio de venta | ✅ | ✅ |
| Vender productos | ✅ | ✅ |

## ¿Cómo empiezo?

### Como Administrador (5 minutos)

**Paso 1: Configurar (2 minutos)**
1. Abre [Supabase](https://supabase.com)
2. Ve a SQL Editor
3. Ejecuta el archivo `supabase-mercadolibre.sql`

**Paso 2: Importar productos (3 minutos)**
1. Inicia sesión como admin
2. Clic en "Importar ML" (botón verde)
3. Busca "audífonos bluetooth"
4. Importa 3-5 productos

### Como Usuario (2 minutos)

**Paso 1: Ver catálogo**
1. Inicia sesión
2. Ve a "Catálogo"
3. Verás los productos importados por el admin

**Paso 2: Agregar a tu tienda**
1. Selecciona un producto
2. Clic en "Agregar a mi tienda"
3. Configura tu margen (ej: 80%)
4. Confirma

**Paso 3: Vender**
1. Comparte tu tienda
2. Cuando vendas, compra en ML
3. Envía a tu cliente
4. Gana dinero

## 💰 Ejemplo completo

### Admin importa producto:
```
Producto: Audífonos Bluetooth
Precio en ML: S/ 50
Importa al catálogo → Precio base: S/ 50
```

### Usuario agrega a su tienda:
```
Ve el producto en Catálogo
Precio base: S/ 50
Configura margen: 80%
Su precio de venta: S/ 90
```

### Cliente compra:
```
Cliente paga: S/ 90
Usuario compra en ML: S/ 50
Usuario envía a cliente
Ganancia del usuario: S/ 40
```

## 📚 Documentación

### Si eres Admin y tienes 5 minutos
Lee: [INICIO-RAPIDO-ML.md](./INICIO-RAPIDO-ML.md)

### Si eres Usuario y tienes 3 minutos
Lee la sección "Usuarios" en: [INICIO-RAPIDO-ML.md](./INICIO-RAPIDO-ML.md)

### Si quieres la guía completa
Lee: [INSTRUCCIONES-MERCADOLIBRE.md](./INSTRUCCIONES-MERCADOLIBRE.md)

### Si quieres ver ejemplos
Lee: [EJEMPLOS-MERCADOLIBRE.md](./EJEMPLOS-MERCADOLIBRE.md)

## ⚡ Inicio ultra rápido

### Como Admin:
```bash
# 1. Ejecutar SQL en Supabase
supabase-mercadolibre.sql

# 2. Ir a tu sistema
http://localhost:3000/importar-ml

# 3. Buscar productos
"audífonos bluetooth"

# 4. Importar al catálogo
Clic en "Importar" → Confirmar

# 5. Listo!
Productos disponibles para todos
```

### Como Usuario:
```bash
# 1. Ir al catálogo
http://localhost:3000/catalogo

# 2. Ver productos importados
Buscar productos con ícono de Mercado Libre

# 3. Agregar a tu tienda
Clic en "Agregar" → Configurar margen → Confirmar

# 4. Listo!
Ya puedes vender
```

## 🎯 Archivos importantes

| Archivo | Para quién | Para qué sirve |
|---------|------------|----------------|
| `supabase-mercadolibre.sql` | Admin | Actualizar base de datos |
| `INICIO-RAPIDO-ML.md` | Todos | Guía de 5 minutos |
| `INSTRUCCIONES-MERCADOLIBRE.md` | Todos | Guía completa |
| `EJEMPLOS-MERCADOLIBRE.md` | Todos | Casos prácticos |

## ❓ Preguntas frecuentes

**¿Por qué solo el admin puede importar?**
Para mantener un catálogo curado y de calidad. El admin selecciona buenos productos que todos pueden vender.

**¿Los usuarios pueden importar sus propios productos?**
No desde Mercado Libre, pero pueden crear productos personalizados en "Mis Productos".

**¿Cuántos productos puede importar el admin?**
Ilimitados.

**¿Los usuarios pueden cambiar el precio base?**
No, solo pueden configurar su margen de ganancia sobre el precio base.

**¿Se actualiza el precio automáticamente?**
No, el admin debe revisar y actualizar manualmente (próxima versión).

**¿Qué pasa si el producto se agota en ML?**
El admin debe desactivarlo del catálogo. Los usuarios deben desactivarlo de sus tiendas.

## 🚀 Siguiente paso

**Si eres Admin:**
1. Ejecuta el script SQL ahora
2. Lee: [INICIO-RAPIDO-ML.md](./INICIO-RAPIDO-ML.md)
3. Importa tus primeros productos

**Si eres Usuario:**
1. Espera a que el admin importe productos
2. Ve al Catálogo
3. Agrega productos a tu tienda
4. Empieza a vender

---

**¡En 5 minutos el admin tendrá productos en el catálogo! 🎉**
**¡En 2 minutos los usuarios podrán venderlos! 🚀**
