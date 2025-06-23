# 📚 PLAN COMPLETO: PDF A BASE DE DATOS - BUSCADIS

## 🎯 OBJETIVO
Importar 50+ PDFs de revistas de avisos clasificados (~30,000-35,000 publicaciones) manteniendo fechas originales y estructura completa.

## 📊 SITUACIÓN ACTUAL
- **PDFs**: ~50 revistas
- **Frecuencia**: 2 por semana (a veces 1 cuando hay feriados)
- **Avisos por revista**: 600-700
- **Total estimado**: 30,000-35,000 publicaciones
- **Período**: 2023-2024
- **Publicaciones actuales en BD**: 201 (se eliminarán)

---

## 🔧 PASO 1: PREPARACIÓN DEL ENTORNO

### 1.1 Configuración MongoDB Atlas
```bash
# Tu base de datos actual está bien configurada
# MongoDB Atlas es PERFECTO para este volumen
# Recomendación: Mantener 1 sola base de datos con múltiples colecciones
```

**Estructura de colecciones recomendada:**
```
buscadis/
├── publications_inmuebles     # Casa, departamentos, terrenos
├── publications_empleos       # Ofertas de trabajo
├── publications_vehiculos     # Autos, motos, camiones
├── publications_servicios     # Servicios profesionales
├── publications_productos     # Productos varios
├── publications_eventos       # Eventos, espectáculos
├── publications_comunidad     # Comunidad, intercambios
└── publications_negocios      # Negocios, inversiones
```

### 1.2 Verificar Variables de Entorno
```bash
# En tu .env.local debe estar:
MONGODB_URI=mongodb+srv://tu-usuario:tu-password@cluster.mongodb.net/buscadis?retryWrites=true&w=majority
MONGODB_DB=buscadis
```

---

## 🤖 PASO 2: EXTRACCIÓN DE DATOS DE PDFs

### 2.1 Herramientas Recomendadas

**Opción A: Usando IA (Recomendado)**
```bash
# 1. Convertir PDF a texto plano
pdftotext revista_01.pdf revista_01.txt

# 2. Usar ChatGPT/Claude con prompt específico:
```

**PROMPT PARA IA:**
```
Eres un experto extractor de avisos clasificados de revistas. Analiza este texto de revista y extrae TODOS los avisos en formato JSON.

ESTRUCTURA REQUERIDA para cada aviso:
{
  "title": "Título del aviso",
  "description": "Descripción completa",
  "category": "inmuebles|empleos|vehiculos|servicios|productos|eventos|comunidad|negocios",
  "subcategory": "departamentos|casas|terrenos|etc",
  "location": "Ubicación (ciudad, distrito)",
  "contact": {
    "phone": "Número de teléfono",
    "whatsapp": "Número WhatsApp (si diferente)",
    "name": "Nombre del contacto"
  },
  "price": 1500,
  "currency": "PEN",
  "publishDate": "2024-03-15", // FECHA DE LA REVISTA
  "source": "Revista Clasificados Cusco Edición 45",
  "pageNumber": 12
}

REGLAS:
- Extraer TODOS los avisos, no omitir ninguno
- Si no hay precio, usar null
- Categorizar correctamente según el contenido
- Mantener la fecha de publicación original de la revista
- Incluir toda la información de contacto disponible

TEXTO DE LA REVISTA:
[Aquí pegas el contenido extraído del PDF]
```

**Opción B: Herramientas Automáticas**
```bash
# Instalar herramientas de extracción
npm install pdf2pic pdf-parse tesseract.js

# Script automático (crearemos uno)
node scripts/extract-pdf-data.js
```

### 2.2 Proceso por Lotes
```bash
# Organizar archivos
mkdir -p data/pdfs-originales
mkdir -p data/textos-extraidos  
mkdir -p data/json-procesados

# Procesar en orden cronológico (más antiguos primero)
```

---

## 📋 PASO 3: VALIDACIÓN Y LIMPIEZA DE DATOS

### 3.1 Script de Validación
```typescript
// Validar estructura de cada archivo JSON
interface ValidationResult {
  fileName: string
  totalAds: number
  validAds: number
  invalidAds: number
  errors: string[]
  dateRange: { start: string, end: string }
}
```

### 3.2 Campos Obligatorios
```typescript
const REQUIRED_FIELDS = [
  'title',        // Siempre requerido
  'description',  // Siempre requerido  
  'category',     // Siempre requerido
  'publishDate'   // Para mantener fechas históricas
]

const OPTIONAL_FIELDS = [
  'subcategory',
  'location',
  'contact',
  'price',
  'currency'
]
```

---

## 🗄️ PASO 4: ESTRUCTURA DE BASE DE DATOS FINAL

