# 📚 GUÍA COMPLETA DE IMPORTACIÓN MASIVA - BUSCADIS

## 🎯 OBJETIVO
Importar 50+ PDFs de revistas con 30,000+ avisos clasificados manteniendo fechas originales.

---

## 📋 PRERREQUISITOS

### 1. Estructura de Directorios
```bash
# Crear estructura de directorios
mkdir -p data/pdfs-originales
mkdir -p data/textos-extraidos
mkdir -p data/json-procesados
mkdir -p data/json-validados
mkdir -p data/import-reports
mkdir -p data/verification-reports
```

### 2. Variables de Entorno
```bash
# En tu .env.local
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/buscadis?retryWrites=true&w=majority
MONGODB_DB=buscadis
```

### 3. Dependencias Adicionales
```bash
# Instalar dependencias para procesamiento de PDFs
npm install pdf-parse pdf2pic tesseract.js

# Para Linux/Ubuntu (OCR)
sudo apt-get install tesseract-ocr tesseract-ocr-spa

# Para macOS (OCR)
brew install tesseract tesseract-lang
```

---

## 🚀 PROCESO COMPLETO

### PASO 1: Colocar PDFs Originales
```bash
# Copiar todos tus PDFs a:
cp /ruta/a/tus/pdfs/*.pdf data/pdfs-originales/

# Renombrar archivos con fecha para orden cronológico (recomendado)
# Formato sugerido: YYYY-MM-DD_revista_nombre.pdf
# Ejemplo: 2023-01-15_revista_cusco_01.pdf
```

### PASO 2: Extracción Automática de PDFs
```bash
# Ejecutar extractor automático
node scripts/extract-pdf-data.js

# Esto creará:
# - data/textos-extraidos/*.txt (texto plano extraído)
# - data/json-procesados/*.json (avisos estructurados)
```

**Salida esperada:**
```
🚀 INICIANDO EXTRACCIÓN MASIVA DE PDFs
=====================================
📄 Encontrados 50 archivos PDF
🔄 Procesando lote 1/10
📖 Procesando: 2023-01-15_revista_cusco_01.pdf
   🔍 Extrayendo avisos del texto...
   📊 Encontrados 650 avisos potenciales
✅ 2023-01-15_revista_cusco_01.pdf: 620 avisos extraídos
...
🎉 EXTRACCIÓN COMPLETADA
📄 PDFs procesados: 50/50
📊 Total avisos extraídos: 31,250
```

### PASO 3: Validación y Limpieza de Datos
```bash
# Validar archivos JSON extraídos
node scripts/validate-json-data.js

# Esto creará:
# - data/json-validados/*.json (archivos limpios y validados)
# - data/validation-reports/ (reportes de validación)
```

**Salida esperada:**
```
🔍 INICIANDO VALIDACIÓN DE ARCHIVOS JSON
========================================
📄 Encontrados 50 archivos JSON
🔍 Validando: 2023-01-15_revista_cusco_01.json
✅ 2023-01-15_revista_cusco_01.json: 598/620 avisos válidos
...
✅ VALIDACIÓN COMPLETADA
📄 Archivos procesados: 50/50
📊 Avisos totales: 31,250
✅ Avisos válidos: 29,876
❌ Avisos inválidos: 1,374
📈 Tasa de éxito: 95.6%
```

### PASO 4: Importación Masiva a Base de Datos
```bash
# IMPORTANTE: Respaldar datos actuales (opcional)
# El script preguntará si deseas eliminar datos existentes

# Ejecutar importación masiva
node scripts/massive-import.js

# El script te preguntará:
# - ¿Continuar con la importación? (s/N)
# - ¿Eliminar publicaciones existentes? (s/N)
```

