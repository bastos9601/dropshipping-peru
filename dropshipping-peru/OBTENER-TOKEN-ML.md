# 🔑 Cómo Obtener Token de Mercado Libre MANUALMENTE

## ✅ CREDENCIALES ACTUALES

```
App ID: 497265314413017
Client Secret: pPDlNcXEMKzcFHUGv859ojBG2iOTcvck
Redirect URIs: 
  - http://localhost:3000/api/auth/ml/callback
  - https://shopidd.netlify.app/api/auth/ml/callback
```

## Opción 1: Usando PowerShell (RECOMENDADO - MÁS RÁPIDO)

Ejecuta este comando en PowerShell:

```powershell
$body = @{
    grant_type = "client_credentials"
    client_id = "497265314413017"
    client_secret = "pPDlNcXEMKzcFHUGv859ojBG2iOTcvck"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://api.mercadolibre.com/oauth/token" -Method Post -Body $body -ContentType "application/json"
```

Recibirás una respuesta como:
```
access_token : APP_USR-497265314413017-XXXXXX-XXXXXX
token_type   : Bearer
expires_in   : 21600
```

Copia el `access_token` y pégalo en `.env.local`:

```
ML_ACCESS_TOKEN=APP_USR-497265314413017-XXXXXX-XXXXXX
```

Reinicia el servidor: `npm run dev`

## Opción 2: Usando la aplicación

1. Asegúrate de que el servidor esté corriendo: `npm run dev`
2. Ve a: http://localhost:3000/admin/conectar-ml
3. Haz clic en "Conectar con Mercado Libre"
4. Autoriza la aplicación
5. Copia el token que aparece
6. Pégalo en `.env.local` en la variable `ML_ACCESS_TOKEN`
7. Reinicia el servidor

## Opción 3: Usando cURL (MANUAL)

### Paso 1: Obtener el código de autorización

Abre esta URL en tu navegador:

```
https://auth.mercadolibre.com.pe/authorization?response_type=code&client_id=497265314413017&redirect_uri=http://localhost:3000/api/auth/ml/callback
```

Te redirigirá a una URL como:
```
http://localhost:3000/api/auth/ml/callback?code=TG-XXXXXXXX
```

Copia el código (TG-XXXXXXXX)

### Paso 2: Intercambiar el código por un token

Ejecuta este comando en tu terminal (reemplaza TG-XXXXXXXX con tu código):

```bash
curl -X POST \
  'https://api.mercadolibre.com/oauth/token' \
  -H 'Content-Type: application/json' \
  -d '{
    "grant_type": "authorization_code",
    "client_id": "497265314413017",
    "client_secret": "pPDlNcXEMKzcFHUGv859ojBG2iOTcvck",
    "code": "TG-XXXXXXXX",
    "redirect_uri": "http://localhost:3000/api/auth/ml/callback"
  }'
```

Recibirás una respuesta como:
```json
{
  "access_token": "APP_USR-497265314413017-XXXXXX-XXXXXX",
  "token_type": "Bearer",
  "expires_in": 21600,
  "scope": "offline_access read write",
  "user_id": 123456789,
  "refresh_token": "TG-XXXXXX"
}
```

### Paso 3: Copiar el token

Copia el `access_token` y pégalo en `.env.local`:

```
ML_ACCESS_TOKEN=APP_USR-497265314413017-XXXXXX-XXXXXX
```

### Paso 4: Reiniciar el servidor

```bash
npm run dev
```

## Opción 4: Usando Postman

1. Abre Postman
2. Crea una nueva petición POST
3. URL: `https://api.mercadolibre.com/oauth/token`
4. Headers: `Content-Type: application/json`
5. Body (raw JSON):
```json
{
  "grant_type": "client_credentials",
  "client_id": "497265314413017",
  "client_secret": "pPDlNcXEMKzcFHUGv859ojBG2iOTcvck"
}
```
6. Envía la petición
7. Copia el `access_token`
8. Pégalo en `.env.local`

## ⚠️ IMPORTANTE

- El token expira en 6 horas
- Guarda también el `refresh_token` para renovarlo
- NO compartas tu token públicamente
- Reinicia el servidor después de agregar el token

## 🧪 Probar que funciona

Después de agregar el token y reiniciar:

1. Ve a: http://localhost:3000/importar-ml
2. Busca: "mouse"
3. Deberías ver productos REALES de Mercado Libre
4. Si ves productos, ¡funcionó! 🎉

## 🔄 Renovar el token (cuando expire)

Si el token expira, repite el proceso o usa el refresh_token:

```bash
curl -X POST \
  'https://api.mercadolibre.com/oauth/token' \
  -H 'Content-Type: application/json' \
  -d '{
    "grant_type": "refresh_token",
    "client_id": "5016004311125153",
    "client_secret": "Ap12NcUljRjcJSSw16b2ozG8f1iFZVpV",
    "refresh_token": "TG-XXXXXX"
  }'
```
