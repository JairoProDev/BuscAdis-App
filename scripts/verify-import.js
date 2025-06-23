/**
 * VERIFICADOR DE IMPORTACIÓN - BUSCADIS
 * Verifica que la importación masiva se haya realizado correctamente
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Configuración
const CONFIG = {
  dbName: process.env.MONGODB_DB || 'buscadis',
  uri: process.env.MONGODB_URI,
  reportsDir: path.join(__dirname, '../data/verification-reports'),
  
  categoryCollections: {
    inmuebles: 'publications_inmuebles',
    empleos: 'publications_empleos',
    vehiculos: 'publications_vehiculos',
    servicios: 'publications_servicios',
    productos: 'publications_productos',
    eventos: 'publications_eventos',
    comunidad: 'publications_comunidad',
    negocios: 'publications_negocios'
  },
  
  // Verificaciones a realizar
  checks: {
    basicCounts: true,
    dataIntegrity: true,
    dateRanges: true,
    indexPerformance: true,
    sampleQueries: true,
    duplicateDetection: true
  }
};

/**
 * Clase principal para verificación
 */
class ImportVerifier {
  constructor() {
    this.client = null;
    this.db = null;
    this.results = {
      timestamp: new Date().toISOString(),
      overall: { status: 'unknown', score: 0 },
      collections: {},
      performance: {},
      integrity: {},
      recommendations: []
    };
    
    this.ensureDirectories();
  }

  /**
   * Crear directorios necesarios
   */
  ensureDirectories() {
    if (!fs.existsSync(CONFIG.reportsDir)) {
      fs.mkdirSync(CONFIG.reportsDir, { recursive: true });
      console.log(`📁 Creado directorio: ${CONFIG.reportsDir}`);
    }
  }

