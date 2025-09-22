# 🤖 GUÍA COMPLETA DE EXTRACCIÓN DE DATOS CON IA

## BuscaDis - Procesamiento de 20,000+ Adisos Históricos

Esta guía te ayudará a procesar eficientemente todos los adisos históricos de las revistas usando IA (Gemini, ChatGPT, Claude, etc.).

## 📊 VISIÓN GENERAL DEL PROYECTO

### Números del Proyecto
- **20,000+ adisos** desde diciembre 2024
- **2 revistas por semana** = 6-8 revistas por mes
- **650 adisos promedio** por revista
- **Alto porcentaje de repetición** (mismos anunciantes)
- **Valor estratégico enorme** para entrenamiento de IA

### Beneficios Estratégicos
1. **🏛️ Sensación de antigüedad y confianza**
2. **📈 Contenido abundante desde día 1**
3. **🎯 Funcionalidad de autocompletado inteligente**
4. **🤖 Entrenamiento de IA para generación de adisos**
5. **📊 Análisis de mercado y competencia histórica**
6. **💰 Identificación de potenciales clientes premium**

## 🔄 PROCESO DE EXTRACCIÓN CON IA

### Paso 1: Preparación del Texto
```bash
# Ejemplo del formato de texto que tienes:
Alquilo departamento amplio consta de 4 
dormitorios, sala-comedor, cocina, hall, baño, 
lavandería y azotea en 4to. piso; ubicado en Urb. 
Lucrepata E-9, Cusco. Razón Cel. 991535226.

COLEGIO PRIVADO
Requiere Coordinadora pedagógica, secretaria, 
profesora de nivel primario, docente de 
Comunicación. También Auxiliares y Personal 
de limpieza. Enviar CV a los WhatsApp 979721481, 
953521124.
```

### Paso 2: Prompt Optimizado para IA

```prompt
Eres un experto en extracción de datos de adisos clasificados. 
Analiza el siguiente texto de adisos de revista peruana y extrae CADA ANUNCIO INDIVIDUAL.

INSTRUCCIONES:
1. Separa cada adiso individual (están separados por espacios o cambios de tema)
2. Para cada adiso, extrae la información en formato JSON
3. Si no encuentras algún dato, usa null
4. Mantén el texto original completo

FORMATO JSON REQUERIDO:
{
  "adisos": [
    {
      "textoOriginal": "texto completo del adiso",
      "titulo": "título extraído (máximo 60 caracteres)",
      "descripcion": "descripción resumida",
      "categoria": "inmuebles|empleos|vehiculos|servicios|productos|educacion|salud|turismo|mascotas",
      "subcategoria": "específica de la categoría",
      "tipo": "venta|alquiler|servicio|trabajo|intercambio|busco",
      "precio": {
        "monto": number,
        "moneda": "PEN|USD",
        "periodo": "mensual|diario|único|por_hora"
      },
      "ubicacion": {
        "direccion": "dirección completa si está disponible",
        "barrio": "barrio/urbanización",
        "distrito": "distrito",
        "referencias": ["referencias mencionadas"]
      },
      "contacto": {
        "telefonos": ["números de teléfono"],
        "whatsapp": ["números de WhatsApp"],
        "emails": ["correos electrónicos"],
        "metodoPreferido": "telefono|whatsapp|email"
      },
      "caracteristicas": ["características especiales mencionadas"],
      "urgencia": "baja|media|alta",
      "calidad": 1-10,
      "fechaEstimada": "fecha de publicación si se menciona"
    }
  ]
}

TEXTO A ANALIZAR:
[AQUÍ PONES TU TEXTO]
```

### Paso 3: Procesamiento por Lotes

#### Opción A: Con ChatGPT/Claude
```javascript
// Dividir el texto en lotes de ~500 adisos
const lotes = dividirTextoEnLotes(textoCompleto, 500);

for (let i = 0; i < lotes.length; i++) {
  const resultado = await procesarConIA(lotes[i]);
  guardarResultado(`lote_${i}.json`, resultado);
}
```

