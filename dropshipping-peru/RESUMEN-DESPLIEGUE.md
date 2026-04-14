# 🚀 Resumen Rápido: Desplegar en Netlify

## ✅ Pasos Rápidos (5 minutos)

### 1. Subir a GitHub
```bash
git init
git add .
git commit -m "Preparar para Netlify"
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

### 2. Conectar con Netlify
1. Ve a https://app.netlify.com
2. Clic en **"Add new site"** → **"Import an existing project"**
3. Selecciona **GitHub** y tu repositorio
4. Configura:
   - **Base directory**: `dropshipping-peru`
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`

### 3. Agregar Variables de Entorno
Copia estas variables en Netlify (Site settings → Environment variables):

```
NEXT_PUBLIC_SUPABASE_URL=https://fxyyxtaeqzkxlazeoyqw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4eXl4dGFlcXpreGxhemVveXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0Mjg4ODIsImV4cCI6MjA5MTAwNDg4Mn0.-emcToXn-pAh1yf_FcHVqUy9yV0Tka_VgLcEGtpg6Pk

ML_CLIENT_ID=497265314413017
ML_CLIENT_SECRET=pPDlNcXEMKzcFHUGv859ojBG2iOTcvck
NEXT_PUBLIC_ML_CLIENT_ID=497265314413017
ML_ACCESS_TOKEN=APP_USR-497265314413017-041402-d6bc92db31363da8bd7da27147eb08cf-2671750401

RAPIDAPI_KEY=27e5642c7fmsh1bbafb0dfe3f8a7p1fbfb6jsn815cdac3a644
ALIEXPRESS_API_HOST=aliexpress-datahub.p.rapidapi.com
AMAZON_API_HOST=real-time-amazon-data.p.rapidapi.co
```

**IMPORTANTE**: Después del primer despliegue, actualiza esta variable con tu URL real:
```
ML_REDIRECT_URI=https://TU-SITIO-REAL.netlify.app/api/auth/ml/callback
```

### 4. Desplegar
- Haz clic en **"Deploy site"**
- Espera 2-5 minutos
- ¡Listo! Tu sitio estará en línea

### 5. Actualizar Mercado Libre
1. Ve a https://developers.mercadolibre.com.pe/apps
2. Edita tu aplicación
3. Actualiza **Redirect URI** con tu URL de Netlify
4. Guarda los cambios

---

## 🔄 Para Actualizar tu Sitio

Cada vez que hagas cambios:

```bash
git add .
git commit -m "Descripción de cambios"
git push
```

Netlify desplegará automáticamente los cambios.

---

## 📱 Tu Sitio Estará Disponible En:

- URL temporal: `https://random-name-123.netlify.app`
- Puedes cambiar el nombre en: Site settings → Site details → Change site name
- O agregar un dominio personalizado

---

## ✅ Verificar que Funciona

Después del despliegue, prueba:
- ✅ Crear cuenta
- ✅ Agregar productos
- ✅ Hacer un pedido de prueba
- ✅ Ver notificaciones
- ✅ Panel de admin

---

## 🆘 Si Algo Falla

1. Ve a **Deploys** en Netlify
2. Haz clic en el deploy fallido
3. Revisa los logs
4. Busca el error y corrígelo
5. Haz `git push` de nuevo

---

## 📞 Soporte

- Documentación completa: Ver `DESPLEGAR-NETLIFY.md`
- Netlify Docs: https://docs.netlify.com
- Netlify Support: https://answers.netlify.com
