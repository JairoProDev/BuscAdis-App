/**
 * EJEMPLO PRÁCTICO DE IMPORTACIÓN MASIVA
 * Demuestra cómo importar miles de anuncios a BuscAdis
 */

import { importPublications, BulkPublicationImporter } from '@/scripts/bulk-import-publications'

// =============================================================================
// EJEMPLO 1: IMPORTACIÓN BÁSICA DESDE CSV
// =============================================================================

async function importFromCSV() {
  console.log('🚀 Iniciando importación desde CSV...')
  
  // Archivo CSV de ejemplo: anuncios_cusco.csv
  // titulo,descripcion,categoria,subcategoria,ciudad,telefono,precio,imagen
  // "Casa en San Blas","Hermosa casa colonial...","inmuebles","casas","Cusco","+51984123456","350000","https://..."
  
  const result = await importPublications(
    './data/anuncios_cusco.csv',
    'BASIC_CSV',
    {
      processing: {
        batchSize: 100,        // Procesar de 100 en 100
        enableAI: true,        // Activar análisis con IA
        generateSlugs: true,   // Generar URLs amigables
        geocodeAddresses: true,// Convertir direcciones a coordenadas
        generateThumbnails: false,
        extractKeywords: true, // Extraer palabras clave automáticamente
        detectLanguage: true
      },
      validation: {
        strictMode: false,     // Modo permisivo
        requiredFields: ['titulo', 'descripcion', 'categoria']
      },
      output: {
        insertToDatabase: true,  // Insertar en MongoDB
        generateJSONFile: true,  // Generar archivo de respaldo
        logLevel: 'detailed'     // Logs detallados
      }
    }
  )
  
  console.log(`✅ Importación completada:`)
  console.log(`   📥 Importados: ${result.imported}`)
  console.log(`   ❌ Errores: ${result.errors}`)
  
  return result
}

// =============================================================================
// EJEMPLO 2: IMPORTACIÓN PERSONALIZADA DESDE TEXTO
// =============================================================================

async function importFromText() {
  console.log('🚀 Iniciando importación desde texto plano...')
  
  // Configuración personalizada para texto plano
  const config = {
    sourceFile: './data/anuncios_texto.txt',
    sourceFormat: 'txt' as const,
    
    // Mapeo personalizado para texto
    mapping: {
      title: (row: Record<string, unknown>) => {
        // Primer línea como título
        const lines = (row.rawText as string).split('\n')
        return lines[0] || 'Sin título'
      },
      
      description: (row: Record<string, unknown>) => {
        // Todo el texto como descripción
        return (row.rawText as string)
      },
      
      category: (row: Record<string, unknown>) => {
        // Detectar categoría automáticamente del texto
        const text = (row.rawText as string).toLowerCase()
        if (text.includes('casa') || text.includes('departamento')) return 'inmuebles'
        if (text.includes('auto') || text.includes('carro')) return 'vehiculos'
        if (text.includes('trabajo') || text.includes('empleo')) return 'empleos'
        return 'productos'
      },
      
      location: {
        city: (row: Record<string, unknown>) => {
          // Extraer ciudad del texto
          const text = (row.rawText as string).toLowerCase()
          if (text.includes('cusco')) return 'Cusco'
          if (text.includes('lima')) return 'Lima'
          if (text.includes('arequipa')) return 'Arequipa'
          return 'Cusco' // Por defecto
        },
        region: () => 'Cusco',
        country: () => 'Peru'
      },
      
      contact: {
        phone: (row: Record<string, unknown>) => {
          // Extraer teléfono con regex
          const phoneRegex = /(\+?51)?[\s-]?9\d{8}/g
          const matches = (row.rawText as string).match(phoneRegex)
          return matches ? matches[0] : undefined
        },
        
        email: (row: Record<string, unknown>) => {
          // Extraer email con regex
          const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
          const matches = (row.rawText as string).match(emailRegex)
          return matches ? matches[0] : undefined
        }
      },
      
      pricing: {
        price: (row: Record<string, unknown>) => {
          // Extraer precio con regex
          const priceRegex = /S\/?\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g
          const matches = (row.rawText as string).match(priceRegex)
          if (matches) {
            const price = matches[0].replace(/S\/?\s?/, '').replace(/,/g, '')
            return parseFloat(price)
          }
          return 0
        },
        currency: () => 'PEN',
        type: () => 'negotiable'
      }
    },
    
    validation: {
      strictMode: false,
      requiredFields: ['title']
    },
    
    processing: {
      batchSize: 50,
      enableAI: true,
      generateSlugs: true,
      geocodeAddresses: false,
      generateThumbnails: false,
      extractKeywords: true,
      detectLanguage: true
    },
    
    output: {
      insertToDatabase: true,
      generateJSONFile: true,
      outputPath: './results/import_texto_results.json',
      logLevel: 'verbose' as const
    }
  }
  
  const importer = new BulkPublicationImporter(config)
  const result = await importer.import()
  
  console.log(`✅ Importación de texto completada:`)
  console.log(`   📥 Importados: ${result.imported}`)
  console.log(`   ❌ Errores: ${result.errors}`)
  
  return result
}

