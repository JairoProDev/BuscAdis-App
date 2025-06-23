# 🤖 GUÍA DE EXTRACCIÓN MANUAL CON IA

## 📋 CUÁNDO USAR ESTA OPCIÓN

Usa extracción manual con IA cuando:
- Los PDFs son de muy buena calidad
- Quieres máxima precisión en los datos
- Los PDFs tienen formatos complejos
- El script automático no funciona bien

---

## 🔧 HERRAMIENTAS NECESARIAS

### Para convertir PDF a texto:
```bash
# Opción 1: pdftotext (Linux/Mac)
sudo apt-get install poppler-utils  # Ubuntu/Debian
brew install poppler                 # macOS

# Opción 2: Online
# - https://www.pdf24.org/es/pdf-to-text
# - https://smallpdf.com/pdf-to-txt
```

### IAs recomendadas:
- **ChatGPT 4** (mejor para estructurar datos)
- **Claude 3.5 Sonnet** (mejor para textos largos)
- **Gemini Pro** (alternativa gratuita)

---

## 📖 PROCESO PASO A PASO

### PASO 1: Convertir PDF a Texto
```bash
# Si tienes pdftotext instalado
pdftotext revista_2023_01_15.pdf revista_2023_01_15.txt

# O subir el PDF a una herramienta online
```

### PASO 2: Preparar el Prompt para IA
Usa este prompt exacto (copiarlo completo):

```
Eres un experto extractor de avisos clasificados de revistas peruanas. Analiza este texto de revista y extrae TODOS los avisos en formato JSON.

CONTEXTO:
- Esta es una revista de avisos clasificados de Cusco, Perú
- Cada revista tiene entre 600-700 avisos
- Los avisos están en español
- Fecha de la revista: [INDICA LA FECHA AQUÍ]

ESTRUCTURA REQUERIDA para cada aviso:
{
  "title": "Título del aviso (máximo 150 caracteres)",
  "description": "Descripción completa del aviso",
  "category": "inmuebles|empleos|vehiculos|servicios|productos|eventos|comunidad|negocios",
  "subcategory": "departamentos|casas|terrenos|profesionales|autos|motos|etc",
  "location": "Ubicación (ciudad, distrito)",
  "contact": {
    "phone": "Número de teléfono principal",
    "whatsapp": "Número WhatsApp (si diferente o si se menciona)",
    "name": "Nombre del contacto (si aparece)"
  },
  "price": 1500,
  "currency": "PEN",
  "publishDate": "2023-01-15",
  "source": "Revista Clasificados Cusco Edición Enero 2023",
  "metadata": {
    "extractionMethod": "ai_manual",
    "confidence": 0.9
  }
}

REGLAS IMPORTANTES:
1. Extraer TODOS los avisos, no omitir ninguno
2. Si no hay precio, usar null
3. Si no hay teléfono, usar null pero intentar extraer email
4. Categorizar según el contenido:
   - inmuebles: casas, departamentos, terrenos, locales
   - empleos: trabajos, empleos, vacantes
   - vehiculos: autos, motos, camiones, bicicletas
   - servicios: servicios profesionales, clases, reparaciones
   - productos: productos para vender, equipos, muebles
   - eventos: espectáculos, fiestas, conciertos
   - comunidad: intercambios, busco/ofrezco, donaciones
   - negocios: negocios, inversiones, sociedades

5. Para subcategoría, ser específico:
   - inmuebles: "departamentos", "casas", "terrenos", "locales", "oficinas"
   - empleos: "profesionales", "servicios", "construccion", "ventas"
   - vehiculos: "autos", "motos", "camiones", "bicicletas"
   - servicios: "clases", "reparaciones", "construccion", "limpieza"
   - productos: "electrodomesticos", "muebles", "ropa", "equipos"

6. Mantener la fecha de publicación original de la revista
7. Incluir toda la información de contacto disponible

FORMATO DE SALIDA:
Retorna SOLO un array JSON válido con todos los avisos:
[
  { aviso 1 },
  { aviso 2 },
  ...
  { aviso N }
]

TEXTO DE LA REVISTA:
[AQUÍ PEGAR EL CONTENIDO DE LA REVISTA]
```

### PASO 3: Procesar con IA

1. **Abre ChatGPT/Claude**
2. **Pega el prompt completo**
3. **Reemplaza `[INDICA LA FECHA AQUÍ]` con la fecha real**
4. **Pega el texto del PDF al final**
5. **Envía y espera la respuesta**

### PASO 4: Guardar Resultados

```bash
# Crear archivo JSON con la respuesta de la IA
# Formato: YYYY-MM-DD_revista_nombre.json
echo '[RESPUESTA_DE_LA_IA]' > data/json-procesados/2023-01-15_revista_cusco.json
```

---

## 📊 EJEMPLO COMPLETO

### 1. PDF Original:
`revista_2023_01_15.pdf`

