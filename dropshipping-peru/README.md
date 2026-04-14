# 🛍️ DropShip Perú

Plataforma de dropshipping enfocada en Perú que permite a cualquier persona crear su propia tienda online en minutos, sin necesidad de inventario.

## 🚀 Características

- ✅ Registro e inicio de sesión con Supabase
- ✅ Catálogo de productos precargados
- ✅ **NUEVO: Importación automática desde Mercado Libre Perú**
- ✅ Generador automático de tiendas personalizadas
- ✅ Enlaces únicos para cada tienda (ej: `/mitienda`)
- ✅ Integración con WhatsApp para ventas
- ✅ Panel de control para gestionar productos
- ✅ Diseño responsive optimizado para móviles
- ✅ Precios en soles peruanos (PEN)
- ✅ Cálculo automático de ganancias
- ✅ Configuración de márgenes personalizados

## 🛠️ Tecnologías

- **Frontend**: Next.js 15 + TypeScript
- **Estilos**: Tailwind CSS
- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Iconos**: Lucide React
- **Hosting**: Vercel (recomendado)

## 📋 Requisitos previos

- Node.js 18+ instalado
- Cuenta en Supabase (gratis)
- Cuenta en Vercel (opcional, para deployment)

## 🔧 Instalación

### 1. Clonar el repositorio

```bash
cd dropshipping-peru
npm install
```

### 2. Configurar Supabase

1. Crea una cuenta en [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. Ve a **SQL Editor** y ejecuta los siguientes archivos en orden:
   - `supabase-schema.sql` (estructura de base de datos)
   - `supabase-productos-iniciales.sql` (productos de ejemplo)
   - `supabase-mercadolibre.sql` (integración con Mercado Libre)
4. Copia las credenciales de tu proyecto:
   - Ve a **Settings** > **API**
   - Copia `Project URL` y `anon public key`

### 3. Configurar variables de entorno

Edita el archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key_aqui
```

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📱 Uso de la aplicación

### Para vendedores:

1. **Registrarse**: Crea una cuenta con email, contraseña, nombre de tienda y WhatsApp
2. **Importar productos**: 
   - Opción A: Usa "Importar ML" para buscar productos en Mercado Libre
   - Opción B: Navega al catálogo y agrega productos precargados
3. **Configurar precios**: Define tu margen de ganancia (recomendado 50-100%)
4. **Compartir tienda**: Copia el enlace único de tu tienda y compártelo
5. **Recibir pedidos**: Los clientes te contactarán por WhatsApp
6. **Procesar ventas**: Compra el producto en ML y envía a tu cliente

### Para compradores:

1. Visita el enlace de una tienda (ej: `tuapp.com/mitienda`)
2. Explora los productos disponibles
3. Haz clic en "Comprar por WhatsApp"
4. Se abrirá WhatsApp con un mensaje prellenado

## 🗂️ Estructura del proyecto

```
dropshipping-peru/
├── app/
│   ├── page.tsx              # Página de inicio
│   ├── registro/page.tsx     # Registro de usuarios
│   ├── login/page.tsx        # Inicio de sesión
│   ├── panel/page.tsx        # Panel del vendedor
│   ├── catalogo/page.tsx     # Catálogo de productos
│   └── [tienda]/page.tsx     # Tienda pública (ruta dinámica)
├── componentes/
│   ├── Navbar.tsx            # Barra de navegación
│   └── TarjetaProducto.tsx   # Tarjeta de producto
├── lib/
│   ├── supabase.ts           # Cliente de Supabase
│   ├── tipos.ts              # Tipos TypeScript
│   ├── utils.ts              # Funciones utilitarias
│   └── productos-iniciales.ts # Datos de productos
├── supabase-schema.sql       # Schema de base de datos
└── supabase-productos-iniciales.sql # Productos iniciales
```

## 🎨 Personalización

### Agregar más productos

Edita `supabase-productos-iniciales.sql` o agrega productos directamente desde Supabase:

```sql
INSERT INTO productos (nombre, descripcion, precio_base, imagen_url, categoria, activo)
VALUES ('Nuevo Producto', 'Descripción', 99.90, 'url_imagen', 'Categoría', true);
```

### Cambiar margen de ganancia

En `app/catalogo/page.tsx`, línea 58:

```typescript
const precioVenta = producto.precio_base * 1.3; // 30% de ganancia
```

### Personalizar colores

Edita `tailwind.config.ts` para cambiar la paleta de colores.

## 🚀 Deployment en Vercel

1. Sube tu código a GitHub
2. Importa el proyecto en [Vercel](https://vercel.com)
3. Agrega las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy automático

## 📊 Base de datos

### Tablas principales:

- **usuarios**: Perfiles de vendedores
- **productos**: Catálogo general de productos
- **tienda_productos**: Productos por tienda (relación muchos a muchos)
- **ventas**: Registro de ventas (opcional)

## 🔐 Seguridad

- Row Level Security (RLS) habilitado en todas las tablas
- Los usuarios solo pueden modificar sus propios datos
- Las tiendas públicas son de solo lectura

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 🛒 Integración con Mercado Libre

Esta plataforma incluye integración directa con la API de Mercado Libre Perú:

- **Búsqueda en tiempo real**: Busca cualquier producto disponible en ML Perú
- **Importación con un clic**: Agrega productos a tu tienda automáticamente
- **Configuración de márgenes**: Define tu ganancia sobre el precio original
- **Tracking de precios**: Guarda el precio original para comparar
- **Links directos**: Acceso rápido al producto original para hacer pedidos

### Cómo funciona:

1. Busca productos en la página "Importar ML"
2. Selecciona el producto que quieres vender
3. Define tu margen de ganancia (ej: 80%)
4. El sistema calcula automáticamente tu precio de venta
5. Cuando vendas, compras el producto en ML y lo envías a tu cliente

📖 **Guías detalladas:**
- [Instrucciones de uso](./INSTRUCCIONES-MERCADOLIBRE.md)
- [Ejemplos prácticos](./EJEMPLOS-MERCADOLIBRE.md)

## 📝 Próximas características

- [x] Integración con Mercado Libre Perú
- [ ] Actualización automática de precios
- [ ] Generador de flyers automático
- [ ] Sistema de analytics y métricas
- [ ] Subdominios personalizados
- [ ] Ranking de tiendas más activas
- [ ] Integración con pasarelas de pago
- [ ] Sistema de notificaciones
- [ ] Panel de administración

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 💬 Soporte

Si tienes preguntas o necesitas ayuda:

- Abre un issue en GitHub
- Contacta al equipo de desarrollo

---

Hecho con ❤️ para emprendedores peruanos
