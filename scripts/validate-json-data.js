/**
 * VALIDADOR DE DATOS JSON - BUSCADIS
 * Valida la estructura y calidad de los archivos JSON extraídos
 */

const fs = require('fs');
const path = require('path');

// Configuración de validación
const VALIDATION_CONFIG = {
  inputDir: path.join(__dirname, '../data/json-procesados'),
  outputDir: path.join(__dirname, '../data/json-validados'),
  reportsDir: path.join(__dirname, '../data/validation-reports'),
  
  // Criterios de validación
  criteria: {
    minTitleLength: 5,
    maxTitleLength: 150,
    minDescriptionLength: 20,
    maxDescriptionLength: 1000,
    requiredFields: ['title', 'description', 'category'],
    validCategories: [
      'inmuebles', 'empleos', 'vehiculos', 'servicios', 
      'productos', 'eventos', 'comunidad', 'negocios'
    ],
    validCurrencies: ['PEN', 'USD'],
    minConfidence: 0.3
  },
  
  // Configuración de limpieza
  cleanup: {
    removeDuplicates: true,
    fixCommonErrors: true,
    enhanceData: true,
    validatePhones: true,
    validateEmails: true
  }
};

/**
 * Clase principal para validar datos JSON
 */
class JSONValidator {
  constructor() {
    this.stats = {
      totalFiles: 0,
      processedFiles: 0,
      totalAds: 0,
      validAds: 0,
      invalidAds: 0,
      duplicateAds: 0,
      fixedAds: 0,
      errors: [],
      warnings: []
    };
    
    this.ensureDirectories();
  }