### 2. Texto Extraído:
```
REVISTA CLASIFICADOS CUSCO - 15 ENERO 2023

INMUEBLES
=========
CASA EN VENTA SAN BLAS
Hermosa casa colonial, 3 habitaciones, 2 baños, patio central.
Precio: S/ 350,000 soles
Contacto: María García - 984 123 456

DEPARTAMENTO ALQUILER CENTRO
Depa amoblado, 2 dormitorios, cocina equipada.
S/ 800 mensual
WhatsApp: 987 654 321

EMPLEOS
=======
SE BUSCA COCINERO
Restaurante en centro histórico requiere cocinero con experiencia.
Sueldo según experiencia.
Llamar al 084-231456 - Sr. Juan

...
```

### 3. Prompt para IA:
```
Eres un experto extractor de avisos clasificados... [PROMPT COMPLETO]

FECHA DE LA REVISTA: 2023-01-15

TEXTO DE LA REVISTA:
REVISTA CLASIFICADOS CUSCO - 15 ENERO 2023
...
```

### 4. Respuesta de IA:
```json
[
  {
    "title": "Casa en venta San Blas",
    "description": "Hermosa casa colonial, 3 habitaciones, 2 baños, patio central.",
    "category": "inmuebles",
    "subcategory": "casas",
    "location": "San Blas, Cusco",
    "contact": {
      "phone": "984123456",
      "whatsapp": null,
      "name": "María García"
    },
    "price": 350000,
    "currency": "PEN",
    "publishDate": "2023-01-15",
    "source": "Revista Clasificados Cusco Edición Enero 2023",
    "metadata": {
      "extractionMethod": "ai_manual",
      "confidence": 0.9
    }
  },
  {
    "title": "Departamento alquiler centro",
    "description": "Depa amoblado, 2 dormitorios, cocina equipada. S/ 800 mensual",
    "category": "inmuebles",
    "subcategory": "departamentos",
    "location": "Centro Histórico, Cusco",
    "contact": {
      "phone": "987654321",
      "whatsapp": "987654321",
      "name": null
    },
    "price": 800,
    "currency": "PEN",
    "publishDate": "2023-01-15",
    "source": "Revista Clasificados Cusco Edición Enero 2023",
    "metadata": {
      "extractionMethod": "ai_manual",
      "confidence": 0.9
    }
  }
]
```

### 5. Archivo Final:
`data/json-procesados/2023-01-15_revista_cusco.json`

---

## ✅ VERIFICACIÓN DE CALIDAD

### Revisa que cada aviso tenga:
- ✅ Título claro y descriptivo
- ✅ Descripción completa
- ✅ Categoría correcta (8 opciones disponibles)
- ✅ Subcategoría específica
- ✅ Al menos un método de contacto
- ✅ Fecha de publicación correcta
- ✅ Precio en PEN (si aplica)

### Conteo aproximado:
- **600-700 avisos** por revista
- **Si obtienes menos de 500**, revisar si falta contenido
- **Si obtienes más de 800**, revisar duplicados

---

## 🚀 VENTAJAS DE ESTE MÉTODO

✅ **Máxima precisión** (95-98% vs 85% automático)
✅ **Mejor categorización** (IA entiende contexto)
✅ **Extracción de datos complejos** (nombres, direcciones específicas)
✅ **Manejo de formatos irregulares**
✅ **Control total del proceso**

---

## ⚠️ CONSIDERACIONES

🔶 **Tiempo**: 20-30 minutos por revista
🔶 **Costo**: Si usas ChatGPT Plus ($20/mes)
🔶 **Límites**: ChatGPT tiene límite de tokens por mensaje
🔶 **Verificación**: Siempre revisar una muestra

---

## 🔄 PROCESAMIENTO DESPUÉS DE EXTRACCIÓN

Una vez tengas los archivos JSON:

```bash
# Continuar con el proceso normal
node scripts/validate-json-data.js
node scripts/massive-import.js
node scripts/create-indexes.js
node scripts/verify-import.js
```

---

## 💡 TIPS PARA MEJORES RESULTADOS

### 1. Preparación del texto:
- Usa OCR si el PDF es imagen
- Limpia caracteres especiales manualmente
- Divide textos muy largos

### 2. Prompt mejorado:
- Incluye ejemplos específicos de tu revista
- Menciona formatos particulares
- Ajusta categorías según tu contenido

### 3. Verificación:
- Compara resultados entre IAs
- Revisa avisos con precios muy altos/bajos
- Verifica números de teléfono

### 4. Iteración:
- Procesa 2-3 revistas primero
- Ajusta el prompt según resultados
- Escala a todas las revistas

---

## 🎯 OBJETIVO FINAL

Al completar 50 revistas manualmente tendrás:
- **30,000+ avisos** de máxima calidad
- **Precisión 95-98%** en extracción
- **Datos perfectamente categorizados**
- **Base sólida para machine learning futuro**

¡Tu plataforma BuscAdis será la más completa y precisa del mercado! 🚀 