// =============================================================================
// EJEMPLO 3: IMPORTACIÓN COMPLEJA CON VALIDACIONES PERSONALIZADAS
// =============================================================================

async function importWithCustomValidation() {
  console.log('🚀 Iniciando importación con validaciones personalizadas...')
  
  const config = {
    sourceFile: './data/anuncios_completos.json',
    sourceFormat: 'json' as const,
    
    mapping: {
      title: 'titulo',
      description: 'descripcion', 
      category: 'categoria',
      subcategory: 'subcategoria',
      
      location: {
        country: 'pais',
        region: 'departamento',
        city: 'ciudad',
        district: 'distrito',
        address: 'direccion',
        coordinates: {
          lat: 'latitud',
          lng: 'longitud'
        }
      },
      
      contact: {
        phone: 'telefono',
        whatsapp: 'whatsapp',
        email: 'email'
      },
      
      pricing: {
        price: 'precio',
        currency: 'moneda',
        type: 'tipo_precio'
      },
      
      media: {
        images: 'imagenes',
        mainImage: 'imagen_principal'
      }
    },
    
    validation: {
      strictMode: true,
      requiredFields: ['titulo', 'descripcion', 'categoria', 'ciudad'],
      
      // Validaciones personalizadas
      customValidators: {
        titulo: (value: string) => !!(value && value.length >= 10 && value.length <= 100),
        descripcion: (value: string) => !!(value && value.length >= 50 && value.length <= 2000),
        precio: (value: number) => !value || (value > 0 && value < 10000000),
        telefono: (value: string) => {
          if (!value) return true // Campo opcional
          const phoneRegex = /^(\+51)?9\d{8}$/
          return phoneRegex.test(value.replace(/\s|-/g, ''))
        },
        email: (value: string) => {
          if (!value) return true // Campo opcional
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          return emailRegex.test(value)
        }
      }
    },
    
    processing: {
      batchSize: 200,
      enableAI: true,
      generateSlugs: true,
      geocodeAddresses: true,
      generateThumbnails: true,
      extractKeywords: true,
      detectLanguage: true
    },
    
    output: {
      insertToDatabase: true,
      generateJSONFile: true,
      outputPath: './results/import_completo_results.json',
      logLevel: 'detailed' as const
    }
  }
  
  const importer = new BulkPublicationImporter(config)
  const result = await importer.import()
  
  console.log(`✅ Importación compleja completada:`)
  console.log(`   📥 Importados: ${result.imported}`)
  console.log(`   ❌ Errores: ${result.errors}`)
  
  // Mostrar estadísticas detalladas
  if (result.results) {
    const categories = result.results
      .filter(r => r.success && r.publication)
      .reduce((acc: Record<string, unknown>, r: Record<string, unknown>) => {
        const cat = (r.publication as { category?: { name?: string } })?.category?.name || 'Sin categoría'
        acc[cat] = (acc[cat] || 0) + 1
        return acc
      }, {})
    
    console.log('\n📊 Distribución por categorías:')
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} anuncios`)
    })
  }
  
  return result
}

// =============================================================================
// EJEMPLO 4: FUNCIÓN PARA GENERAR DATOS DE PRUEBA
// =============================================================================

export function generateSampleData() {
  const categories = ['inmuebles', 'vehiculos', 'empleos', 'productos', 'servicios']
  const cities = ['Cusco', 'Lima', 'Arequipa', 'Trujillo', 'Chiclayo']
  const sampleData = []
  
  for (let i = 0; i < 1000; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)]
    const city = cities[Math.floor(Math.random() * cities.length)]
    
    sampleData.push({
      titulo: `${category} en ${city} ${i + 1}`,
      descripcion: `Descripción detallada del ${category} número ${i + 1} ubicado en ${city}. Este es un ejemplo de anuncio generado automáticamente para pruebas del sistema de importación masiva.`,
      categoria: category,
      ciudad: city,
      telefono: `+51984${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`,
      email: `contacto${i + 1}@ejemplo.com`,
      precio: Math.floor(Math.random() * 500000) + 10000,
      moneda: 'PEN'
    })
  }
  
  return {
    publications: sampleData,
    metadata: {
      source: 'generated_sample_data',
      importDate: new Date().toISOString(),
      totalCount: sampleData.length,
      region: 'Peru',
      language: 'es',
      currency: 'PEN'
    }
  }
}

// =============================================================================
// EJEMPLO 5: MONITOREO DE IMPORTACIÓN EN TIEMPO REAL
// =============================================================================

async function importWithMonitoring() {
  console.log('🚀 Iniciando importación con monitoreo en tiempo real...')
  
  // Generar datos de prueba
  const sampleData = generateSampleData()
  
  // Guardar en archivo temporal
  import fs from 'fs'
  const tempFile = './temp/sample_data.json'
  fs.writeFileSync(tempFile, JSON.stringify(sampleData, null, 2))
  
  const config = {
    sourceFile: tempFile,
    sourceFormat: 'json' as const,
    
    mapping: {
      title: 'titulo',
      description: 'descripcion',
      category: 'categoria',
      location: {
        city: 'ciudad',
        region: () => 'Cusco',
        country: () => 'Peru'
      },
      contact: {
        phone: 'telefono',
        email: 'email'
      },
      pricing: {
        price: 'precio',
        currency: 'moneda',
        type: () => 'fixed'
      }
    },
    
    validation: {
      strictMode: false,
      requiredFields: ['titulo', 'descripcion']
    },
    
           processing: {
         batchSize: 100,
         enableAI: true,
         generateSlugs: true,
         geocodeAddresses: false,
         generateThumbnails: false,
         extractKeywords: true,
         detectLanguage: false
       },
    
    output: {
      insertToDatabase: true,
      generateJSONFile: true,
      logLevel: 'verbose' as const
    }
  }
  
  // Crear importador con monitoreo
  const importer = new BulkPublicationImporter(config)
  
  // Hooks de monitoreo (si los implementas)
  // importer.onProgress = (progress) => {
  //   console.log(`⏳ Progreso: ${progress.processed}/${progress.total} (${progress.percentage}%)`)
  // }
  
  // importer.onBatchComplete = (batchResult) => {
  //   console.log(`✅ Lote completado: ${batchResult.successful}/${batchResult.total}`)
  // }
  
  const result = await importer.import()
  
  // Limpiar archivo temporal
  fs.unlinkSync(tempFile)
  
  console.log(`✅ Importación con monitoreo completada:`)
  console.log(`   📥 Total procesados: ${result.imported + result.errors}`)
  console.log(`   ✅ Exitosos: ${result.imported}`)
  console.log(`   ❌ Con errores: ${result.errors}`)
  console.log(`   📈 Tasa de éxito: ${((result.imported / (result.imported + result.errors)) * 100).toFixed(2)}%`)
  
  return result
}

// =============================================================================
// FUNCIÓN PRINCIPAL PARA EJECUTAR EJEMPLOS
// =============================================================================

export async function runImportExamples() {
  try {
    console.log('🌟 INICIANDO EJEMPLOS DE IMPORTACIÓN MASIVA DE BUSCADIS')
    console.log('=' .repeat(60))
    
    // Ejemplo 1: CSV básico
    console.log('\n1️⃣ EJEMPLO 1: Importación desde CSV')
    console.log('-'.repeat(40))
    // await importFromCSV()
    
    // Ejemplo 2: Texto plano
    console.log('\n2️⃣ EJEMPLO 2: Importación desde texto')
    console.log('-'.repeat(40))
    // await importFromText()
    
    // Ejemplo 3: JSON con validaciones
    console.log('\n3️⃣ EJEMPLO 3: Importación con validaciones')
    console.log('-'.repeat(40))
    // await importWithCustomValidation()
    
    // Ejemplo 4: Con monitoreo
    console.log('\n4️⃣ EJEMPLO 4: Importación con monitoreo')
    console.log('-'.repeat(40))
    await importWithMonitoring()
    
    console.log('\n🎉 TODOS LOS EJEMPLOS COMPLETADOS EXITOSAMENTE')
    
  } catch (error) {
    console.error('❌ Error en ejemplos de importación:', error)
    throw error
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  runImportExamples()
    .then(() => {
      console.log('✨ Proceso completado')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error)
      process.exit(1)
    })
}

const importExample = {
  importFromCSV,
  importFromText,
  importWithCustomValidation,
  importWithMonitoring,
  generateSampleData,
  runImportExamples
}

export default importExample 