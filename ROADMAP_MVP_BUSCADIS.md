# 🚀 ROADMAP MVP BUSCADIS - Vista Netflix + Datos Históricos

## 📋 ESTADO ACTUAL IDENTIFICADO
- ✅ Diseño de PublicationCard funciona bien
- ❌ No implementada vista Netflix/Facebook Marketplace por filas
- ❌ Adisos de ejemplo, no conectados a MongoDB Atlas
- ❌ Buscador no funcional con base de datos real
- ❌ Filtros y categorías no conectados
- 🔄 201 adisos actuales en Atlas (a eliminar)
- 📊 20,000+ adisos históricos por procesar

## 🎯 FASES DEL ROADMAP

### FASE 1: PREPARACIÓN Y LIMPIEZA (1-2 días) 🧹

#### 1.1 Respaldo y Limpieza de Datos
- [ ] **TÚ**: Hacer backup de los 201 adisos actuales si necesitas
- [ ] **TÚ**: Limpiar colección de publicaciones en MongoDB Atlas
- [ ] **TÚ**: Verificar estructura de base de datos actual
- [ ] **YO**: Crear script de migración para nueva estructura

#### 1.2 Preparación de Datos Históricos  
- [ ] **TÚ**: Organizar archivos de revistas por fechas
- [ ] **TÚ**: Extraer texto de PDFs de revistas (OCR si es necesario)
- [ ] **TÚ**: Crear archivo con estructura: fecha_revista + texto_adisos
- [ ] **YO**: Configurar procesador masivo para tus datos específicos

### FASE 2: IMPLEMENTACIÓN VISTA NETFLIX (2-3 días) 🎬

#### 2.1 Modificar Página Principal
- [ ] **YO**: Integrar NetflixView en página principal
- [ ] **YO**: Adaptar tu PublicationCard existente para filas Netflix
- [ ] **YO**: Implementar scroll horizontal por categorías
- [ ] **YO**: Conectar con MongoDB Atlas real

#### 2.2 Sistema de Filas Dinámicas
- [ ] **YO**: Crear filas: Destacados, Recientes, Por Categoría, Próximos a Vencer
- [ ] **YO**: Implementar "Ver todos" para cada fila
- [ ] **YO**: Sistema de scroll infinito dentro de cada fila
- [ ] **YO**: Responsive design para móviles

#### 2.3 Conexión con Base de Datos
- [ ] **YO**: Conectar NetflixViewService con MongoDB
- [ ] **YO**: Crear consultas optimizadas por categorías
- [ ] **YO**: Implementar caché para mejor rendimiento
- [ ] **YO**: Sistema de actualización automática de filas

### FASE 3: PROCESAMIENTO MASIVO HISTÓRICO (2-3 días) 📊

#### 3.1 Extracción con IA
- [ ] **TÚ**: Usar Gemini/ChatGPT con prompts optimizados que creé
- [ ] **TÚ**: Procesar lotes de 500-1000 adisos
- [ ] **TÚ**: Validar calidad de extracción en muestras
- [ ] **YO**: Script para importación masiva a MongoDB

#### 3.2 Estructura de Adisos Históricos
- [ ] **YO**: Implementar sistema de estado (activo/histórico/reactivado)
- [ ] **YO**: Campo para fecha original vs fecha de reactivación
- [ ] **YO**: Historial de reactivaciones por adiso
- [ ] **YO**: Sistema de ocultación de contactos para adisos vencidos

#### 3.3 Importación y Validación
- [ ] **YO**: Script de importación con validaciones
- [ ] **YO**: Detección de duplicados automática
- [ ] **YO**: Asignación automática de categorías
- [ ] **TÚ**: Revisión manual de categorización en muestras

### FASE 4: FUNCIONALIDADES CORE (2-3 días) 🔍

#### 4.1 Buscador Funcional
- [ ] **YO**: Conectar barra de búsqueda con MongoDB
- [ ] **YO**: Búsqueda por texto, categoría, ubicación, precio
- [ ] **YO**: Autocompletado basado en datos reales
- [ ] **YO**: Filtros avanzados funcionales

