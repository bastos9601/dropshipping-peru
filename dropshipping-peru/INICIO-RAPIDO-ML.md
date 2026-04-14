# 🚀 Inicio Rápido - Integración Mercado Libre

## ⚡ En 5 minutos tendrás productos reales en el catálogo

**Importante**: Esta funcionalidad es solo para **administradores**. Los usuarios regulares verán los productos en el catálogo.

### Paso 1: Configurar (2 minutos) - ADMIN

1. Abre [Supabase](https://supabase.com) y ve a tu proyecto
2. Clic en **SQL Editor** en el menú lateral
3. Clic en **New Query**
4. Copia y pega el contenido de `supabase-mercadolibre.sql`
5. Clic en **Run** (botón verde)
6. Verás: "Success. No rows returned"

✅ **Listo!** Tu base de datos está preparada.

---

### Paso 2: Acceder a la página de importación (30 segundos) - ADMIN

1. Inicia sesión como administrador
2. En el menú superior verás un nuevo botón: **"Importar ML"** (verde)
3. Haz clic en él

**Nota**: Los usuarios regulares NO verán este botón.

✅ **Listo!** Estás en la página de importación.

---

### Paso 3: Buscar tu primer producto (1 minuto) - ADMIN

1. En el buscador escribe: **"audífonos bluetooth"**
2. Clic en **Buscar**
3. Espera 3-5 segundos
4. Verás 30 productos de Mercado Libre

✅ **Listo!** Ya tienes resultados.

---

### Paso 4: Importar un producto al catálogo (1 minuto) - ADMIN

1. Elige un producto que te guste
2. Clic en **"Importar"**
3. Se abre un modal con:
   - Foto del producto
   - Descripción
   - Precio en ML (este será el precio base)
   - Stock disponible

4. (Opcional) Selecciona una categoría

5. Clic en **"Importar al catálogo global"**

✅ **Listo!** El producto está en el catálogo para todos los usuarios.

---

### Paso 5: Usuarios agregan el producto (30 segundos) - USUARIOS

1. Los usuarios van a **"Catálogo"**
2. Ven el producto importado
3. Clic en **"Agregar a mi tienda"**
4. Configuran su margen de ganancia (ej: 80%)
   - Ejemplo: Producto base S/ 50 → Con 80% venden a S/ 90
5. El sistema calcula su precio de venta automáticamente

✅ **Listo!** El usuario ya puede vender.

---

## 🎯 ¿Qué hacer ahora?

### Como Admin: Importar más productos (Recomendado)
```
1. Vuelve a "Importar ML"
2. Busca: "smartwatch"
3. Importa 2-3 productos más
4. Busca: "mouse gamer"
5. Importa 2-3 productos más
6. Busca: "accesorios celular"
7. Importa 3-4 productos más
```

**Resultado**: Tendrás 8-12 productos en el catálogo en 15 minutos

### Como Usuario: Agregar productos a tu tienda
```
1. Ve a "Catálogo"
2. Revisa los productos importados por el admin
3. Selecciona 5-10 productos que quieras vender
4. Agrega cada uno a tu tienda
5. Configura tus márgenes de ganancia
```

### Empezar a vender
```
1. Ve a tu tienda pública: tudominio.com/tutienda
2. Copia el enlace
3. Compártelo en WhatsApp/Facebook/Instagram
4. Espera tu primera venta
```

---

## 💰 Cuando recibas tu primera venta (Usuario)

### Ejemplo: Cliente compra audífonos a S/ 90

**Paso 1**: Recibes el pago (S/ 90)

**Paso 2**: Ve a "Catálogo" y busca el producto vendido

**Paso 3**: Haz clic en el ícono de enlace externo (↗) 
- Te lleva al producto original en Mercado Libre

**Paso 4**: Compra el producto en ML (S/ 50)
- Usa la dirección de tu cliente en el envío
- NO uses tu dirección

**Paso 5**: Copia el código de tracking

**Paso 6**: Envía el tracking a tu cliente por WhatsApp

**Paso 7**: Espera 2-5 días

**Paso 8**: Cliente recibe el producto

**Resultado**: Ganaste S/ 40 (menos comisiones de pago)

---

## 📊 Búsquedas recomendadas para el Admin

### Tecnología (Margen sugerido para usuarios: 60-100%)
```
- audífonos bluetooth
- smartwatch
- mouse gamer
- teclado gamer
- cargador inalámbrico
- power bank
- webcam
```

### Accesorios (Margen sugerido: 80-150%)
```
- funda celular
- protector pantalla
- soporte celular
- anillo de luz
- cable usb-c
```

### Hogar (Margen sugerido: 50-80%)
```
- organizador escritorio
- lámpara led
- humidificador
- ventilador usb
```

### Mascotas (Margen sugerido: 60-100%)
```
- bebedero automático
- comedero inteligente
- juguetes interactivos
- cama ortopédica
```

---

## ⚠️ Consejos importantes

### Para el Admin:

✅ **Haz esto:**
- Busca productos con **envío gratis**
- Elige vendedores con **buena reputación** (termómetro verde)
- Verifica que tengan **stock alto** (más de 10 unidades)
- Importa productos de **diferentes categorías**
- Importa **10-20 productos** para empezar

❌ **Evita esto:**
- Productos sin stock
- Vendedores nuevos o con mala reputación
- Productos muy caros (más de S/ 500)
- Productos muy pesados (envío caro)

### Para los Usuarios:

✅ **Haz esto:**
- Revisa el catálogo regularmente
- Agrega productos que conozcas
- Establece márgenes competitivos
- Verifica el precio en ML antes de vender
- Ten 10-15 productos en tu tienda

❌ **Evita esto:**
- Márgenes muy altos (pierdes competitividad)
- Márgenes muy bajos (no ganas suficiente)
- Vender sin verificar stock en ML
- Prometer tiempos de entrega irreales

---

## 🎓 Recursos de aprendizaje

### Documentación completa
- [Instrucciones detalladas](./INSTRUCCIONES-MERCADOLIBRE.md)
- [Ejemplos prácticos](./EJEMPLOS-MERCADOLIBRE.md)
- [Guía de marketing](./GUIA-MARKETING.md)

---

## 🆘 Problemas comunes

### "No veo el botón Importar ML"
- Solo los administradores pueden verlo
- Verifica que tu usuario tenga `es_admin = true` en la base de datos

### "No aparecen resultados"
- Verifica tu conexión a internet
- Intenta con otra búsqueda
- La API de ML puede estar temporalmente caída

### "Error al importar producto"
- Verifica que ejecutaste el script SQL
- Revisa la consola del navegador (F12)
- Cierra sesión y vuelve a entrar

### "El producto ya no está disponible en ML"
- Es normal, el stock cambia constantemente
- Como admin, puedes desactivar el producto del catálogo
- Los usuarios deben desactivarlo de sus tiendas

---

## 📞 Soporte

¿Necesitas ayuda?
1. Revisa la [documentación completa](./INSTRUCCIONES-MERCADOLIBRE.md)
2. Busca en los [ejemplos prácticos](./EJEMPLOS-MERCADOLIBRE.md)
3. Abre un issue en GitHub

---

## 🎉 ¡Felicidades!

Ya tienes todo listo para:
- **Admin**: Importar productos desde Mercado Libre al catálogo
- **Usuarios**: Agregar productos del catálogo a sus tiendas y vender

**Próximos pasos:**

**Como Admin:**
1. Importa 15-20 productos variados
2. Organiza por categorías
3. Mantén el catálogo actualizado

**Como Usuario:**
1. Agrega 10 productos a tu tienda
2. Configura tus márgenes
3. Comparte tu tienda
4. Haz tu primera venta

**¡Mucho éxito! 🚀**
