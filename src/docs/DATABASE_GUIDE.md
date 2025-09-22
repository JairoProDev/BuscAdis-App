# 🌍 GUÍA COMPLETA DE BASE DE DATOS BUSCADIS GLOBAL

## 📋 ÍNDICE

1. [Arquitectura Global](#arquitectura-global)
2. [Estructura de Datos](#estructura-de-datos)
3. [Importación Masiva](#importación-masiva)
4. [Newsfeed y Red Social](#newsfeed-y-red-social)
5. [IA y Machine Learning](#ia-y-machine-learning)
6. [Bases de Datos Vectoriales](#bases-de-datos-vectoriales)
7. [Escalabilidad y Performance](#escalabilidad-y-performance)
8. [Implementación Práctica](#implementación-práctica)

---

## 🌍 ARQUITECTURA GLOBAL

### Estrategia de Sharding Geográfico

```javascript
// Distribución por continentes para búsqueda local optimizada
const GEOGRAPHIC_SHARDS = {
  'publications_northamerica': ['US', 'CA', 'MX', ...],
  'publications_southamerica': ['PE', 'CO', 'EC', 'BO', ...],
  'publications_europe': ['ES', 'FR', 'DE', 'IT', ...],
  'publications_asia': ['JP', 'CN', 'IN', 'KR', ...],
  'publications_africa': ['ZA', 'NG', 'EG', 'KE', ...],
  'publications_oceania': ['AU', 'NZ', 'FJ', ...]
}
```

### Ventajas de esta Arquitectura:

✅ **Búsqueda Local Ultra-Rápida**: Cada región tiene su propio shard
✅ **Escalabilidad Infinita**: Agregar nuevos países es trivial
✅ **Compliance Regional**: Datos almacenados en región correspondiente
✅ **Performance Optimizada**: Latencia mínima para usuarios locales

---

## 📊 ESTRUCTURA DE DATOS

### 1. Estructura JSON para Importación Masiva

```json
{
  "publications": [
    {
      "title": "Casa en venta en San Blas",
      "description": "Hermosa casa colonial de 3 habitaciones...",
      "category": "inmuebles",
      "subcategory": "casas",
      "subsubcategory": "venta",
      
      "location": {
        "country": "Peru",
        "region": "Cusco", 
        "city": "Cusco",
        "district": "San Blas",
        "address": "Calle Tandapata 123",
        "coordinates": {
          "lat": -13.5181,
          "lng": -71.9747
        },
        "timezone": "America/Lima"
      },
      
      "contact": {
        "phones": ["+51 984 123 456"],
        "whatsapp": ["+51 984 123 456"],
        "email": ["contacto@ejemplo.com"],
        "preferredContact": "whatsapp"
      },
      
      "pricing": {
        "price": 350000,
        "currency": "PEN",
        "type": "fixed",
        "period": "once"
      },
      
      "media": {
        "images": [
          "https://ejemplo.com/imagen1.jpg",
          "https://ejemplo.com/imagen2.jpg"
        ],
        "mainImage": "https://ejemplo.com/imagen1.jpg"
      },
      
      "categoryData": {
        "bedrooms": 3,
        "bathrooms": 2,
        "area": 120,
        "parkingSpaces": 1,
        "furnished": true,
        "propertyType": "house"
      },
      
      "metadata": {
        "source": "bulk_import",
        "language": "es",
        "publishDate": "2024-12-19T10:00:00Z",
        "status": "active"
      }
    }
  ],
  "metadata": {
    "source": "archivo_inmuebles_cusco",
    "importDate": "2024-12-19T10:00:00Z",
    "totalCount": 1000,
    "region": "Cusco",
    "language": "es",
    "currency": "PEN"
  }
}
```

### 2. Estructura de Base de Datos Completa

```typescript
interface PublicationDocument {
  _id: string
  
  // INFORMACIÓN BÁSICA
  title: string
  description: string
  slug: string
  
  // CATEGORIZACIÓN JERÁRQUICA
  category: {
    id: string
    name: string
    slug: string
  }
  subcategory?: CategoryInfo
  subsubcategory?: CategoryInfo
  
  // GEOLOCALIZACIÓN INTELIGENTE
  location: {
    continent: string
    country: string
    countryCode: string
    region: string
    city: string
    district?: string
    
    // Coordenadas GeoJSON para búsqueda geoespacial
    coordinates: {
      type: 'Point'
      coordinates: [number, number] // [lng, lat]
    }
    
    timezone: string
    currency: string
    language: string
    searchRadius: number
    administrativeLevels: string[]
  }
  
  // DATOS FLEXIBLES POR CATEGORÍA
  attributes: Record<string, {
    value: any
    type: 'string' | 'number' | 'boolean' | 'date' | 'array'
    label?: string
    unit?: string
    verified?: boolean
  }>
  
  // ENGAGEMENT PARA RED SOCIAL
  engagement: {
    views: number
    likes: number
    shares: number
    saves: number
    comments: number
    trendinessScore: number
    engagementRate: number
    viewsByDay: Record<string, number>
  }
  
  // IA Y MACHINE LEARNING
  ai: {
    titleEmbedding?: number[]        // Vector para búsqueda semántica
    descriptionEmbedding?: number[]  // Vector de descripción
    imageEmbeddings?: number[][]     // Vectores de imágenes
    
    extractedKeywords: string[]
    autoTags: string[]
    sentiment: 'positive' | 'neutral' | 'negative'
    qualityScore: number             // 0-100
    completenessScore: number        // 0-100
    trustScore: number               // 0-100
    
    suggestedCategories: CategorySuggestion[]
    targetAudience: string[]
    similarPublications: string[]
    recommendations: RecommendationWeight[]
  }
}
```

---

## 📥 IMPORTACIÓN MASIVA

### Script de Importación

```bash
# Importar desde CSV
node scripts/bulk-import.js \
  --source "./data/adisos_cusco.csv" \
  --format csv \
  --batch-size 100 \
  --enable-ai true

# Importar desde texto plano
node scripts/bulk-import.js \
  --source "./data/adisos.txt" \
  --format txt \
  --mapping custom \
  --geocode true
```

### Ejemplo de Uso Programático

```typescript
import { importPublications } from '@/scripts/bulk-import-publications'

const result = await importPublications(
  './data/adisos_inmuebles.csv',
  'BASIC_CSV',
  {
    processing: {
      batchSize: 200,
      enableAI: true,
      geocodeAddresses: true
    },
    validation: {
      strictMode: false,
      requiredFields: ['title', 'description', 'location']
    }
  }
)

console.log(`✅ Importados: ${result.imported}`)
console.log(`❌ Errores: ${result.errors}`)
```

---

## 📱 NEWSFEED Y RED SOCIAL

### Algoritmo de Newsfeed

```typescript
interface NewsfeedAlgorithm {
  // Factores de relevancia
  relevanceFactors: {
    location: number        // 40% - Proximidad geográfica
    category: number        // 25% - Intereses del usuario
    freshness: number       // 15% - Qué tan reciente es
    engagement: number      // 10% - Likes, shares, views
    quality: number         // 5%  - Score de calidad IA
    social: number          // 5%  - Actividad de contactos
  }
  
  // Diversificación de contenido
  contentMix: {
    newPublications: 0.4    // 40% publicaciones nuevas
    trending: 0.2           // 20% contenido trending
    recommendations: 0.2    // 20% recomendaciones IA
    userNetwork: 0.1        // 10% actividad de red del usuario
    promoted: 0.1           // 10% contenido promocionado
  }
}
```

### Implementación de Scroll Infinito

```typescript
// API endpoint para newsfeed
GET /api/newsfeed?page=1&limit=20&userId=123

// Respuesta
{
  "items": [
    {
      "type": "publication",
      "contentId": "pub_123",
      "score": 0.95,
      "reasons": ["near_you", "matches_interests"],
      "publication": { /* datos completos */ }
    }
  ],
  "hasMore": true,
  "nextPage": 2
}
```

---

## 🤖 IA Y MACHINE LEARNING

### 1. Embeddings Vectoriales

```typescript
// Generar embeddings para búsqueda semántica
const titleEmbedding = await generateEmbedding(publication.title)
const descriptionEmbedding = await generateEmbedding(publication.description)

// Almacenar en colección separada para performance
await db.collection('ai_embeddings').insertOne({
  contentId: publication._id,
  contentType: 'title',
  embedding: titleEmbedding,
  metadata: {
    category: publication.category.slug,
    location: publication.location.city,
    language: publication.location.language
  }
})
```

### 2. Sistema de Recomendaciones

```typescript
// Algoritmo híbrido: content-based + collaborative filtering
const recommendations = await generateRecommendations(userId, {
  contentBased: {
    weight: 0.6,
    factors: ['category', 'location', 'price_range', 'keywords']
  },
  collaborativeFiltering: {
    weight: 0.3,
    factors: ['similar_users', 'interaction_patterns']
  },
  locationBased: {
    weight: 0.1,
    radius: 10 // km
  }
})
```

### 3. Análisis de Contenido Automático

```typescript
// Procesar publicación con IA al momento de creación
const aiAnalysis = await analyzePublication(publication)

publication.ai = {
  ...publication.ai,
  extractedKeywords: aiAnalysis.keywords,
  autoTags: aiAnalysis.tags,
  sentiment: aiAnalysis.sentiment,
  qualityScore: aiAnalysis.quality,
  suggestedCategories: aiAnalysis.categories,
  priceRecommendation: aiAnalysis.pricing
}
```

---

## 🔍 BASES DE DATOS VECTORIALES

### Configuración de Vector Search

```javascript
// Crear índice vectorial en MongoDB Atlas
db.ai_embeddings.createIndex({
  "embedding": "vector"
}, {
  "vectorOptions": {
    "dimension": 768,        // Dimensiones del modelo
    "similarity": "cosine"   // Métrica de similitud
  }
})

// Búsqueda vectorial
const results = await db.ai_embeddings.aggregate([
  {
    "$vectorSearch": {
      "index": "vector_index",
      "path": "embedding", 
      "queryVector": userQueryEmbedding,
      "numCandidates": 100,
      "limit": 10
    }
  }
])
```

### Búsqueda Semántica Multimodal

```typescript
// Búsqueda por texto + imagen + ubicación
const searchResults = await semanticSearch({
  text: "casa moderna en cusco",
  image: uploadedImageBase64,
  location: {
    lat: -13.5319,
    lng: -71.9675,
    radius: 10
  },
  filters: {
    category: "inmuebles",
    priceRange: { min: 200000, max: 500000 }
  }
})
```

---

## ⚡ ESCALABILIDAD Y PERFORMANCE

### 1. Índices Optimizados

```javascript
// Índices geoespaciales para búsqueda local
db.publications.createIndex({ "location.coordinates": "2dsphere" })

// Índices compuestos para queries comunes
db.publications.createIndex({
  "location.city": 1,
  "category.slug": 1, 
  "timestamps.createdAt": -1
})

// Índices para newsfeed
db.publications.createIndex({
  "engagement.trendinessScore": -1,
  "timestamps.createdAt": -1
})
```

### 2. Caching Estratégico

```typescript
// Cache de newsfeed por usuario
const cacheKey = `newsfeed:${userId}:${page}`
const cachedResults = await redis.get(cacheKey)

if (!cachedResults) {
  const results = await generateNewsfeed(userId, page)
  await redis.setex(cacheKey, 300, JSON.stringify(results)) // 5 min
  return results
}

return JSON.parse(cachedResults)
```

### 3. Agregaciones Precomputadas

```javascript
// Pipeline para trending content
db.publications.aggregate([
  {
    $match: {
      "timestamps.createdAt": { $gte: new Date(Date.now() - 24*60*60*1000) }
    }
  },
  {
    $group: {
      _id: "$location.city",
      trendingScore: { 
        $sum: { 
          $multiply: ["$engagement.views", "$engagement.engagementRate"] 
        }
      },
      publications: { $push: "$$ROOT" }
    }
  },
  {
    $out: "trending_by_city" // Guardar resultado precomputado
  }
])
```

---

## 🚀 IMPLEMENTACIÓN PRÁCTICA

### 1. Configuración Inicial

```bash
# 1. Configurar MongoDB con sharding
mongosh --eval "sh.enableSharding('buscadis')"

# 2. Crear shards por región
mongosh --eval "
sh.shardCollection('buscadis.publications_southamerica', {
  'location.country': 1, 
  'location.region': 1
})
"

# 3. Configurar índices
node scripts/setup-indexes.js
```

### 2. Variables de Entorno

```env
# Base de datos principal
MONGODB_URI=mongodb+srv://cluster.mongodb.net/buscadis
MONGODB_DB=buscadis

# Configuración de sharding
MONGODB_SHARD_SA=mongodb+srv://shard-sa.mongodb.net/
MONGODB_SHARD_NA=mongodb+srv://shard-na.mongodb.net/
MONGODB_SHARD_EU=mongodb+srv://shard-eu.mongodb.net/

# IA y ML
OPENAI_API_KEY=your_key_here
VECTOR_DB_URL=pinecone_or_weaviate_url

# Redis para caching
REDIS_URL=redis://localhost:6379
```

### 3. Script de Migración

```typescript
// scripts/migrate-to-global-structure.ts
import { migrateToGlobalStructure } from '@/scripts/migration'

await migrateToGlobalStructure({
  batchSize: 1000,
  enableValidation: true,
  generateEmbeddings: true,
  backupBeforeMigration: true
})
```

### 4. Monitoreo y Métricas

```typescript
// Métricas en tiempo real
const metrics = await getPerformanceMetrics()

console.log({
  activePublications: metrics.publications.active,
  searchLatency: metrics.search.avgLatency,
  aiProcessingQueue: metrics.ai.queueSize,
  userEngagement: metrics.engagement.dailyActive,
  geograficDistribution: metrics.geo.distribution
})
```

---

## 📈 ROADMAP DE IMPLEMENTACIÓN

### Fase 1: Base Sólida (1-2 meses)
- ✅ Implementar estructura básica de BD
- ✅ Configurar sharding geográfico
- ✅ Sistema de importación masiva
- ✅ Índices básicos de performance

### Fase 2: IA Básica (2-3 meses)
- 🔄 Integrar embeddings vectoriales
- 🔄 Sistema básico de recomendaciones
- 🔄 Análisis automático de contenido
- 🔄 Búsqueda semántica

### Fase 3: Red Social (3-4 meses)
- 📅 Newsfeed personalizado
- 📅 Sistema de engagement
- 📅 Trending content
- 📅 Análisis de user behavior

### Fase 4: IA Avanzada (4-6 meses)
- 📅 ML predictivo para precios
- 📅 Detección automática de fraude
- 📅 Moderación inteligente
- 📅 Optimización de conversiones

---

## 🎯 CONCLUSIÓN

Esta arquitectura te permitirá:

✅ **Escalar globalmente** sin problemas de performance
✅ **Importar millones** de adisos de manera eficiente  
✅ **Competir con gigantes** como Facebook Marketplace
✅ **IA de clase mundial** para recomendaciones y búsqueda
✅ **Red social** con engagement real
✅ **Búsqueda local** ultra-rápida en cualquier país
✅ **Flexibilidad total** para cualquier tipo de adiso

¿Listo para dominar el mundo de los clasificados? 🌍🚀 