**Proceso interactivo:**
```
🚀 INICIANDO IMPORTACIÓN MASIVA
===============================

📊 INFORMACIÓN DEL PROCESO
===========================
📄 Archivos a procesar: 50
📊 Total publicaciones: 29,876
🗄️  Base de datos: buscadis

📈 DISTRIBUCIÓN POR CATEGORÍAS:
   inmuebles: 8,245
   empleos: 6,780
   vehiculos: 4,890
   servicios: 3,450
   productos: 2,890
   eventos: 1,890
   comunidad: 1,120
   negocios: 611

❓ ¿Continuar con la importación? (s/N): s
❓ ¿Eliminar publicaciones existentes antes de importar? (s/N): s

🔌 Conectando a MongoDB Atlas...
✅ Conectado a MongoDB Atlas

📦 Creando backup de datos actuales...
📁 Backup guardado en: data/import-reports/backup_1703001234567

🧹 Limpiando datos existentes...
✅ Total eliminados: 201 documentos

📄 [1/50] Procesando: 2023-01-15_revista_cusco_01.json
   📊 598 publicaciones a importar
   📁 inmuebles: 165 publicaciones
      ✅ Lote 1: 165 insertados
   📁 empleos: 142 publicaciones
      ✅ Lote 1: 142 insertados
   ...

🎉 IMPORTACIÓN COMPLETADA
=========================
⏱️  Duración: 12m 45s
📄 Archivos: 50/50
📊 Publicaciones: 29,876/29,876
📈 Tasa de éxito: 100.0%
```

### PASO 5: Crear Índices de Base de Datos
```bash
# Crear índices optimizados para búsqueda rápida
node scripts/create-indexes.js

# Esto optimizará las consultas de la aplicación
```

**Salida esperada:**
```
🔍 INICIANDO CREACIÓN DE ÍNDICES
=================================

📚 Procesando colección: inmuebles
   📊 8,245 documentos encontrados
   🔍 1 índices existentes
     🔨 Creando "status_1"...
     ✅ "status_1" creado
     🔨 Creando "createdAt_-1"...
     ✅ "createdAt_-1" creado
     ...
   📈 Resultado: 12 creados, 1 omitidos (2,340ms)

🎉 CREACIÓN DE ÍNDICES COMPLETADA
✅ Índices creados: 84
```

### PASO 6: Verificación Final
```bash
# Verificar que todo esté funcionando correctamente
node scripts/verify-import.js
```

**Salida esperada:**
```
🔍 INICIANDO VERIFICACIÓN DE IMPORTACIÓN
========================================

📊 Verificando conteos básicos...
   inmuebles: 8,245 publicaciones
   empleos: 6,780 publicaciones
   vehiculos: 4,890 publicaciones
   ...
   📈 TOTAL: 29,876 publicaciones

🔍 Verificando integridad de datos...
   Problemas encontrados:
   - Títulos faltantes: 0
   - Descripciones faltantes: 12
   - Contacto faltante: 156

🔍 Probando consultas de ejemplo...
   ✅ "Búsqueda por categoría": 165 resultados en 23ms
   ✅ "Búsqueda por precio": 89 resultados in 18ms
   ...

==================================================
📋 RESUMEN DE VERIFICACIÓN
==================================================

🟢 RESULTADO GENERAL: EXCELLENT
📊 Puntuación: 94/100
📈 Total publicaciones: 29,876

✅ inmuebles: 8,245
✅ empleos: 6,780
✅ vehiculos: 4,890
...

🎉 CONCLUSIÓN:
   ¡Importación exitosa! Los datos están listos para uso en producción.
```

---

## 🔧 COMANDOS ADICIONALES

### Limpiar y Reiniciar
```bash
# Eliminar todos los archivos procesados (empezar de cero)
rm -rf data/textos-extraidos/*
rm -rf data/json-procesados/*
rm -rf data/json-validados/*
rm -rf data/*-reports/*

# Eliminar índices de base de datos
node scripts/create-indexes.js drop
```

### Análisis y Mantenimiento
```bash
# Analizar uso de índices
node scripts/create-indexes.js analyze

# Ver estadísticas detalladas de la base de datos
node scripts/verify-import.js --detailed
```

