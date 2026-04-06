# 📖 Instrucciones de Configuración

## Paso 1: Configurar Supabase

### 1.1 Crear proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Haz clic en "New Project"
4. Completa los datos:
   - **Name**: dropship-peru (o el nombre que prefieras)
   - **Database Password**: Guarda esta contraseña en un lugar seguro
   - **Region**: South America (São Paulo) - la más cercana a Perú
5. Espera 2-3 minutos mientras se crea el proyecto

### 1.2 Ejecutar el schema de base de datos

1. En tu proyecto de Supabase, ve al menú lateral izquierdo
2. Haz clic en **SQL Editor**
3. Haz clic en **New Query**
4. Copia todo el contenido del archivo `supabase-schema.sql`
5. Pégalo en el editor
6. Haz clic en **Run** (botón verde en la esquina inferior derecha)
7. Deberías ver el mensaje "Success. No rows returned"

### 1.3 Cargar productos iniciales

1. En el mismo **SQL Editor**, crea una nueva query
2. Copia todo el contenido del archivo `supabase-productos-iniciales.sql`
3. Pégalo en el editor
4. Haz clic en **Run**
5. Deberías ver "Success. 12 rows returned" (o el número de productos que insertaste)

### 1.4 Obtener las credenciales

1. Ve a **Settings** (ícono de engranaje en el menú lateral)
2. Haz clic en **API**
3. Copia los siguientes valores:
   - **Project URL**: Algo como `https://xxxxx.supabase.co`
   - **anon public key**: Una clave larga que empieza con `eyJ...`

## Paso 2: Configurar el proyecto local

### 2.1 Instalar dependencias

```bash
npm install
```

### 2.2 Configurar variables de entorno

1. Abre el archivo `.env.local`
2. Reemplaza los valores:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2.3 Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Paso 3: Probar la aplicación

### 3.1 Crear una cuenta

1. Ve a la página de inicio
2. Haz clic en "Crear mi tienda gratis"
3. Completa el formulario:
   - **Email**: tu@email.com
   - **Contraseña**: mínimo 6 caracteres
   - **Nombre de tienda**: Mi Tienda Test
   - **WhatsApp**: +51987654321 (con código de país)
4. Haz clic en "Crear mi tienda"

### 3.2 Agregar productos

1. Serás redirigido al panel
2. Haz clic en "Agregar productos" o ve a "Catálogo" en el menú
3. Haz clic en "Agregar" en los productos que quieras vender
4. Verás el mensaje "¡Producto agregado a tu tienda!"

### 3.3 Ver tu tienda

1. Vuelve al panel
2. Copia el enlace de tu tienda
3. Ábrelo en una nueva pestaña o compártelo
4. Verás tu tienda pública con los productos que agregaste

### 3.4 Probar compra por WhatsApp

1. En tu tienda pública, haz clic en "Comprar por WhatsApp"
2. Se abrirá WhatsApp Web con un mensaje prellenado
3. El mensaje incluye el producto, precio y nombre de tu tienda

## Paso 4: Deployment en Vercel

### 4.1 Preparar el código

1. Sube tu código a GitHub:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tu-usuario/dropship-peru.git
git push -u origin main
```

### 4.2 Importar en Vercel

1. Ve a [https://vercel.com](https://vercel.com)
2. Inicia sesión con GitHub
3. Haz clic en "Add New Project"
4. Selecciona tu repositorio
5. Configura las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Haz clic en "Deploy"
7. Espera 2-3 minutos

### 4.3 Configurar dominio (opcional)

1. En Vercel, ve a tu proyecto
2. Haz clic en "Settings" > "Domains"
3. Agrega tu dominio personalizado
4. Sigue las instrucciones para configurar el DNS

## Solución de problemas comunes

### Error: "Invalid API key"

- Verifica que copiaste correctamente las credenciales de Supabase
- Asegúrate de que no haya espacios al inicio o final
- Reinicia el servidor de desarrollo (`npm run dev`)

### Error: "relation does not exist"

- Asegúrate de haber ejecutado el archivo `supabase-schema.sql`
- Verifica que estés conectado al proyecto correcto de Supabase

### No aparecen productos en el catálogo

- Ejecuta el archivo `supabase-productos-iniciales.sql`
- Verifica en Supabase > Table Editor > productos que haya datos

### Error al registrarse

- Verifica que el email no esté ya registrado
- La contraseña debe tener mínimo 6 caracteres
- Revisa la consola del navegador para más detalles

### La tienda pública no carga

- Verifica que el slug de la tienda sea correcto
- Asegúrate de haber agregado productos a tu tienda
- Revisa las políticas RLS en Supabase

## Personalización

### Cambiar el margen de ganancia

Edita `app/catalogo/page.tsx`, línea 58:

```typescript
const precioVenta = producto.precio_base * 1.5; // 50% de ganancia
```

### Agregar más productos

Opción 1: Desde Supabase Table Editor
1. Ve a Table Editor > productos
2. Haz clic en "Insert row"
3. Completa los campos

Opción 2: Desde SQL Editor
```sql
INSERT INTO productos (nombre, descripcion, precio_base, imagen_url, categoria)
VALUES ('Producto Nuevo', 'Descripción', 99.90, 'https://url-imagen.jpg', 'Categoría');
```

### Cambiar colores del tema

Edita `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      primary: '#3B82F6', // Azul
      secondary: '#10B981', // Verde
    }
  }
}
```

## Recursos adicionales

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Tailwind CSS](https://tailwindcss.com/docs)
- [Guía de Vercel](https://vercel.com/docs)

## Soporte

Si tienes problemas, revisa:
1. La consola del navegador (F12)
2. Los logs de Supabase
3. Los logs de Vercel (si está deployado)

---

¡Éxito con tu negocio de dropshipping! 🚀
