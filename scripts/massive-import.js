/**
 * IMPORTADOR MASIVO - BUSCADIS
 * Importa publicaciones validadas a MongoDB Atlas
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuración
const CONFIG = {
  // Directorios
  inputDir: path.join(__dirname, '../data/json-validados'),
  reportsDir: path.join(__dirname, '../data/import-reports'),
  
  // Base de datos
  dbName: process.env.MONGODB_DB || 'buscadis',
  uri: process.env.MONGODB_URI,
  
  // Importación
  batchSize: 500,
  delayBetweenBatches: 1000, // ms
  maxRetries: 3,
  enableProgressReports: true,
  createBackup: true,
  
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
 * Clase principal para importación masiva
 */
class MassiveImporter {
  constructor() {
    this.client = null;
    this.db = null;
    this.stats = {
      totalFiles: 0,
      processedFiles: 0,
      totalPublications: 0,
      importedPublications: 0,
      duplicatesSkipped: 0,
      errors: [],
      startTime: null,
      endTime: null,
      categoryCounts: {}
    };
    
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
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
   * Función principal de importación
   */
  async importAll() {
    console.log('🚀 INICIANDO IMPORTACIÓN MASIVA');
    console.log('===============================');
    
    try {
      // Validar configuración
      await this.validateConfig();
      
      // Mostrar información del proceso
      await this.showImportInfo();
      
      // Confirmar con usuario
      const confirmed = await this.confirmImport();
      if (!confirmed) {
        console.log('❌ Importación cancelada por el usuario');
        return;
      }
      
      this.stats.startTime = new Date();
      
      // Conectar a base de datos
      await this.connectToDatabase();
      
      // Crear backup si está habilitado
      if (CONFIG.createBackup) {
        await this.createBackup();
      }
      
      // Limpiar datos actuales (opcional)
      const shouldClean = await this.askCleanExisting();
      if (shouldClean) {
        await this.cleanExistingData();
      }
      
      // Obtener archivos a procesar
      const files = this.getJSONFiles();
      this.stats.totalFiles = files.length;
      
      // Procesar archivos en orden cronológico
      const sortedFiles = this.sortFilesByDate(files);
      
      for (let i = 0; i < sortedFiles.length; i++) {
        const file = sortedFiles[i];
        console.log(`\n📄 [${i + 1}/${sortedFiles.length}] Procesando: ${file}`);
        
        await this.processFile(file);
        
        // Pausa entre archivos
        if (i < sortedFiles.length - 1) {
          await this.sleep(CONFIG.delayBetweenBatches);
        }
        
        // Reporte de progreso
        if (CONFIG.enableProgressReports && (i + 1) % 5 === 0) {
          this.printProgressReport();
        }
      }
      
      this.stats.endTime = new Date();
      
      // Crear índices de base de datos
      await this.createDatabaseIndexes();
      
      // Generar reporte final
      await this.generateFinalReport();
      
      // Mostrar estadísticas finales
      this.printFinalStats();
      
    } catch (error) {
      console.error('❌ Error en importación masiva:', error);
      throw error;
    } finally {
      if (this.client) {
        await this.client.close();
      }
      this.rl.close();
    }
  }

  /**
   * Validar configuración
   */
  async validateConfig() {
    if (!CONFIG.uri) {
      throw new Error('MONGODB_URI no está configurada en variables de entorno');
    }
    
    if (!fs.existsSync(CONFIG.inputDir)) {
      throw new Error(`Directorio de entrada no existe: ${CONFIG.inputDir}`);
    }
    
    const files = this.getJSONFiles();
    if (files.length === 0) {
      throw new Error(`No se encontraron archivos JSON en: ${CONFIG.inputDir}`);
    }
    
    console.log('✅ Configuración validada');
  }

  /**
   * Mostrar información del proceso
   */
  async showImportInfo() {
    const files = this.getJSONFiles();
    let totalPublications = 0;
    const categoryBreakdown = {};
    
    // Contar publicaciones y categorías
    for (const file of files) {
      try {
        const filePath = path.join(CONFIG.inputDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        if (data.publications && Array.isArray(data.publications)) {
          totalPublications += data.publications.length;
          
          // Contar por categorías
          data.publications.forEach(pub => {
            const category = pub.category || 'sin_categoria';
            categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
          });
        }
      } catch (error) {
        console.warn(`⚠️  Error leyendo ${file}:`, error.message);
      }
    }
    
    console.log('\n📊 INFORMACIÓN DEL PROCESO');
    console.log('===========================');
    console.log(`📄 Archivos a procesar: ${files.length}`);
    console.log(`📊 Total publicaciones: ${totalPublications.toLocaleString()}`);
    console.log(`🗄️  Base de datos: ${CONFIG.dbName}`);
    console.log(`📦 Tamaño de lote: ${CONFIG.batchSize}`);
    
    console.log('\n📈 DISTRIBUCIÓN POR CATEGORÍAS:');
    Object.entries(categoryBreakdown)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`   ${category}: ${count.toLocaleString()}`);
      });
  }

  /**
   * Confirmar importación con usuario
   */
  async confirmImport() {
    return new Promise((resolve) => {
      const question = '\n❓ ¿Continuar con la importación? (s/N): ';
      this.rl.question(question, (answer) => {
        resolve(answer.toLowerCase().startsWith('s'));
      });
    });
  }

  /**
   * Preguntar si limpiar datos existentes
   */
  async askCleanExisting() {
    return new Promise((resolve) => {
      const question = '\n❓ ¿Eliminar publicaciones existentes antes de importar? (s/N): ';
      this.rl.question(question, (answer) => {
        resolve(answer.toLowerCase().startsWith('s'));
      });
    });
  }

  /**
   * Conectar a base de datos
   */
  async connectToDatabase() {
    console.log('\n🔌 Conectando a MongoDB Atlas...');
    
    this.client = new MongoClient(CONFIG.uri, {
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      },
      maxPoolSize: 10,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    
    await this.client.connect();
    this.db = this.client.db(CONFIG.dbName);
    
    // Verificar conexión
    await this.db.admin().ping();
    console.log('✅ Conectado a MongoDB Atlas');
  }

  /**
   * Crear backup de datos actuales
   */
  async createBackup() {
    console.log('\n📦 Creando backup de datos actuales...');
    
    const backupDir = path.join(CONFIG.reportsDir, `backup_${Date.now()}`);
    fs.mkdirSync(backupDir, { recursive: true });
    
    // Backup de cada colección
    for (const [category, collectionName] of Object.entries(CONFIG.categoryCollections)) {
      try {
        const collection = this.db.collection(collectionName);
        const count = await collection.countDocuments();
        
        if (count > 0) {
          const documents = await collection.find({}).toArray();
          const backupPath = path.join(backupDir, `${category}_backup.json`);
          fs.writeFileSync(backupPath, JSON.stringify(documents, null, 2));
          console.log(`   ✅ ${category}: ${count} documentos respaldados`);
        }
      } catch (error) {
        console.warn(`   ⚠️  Error en backup de ${category}:`, error.message);
      }
    }
    
    console.log(`📁 Backup guardado en: ${backupDir}`);
  }

  /**
   * Limpiar datos existentes
   */
  async cleanExistingData() {
    console.log('\n🧹 Limpiando datos existentes...');
    
    let totalDeleted = 0;
    
    for (const [category, collectionName] of Object.entries(CONFIG.categoryCollections)) {
      try {
        const collection = this.db.collection(collectionName);
        const result = await collection.deleteMany({});
        totalDeleted += result.deletedCount;
        
        if (result.deletedCount > 0) {
          console.log(`   🗑️  ${category}: ${result.deletedCount} documentos eliminados`);
        }
      } catch (error) {
        console.warn(`   ⚠️  Error limpiando ${category}:`, error.message);
      }
    }
    
    console.log(`✅ Total eliminados: ${totalDeleted} documentos`);
  }

  /**
   * Obtener archivos JSON
   */
  getJSONFiles() {
    return fs.readdirSync(CONFIG.inputDir)
      .filter(file => file.toLowerCase().endsWith('.json'))
      .sort();
  }

  /**
   * Ordenar archivos por fecha (más antiguos primero)
   */
  sortFilesByDate(files) {
    return files.sort((a, b) => {
      // Intentar extraer fecha del nombre de archivo
      const dateA = this.extractDateFromFilename(a);
      const dateB = this.extractDateFromFilename(b);
      
      if (dateA && dateB) {
        return dateA.getTime() - dateB.getTime();
      }
      
      // Si no se puede extraer fecha, ordenar alfabéticamente
      return a.localeCompare(b);
    });
  }

  /**
   * Extraer fecha del nombre de archivo
   */
  extractDateFromFilename(filename) {
    // Patrones comunes de fecha en nombres de archivo
    const patterns = [
      /(\d{4})[-_](\d{1,2})[-_](\d{1,2})/,  // YYYY-MM-DD
      /(\d{2})[-_](\d{2})[-_](\d{4})/,      // DD-MM-YYYY
      /(\d{1,2})[-_](\d{1,2})[-_](\d{4})/   // M-D-YYYY
    ];
    
    for (const pattern of patterns) {
      const match = filename.match(pattern);
      if (match) {
        try {
          const [, p1, p2, p3] = match;
          
          // Determinar orden de año, mes, día
          if (p1.length === 4) {
            // YYYY-MM-DD
            return new Date(parseInt(p1), parseInt(p2) - 1, parseInt(p3));
          } else if (p3.length === 4) {
            // DD-MM-YYYY o MM-DD-YYYY
            return new Date(parseInt(p3), parseInt(p2) - 1, parseInt(p1));
          }
        } catch (error) {
          // Continuar con siguiente patrón
        }
      }
    }
    
    return null;
  }

  /**
   * Procesar un archivo JSON
   */
  async processFile(fileName) {
    const filePath = path.join(CONFIG.inputDir, fileName);
    
    try {
      // Cargar datos
      const rawData = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(rawData);
      
      if (!data.publications || !Array.isArray(data.publications)) {
        throw new Error('Estructura JSON inválida');
      }
      
      const publications = data.publications;
      this.stats.totalPublications += publications.length;
      
      console.log(`   📊 ${publications.length} publicaciones a importar`);
      
      // Agrupar por categoría
      const groupedByCategory = this.groupByCategory(publications);
      
      // Importar cada categoría
      for (const [category, pubs] of Object.entries(groupedByCategory)) {
        await this.importCategory(category, pubs, fileName);
      }
      
      this.stats.processedFiles++;
      
    } catch (error) {
      this.stats.errors.push({
        file: fileName,
        error: error.message
      });
      console.error(`   ❌ Error procesando archivo:`, error.message);
    }
  }

  /**
   * Agrupar publicaciones por categoría
   */
  groupByCategory(publications) {
    const grouped = {};
    
    publications.forEach(pub => {
      const category = pub.category || 'productos'; // Categoría por defecto
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(pub);
    });
    
    return grouped;
  }

  /**
   * Importar publicaciones de una categoría
   */
  async importCategory(category, publications, sourceFile) {
    const collectionName = CONFIG.categoryCollections[category];
    
    if (!collectionName) {
      console.warn(`   ⚠️  Categoría desconocida: ${category}, usando productos`);
      collectionName = CONFIG.categoryCollections.productos;
    }
    
    const collection = this.db.collection(collectionName);
    
    console.log(`   📁 ${category}: ${publications.length} publicaciones`);
    
    // Procesar en lotes
    for (let i = 0; i < publications.length; i += CONFIG.batchSize) {
      const batch = publications.slice(i, i + CONFIG.batchSize);
      
      try {
        // Preparar documentos para inserción
        const documents = batch.map(pub => this.prepareDocument(pub, sourceFile));
        
        // Insertar lote
        const result = await collection.insertMany(documents, { ordered: false });
        
        this.stats.importedPublications += result.insertedCount;
        this.stats.categoryCounts[category] = (this.stats.categoryCounts[category] || 0) + result.insertedCount;
        
        console.log(`      ✅ Lote ${Math.floor(i / CONFIG.batchSize) + 1}: ${result.insertedCount} insertados`);
        
      } catch (error) {
        // Manejar duplicados y otros errores
        if (error.code === 11000) {
          // Error de duplicado
          const duplicateCount = batch.length - (error.result?.insertedCount || 0);
          this.stats.duplicatesSkipped += duplicateCount;
          this.stats.importedPublications += error.result?.insertedCount || 0;
          
          console.log(`      ⚠️  Lote ${Math.floor(i / CONFIG.batchSize) + 1}: ${duplicateCount} duplicados omitidos`);
        } else {
          console.error(`      ❌ Error en lote ${Math.floor(i / CONFIG.batchSize) + 1}:`, error.message);
          this.stats.errors.push({
            file: sourceFile,
            category: category,
            batch: Math.floor(i / CONFIG.batchSize) + 1,
            error: error.message
          });
        }
      }
      
      // Pausa entre lotes
      if (i + CONFIG.batchSize < publications.length) {
        await this.sleep(100);
      }
    }
  }

  /**
   * Preparar documento para inserción
   */
  prepareDocument(publication, sourceFile) {
    const now = new Date();
    
    return {
      ...publication,
      
      // IDs y slugs
      _id: publication._id || publication.id || this.generateObjectId(),
      id: publication.id || this.generateId(),
      slug: publication.slug || this.generateSlug(publication.title),
      
      // Metadatos de importación
      importMetadata: {
        sourceFile: sourceFile,
        importedAt: now,
        method: 'massive_import',
        version: '1.0'
      },
      
      // Fechas de sistema
      createdAt: publication.metadata?.publishDate ? new Date(publication.metadata.publishDate) : now,
      updatedAt: now,
      
      // Estado
      status: publication.status || 'active',
      
      // Normalización de campos
      categorySlug: publication.category,
      subcategorySlug: publication.subcategory || 'general',
      
      // Pricing normalizado
      ...(publication.pricing && {
        price: publication.pricing.amount,
        currency: publication.pricing.currency || 'PEN'
      }),
      
      // Ubicación normalizada
      location: typeof publication.location === 'string' 
        ? publication.location 
        : publication.location?.raw || publication.location?.city || 'Cusco',
      
      // Contacto normalizado
      contactPhone: publication.contact?.phones?.[0] || publication.contact?.primaryPhone,
      contactName: publication.contact?.name || 'Anunciante',
      
      // Imágenes
      images: publication.images || []
    };
  }

  /**
   * Generar ObjectId
   */
  generateObjectId() {
    return new Date().getTime().toString(16) + Math.random().toString(16).substring(2);
  }

  /**
   * Generar ID único
   */
  generateId() {
    return `pub_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  /**
   * Generar slug
   */
  generateSlug(title) {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-')
      .substring(0, 100);
  }

  /**
   * Crear índices de base de datos
   */
  async createDatabaseIndexes() {
    console.log('\n🔍 Creando índices de base de datos...');
    
    const commonIndexes = [
      { 'status': 1 },
      { 'categorySlug': 1 },
      { 'createdAt': -1 },
      { 'price': 1 },
      { 'location': 1 },
      { 'categorySlug': 1, 'status': 1 },
      { 'createdAt': -1, 'status': 1 }
    ];
    
    for (const [category, collectionName] of Object.entries(CONFIG.categoryCollections)) {
      try {
        const collection = this.db.collection(collectionName);
        
        for (const index of commonIndexes) {
          await collection.createIndex(index);
        }
        
        console.log(`   ✅ ${category}: índices creados`);
      } catch (error) {
        console.warn(`   ⚠️  Error creando índices para ${category}:`, error.message);
      }
    }
  }

  /**
   * Generar reporte final
   */
  async generateFinalReport() {
    const duration = this.stats.endTime - this.stats.startTime;
    const durationMinutes = Math.floor(duration / 60000);
    const durationSeconds = Math.floor((duration % 60000) / 1000);
    
    const report = {
      timestamp: new Date().toISOString(),
      duration: {
        milliseconds: duration,
        readable: `${durationMinutes}m ${durationSeconds}s`
      },
      summary: {
        totalFiles: this.stats.totalFiles,
        processedFiles: this.stats.processedFiles,
        totalPublications: this.stats.totalPublications,
        importedPublications: this.stats.importedPublications,
        duplicatesSkipped: this.stats.duplicatesSkipped,
        errors: this.stats.errors.length,
        successRate: ((this.stats.importedPublications / this.stats.totalPublications) * 100).toFixed(2) + '%'
      },
      categoryBreakdown: this.stats.categoryCounts,
      errors: this.stats.errors,
      performance: {
        publicationsPerSecond: Math.floor(this.stats.importedPublications / (duration / 1000)),
        averageTimePerFile: Math.floor(duration / this.stats.processedFiles)
      }
    };
    
    const reportPath = path.join(CONFIG.reportsDir, `import_report_${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Reporte legible
    const readableReport = this.generateReadableReport(report);
    const txtReportPath = path.join(CONFIG.reportsDir, `import_summary_${Date.now()}.txt`);
    fs.writeFileSync(txtReportPath, readableReport);
    
    console.log(`📊 Reporte guardado en: ${reportPath}`);
  }

  /**
   * Generar reporte legible
   */
  generateReadableReport(report) {
    return `
REPORTE DE IMPORTACIÓN MASIVA - BUSCADIS
========================================
Fecha: ${new Date(report.timestamp).toLocaleString()}
Duración: ${report.duration.readable}

RESUMEN:
- Archivos procesados: ${report.summary.processedFiles}/${report.summary.totalFiles}
- Publicaciones importadas: ${report.summary.importedPublications.toLocaleString()}
- Duplicados omitidos: ${report.summary.duplicatesSkipped.toLocaleString()}
- Tasa de éxito: ${report.summary.successRate}
- Velocidad: ${report.performance.publicationsPerSecond} pub/seg

DISTRIBUCIÓN POR CATEGORÍAS:
${Object.entries(report.categoryBreakdown)
  .map(([cat, count]) => `- ${cat}: ${count.toLocaleString()}`)
  .join('\n')}

${report.errors.length > 0 ? `
ERRORES:
${report.errors.map(e => `- ${e.file}: ${e.error}`).join('\n')}
` : 'Sin errores ✅'}
    `.trim();
  }

  /**
   * Imprimir reporte de progreso
   */
  printProgressReport() {
    const elapsed = new Date() - this.stats.startTime;
    const rate = Math.floor(this.stats.importedPublications / (elapsed / 1000));
    
    console.log(`\n📈 PROGRESO: ${this.stats.importedPublications.toLocaleString()} importadas (${rate} pub/seg)`);
  }

  /**
   * Imprimir estadísticas finales
   */
  printFinalStats() {
    const duration = this.stats.endTime - this.stats.startTime;
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    
    console.log('\n🎉 IMPORTACIÓN COMPLETADA');
    console.log('=========================');
    console.log(`⏱️  Duración: ${minutes}m ${seconds}s`);
    console.log(`📄 Archivos: ${this.stats.processedFiles}/${this.stats.totalFiles}`);
    console.log(`📊 Publicaciones: ${this.stats.importedPublications.toLocaleString()}/${this.stats.totalPublications.toLocaleString()}`);
    console.log(`🔄 Duplicados omitidos: ${this.stats.duplicatesSkipped.toLocaleString()}`);
    console.log(`❌ Errores: ${this.stats.errors.length}`);
    console.log(`📈 Tasa de éxito: ${((this.stats.importedPublications / this.stats.totalPublications) * 100).toFixed(2)}%`);
    
    console.log('\n📊 POR CATEGORÍAS:');
    Object.entries(this.stats.categoryCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`   ${category}: ${count.toLocaleString()}`);
      });
    
    if (this.stats.errors.length > 0) {
      console.log('\n❌ ERRORES:');
      this.stats.errors.forEach(error => {
        console.log(`   - ${error.file}: ${error.error}`);
      });
    }
  }

  /**
   * Utilidad para sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const importer = new MassiveImporter();
  
  importer.importAll()
    .then(() => {
      console.log('\n🚀 Importación masiva completada exitosamente');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error en importación masiva:', error);
      process.exit(1);
    });
}

module.exports = MassiveImporter; 