#### 4.2 Sistema de Filtros
- [ ] **YO**: Filtros por categoría conectados a DB
- [ ] **YO**: Filtros por ubicación funcionales
- [ ] **YO**: Filtros por rango de precios
- [ ] **YO**: Filtros por fecha de publicación

#### 4.3 Gestión de Estados de Adisos
- [ ] **YO**: Lógica para adisos activos vs históricos
- [ ] **YO**: Botones de contacto condicionalmente mostrados
- [ ] **YO**: Sistema de reactivación de adisos
- [ ] **YO**: Dashboard para gestión de reactivaciones

### FASE 5: FUNCIONES AVANZADAS (1-2 días) ⚡

#### 5.1 Sistema de Reactivación
- [ ] **YO**: Interface para reactivar adisos vencidos
- [ ] **YO**: Historial de reactivaciones visible
- [ ] **YO**: Cálculo automático de nuevas fechas de vencimiento
- [ ] **YO**: Notificaciones de próximo vencimiento

#### 5.2 Analytics y Métricas
- [ ] **YO**: Tracking de views por adiso
- [ ] **YO**: Métricas por categoría y ubicación
- [ ] **YO**: Dashboard básico de estadísticas
- [ ] **YO**: Reportes de adisos más populares

### FASE 6: TESTING Y OPTIMIZACIÓN (1-2 días) ✅

#### 6.1 Testing Completo
- [ ] **AMBOS**: Probar búsqueda con datos reales
- [ ] **AMBOS**: Validar filtros y categorías
- [ ] **AMBOS**: Probar vista Netflix en diferentes dispositivos
- [ ] **AMBOS**: Test de rendimiento con 20k+ adisos

#### 6.2 Optimización
- [ ] **YO**: Optimizar consultas MongoDB
- [ ] **YO**: Implementar lazy loading para imágenes
- [ ] **YO**: Caché de consultas frecuentes
- [ ] **YO**: Optimización para móviles

## 🔧 LO QUE NECESITO QUE HAGAS TÚ

### INMEDIATO (Hoy):
1. **Preparar datos de revistas**:
   ```
   - Organizar por fecha: revista_2024_01_15.txt, revista_2024_01_22.txt, etc.
   - Cada archivo con el texto completo de adisos de esa edición
   - Incluir metadatos: fecha_publicacion, numero_edicion, nombre_revista
   ```

2. **Proporcionar acceso a MongoDB Atlas**:
   - String de conexión actualizada
   - Confirmar estructura actual de colecciones
   - Permisos para eliminar/crear datos

3. **Validar diseño actual**:
   - Confirmar que quieres mantener el estilo de PublicationCard
   - Especificar si hay cambios de diseño requeridos

### EXTRACCIÓN CON IA (Mañana):
1. **Usar este prompt con Gemini/ChatGPT**:
```
Eres un experto en extracción de adisos clasificados peruanos. 
Procesa esta página de revista "Rueda de Negocios" y extrae CADA adiso individual.

REGLAS IMPORTANTES:
- Separar cada adiso claramente
- Mantener texto original completo
- Extraer información de contacto (teléfonos, WhatsApp, emails)
- Identificar categoría (inmuebles, empleos, vehículos, servicios, etc.)
- Detectar precios en soles peruanos
- Identificar ubicaciones (distritos, calles, referencias)

FORMATO JSON REQUERIDO:
{
  "fecha_revista": "2024-07-25",
  "numero_edicion": "2547",
  "adisos": [
    {
      "texto_original": "texto completo del adiso",
      "titulo": "título extraído (max 60 chars)",
      "categoria": "inmuebles|empleos|vehiculos|servicios|productos|educacion|otros",
      "subcategoria": "específica",
      "tipo": "venta|alquiler|servicio|trabajo|busco",
      "precio": {"monto": 1200, "moneda": "PEN", "periodo": "mensual"},
      "ubicacion": {"distrito": "Cusco", "referencia": "Av. La Cultura"},
      "contacto": {"telefonos": ["984123456"], "whatsapp": ["984123456"]},
      "urgencia": "baja|media|alta",
      "fecha_original": "2024-07-25"
    }
  ]
}

TEXTO DE REVISTA:
[AQUÍ PEGAS EL TEXTO DE CADA PÁGINA]
```

