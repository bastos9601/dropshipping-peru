# Guía de Integración con Mercado Libre

## 🎯 ¿Qué hace esta integración?

Esta funcionalidad permite al **administrador** buscar productos directamente desde Mercado Libre Perú e importarlos al catálogo global del sistema. Una vez importados, todos los usuarios podrán agregar estos productos a sus tiendas y establecer sus propios márgenes de ganancia.

## � Roless

### Administrador
- Puede acceder a "Importar ML"
- Busca productos en Mercado Libre
- Importa productos al catálogo global
- Los productos quedan disponibles para todos

### Usuarios regulares
- Ven los productos importados en el "Catálogo"
- Agregan productos a su tienda
- Establecen su propio precio de venta
- Gestionan sus ventas

## 📋 Pasos para usar la integración

### 1. Configurar la base de datos (Solo una vez)

Primero, ejecuta el script SQL en tu panel de Supabase:

1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. Abre el **SQL Editor**
3. Copia y pega el contenido del archivo `supabase-mercadolibre.sql`
4. Haz clic en **Run** para ejecutar el script

Esto agregará los campos necesarios para guardar información de Mercado Libre.

### 2. Acceder a la página de importación (Solo Admin)

1. Inicia sesión como administrador
2. En el menú superior, verás el botón **"Importar ML"** (verde)
3. Haz clic en él para acceder

**Nota**: Los usuarios regulares NO verán este botón.

### 3. Buscar productos (Admin)

1. Escribe lo que quieres buscar en el campo de búsqueda
   - Ejemplos: "audífonos bluetooth", "smartwatch", "mouse gamer"
2. Haz clic en **Buscar** o presiona Enter
3. Espera unos segundos mientras se cargan los resultados

### 4. Importar un producto al catálogo (Admin)

1. Revisa los productos que aparecen
2. Haz clic en **"Importar"** en el producto que te interese
3. Se abrirá un modal con los detalles:
   - Imagen del producto
   - Descripción completa
   - Precio en Mercado Libre
   - Stock disponible
   - Información de envío

### 5. Configurar el producto (Admin)

1. En el modal, puedes ver el precio base del producto
2. (Opcional) Asigna una categoría
3. Haz clic en **"Importar al catálogo global"**
4. El producto se agregará al catálogo y estará disponible para todos los usuarios

**Nota**: El admin NO establece el margen de ganancia. Cada usuario lo hará cuando agregue el producto a su tienda.

### 6. Usuarios agregan productos a su tienda

1. Los usuarios van a **"Catálogo"**
2. Ven los productos importados desde Mercado Libre
3. Hacen clic en **"Agregar a mi tienda"**
4. Establecen su propio margen de ganancia (ej: 80%)
5. El sistema calcula su precio de venta automáticamente

## 🛒 Cómo funciona el proceso de venta

### Cuando un cliente compra en la tienda de un usuario:

1. **Cliente compra** en la tienda del usuario a S/ 90
2. **Usuario recibe** el pago (S/ 90)
3. **Usuario va al catálogo** y busca el producto vendido
4. **Ve el link de Mercado Libre** guardado en el producto
5. **Compra el producto** en ML a S/ 50
6. **Pone la dirección de su cliente** en el envío
7. **El vendedor de ML envía** directo al cliente del usuario
8. **Ganancia del usuario**: S/ 40 (menos comisiones de pago)

### Información guardada del producto:

El sistema guarda automáticamente:
- Link al producto original en ML
- Precio original en ML (precio base)
- ID del producto en ML
- Fecha de importación

Los usuarios pueden ver esta información en el catálogo para:
- Hacer el pedido rápidamente cuando vendan
- Verificar si el precio cambió
- Contactar al vendedor si es necesario

## 💡 Consejos y mejores prácticas

### Para el Administrador

#### Selección de productos

✅ **Busca productos con:**
- Envío gratis (más atractivo para usuarios finales)
- Vendedores con buena reputación (termómetro verde/azul)
- Stock alto (más de 10 unidades)
- Buenas fotos y descripciones
- Precios competitivos

