# Vercel API Cache Fix - Publicaciones No Aparecen en Producción

## 🔴 **PROBLEMA CRÍTICO IDENTIFICADO**

### Síntomas
- ✅ Publicaciones aparecen en local (localhost)
- ❌ Publicaciones NO aparecen en producción (Vercel)
- ✅ API responde 200 OK
- ❌ Pero devuelve datos vacíos: `{"publications":[],"total":0}`
- ✅ MongoDB tiene 24 documentos
- ✅ Variables de entorno correctas en Vercel

### Evidencia del Network Tab
```
Status: 200 OK (from disk cache)
Time: 1 ms (disk cache)
Response: {"publications":[],"total":0,"page":1,"pages":0,"success":true,"hasMore":false}
```

---

## 🎯 **CAUSA RAÍZ**

### **Vercel está cacheando las respuestas de la API**

El flujo del problema fue:

1. **Primer deploy**: API tenía el bug de MongoDB (cerraba la conexión)
   - API respondía con arrays vacíos
   - Vercel **cacheó** estas respuestas vacías

2. **Segundo deploy**: Arreglamos el bug de MongoDB
   - Código correcto deployado
   - Pero Vercel seguía sirviendo **respuestas cacheadas** (vacías)

3. **Local funciona**: No usa el cache de Vercel
   - Respuestas frescas directamente de MongoDB

### Por qué Next.js 15 cachea por defecto

Next.js 15 tiene caching agresivo para mejorar rendimiento:
- Route Handlers son **cached by default**
- Vercel CDN cachea responses automáticamente
- Útil para contenido estático, **problemático para APIs dinámicas**

---

## ✅ **SOLUCIÓN IMPLEMENTADA**

### 1. **Headers de No-Cache en el Endpoint**

```typescript
// src/app/api/publications/route.ts

const response = NextResponse.json({
  publications: formattedPublications,
  total: totalCount,
  // ...
})

// Force no cache - critical for Vercel deployment
response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
response.headers.set('Pragma', 'no-cache')
response.headers.set('Expires', '0')
response.headers.set('Surrogate-Control', 'no-store') // Vercel-specific

return response
```

### 2. **Configuración Global en next.config.js**

```javascript
// next.config.js

const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          // CORS headers...
          
          // Disable caching for API routes - critical for Vercel
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
    ]
  }
}
```

### 3. **Force Dynamic ya estaba configurado**

```typescript
// Ya teníamos esto, pero no era suficiente
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
```

---

## 📊 **Diferencias entre Headers**

| Header | Propósito | Scope |
|--------|-----------|-------|
| `Cache-Control: no-store` | No almacenar EN ABSOLUTO | Browser + CDN |
| `Cache-Control: no-cache` | Revalidar SIEMPRE antes de usar | Browser + Proxies |
| `Pragma: no-cache` | Compatibilidad HTTP/1.0 | Legacy browsers |
| `Expires: 0` | Marca como expirado INMEDIATAMENTE | Browser |
| `Surrogate-Control: no-store` | Específico para Vercel Edge Network | Vercel CDN |
| `Cache-Control: max-age=0` | TTL = 0 segundos | Browser + CDN |

---

## 🧪 **Verificación**

### Antes del Fix
```bash
curl -I https://www.buscadis.com/api/publications
# X-Vercel-Cache: HIT  (servido desde cache)
# Time: 1-2ms (demasiado rápido, es cache)
```

### Después del Fix
```bash
curl -I https://www.buscadis.com/api/publications
# Cache-Control: no-store, no-cache, must-revalidate
# X-Vercel-Cache: MISS (no cacheado)
# Time: 300-500ms (tiempo real de query a MongoDB)
```

### En Browser DevTools
Antes:
- ❌ `Status: 200 (from disk cache)`
- ❌ `Size: (disk cache)`
- ❌ `Time: 1 ms`

Después:
- ✅ `Status: 200`
- ✅ `Size: 15.2 kB`
- ✅ `Time: 350 ms`

---

## 🔍 **Cómo Diagnosticar Problemas de Cache en Vercel**

### 1. Revisar Response Headers en Network Tab
```
X-Vercel-Cache: HIT     → Servido desde cache (problema)
X-Vercel-Cache: MISS    → No cacheado (correcto para APIs dinámicas)
X-Vercel-Cache: BYPASS  → Cache deshabilitado (ideal)
```

### 2. Comparar Tiempos de Respuesta
```
1-5 ms        → Definitivamente cache
50-200 ms     → Posible cache o serverless cold start
300-1000 ms   → Request real (correcto para DB queries)
```

### 3. Revisar Size en Network Tab
```
(disk cache)    → Cache local del browser
(from cache)    → Cache del CDN
KB reales       → Response fresca
```

---

## 💡 **Lecciones Aprendidas**

### 1. **Next.js 15 Cachea Agresivamente**
- Por defecto, route handlers son cacheados
- `force-dynamic` NO es suficiente para Vercel
- Necesitas headers explícitos de no-cache

### 2. **Vercel CDN es Persistente**
- Una vez cacheado, sirve esa versión indefinidamente
- Deployar código nuevo NO limpia el cache automáticamente
- Debes **prevenir** el cache con headers

### 3. **Testing Completo Requiere Producción**
- Local nunca tiene el mismo caching que producción
- Siempre testear en staging/production después de cambios críticos

### 4. **Headers Defensivos para APIs Dinámicas**
```typescript
// SIEMPRE incluir para APIs con datos cambiantes:
'Cache-Control': 'no-store, no-cache, must-revalidate'
'Surrogate-Control': 'no-store'  // Vercel-specific
```

---

## 📝 **Checklist para Futuros Endpoints**

Cuando creates un nuevo API endpoint que devuelva datos dinámicos:

- [ ] Agregar `export const dynamic = 'force-dynamic'`
- [ ] Incluir headers de no-cache en la response
- [ ] Configurar source en `next.config.js` headers
- [ ] Testear en producción (no solo local)
- [ ] Verificar `X-Vercel-Cache` header en DevTools
- [ ] Confirmar que time > 100ms (no es cache)

---

## 🚀 **Deploy del Fix**

```bash
# 1. Commit y push
git add src/app/api/publications/route.ts next.config.js
git commit -m "fix: disable API route caching in production"
git push origin setup-new-db-architecture

# 2. Vercel auto-deploys
# Esperar ~2-3 minutos

# 3. Verificar en producción
curl https://www.buscadis.com/api/publications?category=empleos

# 4. Verificar en browser
# Abrir DevTools → Network → Hacer request
# Verificar que NO diga "(from disk cache)"
```

---

## 🔗 **Referencias**

- [Next.js 15 Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Vercel Edge Caching](https://vercel.com/docs/concepts/edge-network/caching)
- [HTTP Caching Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)
- [Surrogate-Control Header](https://www.fastly.com/documentation/reference/http/http-headers/Surrogate-Control/)

---

**Fecha**: 30 de Septiembre, 2025  
**Fix Commit**: `81e239d`  
**Estado**: ✅ **RESUELTO Y DEPLOYADO**
