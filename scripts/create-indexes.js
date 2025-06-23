/**
 * CREADOR DE ÍNDICES - BUSCADIS
 * Crea índices optimizados para búsqueda rápida después de importación masiva
 */

const { MongoClient } = require('mongodb');

// Configuración
const CONFIG = {
  dbName: process.env.MONGODB_DB || 'buscadis',
  uri: process.env.MONGODB_URI,
  
  // Colecciones por categoría
  categoryCollections: {
    inmuebles: 'publications_inmuebles',
    empleos: 'publications_empleos',
    vehiculos: 'publications_vehiculos',
    servicios: 'publications_servicios',
    productos: 'publications_productos',
    eventos: 'publications_eventos',
    comunidad: 'publications_comunidad',
    negocios: 'publications_negocios'
  }
};

/**
 * Definición de índices a crear
 */
const INDEXES = {
  // Índices básicos para todas las colecciones
  common: [
    // Índice principal para estado
    { key: { status: 1 }, name: 'status_1' },
    
    // Índice para fechas (más recientes primero)
    { key: { createdAt: -1 }, name: 'createdAt_-1' },
    
    // Índice compuesto para filtros básicos
    { key: { status: 1, createdAt: -1 }, name: 'status_1_createdAt_-1' },
    
    // Índice para categorización
    { key: { categorySlug: 1 }, name: 'categorySlug_1' },
    { key: { categorySlug: 1, subcategorySlug: 1 }, name: 'categorySlug_1_subcategorySlug_1' },
    
    // Índice para ubicación
    { key: { location: 1 }, name: 'location_1' },
    
    // Índice para precios
    { key: { price: 1 }, name: 'price_1' },
    { key: { currency: 1, price: 1 }, name: 'currency_1_price_1' },
    
    // Índices de texto para búsqueda
    { key: { title: 'text', description: 'text' }, name: 'title_text_description_text' },
    
    // Índice único para evitar duplicados (si tiene slug)
    { key: { slug: 1 }, name: 'slug_1', unique: true, sparse: true },
    
    // Índices compuestos para búsquedas complejas
    { key: { categorySlug: 1, status: 1, createdAt: -1 }, name: 'category_status_date' },
    { key: { status: 1, price: 1, createdAt: -1 }, name: 'status_price_date' },
    { key: { location: 1, categorySlug: 1, status: 1 }, name: 'location_category_status' }
  ],
  
  // Índices específicos por categoría
  specific: {
    inmuebles: [
      // Búsquedas por características de inmuebles
      { key: { 'attributes.bedrooms': 1 }, name: 'bedrooms_1', sparse: true },
      { key: { 'attributes.bathrooms': 1 }, name: 'bathrooms_1', sparse: true },
      { key: { 'attributes.area': 1 }, name: 'area_1', sparse: true },
      { key: { 'attributes.propertyType': 1 }, name: 'propertyType_1', sparse: true },
      
      // Búsquedas compuestas para inmuebles
      { key: { subcategorySlug: 1, price: 1, 'attributes.area': 1 }, name: 'type_price_area' },
      { key: { location: 1, 'attributes.bedrooms': 1, price: 1 }, name: 'location_bedrooms_price' }
    ],
    
    empleos: [
      // Búsquedas por tipo de empleo
      { key: { 'attributes.jobType': 1 }, name: 'jobType_1', sparse: true },
      { key: { 'attributes.experience': 1 }, name: 'experience_1', sparse: true },
      { key: { 'attributes.salary': 1 }, name: 'salary_1', sparse: true },
      { key: { 'attributes.schedule': 1 }, name: 'schedule_1', sparse: true },
      
      // Búsquedas compuestas para empleos
      { key: { subcategorySlug: 1, location: 1, 'attributes.salary': 1 }, name: 'job_location_salary' }
    ],
    
    vehiculos: [
      // Búsquedas por características de vehículos
      { key: { 'attributes.brand': 1 }, name: 'brand_1', sparse: true },
      { key: { 'attributes.model': 1 }, name: 'model_1', sparse: true },
      { key: { 'attributes.year': 1 }, name: 'year_1', sparse: true },
      { key: { 'attributes.mileage': 1 }, name: 'mileage_1', sparse: true },
      { key: { 'attributes.fuelType': 1 }, name: 'fuelType_1', sparse: true },
      
      // Búsquedas compuestas para vehículos
      { key: { 'attributes.brand': 1, 'attributes.model': 1, 'attributes.year': 1 }, name: 'brand_model_year' },
      { key: { subcategorySlug: 1, price: 1, 'attributes.year': 1 }, name: 'type_price_year' }
    ],
    
    servicios: [
      // Búsquedas por tipo de servicio
      { key: { 'attributes.serviceType': 1 }, name: 'serviceType_1', sparse: true },
      { key: { 'attributes.availability': 1 }, name: 'availability_1', sparse: true },
      
      // Búsquedas compuestas para servicios
      { key: { subcategorySlug: 1, location: 1, 'attributes.serviceType': 1 }, name: 'service_location_type' }
    ],
    
    productos: [
      // Búsquedas por características de productos
      { key: { 'attributes.brand': 1 }, name: 'brand_1', sparse: true },
      { key: { 'attributes.condition': 1 }, name: 'condition_1', sparse: true },
      { key: { 'attributes.category': 1 }, name: 'productCategory_1', sparse: true },
      
      // Búsquedas compuestas para productos
      { key: { 'attributes.condition': 1, price: 1, createdAt: -1 }, name: 'condition_price_date' }
    ],
    
    eventos: [
      // Búsquedas por características de eventos
      { key: { 'attributes.eventDate': 1 }, name: 'eventDate_1', sparse: true },
      { key: { 'attributes.eventType': 1 }, name: 'eventType_1', sparse: true },
      { key: { 'attributes.venue': 1 }, name: 'venue_1', sparse: true },
      
      // Búsquedas compuestas para eventos
      { key: { 'attributes.eventDate': 1, location: 1 }, name: 'date_location' }
    ],
    
    comunidad: [
      // Búsquedas por tipo de actividad comunitaria
      { key: { 'attributes.activityType': 1 }, name: 'activityType_1', sparse: true },
      { key: { 'attributes.targetGroup': 1 }, name: 'targetGroup_1', sparse: true }
    ],
    
    negocios: [
      // Búsquedas por tipo de negocio
      { key: { 'attributes.businessType': 1 }, name: 'businessType_1', sparse: true },
      { key: { 'attributes.investment': 1 }, name: 'investment_1', sparse: true },
      { key: { 'attributes.sector': 1 }, name: 'sector_1', sparse: true },
      
      // Búsquedas compuestas para negocios
      { key: { 'attributes.businessType': 1, price: 1 }, name: 'business_price' }
    ]
  }
};