## 🎯 LO QUE HARÉ YO

### INMEDIATO (Hoy):
1. **Crear componente HomePage con vista Netflix**
2. **Adaptar tu PublicationCard para filas horizontales**
3. **Conectar con MongoDB Atlas real**
4. **Implementar buscador funcional**

### MAÑANA:
1. **Script de procesamiento masivo**
2. **Sistema de estados de adisos**
3. **Funcionalidad de reactivación**
4. **Optimizaciones de rendimiento**

## 📊 ESTRUCTURA DE DATOS FINAL

```javascript
// Adiso en MongoDB
{
  _id: ObjectId,
  // DATOS BÁSICOS
  titulo: "Casa amplia en San Blas",
  descripcion: "Hermosa casa de 3 dormitorios...",
  categoria: "inmuebles",
  subcategoria: "casas",
  tipo: "alquiler",
  
  // PRECIOS
  precio: {
    monto: 1200,
    moneda: "PEN",
    periodo: "mensual"
  },
  
  // UBICACIÓN
  ubicacion: {
    distrito: "Cusco",
    direccion: "Urb. San Blas A-15",
    coordenadas: { lat: -13.5181, lng: -71.9785 }
  },
  
  // CONTACTO (oculto si está vencido)
  contacto: {
    telefonos: ["984123456"],
    whatsapp: ["984123456"],
    emails: ["contacto@email.com"],
    visible: true/false
  },
  
  // FECHAS Y ESTADO
  fecha_original: "2024-01-15",
  fecha_publicacion: "2024-01-15", // puede cambiar con reactivaciones
  fecha_vencimiento: "2024-01-18",
  estado: "activo|vencido|historico",
  
  // HISTORIAL
  reactivaciones: [
    {
      fecha: "2024-02-01",
      nueva_fecha_vencimiento: "2024-02-04",
      costo: 25
    }
  ],
  
  // METADATOS
  fuente: "revista",
  revista_original: "Rueda de Negocios 2547",
  views: 150,
  calidad_score: 85,
  es_premium: false,
  
  // DATOS HISTÓRICOS
  texto_original: "Alquilo casa amplia...",
  datos_extraccion: {
    metodo: "ia",
    confianza: 92,
    fecha_procesamiento: "2024-12-20"
  }
}
```

## ✅ CRITERIOS DE ÉXITO

### MVP Completo cuando tengamos:
- [ ] Vista Netflix funcional con filas por categorías
- [ ] 20,000+ adisos históricos procesados e importados  
- [ ] Buscador conectado a base de datos real
- [ ] Filtros funcionales (categoría, ubicación, precio, fecha)
- [ ] Sistema de estados (activo/histórico) funcionando
- [ ] Botones de contacto condicionalmente visibles
- [ ] Sistema de reactivación básico implementado
- [ ] Responsive design funcionando
- [ ] Rendimiento optimizado para grandes volúmenes

## 🚨 DECISIONES CRÍTICAS PENDIENTES

1. **¿Elimino los 201 adisos actuales de Atlas?** ✅ Confirmado
2. **¿Mantienes el diseño actual de PublicationCard?** ⏳ Pendiente confirmación
3. **¿Qué hacer con adisos sin fecha específica?** ⏳ Pendiente decisión
4. **¿Costo de reactivación de adisos históricos?** ⏳ Pendiente definir

---

## 🏁 PRÓXIMOS PASOS INMEDIATOS

### HOY (Viernes):
1. **TÚ**: Prepara archivos de texto de revistas organizados por fecha
2. **TÚ**: Proporciona string de conexión MongoDB Atlas
3. **YO**: Implemento vista Netflix en homepage
4. **YO**: Conecto buscador con base de datos real

### MAÑANA (Sábado):
1. **TÚ**: Procesa primeros lotes con IA (500-1000 adisos)
2. **YO**: Script de importación masiva
3. **AMBOS**: Testing con datos reales

¿Estás listo para empezar? ¿Necesitas que ajuste algo del roadmap? 