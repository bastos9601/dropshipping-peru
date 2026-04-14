# 🚀 Guía para Desplegar en Netlify

## 📋 Requisitos Previos

1. ✅ Cuenta en Netlify (https://netlify.com)
2. ✅ Cuenta en GitHub (para conectar el repositorio)
3. ✅ Proyecto subido a GitHub

---

## 🔧 PASO 1: Preparar el Proyecto

### 1.1 Crear repositorio en GitHub

Si aún no tienes el proyecto en GitHub:

```bash
# Inicializar git (si no lo has hecho)
git init

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Preparar para despliegue en Netlify"

# Crear repositorio en GitHub y conectarlo
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git branch -M main
git push -u origin main
```

### 1.2 Verificar archivos importantes

Asegúrate de tener estos archivos:
- ✅ `netlify.toml` (configuración de Netlify)
- ✅ `.gitignore` (para no subir archivos sensibles)
- ✅ `package.json` (dependencias del proyecto)

---

## 🌐 PASO 2: Desplegar en Netlify

### Opción A: Desde la Interfaz Web (Recomendado)

1. **Ve a Netlify**
   - Abre https://app.netlify.com
   - Inicia sesión con tu cuenta

2. **Importar proyecto**
   - Haz clic en **"Add new site"** → **"Import an existing project"**
   - Selecciona **"Deploy with GitHub"**
   - Autoriza a Netlify para acceder a tu GitHub

3. **Seleccionar repositorio**
   - Busca y selecciona tu repositorio
   - Haz clic en él

4. **Configurar el build**
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Base directory**: `dropshipping-peru` (si tu proyecto está en una subcarpeta)

5. **Agregar variables de entorno**
   - Haz clic en **"Add environment variables"**
   - Agrega estas variables (cópialas de tu `.env.local`):

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://fxyyxtaeqzkxlazeoyqw.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4eXl4dGFlcXpreGxhemVveXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0Mjg4ODIsImV4cCI6MjA5MTAwNDg4Mn0.-emcToXn-pAh1yf_FcHVqUy9yV0Tka_VgLcEGtpg6Pk
   
   ML_CLIENT_ID=497265314413017
   ML_CLIENT_SECRET=pPDlNcXEMKzcFHUGv859ojBG2iOTcvck
   ML_REDIRECT_URI=https://TU-SITIO.netlify.app/api/auth/ml/callback
   NEXT_PUBLIC_ML_CLIENT_ID=497265314413017
   ML_ACCESS_TOKEN=APP_USR-497265314413017-041402-d6bc92db31363da8bd7da27147eb08cf-2671750401
   
   RAPIDAPI_KEY=27e5642c7fmsh1bbafb0dfe3f8a7p1fbfb6jsn815cdac3a644
   ALIEXPRESS_API_HOST=aliexpress-datahub.p.rapidapi.com
   AMAZON_API_HOST=real-time-amazon-data.p.rapidapi.co
   ```

   **IMPORTANTE**: Reemplaza `TU-SITIO` en `ML_REDIRECT_URI` con el nombre de tu sitio en Netlify

6. **Desplegar**
   - Haz clic en **"Deploy site"**
   - Espera 2-5 minutos mientras se construye

7. **Verificar el despliegue**
   - Una vez completado, verás un enlace como: `https://random-name-123.netlify.app`
   - Haz clic para abrir tu sitio

### Opción B: Usando Netlify CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Iniciar sesión
netlify login

# Desplegar
cd dropshipping-peru
netlify deploy --prod
```

---

## ⚙️ PASO 3: Configurar Dominio Personalizado (Opcional)

1. **En Netlify Dashboard**
   - Ve a **Site settings** → **Domain management**
   - Haz clic en **"Add custom domain"**

2. **Agregar tu dominio**
   - Ingresa tu dominio (ej: `mitienda.com`)
   - Sigue las instrucciones para configurar los DNS

3. **Habilitar HTTPS**
   - Netlify automáticamente genera un certificado SSL
   - Tu sitio estará disponible en `https://tudominio.com`

---

## 🔄 PASO 4: Actualizar ML_REDIRECT_URI

Después del primer despliegue:

1. **Copia tu URL de Netlify**
   - Ejemplo: `https://mi-tienda-dropshipping.netlify.app`

2. **Actualiza las variables de entorno en Netlify**
   - Ve a **Site settings** → **Environment variables**
   - Edita `ML_REDIRECT_URI`
   - Cambia a: `https://TU-SITIO.netlify.app/api/auth/ml/callback`

3. **Actualiza en Mercado Libre**
   - Ve a https://developers.mercadolibre.com.pe/apps
   - Edita tu aplicación
   - Actualiza la **Redirect URI** con tu nueva URL de Netlify

4. **Redesplegar**
   - En Netlify, ve a **Deploys**
   - Haz clic en **"Trigger deploy"** → **"Clear cache and deploy site"**

---

## 🔧 PASO 5: Configuraciones Adicionales

### 5.1 Habilitar despliegues automáticos

- Cada vez que hagas `git push` a tu repositorio, Netlify desplegará automáticamente
- Puedes desactivar esto en **Site settings** → **Build & deploy** → **Continuous deployment**

### 5.2 Configurar notificaciones

- Ve a **Site settings** → **Build & deploy** → **Deploy notifications**
- Puedes recibir notificaciones por email, Slack, etc.

### 5.3 Ver logs de build

- Si algo falla, ve a **Deploys** → Haz clic en el deploy fallido
- Revisa los logs para ver el error

---

## ✅ Verificar que Todo Funciona

Después del despliegue, verifica:

1. ✅ La página principal carga correctamente
2. ✅ Puedes crear una cuenta y iniciar sesión
3. ✅ Los productos se muestran correctamente
4. ✅ El carrito funciona
5. ✅ Puedes hacer un pedido de prueba
6. ✅ Las notificaciones llegan
7. ✅ El panel de admin funciona

---

## 🐛 Solución de Problemas

### Error: "Build failed"

**Solución:**
- Revisa los logs en Netlify
- Asegúrate de que todas las dependencias estén en `package.json`
- Verifica que las variables de entorno estén configuradas

### Error: "Page not found" en rutas dinámicas

**Solución:**
- Verifica que `netlify.toml` esté configurado correctamente
- El plugin `@netlify/plugin-nextjs` debe estar instalado

### Error: "Supabase connection failed"

**Solución:**
- Verifica que las variables de entorno `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` estén configuradas
- Asegúrate de que no tengan espacios al inicio o final

### Las imágenes no cargan

**Solución:**
- Verifica que `next.config.ts` tenga configurados los dominios remotos
- Netlify automáticamente optimiza las imágenes con Next.js

---

## 🚀 Comandos Útiles

```bash
# Ver el estado del sitio
netlify status

# Ver logs en tiempo real
netlify watch

# Abrir el dashboard de Netlify
netlify open

# Abrir el sitio desplegado
netlify open:site

# Redesplegar
netlify deploy --prod

# Ver variables de entorno
netlify env:list
```

---

## 📊 Monitoreo y Analytics

Netlify incluye analytics básicos:
- Ve a **Analytics** en el dashboard
- Puedes ver visitas, páginas más vistas, etc.

Para analytics más avanzados, puedes integrar:
- Google Analytics
- Plausible
- Fathom

---

## 💰 Límites del Plan Gratuito de Netlify

- ✅ 100 GB de ancho de banda/mes
- ✅ 300 minutos de build/mes
- ✅ Despliegues ilimitados
- ✅ HTTPS automático
- ✅ Dominio personalizado

Para la mayoría de tiendas pequeñas, el plan gratuito es suficiente.

---

## 🎉 ¡Listo!

Tu tienda de dropshipping ya está en línea y accesible desde cualquier parte del mundo.

**Próximos pasos:**
1. Comparte el enlace con tus clientes
2. Configura tu dominio personalizado
3. Agrega productos
4. ¡Empieza a vender!

**¿Necesitas ayuda?**
- Documentación de Netlify: https://docs.netlify.com
- Soporte de Netlify: https://answers.netlify.com