  /**
   * Crear directorios necesarios
   */
  ensureDirectories() {
    [VALIDATION_CONFIG.outputDir, VALIDATION_CONFIG.reportsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Creado directorio: ${dir}`);
      }
    });
  }

  /**
   * Validar todos los archivos JSON
   */
  async validateAllFiles() {
    console.log('🔍 INICIANDO VALIDACIÓN DE ARCHIVOS JSON');
    console.log('========================================');
    
    try {
      // Obtener lista de archivos JSON
      const jsonFiles = this.getJSONFiles();
      this.stats.totalFiles = jsonFiles.length;
      
      console.log(`📄 Encontrados ${jsonFiles.length} archivos JSON`);
      
      if (jsonFiles.length === 0) {
        console.log(`❌ No se encontraron archivos JSON en: ${VALIDATION_CONFIG.inputDir}`);
        return;
      }

      // Procesar cada archivo
      for (const fileName of jsonFiles) {
        await this.validateFile(fileName);
      }

      // Generar reporte final
      await this.generateFinalReport();
      
      this.printFinalStats();
      
    } catch (error) {
      console.error('❌ Error en validación:', error);
      throw error;
    }
  }

  /**
   * Obtener lista de archivos JSON
   */
  getJSONFiles() {
    return fs.readdirSync(VALIDATION_CONFIG.inputDir)
      .filter(file => file.toLowerCase().endsWith('.json'))
      .sort();
  }

  /**
   * Validar un archivo JSON
   */
  async validateFile(fileName) {
    const filePath = path.join(VALIDATION_CONFIG.inputDir, fileName);
    const baseName = path.basename(fileName, '.json');
    
    console.log(`🔍 Validando: ${fileName}`);
    
    try {
      // Cargar archivo
      const rawData = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(rawData);
      
      // Validar estructura general
      if (!data.publications || !Array.isArray(data.publications)) {
        throw new Error('Estructura JSON inválida: no contiene array de publications');
      }
      
      const originalCount = data.publications.length;
      this.stats.totalAds += originalCount;
      
      // Validar cada publicación
      const validationResults = data.publications.map((pub, index) => 
        this.validatePublication(pub, fileName, index)
      );
      
      // Separar válidas e inválidas
      const validPublications = validationResults
        .filter(result => result.isValid)
        .map(result => result.publication);
      
      const invalidPublications = validationResults
        .filter(result => !result.isValid);
      
      // Limpiar y mejorar datos válidos
      const cleanedPublications = VALIDATION_CONFIG.cleanup.removeDuplicates 
        ? this.removeDuplicates(validPublications)
        : validPublications;
      
      const enhancedPublications = VALIDATION_CONFIG.cleanup.enhanceData
        ? cleanedPublications.map(pub => this.enhancePublication(pub))
        : cleanedPublications;
      
      // Actualizar estadísticas
      this.stats.validAds += enhancedPublications.length;
      this.stats.invalidAds += invalidPublications.length;
      this.stats.duplicateAds += validPublications.length - cleanedPublications.length;
      this.stats.processedFiles++;
      
      // Guardar archivo validado
      const outputData = {
        ...data,
        metadata: {
          ...data.metadata,
          validation: {
            validatedAt: new Date().toISOString(),
            originalCount: originalCount,
            validCount: enhancedPublications.length,
            invalidCount: invalidPublications.length,
            duplicatesRemoved: validPublications.length - cleanedPublications.length
          }
        },
        publications: enhancedPublications
      };
      
      const outputPath = path.join(VALIDATION_CONFIG.outputDir, fileName);
      fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf8');
      
      // Generar reporte de validación para este archivo
      await this.generateFileReport(fileName, validationResults, outputData.metadata.validation);
      
      console.log(`✅ ${fileName}: ${enhancedPublications.length}/${originalCount} avisos válidos`);
      
    } catch (error) {
      this.stats.errors.push({
        file: fileName,
        error: error.message
      });
      console.error(`❌ Error validando ${fileName}:`, error.message);
    }
  }

  /**
   * Validar una publicación individual
   */
  validatePublication(publication, fileName, index) {
    const errors = [];
    const warnings = [];
    
    // Clonar publicación para modificaciones
    const pub = { ...publication };
    
    // Validar campos requeridos
    for (const field of VALIDATION_CONFIG.criteria.requiredFields) {
      if (!pub[field] || (typeof pub[field] === 'string' && pub[field].trim() === '')) {
        errors.push(`Campo requerido faltante: ${field}`);
      }
    }
    
    // Validar título
    if (pub.title) {
      const titleLength = pub.title.length;
      if (titleLength < VALIDATION_CONFIG.criteria.minTitleLength) {
        errors.push(`Título muy corto: ${titleLength} caracteres`);
      }
      if (titleLength > VALIDATION_CONFIG.criteria.maxTitleLength) {
        warnings.push(`Título muy largo: ${titleLength} caracteres`);
        pub.title = pub.title.substring(0, VALIDATION_CONFIG.criteria.maxTitleLength);
      }
    }
    
    // Validar descripción
    if (pub.description) {
      const descLength = pub.description.length;
      if (descLength < VALIDATION_CONFIG.criteria.minDescriptionLength) {
        errors.push(`Descripción muy corta: ${descLength} caracteres`);
      }
      if (descLength > VALIDATION_CONFIG.criteria.maxDescriptionLength) {
        warnings.push(`Descripción muy larga: ${descLength} caracteres`);
        pub.description = pub.description.substring(0, VALIDATION_CONFIG.criteria.maxDescriptionLength);
      }
    }
    
    // Validar categoría
    if (pub.category && !VALIDATION_CONFIG.criteria.validCategories.includes(pub.category)) {
      errors.push(`Categoría inválida: ${pub.category}`);
    }
    
    // Validar pricing
    if (pub.pricing) {
      if (pub.pricing.currency && !VALIDATION_CONFIG.criteria.validCurrencies.includes(pub.pricing.currency)) {
        warnings.push(`Moneda inválida: ${pub.pricing.currency}`);
        pub.pricing.currency = 'PEN'; // Valor por defecto
      }
      
      if (pub.pricing.amount && (isNaN(pub.pricing.amount) || pub.pricing.amount < 0)) {
        warnings.push(`Monto inválido: ${pub.pricing.amount}`);
        delete pub.pricing.amount;
      }
    }
    
    // Validar contacto
    if (pub.contact) {
      if (VALIDATION_CONFIG.cleanup.validatePhones && pub.contact.phones) {
        pub.contact.phones = pub.contact.phones.filter(phone => this.isValidPhone(phone));
      }
      
      if (VALIDATION_CONFIG.cleanup.validateEmails && pub.contact.emails) {
        pub.contact.emails = pub.contact.emails.filter(email => this.isValidEmail(email));
      }
    }
    
    // Validar confianza
    if (pub.metadata && pub.metadata.confidence < VALIDATION_CONFIG.criteria.minConfidence) {
      warnings.push(`Confianza muy baja: ${pub.metadata.confidence}`);
    }
    
    const isValid = errors.length === 0;
    
    return {
      isValid,
      publication: pub,
      errors,
      warnings,
      originalIndex: index
    };
  }

  /**
   * Validar número de teléfono
   */
  isValidPhone(phone) {
    // Patrones para Perú
    const patterns = [
      /^\+51\s?9\d{8}$/, // Móvil con código país
      /^9\d{8}$/,        // Móvil sin código país
      /^\d{2,3}[-\s]?\d{6,7}$/ // Fijo
    ];
    
    return patterns.some(pattern => pattern.test(phone.replace(/\s+/g, '')));
  }

  /**
   * Validar email
   */
  isValidEmail(email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  }

  /**
   * Remover duplicados
   */
  removeDuplicates(publications) {
    const seen = new Set();
    const unique = [];
    
    for (const pub of publications) {
      // Crear clave única basada en título y descripción
      const key = `${pub.title?.toLowerCase().trim()}_${pub.description?.substring(0, 100).toLowerCase().trim()}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(pub);
      }
    }
    