/**
 * Clase principal para crear índices
 */
class IndexCreator {
  constructor() {
    this.client = null;
    this.db = null;
    this.stats = {
      totalIndexes: 0,
      createdIndexes: 0,
      errors: [],
      timing: {}
    };
  }

  /**
   * Crear todos los índices
   */
  async createAllIndexes() {
    console.log('🔍 INICIANDO CREACIÓN DE ÍNDICES');
    console.log('=================================');
    
    try {
      // Conectar a base de datos
      await this.connectToDatabase();
      
      // Crear índices para cada colección
      for (const [category, collectionName] of Object.entries(CONFIG.categoryCollections)) {
        console.log(`\n📚 Procesando colección: ${category}`);
        await this.createIndexesForCollection(category, collectionName);
      }
      
      // Mostrar estadísticas finales
      this.printFinalStats();
      
    } catch (error) {
      console.error('❌ Error creando índices:', error);
      throw error;
    } finally {
      if (this.client) {
        await this.client.close();
      }
    }
  }

  /**
   * Conectar a base de datos
   */
  async connectToDatabase() {
    console.log('\n🔌 Conectando a MongoDB Atlas...');
    
    if (!CONFIG.uri) {
      throw new Error('MONGODB_URI no está configurada');
    }
    
    this.client = new MongoClient(CONFIG.uri);
    await this.client.connect();
    this.db = this.client.db(CONFIG.dbName);
    
    console.log('✅ Conectado exitosamente');
  }