### 4.1 Modelo de Publicación Completo
```typescript
interface Publication {
  _id: ObjectId,
  
  // DATOS BÁSICOS
  title: string,
  description: string,
  slug: string, // Generado automáticamente
  
  // CATEGORIZACIÓN
  categorySlug: string, // "inmuebles", "empleos", etc.
  subcategorySlug?: string, // "departamentos", "casas", etc.
  subSubcategorySlug?: string, // "alquiler", "venta", etc.
  
  // UBICACIÓN
  location: {
    raw: string, // Texto original
    country: "Peru",
    region: "Cusco",
    city: string,
    district?: string,
    coordinates?: { lat: number, lng: number }
  },
  
  // CONTACTO
  contact: {
    name?: string,
    phones: string[],
    whatsapp?: string,
    email?: string,
    preferredMethod: "phone" | "whatsapp" | "email"
  },
  
  // PRECIO
  pricing: {
    amount?: number,
    currency: "PEN" | "USD",
    type: "fixed" | "negotiable" | "free",
    period?: "once" | "monthly" | "daily"
  },
  
  // METADATOS HISTÓRICOS (CLAVE)
  metadata: {
    publishDate: Date, // FECHA ORIGINAL DE LA REVISTA
    source: string, // "Revista Clasificados Cusco Ed. 45"
    pageNumber?: number,
    extractionMethod: "ai" | "manual" | "auto",
    extractionDate: Date, // Fecha de procesamiento
    originalRevision?: string // Nombre del PDF original
  },
  
  // ESTADO
  status: "active" | "historical" | "expired",
  
  // FECHAS DE SISTEMA
  createdAt: Date, // Fecha de inserción en BD
  updatedAt: Date
}
```

---

## 🚀 PASO 5: IMPORTACIÓN MASIVA

### 5.1 Script de Importación Optimizado

```bash
# Ejecutar importación por lotes
node scripts/massive-import.js --source="data/json-procesados" --batch-size=500
```

### 5.2 Estrategia de Importación
```typescript
// Orden de importación (más antiguos primero)
const IMPORT_ORDER = [
  'revista_2023_enero_01.json',
  'revista_2023_enero_02.json',
  // ... en orden cronológico
  'revista_2024_diciembre_02.json'
]

// Configuración de lotes
const BATCH_CONFIG = {
  batchSize: 500,           // 500 publicaciones por lote
  delayBetweenBatches: 1000, // 1 segundo entre lotes
  maxRetries: 3,            // Reintentos en caso de error
  validateBeforeInsert: true // Validar antes de insertar
}
```

---

## 🔍 PASO 6: VERIFICACIÓN Y PRUEBAS

### 6.1 Verificaciones Post-Importación
```typescript
// Verificar totales por categoría
const verification = {
  inmuebles: await db.collection('publications_inmuebles').countDocuments(),
  empleos: await db.collection('publications_empleos').countDocuments(),
  vehiculos: await db.collection('publications_vehiculos').countDocuments(),
  // ... otras categorías
}

// Verificar rangos de fechas
const dateRanges = await db.collection('publications_inmuebles').aggregate([
  {
    $group: {
      _id: null,
      minDate: { $min: "$metadata.publishDate" },
      maxDate: { $max: "$metadata.publishDate" },
      total: { $sum: 1 }
    }
  }
])
```

### 6.2 Pruebas de Funcionalidad
- ✅ Búsqueda por categoría funciona
- ✅ Filtros por fecha funcionan
- ✅ Paginación funciona
- ✅ Detalles de publicación se muestran
- ✅ Información de contacto visible

---

## 📝 PASO 7: CONFIGURACIÓN FINAL

### 7.1 Índices de Base de Datos
```javascript
// Crear índices para búsqueda optimizada
db.publications_inmuebles.createIndex({ "metadata.publishDate": -1 })
db.publications_inmuebles.createIndex({ "categorySlug": 1, "status": 1 })
db.publications_inmuebles.createIndex({ "location.city": 1 })
db.publications_inmuebles.createIndex({ "pricing.amount": 1 })
```

### 7.2 Configuración de la Aplicación
```typescript
// En src/config/constants.ts
export const HISTORICAL_DATA_CONFIG = {
  showHistoricalAds: true,
  historicalDateRange: {
    start: '2023-01-01',
    end: '2024-12-31'
  },
  defaultSortOrder: 'publishDate_desc', // Más recientes primero
  enableDateFilters: true
}
```

---

## ⚡ CRONOGRAMA DE EJECUCIÓN

### Semana 1: Preparación
- [ ] Configurar entorno de extracción
- [ ] Procesar primeros 5 PDFs como prueba
- [ ] Validar calidad de extracción

### Semana 2: Extracción Masiva  
- [ ] Extraer todos los PDFs (45 restantes)
- [ ] Validar y limpiar datos
- [ ] Preparar archivos JSON finales

### Semana 3: Importación
- [ ] Eliminar 201 publicaciones actuales
- [ ] Importar datos históricos en orden cronológico
- [ ] Verificar integridad de datos

### Semana 4: Pruebas y Optimización
- [ ] Probar funcionalidad completa
- [ ] Optimizar rendimiento
- [ ] Crear índices adicionales si es necesario

---

## 🛠️ HERRAMIENTAS Y SCRIPTS NECESARIOS

1. **extract-pdf-data.js** - Extractor automático de PDFs
2. **validate-json-data.js** - Validador de estructura JSON  
3. **massive-import.js** - Importador masivo optimizado
4. **verify-import.js** - Verificador post-importación
5. **create-indexes.js** - Creador de índices de BD

¿Empezamos con la creación de estos scripts? 🚀 