❌ **Evita productos:**
- Sin stock o stock bajo
- Vendedores nuevos o con mala reputación
- Precios muy variables
- Productos muy pesados (envío caro)

#### Gestión del catálogo

1. **Importa variedad**: Diferentes categorías y rangos de precio
2. **Verifica calidad**: Lee reseñas antes de importar
3. **Actualiza regularmente**: Importa productos nuevos semanalmente
4. **Elimina obsoletos**: Quita productos que ya no existen en ML

### Para los Usuarios

#### Selección de productos del catálogo

✅ **Elige productos:**
- Que conozcas o hayas usado
- Con buenas descripciones
- Con fotos de calidad
- Que puedas promocionar bien

#### Márgenes de ganancia recomendados

- **Productos baratos** (S/ 10-50): 80-150%
- **Productos medianos** (S/ 50-200): 50-100%
- **Productos caros** (S/ 200+): 30-60%

### Gestión de inventario

#### Para el Admin:
1. **Revisa precios semanalmente**: Los precios en ML pueden cambiar
2. **Actualiza productos**: Si un precio cambió mucho, actualiza el precio base
3. **Verifica stock**: Antes de promocionar, confirma que hay stock en ML
4. **Importa productos nuevos**: Mantén el catálogo fresco y actualizado

#### Para los Usuarios:
1. **Revisa el catálogo regularmente**: Nuevos productos se agregan constantemente
2. **Verifica precios**: Antes de promocionar, confirma que el precio en ML no cambió
3. **Ten alternativas**: Agrega varios productos similares a tu tienda
4. **Actualiza tu tienda**: Si un producto se agota en ML, desactívalo en tu tienda

### Atención al cliente

1. **Sé transparente**: Informa tiempos de entrega realistas (2-7 días)
2. **Guarda el tracking**: Envía el código de seguimiento a tu cliente
3. **Responde rápido**: Mantén comunicación constante
4. **Gestiona devoluciones**: Ten una política clara

## 🔍 Funcionalidades adicionales

### Ver producto original en ML

- Haz clic en el ícono de enlace externo (↗) en cualquier producto
- Se abrirá el producto en Mercado Libre en una nueva pestaña
- Úsalo para verificar detalles, reseñas, o hacer el pedido

### Búsquedas sugeridas

- Usa los botones de sugerencias para búsquedas rápidas
- Están optimizados para productos populares en Perú

### Filtros de búsqueda

La API de Mercado Libre devuelve automáticamente:
- Productos más relevantes primero
- Hasta 30 resultados por búsqueda
- Solo productos disponibles en Perú

## ⚠️ Consideraciones importantes

### Legales

- Asegúrate de cumplir con las leyes de comercio electrónico en Perú
- Ten términos y condiciones claros
- Respeta los derechos de autor de las imágenes (son del vendedor original)

### Financieras

- Considera comisiones de pago (3-5% típicamente)
- Calcula costos de transacción bancaria
- Ten capital para comprar productos cuando vendas

### Operativas

- No puedes controlar la calidad del producto
- Dependes del stock del vendedor
- Los tiempos de entrega dependen del vendedor
- Las devoluciones son más complejas

## 🚀 Próximos pasos

1. Ejecuta el script SQL en Supabase
2. Busca tus primeros productos
3. Importa 5-10 productos para empezar
4. Configura tus categorías
5. Prueba el flujo completo con un producto de prueba
6. Empieza a promocionar tu tienda

## 📞 Soporte

Si tienes problemas:
1. Verifica que ejecutaste el script SQL
2. Revisa la consola del navegador (F12) para errores
3. Confirma que tu conexión a Supabase funciona
4. Verifica que la API de Mercado Libre esté disponible

## 🎓 Recursos adicionales

- [API de Mercado Libre](https://developers.mercadolibre.com.pe/)
- [Guía de Dropshipping](./GUIA-MARKETING.md)
- [Características del sistema](./CARACTERISTICAS.md)