    return unique;
  }

  /**
   * Mejorar datos de publicación
   */
  enhancePublication(publication) {
    const enhanced = { ...publication };
    
    // Generar slug si no existe
    if (!enhanced.slug && enhanced.title) {
      enhanced.slug = this.generateSlug(enhanced.title);
    }
    
    // Normalizar ubicación
    if (enhanced.location && typeof enhanced.location === 'string') {
      enhanced.location = {
        raw: enhanced.location,
        city: this.extractCity(enhanced.location),
        country: 'Peru',
        region: 'Cusco'
      };
    }
    
    // Normalizar contacto
    if (enhanced.contact) {
      if (enhanced.contact.phones && enhanced.contact.phones.length > 0) {
        enhanced.contact.primaryPhone = enhanced.contact.phones[0];
        enhanced.contact.hasWhatsApp = enhanced.contact.phones.some(phone => phone.startsWith('9'));
      }
    }
    
    // Normalizar pricing
    if (enhanced.pricing && enhanced.pricing.hasPrice) {
      enhanced.pricing.type = enhanced.pricing.type || 'fixed';
      enhanced.pricing.currency = enhanced.pricing.currency || 'PEN';
    }
    
    // Añadir timestamp de validación
    enhanced.validatedAt = new Date().toISOString();
    
    return enhanced;
  }

  /**
   * Generar slug a partir del título
   */
  generateSlug(title) {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
      .replace(/\s+/g, '-') // Espacios a guiones
      .replace(/-+/g, '-') // Múltiples guiones a uno
      .trim('-'); // Remover guiones al inicio/final
  }

  /**
   * Extraer ciudad de texto de ubicación
   */
  extractCity(locationText) {
    const cities = ['cusco', 'pisaq', 'urubamba', 'ollantaytambo', 'calca', 'maras'];
    const textLower = locationText.toLowerCase();
    
    for (const city of cities) {
      if (textLower.includes(city)) {
        return city.charAt(0).toUpperCase() + city.slice(1);
      }
    }
    
    return 'Cusco'; // Por defecto
  }

  /**
   * Generar reporte de archivo individual
   */
  async generateFileReport(fileName, validationResults, validationMetadata) {
    const report = {
      fileName,
      timestamp: new Date().toISOString(),
      summary: validationMetadata,
      details: {
        validPublications: validationResults.filter(r => r.isValid).length,
        invalidPublications: validationResults.filter(r => !r.isValid).length,
        totalErrors: validationResults.reduce((sum, r) => sum + r.errors.length, 0),
        totalWarnings: validationResults.reduce((sum, r) => sum + r.warnings.length, 0)
      },
      errors: validationResults
        .filter(r => r.errors.length > 0)
        .map(r => ({
          index: r.originalIndex,
          title: r.publication.title,
          errors: r.errors
        })),
      warnings: validationResults
        .filter(r => r.warnings.length > 0)
        .map(r => ({
          index: r.originalIndex,
          title: r.publication.title,
          warnings: r.warnings
        }))
    };
    
    const reportPath = path.join(VALIDATION_CONFIG.reportsDir, `${path.basename(fileName, '.json')}_report.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  }

  /**
   * Generar reporte final
   */
  async generateFinalReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: this.stats.totalFiles,
        processedFiles: this.stats.processedFiles,
        totalAds: this.stats.totalAds,
        validAds: this.stats.validAds,
        invalidAds: this.stats.invalidAds,
        duplicateAds: this.stats.duplicateAds,
        successRate: ((this.stats.validAds / this.stats.totalAds) * 100).toFixed(2) + '%'
      },
      errors: this.stats.errors,
      warnings: this.stats.warnings,
      recommendations: this.generateRecommendations()
    };
    
    const reportPath = path.join(VALIDATION_CONFIG.reportsDir, 'validation_summary.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    
    // También generar versión readable
    const readableReport = this.generateReadableReport(report);
    const txtReportPath = path.join(VALIDATION_CONFIG.reportsDir, 'validation_summary.txt');
    fs.writeFileSync(txtReportPath, readableReport, 'utf8');
  }

  /**
   * Generar recomendaciones
   */
  generateRecommendations() {
    const recommendations = [];
    
    if (this.stats.invalidAds > this.stats.validAds * 0.3) {
      recommendations.push('Alto porcentaje de avisos inválidos. Revisar criterios de extracción.');
    }
    
    if (this.stats.duplicateAds > this.stats.totalAds * 0.1) {
      recommendations.push('Muchos duplicados encontrados. Mejorar detección de duplicados en extracción.');
    }
    
    if (this.stats.errors.length > 0) {
      recommendations.push('Errores en archivos. Revisar calidad de PDFs fuente.');
    }
    
    return recommendations;
  }

  /**
   * Generar reporte legible
   */
  generateReadableReport(report) {
    return `
REPORTE DE VALIDACIÓN - BUSCADIS
================================
Fecha: ${new Date(report.timestamp).toLocaleString()}

RESUMEN GENERAL:
- Archivos procesados: ${report.summary.processedFiles}/${report.summary.totalFiles}
- Avisos totales: ${report.summary.totalAds}
- Avisos válidos: ${report.summary.validAds}
- Avisos inválidos: ${report.summary.invalidAds}
- Duplicados removidos: ${report.summary.duplicateAds}
- Tasa de éxito: ${report.summary.successRate}

${report.errors.length > 0 ? `
ERRORES ENCONTRADOS:
${report.errors.map(e => `- ${e.file}: ${e.error}`).join('\n')}
` : ''}

${report.recommendations.length > 0 ? `
RECOMENDACIONES:
${report.recommendations.map(r => `- ${r}`).join('\n')}
` : ''}

Archivos validados guardados en: ${VALIDATION_CONFIG.outputDir}
Reportes detallados en: ${VALIDATION_CONFIG.reportsDir}
    `.trim();
  }

  /**
   * Imprimir estadísticas finales
   */
  printFinalStats() {
    console.log('\n✅ VALIDACIÓN COMPLETADA');
    console.log('========================');
    console.log(`📄 Archivos procesados: ${this.stats.processedFiles}/${this.stats.totalFiles}`);
    console.log(`📊 Avisos totales: ${this.stats.totalAds}`);
    console.log(`✅ Avisos válidos: ${this.stats.validAds}`);
    console.log(`❌ Avisos inválidos: ${this.stats.invalidAds}`);
    console.log(`🔄 Duplicados removidos: ${this.stats.duplicateAds}`);
    console.log(`📈 Tasa de éxito: ${((this.stats.validAds / this.stats.totalAds) * 100).toFixed(2)}%`);
    
    if (this.stats.errors.length > 0) {
      console.log(`\n❌ Errores: ${this.stats.errors.length}`);
      this.stats.errors.forEach(error => {
        console.log(`   - ${error.file}: ${error.error}`);
      });
    }
    
    console.log(`\n📁 Archivos validados en: ${VALIDATION_CONFIG.outputDir}`);
    console.log(`📁 Reportes en: ${VALIDATION_CONFIG.reportsDir}`);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const validator = new JSONValidator();
  
  validator.validateAllFiles()
    .then(() => {
      console.log('\n🚀 Validación completada exitosamente');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error en validación:', error);
      process.exit(1);
    });
}

module.exports = JSONValidator; 