#### Opción B: Con Gemini
```python
import google.generativeai as genai

def procesar_adisos_con_gemini(texto_adisos):
    model = genai.GenerativeModel('gemini-pro')
    
    prompt = f"""
    [PROMPT OPTIMIZADO AQUÍ]
    
    TEXTO: {texto_adisos}
    """
    
    response = model.generate_content(prompt)
    return response.text
```

## 📁 ESTRUCTURA DE ARCHIVOS RECOMENDADA

```
/datos-historicos/
├── /originales/
│   ├── revista_cusco_2024_01.txt
│   ├── revista_cusco_2024_02.txt
│   └── ...
├── /procesados/
│   ├── lote_001_procesado.json
│   ├── lote_002_procesado.json
│   └── ...
├── /consolidados/
│   ├── todos_los_adisos.json
│   ├── adisos_deduplicados.json
│   └── adisos_para_ia.json
└── /estadisticas/
    ├── resumen_por_categoria.json
    ├── analisis_contactos.json
    └── insights_mercado.json
```

## 🎯 ESTRATEGIAS DE EXTRACCIÓN ESPECÍFICAS

### Para Inmuebles
```json
{
  "categoria": "inmuebles",
  "subcategoria": "departamentos|casas|terrenos|locales|oficinas",
  "detalles_especificos": {
    "habitaciones": number,
    "baños": number,
    "area": number,
    "estado": "nuevo|usado|a_estrenar",
    "servicios": ["agua", "luz", "internet"],
    "amoblado": boolean
  }
}
```

### Para Empleos
```json
{
  "categoria": "empleos",
  "subcategoria": "profesional|tecnico|operario|ventas|servicios",
  "detalles_especificos": {
    "puesto": "título del puesto",
    "experiencia_requerida": "años o nivel",
    "horario": "tiempo_completo|medio_tiempo|por_horas",
    "salario": number,
    "beneficios": ["planilla", "alimentacion", "transporte"]
  }
}
```

### Para Vehículos
```json
{
  "categoria": "vehiculos",
  "subcategoria": "autos|motos|camiones|buses",
  "detalles_especificos": {
    "marca": "marca del vehículo",
    "modelo": "modelo",
    "año": number,
    "kilometraje": number,
    "combustible": "gasolina|diesel|glp|electrico",
    "estado": "nuevo|usado|para_repuestos"
  }
}
```

## 🔍 DETECCIÓN DE DUPLICADOS

### Estrategia de Deduplicación
```javascript
function detectarDuplicados(adisos) {
  const duplicados = [];
  
  for (let i = 0; i < adisos.length; i++) {
    for (let j = i + 1; j < adisos.length; j++) {
      const similitud = calcularSimilitud(
        adisos[i].textoOriginal,
        adisos[j].textoOriginal
      );
      
      if (similitud > 0.85) {
        duplicados.push({
          original: adisos[i],
          duplicado: adisos[j],
          similitud: similitud
        });
      }
    }
  }
  
  return duplicados;
}
```

### Criterios de Duplicación
1. **Exacto**: Texto idéntico (100% similar)
2. **Casi idéntico**: >95% similar (pequeños cambios)
3. **Variante**: 85-95% similar (mismo adiso, diferentes detalles)
4. **Republicación**: Mismo contacto, mismo tipo, diferente fecha

## 📊 ANÁLISIS DE DATOS EXTRAÍDOS

### Métricas Clave a Extraer
```javascript
const estadisticas = {
  resumen_general: {
    total_adisos: number,
    adisos_unicos: number,
    porcentaje_duplicados: number,
    calidad_promedio: number
  },
  
  por_categoria: {
    inmuebles: { cantidad: number, precio_promedio: number },
    empleos: { cantidad: number, salario_promedio: number },
    vehiculos: { cantidad: number, precio_promedio: number },
    // ... más categorías
  },
  
  analisis_temporal: {
    publicaciones_por_mes: {},
    tendencias_precio: {},
    estacionalidad: {}
  },
  
  analisis_geografico: {
    zonas_mas_activas: [],
    distribucion_por_distrito: {},
    precios_por_zona: {}
  },
  
  analisis_contactos: {
    tipos_contacto_preferidos: {},
    numeros_mas_frecuentes: [],
    empresas_identificadas: []
  }
};
```

## 🤖 PREPARACIÓN PARA IA