### Procesar Solo Algunos Archivos
```bash
# Mover archivos específicos a un directorio temporal
mkdir data/pdfs-test
cp data/pdfs-originales/2023-01-15_revista_cusco_01.pdf data/pdfs-test/

# Cambiar CONFIG.inputDir en los scripts o crear scripts específicos
```

---

## 📊 ESTRUCTURA DE DATOS FINAL

### Base de Datos
```
buscadis/
└── adisos                     (29,876 docs - unified collection)
    ├── category: inmuebles     (8,245 docs)
    ├── category: empleos       (6,780 docs)
    ├── category: vehiculos     (4,890 docs)
    ├── category: servicios     (3,450 docs)
    ├── category: productos     (2,890 docs)
    ├── category: eventos       (1,890 docs)
    ├── category: comunidad     (1,120 docs)
    └── category: negocios      (611 docs)
```

### Documento de Ejemplo
```json
{
  "_id": "ObjectId",
  "id": "pub_1703001234567_abc123",
  "title": "Casa en venta San Blas - 3 habitaciones",
  "description": "Hermosa casa colonial de 3 habitaciones...",
  "slug": "casa-venta-san-blas-3-habitaciones",
  
  "category": "inmuebles",
  "categorySlug": "inmuebles",
  "subcategory": "casas",
  "subcategorySlug": "casas",
  
  "location": "San Blas, Cusco",
  "price": 350000,
  "currency": "PEN",
  
  "contactPhone": "+51 984 123 456",
  "contactName": "María García",
  
  "images": [],
  
  "status": "active",
  "createdAt": "2023-01-15T08:00:00Z",
  "updatedAt": "2024-12-19T15:30:00Z",
  
  "importMetadata": {
    "sourceFile": "2023-01-15_revista_cusco_01.json",
    "importedAt": "2024-12-19T15:30:00Z",
    "method": "massive_import"
  }
}
```

---

## ⚠️ SOLUCIÓN DE PROBLEMAS

### Error: "MONGODB_URI no está configurada"
```bash
# Verificar variables de entorno
echo $MONGODB_URI

# Si está vacía, agregar a .env.local
echo "MONGODB_URI=tu_uri_de_mongodb" >> .env.local
```

### Error: "No se encontraron archivos PDF"
```bash
# Verificar que los PDFs están en el directorio correcto
ls -la data/pdfs-originales/

# Deben ser archivos .pdf (extensión en minúsculas)
```

### Error de memoria en extracción
```bash
# Procesar en lotes más pequeños
# Editar CONFIG.batchSize en extract-pdf-data.js de 5 a 2
```

### Índices lentos o consultas lentas
```bash
# Verificar uso de índices
node scripts/create-indexes.js analyze

# Recrear índices si es necesario
node scripts/create-indexes.js drop
node scripts/create-indexes.js
```

---

## 📈 MONITOREO Y MANTENIMIENTO

### Verificación Periódica
```bash
# Ejecutar verificación mensual
node scripts/verify-import.js > monthly-report.txt

# Enviar reporte por email (opcional)
```

### Backup Automático
```bash
# Crear backup antes de cambios importantes
# El script massive-import.js ya hace backup automático
```

### Actualización de Datos
```bash
# Para agregar nuevas revistas:
# 1. Colocar nuevos PDFs en data/pdfs-originales/
# 2. Ejecutar solo los pasos 2-6 sin eliminar datos existentes
# 3. El script detectará y omitirá duplicados automáticamente
```

---

## 🎯 RESULTADOS ESPERADOS

Al completar todo el proceso tendrás:

✅ **29,876+ publicaciones** importadas en MongoDB Atlas
✅ **8 categorías** bien distribuidas y organizadas
✅ **Índices optimizados** para búsqueda rápida
✅ **Fechas históricas** preservadas (2023-2024)
✅ **Datos limpios** y validados
✅ **Aplicación funcional** con contenido real
✅ **Reportes completos** de todo el proceso

**¡Tu plataforma BuscAdis estará lista para competir con los mejores marketplaces del mundo!** 🚀 