  /**
   * Crear índices para una colección específica
   */
  async createIndexesForCollection(category, collectionName) {
    const startTime = Date.now();
    
    try {
      const collection = this.db.collection(collectionName);
      
      // Verificar si la colección tiene documentos
      const documentCount = await collection.countDocuments();
      
      if (documentCount === 0) {
        console.log(`   ⚠️  Colección vacía, omitiendo índices`);
        return;
      }
      
      console.log(`   📊 ${documentCount.toLocaleString()} documentos encontrados`);
      
      // Obtener índices existentes
      const existingIndexes = await collection.indexes();
      const existingIndexNames = existingIndexes.map(idx => idx.name);
      
      console.log(`   🔍 ${existingIndexes.length} índices existentes`);
      
      // Preparar lista de índices a crear
      const indexesToCreate = [...INDEXES.common];
      
      // Agregar índices específicos de la categoría
      if (INDEXES.specific[category]) {
        indexesToCreate.push(...INDEXES.specific[category]);
      }
      
      let createdCount = 0;
      let skippedCount = 0;
      
      // Crear cada índice
      for (const indexSpec of indexesToCreate) {
        try {
          // Verificar si el índice ya existe
          if (existingIndexNames.includes(indexSpec.name)) {
            console.log(`     ⏭️  "${indexSpec.name}" ya existe`);
            skippedCount++;
            continue;
          }
          
          // Crear el índice
          console.log(`     🔨 Creando "${indexSpec.name}"...`);
          
          const indexOptions = {
            name: indexSpec.name,
            background: true // Crear en background para no bloquear
          };
          
          // Agregar opciones específicas
          if (indexSpec.unique) indexOptions.unique = true;
          if (indexSpec.sparse) indexOptions.sparse = true;
          
          await collection.createIndex(indexSpec.key, indexOptions);
          
          console.log(`     ✅ "${indexSpec.name}" creado`);
          createdCount++;
          this.stats.createdIndexes++;
          
          // Pequeña pausa para no sobrecargar el servidor
          await this.sleep(100);
          
        } catch (error) {
          // Manejar errores específicos
          if (error.code === 85) {
            // Índice ya existe con diferente especificación
            console.log(`     ⚠️  "${indexSpec.name}" existe con especificación diferente`);
            skippedCount++;
          } else if (error.code === 86) {
            // Conflicto de índice
            console.log(`     ⚠️  Conflicto con "${indexSpec.name}"`);
            skippedCount++;
          } else {
            console.error(`     ❌ Error creando "${indexSpec.name}":`, error.message);
            this.stats.errors.push({
              collection: collectionName,
              index: indexSpec.name,
              error: error.message
            });
          }
        }
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      this.stats.timing[category] = duration;
      this.stats.totalIndexes += indexesToCreate.length;
      
      console.log(`   📈 Resultado: ${createdCount} creados, ${skippedCount} omitidos (${duration}ms)`);
      
    } catch (error) {
      console.error(`   ❌ Error procesando colección ${collectionName}:`, error.message);
      this.stats.errors.push({
        collection: collectionName,
        error: error.message
      });
    }
  }

  /**
   * Verificar performance de índices creados
   */
  async verifyIndexPerformance() {
    console.log('\n⚡ Verificando performance de índices...');
    
    const testQueries = [
      { query: { status: 'active' }, description: 'Filtro por estado' },
      { query: { categorySlug: 'inmuebles' }, description: 'Filtro por categoría' },
      { query: { status: 'active', createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }, description: 'Filtro compuesto' }
    ];
    
    for (const [category, collectionName] of Object.entries(CONFIG.categoryCollections)) {
      try {
        const collection = this.db.collection(collectionName);
        const documentCount = await collection.countDocuments();
        
        if (documentCount > 0) {
          console.log(`   🔍 Probando ${category}...`);
          
          for (const testQuery of testQueries) {
            const start = Date.now();
            
            const explainResult = await collection
              .find(testQuery.query)
              .limit(10)
              .explain('executionStats');
            
            const executionTime = Date.now() - start;
            const usedIndex = explainResult.executionStats.executionStages?.indexName || 'COLLSCAN';
            
            console.log(`     ${testQuery.description}: ${executionTime}ms (${usedIndex})`);
          }
        }
        
      } catch (error) {
        console.error(`   ❌ Error verificando ${category}:`, error.message);
      }
    }
  }

  /**
   * Listar todos los índices creados
   */
  async listAllIndexes() {
    console.log('\n📋 ÍNDICES POR COLECCIÓN');
    console.log('=========================');
    
    for (const [category, collectionName] of Object.entries(CONFIG.categoryCollections)) {
      try {
        const collection = this.db.collection(collectionName);
        const indexes = await collection.indexes();
        
        console.log(`\n📚 ${category} (${collectionName}):`);
        indexes.forEach(index => {
          const keyString = Object.entries(index.key)
            .map(([field, direction]) => `${field}: ${direction}`)
            .join(', ');
          
          console.log(`   - ${index.name}: { ${keyString} }`);
        });
        
      } catch (error) {
        console.error(`   ❌ Error listando índices de ${category}:`, error.message);
      }
    }
  }

  /**
   * Imprimir estadísticas finales
   */
  printFinalStats() {
    console.log('\n🎉 CREACIÓN DE ÍNDICES COMPLETADA');
    console.log('=================================');
    console.log(`📊 Índices totales procesados: ${this.stats.totalIndexes}`);
    console.log(`✅ Índices creados: ${this.stats.createdIndexes}`);
    console.log(`❌ Errores: ${this.stats.errors.length}`);
    
    // Mostrar tiempo por categoría
    console.log('\n⏱️  TIEMPO POR CATEGORÍA:');
    Object.entries(this.stats.timing).forEach(([category, time]) => {
      console.log(`   ${category}: ${time}ms`);
    });
    
    // Mostrar errores si los hay
    if (this.stats.errors.length > 0) {
      console.log('\n❌ ERRORES ENCONTRADOS:');
      this.stats.errors.forEach(error => {
        console.log(`   - ${error.collection || 'General'}: ${error.error}`);
      });
    }
    
    console.log('\n💡 RECOMENDACIONES:');
    console.log('   - Los índices se crean en background para no afectar performance');
    console.log('   - Monitorear uso de índices con db.collection.getIndexStats()');
    console.log('   - Considerar índices adicionales basados en patrones de consulta reales');
  }

  /**
   * Utilidad para sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Funciones de utilidad
async function dropAllIndexes() {
  console.log('🗑️  ELIMINANDO TODOS LOS ÍNDICES (excepto _id)');
  
  const creator = new IndexCreator();
  await creator.connectToDatabase();
  
  for (const [category, collectionName] of Object.entries(CONFIG.categoryCollections)) {
    try {
      const collection = creator.db.collection(collectionName);
      await collection.dropIndexes();
      console.log(`   ✅ Índices eliminados de ${category}`);
    } catch (error) {
      console.error(`   ❌ Error eliminando índices de ${category}:`, error.message);
    }
  }
  
  await creator.client.close();
}

async function analyzeIndexUsage() {
  console.log('📊 ANALIZANDO USO DE ÍNDICES');
  
  const creator = new IndexCreator();
  await creator.connectToDatabase();
  
  for (const [category, collectionName] of Object.entries(CONFIG.categoryCollections)) {
    try {
      const collection = creator.db.collection(collectionName);
      const stats = await collection.aggregate([
        { $indexStats: {} }
      ]).toArray();
      
      console.log(`\n📚 ${category}:`);
      stats.forEach(stat => {
        console.log(`   ${stat.name}: ${stat.accesses.ops} accesos`);
      });
      
    } catch (error) {
      console.error(`   ❌ Error analizando ${category}:`, error.message);
    }
  }
  
  await creator.client.close();
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'drop') {
    dropAllIndexes()
      .then(() => {
        console.log('\n🚀 Eliminación de índices completada');
        process.exit(0);
      })
      .catch(error => {
        console.error('\n❌ Error eliminando índices:', error);
        process.exit(1);
      });
  } else if (command === 'analyze') {
    analyzeIndexUsage()
      .then(() => {
        console.log('\n🚀 Análisis de índices completado');
        process.exit(0);
      })
      .catch(error => {
        console.error('\n❌ Error analizando índices:', error);
        process.exit(1);
      });
  } else {
    const creator = new IndexCreator();
    
    creator.createAllIndexes()
      .then(async () => {
        // Verificar performance después de crear índices
        await creator.verifyIndexPerformance();
        
        // Listar todos los índices creados
        await creator.listAllIndexes();
        
        console.log('\n🚀 Creación de índices completada exitosamente');
        process.exit(0);
      })
      .catch(error => {
        console.error('\n❌ Error creando índices:', error);
        process.exit(1);
      });
  }
}

module.exports = IndexCreator; 