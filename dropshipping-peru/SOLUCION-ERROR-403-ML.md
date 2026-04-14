# 🚨 Solución al Error 403 de Mercado Libre

## Problema Actual

Mercado Libre está devolviendo error 403 (Forbidden) en TODAS las peticiones desde tu máquina/IP, incluso en las peticiones públicas que no requieren autenticación.

```
{"message":"forbidden","error":"forbidden","status":403,"cause":[]}
```

## ¿Por qué sucede esto?

1. **Rate Limiting**: Hiciste muchas peticiones en poco tiempo
2. **Bloqueo de IP**: ML detectó comportamiento automatizado
3. **Restricciones regionales**: Algunas IPs están bloqueadas
4. **User-Agent**: ML puede estar bloqueando ciertos user-agents

## ✅ Soluciones

### Solución 1: Esperar (RECOMENDADO)

El bloqueo suele ser temporal (2-4 horas). Espera y vuelve a intentar más tarde.

### Solución 2: Cambiar IP

- Usa una VPN
- Cambia tu conexión (usa datos móviles)
- Reinicia tu router para obtener nueva IP

### Solución 3: Usar el flujo OAuth completo

En lugar de `client_credentials`, usa el flujo de autorización:

1. Ve a: http://localhost:3000/admin/conectar-ml
2. Haz clic en "Conectar con Mercado Libre"
3. Autoriza con tu cuenta de ML
4. Obtén el token de usuario (no de aplicación)

Este token tiene más permisos y es menos probable que sea bloqueado.

### Solución 4: Proxy/CORS Anywhere

Usa un proxy para hacer las peticiones:

```typescript
const PROXY = 'https://cors-anywhere.herokuapp.com/';
const url = `${PROXY}https://api.mercadolibre.com/sites/MPE/search?q=${query}`;
```

### Solución 5: Usar otra fuente de productos

Mientras ML está bloqueado, puedes usar:

- **AliExpress API**: Productos de dropshipping directo
- **Amazon Product API**: Productos de Amazon
- **Fake Store API**: Para pruebas (https://fakestoreapi.com)
- **Tu propia base de datos**: Agregar productos manualmente

## 🧪 Verificar si el bloqueo se levantó

Ejecuta este comando en PowerShell:

```powershell
Invoke-RestMethod -Uri "https://api.mercadolibre.com/sites/MPE/search?q=mouse&limit=5" -Headers @{
    "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    "Accept" = "application/json"
}
```

Si devuelve productos, el bloqueo se levantó. Si devuelve 403, sigue bloqueado.

## 📝 Estado Actual

- ✅ Token obtenido: `APP_USR-497265314413017-041402-d6bc92db31363da8bd7da27147eb08cf-2671750401`
- ✅ Credenciales configuradas en `.env.local`
- ✅ Código listo para usar productos reales
- ❌ ML bloqueando peticiones desde tu IP

## 🔄 Próximos pasos

1. **Espera 2-4 horas**
2. **Verifica con el comando de PowerShell**
3. **Si funciona**: Reinicia el servidor y prueba en `/importar-ml`
4. **Si no funciona**: Usa VPN o considera otra fuente de productos

## 💡 Alternativa temporal

Mientras tanto, puedes:

1. Agregar productos manualmente desde el panel de admin
2. Usar otra API de productos
3. Importar un CSV con productos

¿Quieres que implemente alguna de estas alternativas?
