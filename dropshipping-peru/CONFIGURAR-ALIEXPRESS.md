# 🛒 Configurar AliExpress API OFICIAL para Productos REALES

## API Oficial de AliExpress (RECOMENDADO para Dropshipping)

### Paso 1: Registrarse en AliExpress Affiliate Program

1. Ve a: https://portals.aliexpress.com/
2. Regístrate como afiliado (es GRATIS)
3. Completa el proceso de verificación
4. Acepta los términos del programa

### Paso 2: Crear una aplicación

1. Ve a: https://openservice.aliexpress.com/
2. Inicia sesión con tu cuenta de afiliado
3. Ve a "My Apps" > "Create App"
4. Completa la información:
   - App Name: Tu nombre de tienda
   - App Type: Web Application
   - Description: Plataforma de dropshipping
5. Envía la solicitud y espera aprobación (1-2 días)

### Paso 3: Obtener credenciales

Una vez aprobada tu aplicación:

1. Ve a "My Apps"
2. Haz clic en tu aplicación
3. Copia:
   - **App Key** (también llamado API Key)
   - **App Secret** (también llamado Secret Key)
   - **Tracking ID** (para comisiones de afiliado)

### Paso 4: Agregar a .env.local

```env
# AliExpress Official API
ALIEXPRESS_APP_KEY=tu_app_key_aqui
ALIEXPRESS_APP_SECRET=tu_app_secret_aqui
ALIEXPRESS_TRACKING_ID=tu_tracking_id_aqui
```

### Paso 5: Reiniciar servidor

```bash
npm run dev
```

---

## APIs Disponibles de AliExpress

La API oficial te da acceso a:

### 1. Búsqueda de Productos
- `aliexpress.affiliate.productdetail.get` - Detalles de producto
- `aliexpress.affiliate.product.query` - Búsqueda de productos
- `aliexpress.affiliate.featuredpromo.products.get` - Productos en promoción
- `aliexpress.affiliate.hotproduct.query` - Productos populares

### 2. Categorías
- `aliexpress.affiliate.category.get` - Obtener categorías

### 3. Órdenes y Comisiones
- `aliexpress.affiliate.order.get` - Obtener órdenes
- `aliexpress.affiliate.order.list` - Listar órdenes

### 4. Links de Afiliado
- `aliexpress.affiliate.link.generate` - Generar links con tu tracking ID

---

## Ventajas de la API Oficial

✅ **Productos 100% reales** de AliExpress
✅ **Comisiones de afiliado** (3-50% según categoría)
✅ **Sin límites** de peticiones (dentro de lo razonable)
✅ **Datos actualizados** en tiempo real
✅ **Soporte oficial** de AliExpress
✅ **Precios reales** con descuentos
✅ **Stock actualizado**
✅ **Imágenes de alta calidad**

---

## Alternativa Rápida: RapidAPI (mientras esperas aprobación)

Si quieres empezar YA mientras esperas la aprobación de AliExpress:

### Opción A: RapidAPI - AliExpress Unofficial (500 requests/mes gratis)

1. Ve a: https://rapidapi.com/
2. Regístrate gratis
3. Busca "AliExpress Unofficial"
4. Suscríbete al plan gratuito
5. Copia tu `X-RapidAPI-Key`
6. Agrégala a `.env.local`:

```env
RAPIDAPI_KEY=tu_rapidapi_key_aqui
ALIEXPRESS_API_HOST=aliexpress-unofficial.p.rapidapi.com
```

---

## ¿Cuál opción usar?

### Para producción (RECOMENDADO):
- **API Oficial de AliExpress**: Más profesional, sin límites, con comisiones

### Para desarrollo/pruebas:
- **RapidAPI**: Más rápido de configurar, funciona en 5 minutos

---

## Documentación Oficial

- Portal de Afiliados: https://portals.aliexpress.com/
- API Docs: https://openservice.aliexpress.com/doc/api.htm
- Centro de Ayuda: https://helppage.aliexpress.com/

---

## Próximos pasos

1. Elige una opción (API Oficial o RapidAPI)
2. Obtén las credenciales
3. Agrégalas a `.env.local`
4. Reinicia el servidor
5. Ve a `/importar-ml` y busca productos REALES

---

## Nota sobre comisiones

Con la API oficial de AliExpress, cada vez que un usuario compre un producto que importaste, recibirás una comisión de afiliado (3-50% según la categoría del producto). Esto es adicional a tu margen de ganancia.