  /**
   * Ejecutar todas las verificaciones
   */
  async verifyAll() {
    console.log('🔍 INICIANDO VERIFICACIÓN DE IMPORTACIÓN');
    console.log('========================================');
    
    try {
      // Conectar a base de datos
      await this.connectToDatabase();
      
      // Verificaciones básicas
      if (CONFIG.checks.basicCounts) {
        await this.verifyBasicCounts();
      }
      
      // Integridad de datos
      if (CONFIG.checks.dataIntegrity) {
        await this.verifyDataIntegrity();
      }
      
      // Rangos de fechas
      if (CONFIG.checks.dateRanges) {
        await this.verifyDateRanges();
      }
      
      // Performance de índices
      if (CONFIG.checks.indexPerformance) {
        await this.verifyIndexPerformance();
      }
      
      // Consultas de ejemplo
      if (CONFIG.checks.sampleQueries) {
        await this.verifySampleQueries();
      }
      
      // Detección de duplicados
      if (CONFIG.checks.duplicateDetection) {
        await this.verifyDuplicates();
      }
      
      // Calcular puntuación general
      this.calculateOverallScore();
      
      // Generar recomendaciones
      this.generateRecommendations();
      
      // Guardar y mostrar resultados
      await this.saveResults();
      this.printResults();
      
    } catch (error) {
      console.error('❌ Error en verificación:', error);
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
   * Verificar conteos básicos
   */
  async verifyBasicCounts() {
    console.log('\n📊 Verificando conteos básicos...');
    
    let totalPublications = 0;
    
    for (const [category, collectionName] of Object.entries(CONFIG.categoryCollections)) {
      try {
        const collection = this.db.collection(collectionName);
        const count = await collection.countDocuments();
        
        totalPublications += count;
        
        this.results.collections[category] = {
          count: count,
          status: count > 0 ? 'ok' : 'empty'
        };
        
        console.log(`   ${category}: ${count.toLocaleString()} publicaciones`);
        
      } catch (error) {
        this.results.collections[category] = {
          count: 0,
          status: 'error',
          error: error.message
        };
        console.error(`   ❌ Error en ${category}:`, error.message);
      }
    }
    
    console.log(`   📈 TOTAL: ${totalPublications.toLocaleString()} publicaciones`);
    
    // Verificar si es razonable
    if (totalPublications < 1000) {
      this.results.recommendations.push('Bajo número de publicaciones importadas. Verificar proceso de extracción.');
    }
    
    this.results.overall.totalPublications = totalPublications;
  }

  /**
   * Verificar integridad de datos
   */
  async verifyDataIntegrity() {
    console.log('\n🔍 Verificando integridad de datos...');
    
    const integrityIssues = {
      missingTitles: 0,
      missingDescriptions: 0,
      missingCategories: 0,
      invalidPrices: 0,
      missingContact: 0
    };
    
    for (const [category, collectionName] of Object.entries(CONFIG.categoryCollections)) {
      if (this.results.collections[category]?.count > 0) {
        try {
          const collection = this.db.collection(collectionName);
          
          // Verificar campos requeridos
          const missingTitles = await collection.countDocuments({ 
            $or: [{ title: null }, { title: '' }, { title: { $exists: false } }] 
          });
          
          const missingDescriptions = await collection.countDocuments({ 
            $or: [{ description: null }, { description: '' }, { description: { $exists: false } }] 
          });
          
          const missingCategories = await collection.countDocuments({ 
            $or: [{ categorySlug: null }, { categorySlug: '' }, { categorySlug: { $exists: false } }] 
          });
          
          const invalidPrices = await collection.countDocuments({ 
            price: { $lt: 0 }
          });
          
          const missingContact = await collection.countDocuments({ 
            $and: [
              { $or: [{ contactPhone: null }, { contactPhone: '' }, { contactPhone: { $exists: false } }] },
              { $or: [{ 'contact.phones.0': null }, { 'contact.phones.0': { $exists: false } }] }
            ]
          });
          
          integrityIssues.missingTitles += missingTitles;
          integrityIssues.missingDescriptions += missingDescriptions;
          integrityIssues.missingCategories += missingCategories;
          integrityIssues.invalidPrices += invalidPrices;
          integrityIssues.missingContact += missingContact;
          
          this.results.collections[category].integrity = {
            missingTitles,
            missingDescriptions,
            missingCategories,
            invalidPrices,
            missingContact
          };
          
        } catch (error) {
          console.error(`   ❌ Error verificando integridad de ${category}:`, error.message);
        }
      }
    }
    
    // Mostrar resumen
    console.log('   Problemas encontrados:');
    console.log(`   - Títulos faltantes: ${integrityIssues.missingTitles}`);
    console.log(`   - Descripciones faltantes: ${integrityIssues.missingDescriptions}`);
    console.log(`   - Categorías faltantes: ${integrityIssues.missingCategories}`);
    console.log(`   - Precios inválidos: ${integrityIssues.invalidPrices}`);
    console.log(`   - Contacto faltante: ${integrityIssues.missingContact}`);
    
    this.results.integrity = integrityIssues;
    
    // Agregar recomendaciones si hay problemas
    const totalIssues = Object.values(integrityIssues).reduce((sum, count) => sum + count, 0);
    if (totalIssues > this.results.overall.totalPublications * 0.1) {
      this.results.recommendations.push('Más del 10% de las publicaciones tienen problemas de integridad.');
    }
  }

  /**
   * Verificar rangos de fechas
   */
  async verifyDateRanges() {
    console.log('\n📅 Verificando rangos de fechas...');
    
    const dateRanges = {};
    
    for (const [category, collectionName] of Object.entries(CONFIG.categoryCollections)) {
      if (this.results.collections[category]?.count > 0) {
        try {
          const collection = this.db.collection(collectionName);
          
          const dateStats = await collection.aggregate([
            {
              $group: {
                _id: null,
                minCreatedAt: { $min: '$createdAt' },
                maxCreatedAt: { $max: '$createdAt' },
                minPublishDate: { $min: '$metadata.publishDate' },
                maxPublishDate: { $max: '$metadata.publishDate' },
                total: { $sum: 1 }
              }
            }
          ]).toArray();
          
          if (dateStats.length > 0) {
            const stats = dateStats[0];
            dateRanges[category] = {
              createdAt: {
                min: stats.minCreatedAt,
                max: stats.maxCreatedAt
              },
              publishDate: {
                min: stats.minPublishDate,
                max: stats.maxPublishDate
              },
              total: stats.total
            };
            
            console.log(`   ${category}:`);
            if (stats.minPublishDate && stats.maxPublishDate) {
              console.log(`     Publicación: ${new Date(stats.minPublishDate).toLocaleDateString()} - ${new Date(stats.maxPublishDate).toLocaleDateString()}`);
            }
            console.log(`     Creación: ${new Date(stats.minCreatedAt).toLocaleDateString()} - ${new Date(stats.maxCreatedAt).toLocaleDateString()}`);
          }
          
        } catch (error) {
          console.error(`   ❌ Error verificando fechas de ${category}:`, error.message);
        }
      }
    }
    
    this.results.dateRanges = dateRanges;
  }

  /**
   * Verificar performance de índices
   */
  async verifyIndexPerformance() {
    console.log('\n⚡ Verificando performance de índices...');
    
    const performanceResults = {};
    
    for (const [category, collectionName] of Object.entries(CONFIG.categoryCollections)) {
      if (this.results.collections[category]?.count > 100) { // Solo si tiene suficientes datos
        try {
          const collection = this.db.collection(collectionName);
          
          // Verificar índices existentes
          const indexes = await collection.indexes();
          
          // Consultas de prueba con explain
          const queries = [
            { categorySlug: category },
            { status: 'active' },
            { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
            { price: { $gte: 100, $lte: 1000 } }
          ];
          
          const queryPerformance = [];
          
          for (const query of queries) {
            try {
              const start = Date.now();
              const explainResult = await collection.find(query).explain('executionStats');
              const executionTime = Date.now() - start;
              
              queryPerformance.push({
                query: JSON.stringify(query),
                executionTimeMs: executionTime,
                docsExamined: explainResult.executionStats.totalDocsExamined,
                docsReturned: explainResult.executionStats.totalDocsReturned,
                usedIndex: explainResult.executionStats.executionStages?.indexName || 'COLLSCAN'
              });
              
            } catch (error) {
              console.warn(`     ⚠️  Error en consulta ${JSON.stringify(query)}:`, error.message);
            }
          }
          
          performanceResults[category] = {
            indexes: indexes.length,
            indexNames: indexes.map(idx => idx.name),
            queryPerformance
          };
          
          console.log(`   ${category}: ${indexes.length} índices, consultas OK`);
          
        } catch (error) {
          console.error(`   ❌ Error verificando performance de ${category}:`, error.message);
        }
      }
    }
    
    this.results.performance = performanceResults;
  }

  /**
   * Verificar consultas de ejemplo
   */
  async verifySampleQueries() {
    console.log('\n🔍 Probando consultas de ejemplo...');
    
    const sampleQueries = [
      {
        name: 'Búsqueda por categoría',
        collection: 'publications_inmuebles',
        query: { categorySlug: 'inmuebles', status: 'active' },
        limit: 10
      },
      {
        name: 'Búsqueda por precio',
        collection: 'publications_inmuebles',
        query: { price: { $gte: 100000, $lte: 500000 } },
        limit: 5
      },
      {
        name: 'Búsqueda por fecha',
        collection: 'publications_empleos',
        query: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        limit: 5
      },
      {
        name: 'Búsqueda por ubicación',
        collection: 'publications_vehiculos',
        query: { location: /cusco/i },
        limit: 5
      }
    ];
    
    const queryResults = [];
    
    for (const sampleQuery of sampleQueries) {
      try {
        const collection = this.db.collection(sampleQuery.collection);
        const start = Date.now();
        
        const results = await collection
          .find(sampleQuery.query)
          .limit(sampleQuery.limit)
          .toArray();
        
        const executionTime = Date.now() - start;
        
        queryResults.push({
          name: sampleQuery.name,
          collection: sampleQuery.collection,
          resultsCount: results.length,
          executionTimeMs: executionTime,
          status: results.length > 0 ? 'ok' : 'no_results',
          sampleTitles: results.slice(0, 3).map(r => r.title)
        });
        
        console.log(`   ✅ "${sampleQuery.name}": ${results.length} resultados en ${executionTime}ms`);
        
      } catch (error) {
        queryResults.push({
          name: sampleQuery.name,
          collection: sampleQuery.collection,
          status: 'error',
          error: error.message
        });
        console.error(`   ❌ Error en "${sampleQuery.name}":`, error.message);
      }
    }
    
    this.results.sampleQueries = queryResults;
  }

  /**
   * Verificar duplicados
   */
  async verifyDuplicates() {
    console.log('\n🔍 Verificando duplicados...');
    
    const duplicateStats = {};
    
    for (const [category, collectionName] of Object.entries(CONFIG.categoryCollections)) {
      if (this.results.collections[category]?.count > 0) {
        try {
          const collection = this.db.collection(collectionName);
          
          // Buscar duplicados por título similar
          const duplicatesByTitle = await collection.aggregate([
            {
              $group: {
                _id: { $toLower: { $substr: ['$title', 0, 50] } },
                count: { $sum: 1 },
                docs: { $push: { id: '$_id', title: '$title' } }
              }
            },
            { $match: { count: { $gt: 1 } } },
            { $limit: 10 } // Limitar para no sobrecargar
          ]).toArray();
          
          duplicateStats[category] = {
            titleDuplicates: duplicatesByTitle.length,
            examples: duplicatesByTitle.slice(0, 3).map(dup => ({
              pattern: dup._id,
              count: dup.count,
              titles: dup.docs.slice(0, 2).map(doc => doc.title)
            }))
          };
          
          if (duplicatesByTitle.length > 0) {
            console.log(`   ⚠️  ${category}: ${duplicatesByTitle.length} posibles grupos de duplicados`);
          } else {
            console.log(`   ✅ ${category}: Sin duplicados evidentes`);
          }
          
        } catch (error) {
          console.error(`   ❌ Error verificando duplicados de ${category}:`, error.message);
        }
      }
    }
    
    this.results.duplicates = duplicateStats;
  }

  /**
   * Calcular puntuación general
   */
  calculateOverallScore() {
    let score = 100;
    
    // Penalizar por problemas de integridad
    const integrityIssues = Object.values(this.results.integrity).reduce((sum, count) => sum + count, 0);
    const integrityPenalty = Math.min(30, (integrityIssues / this.results.overall.totalPublications) * 100);
    score -= integrityPenalty;
    
    // Penalizar por errores en colecciones
    const collectionErrors = Object.values(this.results.collections).filter(col => col.status === 'error').length;
    score -= collectionErrors * 10;
    
    // Penalizar por colecciones vacías
    const emptyCollections = Object.values(this.results.collections).filter(col => col.status === 'empty').length;
    score -= emptyCollections * 5;
    
    // Bonificar por consultas exitosas
    if (this.results.sampleQueries) {
      const successfulQueries = this.results.sampleQueries.filter(q => q.status === 'ok').length;
      const totalQueries = this.results.sampleQueries.length;
      if (totalQueries > 0) {
        score += (successfulQueries / totalQueries) * 10;
      }
    }
    
    this.results.overall.score = Math.max(0, Math.min(100, Math.round(score)));
    
    if (score >= 90) {
      this.results.overall.status = 'excellent';
    } else if (score >= 75) {
      this.results.overall.status = 'good';
    } else if (score >= 60) {
      this.results.overall.status = 'fair';
    } else {
      this.results.overall.status = 'poor';
    }
  }

  /**
   * Generar recomendaciones
   */
  generateRecommendations() {
    // Ya se agregan algunas recomendaciones durante las verificaciones
    
    // Recomendaciones basadas en performance
    if (this.results.performance) {
      const slowQueries = Object.values(this.results.performance)
        .flatMap(perf => perf.queryPerformance || [])
        .filter(query => query.executionTimeMs > 1000);
      
      if (slowQueries.length > 0) {
        this.results.recommendations.push('Hay consultas lentas (>1s). Considerar optimizar índices.');
      }
    }
    
    // Recomendaciones basadas en duplicados
    const totalDuplicates = Object.values(this.results.duplicates || {})
      .reduce((sum, stat) => sum + (stat.titleDuplicates || 0), 0);
    
    if (totalDuplicates > 10) {
      this.results.recommendations.push('Muchos duplicados detectados. Implementar mejor deduplicación.');
    }
    
    // Recomendación general
    if (this.results.overall.score < 80) {
      this.results.recommendations.push('La calidad general de la importación puede mejorarse. Revisar proceso de extracción y validación.');
    }
  }

  /**
   * Guardar resultados
   */
  async saveResults() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Reporte JSON completo
    const jsonReportPath = path.join(CONFIG.reportsDir, `verification_${timestamp}.json`);
    fs.writeFileSync(jsonReportPath, JSON.stringify(this.results, null, 2));
    
    // Reporte texto legible
    const textReport = this.generateTextReport();
    const txtReportPath = path.join(CONFIG.reportsDir, `verification_${timestamp}.txt`);
    fs.writeFileSync(txtReportPath, textReport);
    
    console.log(`\n📊 Reportes guardados:`);
    console.log(`   JSON: ${jsonReportPath}`);
    console.log(`   TXT: ${txtReportPath}`);
  }

  /**
   * Generar reporte de texto
   */
  generateTextReport() {
    const statusEmojis = {
      excellent: '🟢',
      good: '🔵',
      fair: '🟡',
      poor: '🔴'
    };
    
    return `
REPORTE DE VERIFICACIÓN DE IMPORTACIÓN - BUSCADIS
=================================================
Fecha: ${new Date(this.results.timestamp).toLocaleString()}

RESULTADO GENERAL: ${statusEmojis[this.results.overall.status]} ${this.results.overall.status.toUpperCase()}
Puntuación: ${this.results.overall.score}/100
Total de publicaciones: ${this.results.overall.totalPublications?.toLocaleString() || 'N/A'}

PUBLICACIONES POR CATEGORÍA:
${Object.entries(this.results.collections)
  .map(([cat, data]) => `- ${cat}: ${data.count?.toLocaleString() || 'N/A'} (${data.status})`)
  .join('\n')}

INTEGRIDAD DE DATOS:
- Títulos faltantes: ${this.results.integrity?.missingTitles || 0}
- Descripciones faltantes: ${this.results.integrity?.missingDescriptions || 0}
- Categorías faltantes: ${this.results.integrity?.missingCategories || 0}
- Precios inválidos: ${this.results.integrity?.invalidPrices || 0}
- Contacto faltante: ${this.results.integrity?.missingContact || 0}

CONSULTAS DE PRUEBA:
${(this.results.sampleQueries || [])
  .map(q => `- ${q.name}: ${q.status === 'ok' ? '✅' : '❌'} (${q.resultsCount || 0} resultados)`)
  .join('\n')}

${this.results.recommendations.length > 0 ? `
RECOMENDACIONES:
${this.results.recommendations.map(rec => `- ${rec}`).join('\n')}
` : ''}

CONCLUSIÓN:
${this.results.overall.status === 'excellent' 
  ? '¡Importación exitosa! Los datos están listos para uso en producción.' 
  : this.results.overall.status === 'good'
  ? 'Importación buena con algunos puntos de mejora menores.'
  : this.results.overall.status === 'fair'
  ? 'Importación aceptable pero requiere atención a los problemas identificados.'
  : 'Importación problemática. Se requiere revisión y corrección antes de usar en producción.'}
    `.trim();
  }

  /**
   * Mostrar resultados en consola
   */
  printResults() {
    const statusEmojis = {
      excellent: '🟢',
      good: '🔵', 
      fair: '🟡',
      poor: '🔴'
    };
    
    console.log('\n' + '='.repeat(50));
    console.log('📋 RESUMEN DE VERIFICACIÓN');
    console.log('='.repeat(50));
    
    console.log(`\n${statusEmojis[this.results.overall.status]} RESULTADO GENERAL: ${this.results.overall.status.toUpperCase()}`);
    console.log(`📊 Puntuación: ${this.results.overall.score}/100`);
    console.log(`📈 Total publicaciones: ${this.results.overall.totalPublications?.toLocaleString() || 'N/A'}`);
    
    console.log('\n📚 PUBLICACIONES POR CATEGORÍA:');
    Object.entries(this.results.collections).forEach(([category, data]) => {
      const emoji = data.status === 'ok' ? '✅' : data.status === 'empty' ? '⚠️' : '❌';
      console.log(`   ${emoji} ${category}: ${data.count?.toLocaleString() || 'N/A'}`);
    });
    
    if (this.results.recommendations.length > 0) {
      console.log('\n💡 RECOMENDACIONES:');
      this.results.recommendations.forEach(rec => {
        console.log(`   - ${rec}`);
      });
    }
    
    console.log(`\n${this.results.overall.status === 'excellent' ? '🎉' : '⚠️'} CONCLUSIÓN:`);
    if (this.results.overall.status === 'excellent') {
      console.log('   ¡Importación exitosa! Los datos están listos para uso en producción.');
    } else if (this.results.overall.status === 'good') {
      console.log('   Importación buena con algunos puntos de mejora menores.');
    } else if (this.results.overall.status === 'fair') {
      console.log('   Importación aceptable pero requiere atención a los problemas identificados.');
    } else {
      console.log('   Importación problemática. Revisar y corregir antes de usar en producción.');
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const verifier = new ImportVerifier();
  
  verifier.verifyAll()
    .then(() => {
      console.log('\n🚀 Verificación completada');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error en verificación:', error);
      process.exit(1);
    });
}

module.exports = ImportVerifier; 