### Dataset para Entrenamiento
```json
{
  "id": "unique_id",
  "input": "texto original del adiso",
  "output": {
    "categoria_predicha": "categoria",
    "titulo_generado": "título optimizado",
    "descripcion_mejorada": "descripción SEO-friendly",
    "precio_sugerido": number,
    "palabras_clave": ["keyword1", "keyword2"],
    "calidad_score": 1-100
  },
  "metadata": {
    "fecha_original": "2024-12-01",
    "revista_origen": "El Cusco",
    "numero_edicion": "123",
    "verificado_humano": boolean
  }
}
```

### Casos de Uso para IA Entrenada
1. **Autocompletado Inteligente**: Sugerir información basada en historial
2. **Generación de Adisos**: Crear adisos optimizados automáticamente
3. **Optimización de Precios**: Sugerir precios competitivos
4. **Mejora de Contenido**: Optimizar títulos y descripciones
5. **Detección de Spam**: Identificar adisos de baja calidad
6. **Recomendaciones Personalizadas**: Mostrar adisos relevantes

## 🔧 HERRAMIENTAS RECOMENDADAS

### Para Procesamiento de Texto
- **Python**: `pandas`, `nltk`, `spacy`
- **JavaScript**: `natural`, `compromise`
- **Regex**: Para extracción de patrones específicos

### Para IA
- **OpenAI GPT-4**: Mejor para análisis complejo
- **Google Gemini**: Bueno para volúmenes grandes
- **Claude**: Excelente para estructuración de datos
- **Llama Local**: Para procesamiento privado

### Para Almacenamiento
- **MongoDB**: Para datos estructurados flexibles
- **PostgreSQL**: Para análisis relacionales complejos
- **Elasticsearch**: Para búsquedas avanzadas

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Preparación (1-2 días)
- [ ] Organizar archivos de texto por revista/fecha
- [ ] Definir estructura JSON final
- [ ] Configurar herramientas de IA
- [ ] Crear scripts de procesamiento

### Fase 2: Extracción Masiva (3-5 días)
- [ ] Procesar lotes de 500-1000 adisos
- [ ] Validar calidad de extracción
- [ ] Ajustar prompts según resultados
- [ ] Consolidar datos extraídos

### Fase 3: Limpieza y Deduplicación (2-3 días)
- [ ] Ejecutar algoritmos de deduplicación
- [ ] Validar manualmente muestras aleatorias
- [ ] Corregir categorización automática
- [ ] Enriquecer datos geográficos

### Fase 4: Integración (2-3 días)
- [ ] Importar a base de datos de producción
- [ ] Configurar índices de búsqueda
- [ ] Implementar vista Netflix
- [ ] Probar funcionalidades de autocompletado

### Fase 5: Optimización (1-2 días)
- [ ] Entrenar modelos de IA personalizados
- [ ] Configurar sistemas de recomendación
- [ ] Implementar analytics y métricas
- [ ] Documentar proceso para futuras extracciones

## 💡 TIPS PARA ÉXITO

### Optimización de Prompts
1. **Sé específico** con los formatos de salida
2. **Incluye ejemplos** de buenas extracciones
3. **Maneja errores** con prompts de recuperación
4. **Valida resultados** con scripts automatizados

### Gestión de Calidad
1. **Muestrea aleatoriamente** 5% para validación manual
2. **Establece métricas** de calidad mínima
3. **Implementa bucles** de retroalimentación
4. **Documenta patrones** de error comunes

### Escalabilidad
1. **Procesa en paralelo** cuando sea posible
2. **Usa caching** para evitar reprocesamiento
3. **Implementa checkpoints** para reanudar trabajo
4. **Monitorea costos** de API de IA

## 🎯 RESULTADOS ESPERADOS

Al completar este proceso tendrás:

- ✅ **20,000+ adisos estructurados** listos para usar
- ✅ **Base de datos robusta** para análisis y IA  
- ✅ **Vista Netflix** con contenido abundante
- ✅ **Sistema de autocompletado** inteligente
- ✅ **Insights de mercado** únicos y valiosos
- ✅ **Ventaja competitiva** significativa
- ✅ **Dataset para IA** de clase mundial

¡Con esta data histórica, BuscaDis tendrá una ventaja competitiva única en el mercado peruano! 🚀 