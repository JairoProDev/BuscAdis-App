# MongoDB Connection Pool Fix

## Problema Identificado

### Síntomas
- Las publicaciones aparecían en la primera carga de la página
- Al navegar y regresar, las publicaciones desaparecían
- Error: `MongoNotConnectedError: Client must be connected before running operations`
- El error ocurría tanto en local como en producción

### Causa Raíz
En `src/app/api/publications/route.ts`, se estaba cerrando la conexión de MongoDB después de cada request:

```typescript
const { client, db } = await connectToDatabase()
// ... queries ...
await client.close() // ❌ ERROR: Esto cerraba la conexión cacheada
```

El flujo era:
1. **Primera petición**: Creaba nueva conexión → funcionaba ✅
2. **Segunda petición**: Intentaba usar conexión cacheada (pero estaba cerrada) → Error ❌
3. **Tercera petición (tras recargar)**: Creaba nueva conexión → funcionaba ✅

## Solución Implementada

### Fix Principal
Eliminar el `client.close()` para permitir que el connection pool funcione correctamente:

```typescript
const { db } = await connectToDatabase()
// ... queries ...
// Connection pooling: client is cached and reused, no need to close
```

### Optimizaciones Adicionales

1. **Logging Condicional**: Solo loggear en desarrollo
   ```typescript
   const isDev = process.env.NODE_ENV === 'development'
   if (isDev) {
     Logger.debug('...')
   }
   ```

2. **Middleware Optimizado**: Reducir logging verbose en producción

3. **Eliminación de Endpoints de Debug**: Removidos `/api/debug/db`, `/api/health`, `/api/test`

## Cómo Funciona el Connection Pool

MongoDB Node.js driver maneja automáticamente un pool de conexiones:

- **Creación**: Primera vez que `new MongoClient().connect()` se ejecuta
- **Cache**: La conexión se almacena en `cachedClient` y `cachedDb`
- **Reutilización**: Peticiones subsecuentes usan la conexión cacheada
- **Cleanup**: El driver maneja el cierre de conexiones automáticamente

### Configuración Actual
```typescript
const connectionOptions = {
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 10000,
  maxPoolSize: 50,
  minPoolSize: 5,
  retryWrites: true,
  retryReads: true
}
```

## Testing

### Verificación Local
```bash
# Test múltiples peticiones
curl http://localhost:3000/api/publications?category=empleos
curl http://localhost:3000/api/publications?category=inmuebles
curl http://localhost:3000/api/publications?category=vehiculos
# Todas deberían devolver datos correctamente
```

### Verificación en Navegador
1. Cargar `/` - las publicaciones aparecen ✅
2. Navegar a `/buscar` - las publicaciones aparecen ✅
3. Volver a `/` - las publicaciones siguen apareciendo ✅
4. Refrescar la página - las publicaciones siguen apareciendo ✅

## Lecciones Aprendidas

1. **NUNCA cerrar el MongoClient en un entorno serverless/edge**
   - El driver maneja el pooling automáticamente
   - Cerrar el cliente rompe el cache de conexiones

2. **Logging debe ser condicional**
   - Solo debug en desarrollo
   - Producción: solo errores críticos

3. **Connection pooling es crítico para rendimiento**
   - Reduce latencia de conexión
   - Mejora throughput
   - Maneja reconexiones automáticamente

## Archivos Modificados

- ✅ `src/app/api/publications/route.ts` - Fix principal
- ✅ `src/middleware.ts` - Optimización de logging
- 🗑️ `src/app/api/debug/db/route.ts` - Eliminado
- 🗑️ `src/app/api/health/route.ts` - Eliminado  
- 🗑️ `src/app/api/test/route.ts` - Eliminado

## Referencias

- [MongoDB Node.js Driver - Connection Pooling](https://www.mongodb.com/docs/drivers/node/current/fundamentals/connection/connection-pooling/)
- [Next.js - API Routes Best Practices](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
