#!/usr/bin/env node

/**
 * SCRIPT MAESTRO DE IMPORTACIÓN - BUSCADIS
 * Ejecuta todo el proceso de importación paso a paso
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuración
const CONFIG = {
  directories: [
    'data/pdfs-originales',
    'data/textos-extraidos',
    'data/json-procesados',
    'data/json-validados',
    'data/import-reports',
    'data/verification-reports'
  ],
  
  scripts: {
    extract: path.join(__dirname, 'extract-pdf-data.js'),
    validate: path.join(__dirname, 'validate-json-data.js'),
    import: path.join(__dirname, 'massive-import.js'),
    indexes: path.join(__dirname, 'create-indexes.js'),
    verify: path.join(__dirname, 'verify-import.js')
  },
  
  requiredEnvVars: ['MONGODB_URI'],
  
  steps: [
    { name: 'setup', description: 'Verificar configuración y directorios' },
    { name: 'extract', description: 'Extraer datos de PDFs' },
    { name: 'validate', description: 'Validar y limpiar datos' },
    { name: 'import', description: 'Importar a base de datos' },
    { name: 'indexes', description: 'Crear índices optimizados' },
    { name: 'verify', description: 'Verificar importación' }
  ]
};

/**
 * Clase principal del script maestro
 */
class MasterImporter {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    this.stats = {
      startTime: null,
      endTime: null,
      completedSteps: [],
      errors: []
    };
  }

  /**
   * Ejecutar proceso completo
   */
  async runComplete() {
    console.log('🚀 BUSCADIS - IMPORTACIÓN MASIVA COMPLETA');
    console.log('========================================');
    console.log('Este script ejecutará todo el proceso de importación paso a paso.');
    console.log('Duración estimada: 30-60 minutos para 50 PDFs con 30,000+ avisos.\n');
    
    try {
      this.stats.startTime = new Date();
      
      // Mostrar información del proceso
      await this.showProcessInfo();
      
      // Confirmar ejecución
      const confirmed = await this.confirmExecution();
      if (!confirmed) {
        console.log('❌ Proceso cancelado por el usuario');
        return;
      }
      
      // Ejecutar cada paso
      for (let i = 0; i < CONFIG.steps.length; i++) {
        const step = CONFIG.steps[i];
        const stepNumber = i + 1;
        
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📋 PASO ${stepNumber}/${CONFIG.steps.length}: ${step.description.toUpperCase()}`);
        console.log(`${'='.repeat(60)}`);
        
        try {
          await this.executeStep(step.name, stepNumber);
          this.stats.completedSteps.push(step.name);
          
          console.log(`✅ Paso ${stepNumber} completado exitosamente`);
          
          // Pausa entre pasos
          if (i < CONFIG.steps.length - 1) {
            console.log('⏳ Pausa de 3 segundos...');
            await this.sleep(3000);
          }
          
        } catch (error) {
          console.error(`❌ Error en paso ${stepNumber}:`, error.message);
          this.stats.errors.push({ step: step.name, error: error.message });
          
          const shouldContinue = await this.askContinueOnError(step.name);
          if (!shouldContinue) {
            console.log('🛑 Proceso detenido por el usuario');
            break;
          }
        }
      }
      
      this.stats.endTime = new Date();
      
      // Mostrar resumen final
      this.showFinalSummary();
      
    } catch (error) {
      console.error('❌ Error crítico en el proceso:', error);
      throw error;
    } finally {
      this.rl.close();
    }
  }

  /**
   * Mostrar información del proceso
   */
  async showProcessInfo() {
    console.log('📊 INFORMACIÓN DEL PROCESO:');
    console.log('============================');
    
    // Verificar PDFs disponibles
    const pdfCount = this.countPDFs();
    console.log(`📄 PDFs encontrados: ${pdfCount}`);
    
    if (pdfCount === 0) {
      console.log('⚠️  ADVERTENCIA: No se encontraron archivos PDF en data/pdfs-originales/');
      console.log('   Por favor, coloca tus PDFs en ese directorio antes de continuar.');
    }
    
    // Verificar configuración
    console.log(`🔧 Variables de entorno: ${this.checkEnvVars() ? '✅' : '❌'}`);
    console.log(`📁 Directorios: ${this.checkDirectories() ? '✅' : '❌'}`);
    console.log(`📜 Scripts: ${this.checkScripts() ? '✅' : '❌'}`);
    
    // Estimaciones
    const estimatedTime = this.calculateEstimatedTime(pdfCount);
    const estimatedAds = pdfCount * 650; // Promedio de avisos por PDF
    
    console.log(`⏱️  Tiempo estimado: ${estimatedTime}`);
    console.log(`📊 Avisos estimados: ${estimatedAds.toLocaleString()}`);
    
    console.log('\n📋 PASOS A EJECUTAR:');
    CONFIG.steps.forEach((step, index) => {
      console.log(`   ${index + 1}. ${step.description}`);
    });
  }

  /**
   * Confirmar ejecución del proceso
   */
  async confirmExecution() {
    return new Promise((resolve) => {
      const question = '\n❓ ¿Deseas continuar con el proceso completo? (s/N): ';
      this.rl.question(question, (answer) => {
        resolve(answer.toLowerCase().startsWith('s'));
      });
    });
  }

  /**
   * Preguntar si continuar tras error
   */
  async askContinueOnError(stepName) {
    return new Promise((resolve) => {
      const question = `\n❓ Error en paso "${stepName}". ¿Continuar con el siguiente paso? (s/N): `;
      this.rl.question(question, (answer) => {
        resolve(answer.toLowerCase().startsWith('s'));
      });
    });
  }

  /**
   * Ejecutar un paso específico
   */
  async executeStep(stepName, stepNumber) {
    switch (stepName) {
      case 'setup':
        await this.executeSetup();
        break;
      case 'extract':
        await this.executeExtraction();
        break;
      case 'validate':
        await this.executeValidation();
        break;
      case 'import':
        await this.executeImport();
        break;
      case 'indexes':
        await this.executeIndexes();
        break;
      case 'verify':
        await this.executeVerification();
        break;
      default:
        throw new Error(`Paso desconocido: ${stepName}`);
    }
  }

  /**
   * Paso 1: Configuración
   */
  async executeSetup() {
    console.log('🔧 Verificando y creando configuración...');
    
    // Crear directorios
    this.ensureDirectories();
    
    // Verificar variables de entorno
    if (!this.checkEnvVars()) {
      throw new Error('Variables de entorno faltantes. Revisa tu .env.local');
    }
    
    // Verificar dependencias
    this.checkDependencies();
    
    console.log('✅ Configuración verificada correctamente');
  }

  /**
   * Paso 2: Extracción
   */
  async executeExtraction() {
    console.log('📖 Extrayendo datos de PDFs...');
    
    const pdfCount = this.countPDFs();
    if (pdfCount === 0) {
      throw new Error('No se encontraron archivos PDF para procesar');
    }
    
    console.log(`📄 Procesando ${pdfCount} archivos PDF...`);
    
    try {
      execSync(`node "${CONFIG.scripts.extract}"`, {
        stdio: 'inherit',
        cwd: process.cwd()
      });
    } catch (error) {
      throw new Error(`Error en extracción: ${error.message}`);
    }
    
    // Verificar resultados
    const jsonCount = this.countJSONFiles('json-procesados');
    console.log(`✅ Generados ${jsonCount} archivos JSON`);
    
    if (jsonCount === 0) {
      throw new Error('No se generaron archivos JSON. Revisar proceso de extracción');
    }
  }

  /**
   * Paso 3: Validación
   */
  async executeValidation() {
    console.log('🔍 Validando y limpiando datos...');
    
    const inputCount = this.countJSONFiles('json-procesados');
    if (inputCount === 0) {
      throw new Error('No hay archivos JSON para validar');
    }
    
    try {
      execSync(`node "${CONFIG.scripts.validate}"`, {
        stdio: 'inherit',
        cwd: process.cwd()
      });
    } catch (error) {
      throw new Error(`Error en validación: ${error.message}`);
    }
    
    // Verificar resultados
    const outputCount = this.countJSONFiles('json-validados');
    console.log(`✅ Validados ${outputCount} archivos JSON`);
    
    if (outputCount === 0) {
      throw new Error('No se generaron archivos JSON validados');
    }
  }

  /**
   * Paso 4: Importación
   */
  async executeImport() {
    console.log('📦 Importando datos a base de datos...');
    
    const inputCount = this.countJSONFiles('json-validados');
    if (inputCount === 0) {
      throw new Error('No hay archivos JSON validados para importar');
    }
    
    try {
      // Importación requiere interacción del usuario
      console.log('⚠️  NOTA: La importación requiere confirmación del usuario');
      console.log('   Se te preguntará si deseas eliminar datos existentes');
      
      execSync(`node "${CONFIG.scripts.import}"`, {
        stdio: 'inherit',
        cwd: process.cwd()
      });
    } catch (error) {
      throw new Error(`Error en importación: ${error.message}`);
    }
    
    console.log('✅ Importación completada');
  }

  /**
   * Paso 5: Índices
   */
  async executeIndexes() {
    console.log('🔍 Creando índices de base de datos...');
    
    try {
      execSync(`node "${CONFIG.scripts.indexes}"`, {
        stdio: 'inherit',
        cwd: process.cwd()
      });
    } catch (error) {
      throw new Error(`Error creando índices: ${error.message}`);
    }
    
    console.log('✅ Índices creados correctamente');
  }

  /**
   * Paso 6: Verificación
   */
  async executeVerification() {
    console.log('🔍 Verificando importación...');
    
    try {
      execSync(`node "${CONFIG.scripts.verify}"`, {
        stdio: 'inherit',
        cwd: process.cwd()
      });
    } catch (error) {
      throw new Error(`Error en verificación: ${error.message}`);
    }
    
    console.log('✅ Verificación completada');
  }

  /**
   * Crear directorios necesarios
   */
  ensureDirectories() {
    CONFIG.directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`   📁 Creado: ${dir}`);
      }
    });
  }

  /**
   * Verificar variables de entorno
   */
  checkEnvVars() {
    return CONFIG.requiredEnvVars.every(varName => {
      const value = process.env[varName];
      if (!value) {
        console.error(`   ❌ Variable faltante: ${varName}`);
        return false;
      }
      return true;
    });
  }

  /**
   * Verificar directorios
   */
  checkDirectories() {
    return CONFIG.directories.every(dir => {
      if (!fs.existsSync(dir)) {
        console.error(`   ❌ Directorio faltante: ${dir}`);
        return false;
      }
      return true;
    });
  }

  /**
   * Verificar scripts
   */
  checkScripts() {
    return Object.values(CONFIG.scripts).every(scriptPath => {
      if (!fs.existsSync(scriptPath)) {
        console.error(`   ❌ Script faltante: ${scriptPath}`);
        return false;
      }
      return true;
    });
  }

  /**
   * Verificar dependencias
   */
  checkDependencies() {
    const requiredPackages = ['pdf-parse', 'mongodb'];
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      const missingPackages = requiredPackages.filter(pkg => !allDeps[pkg]);
      
      if (missingPackages.length > 0) {
        console.warn('⚠️  Dependencias faltantes:', missingPackages.join(', '));
        console.warn('   Ejecuta: npm install ' + missingPackages.join(' '));
      }
    } catch (error) {
      console.warn('⚠️  No se pudo verificar dependencias');
    }
  }

  /**
   * Contar archivos PDF
   */
  countPDFs() {
    const pdfDir = 'data/pdfs-originales';
    if (!fs.existsSync(pdfDir)) return 0;
    
    return fs.readdirSync(pdfDir)
      .filter(file => file.toLowerCase().endsWith('.pdf'))
      .length;
  }

  /**
   * Contar archivos JSON
   */
  countJSONFiles(subdir) {
    const jsonDir = `data/${subdir}`;
    if (!fs.existsSync(jsonDir)) return 0;
    
    return fs.readdirSync(jsonDir)
      .filter(file => file.toLowerCase().endsWith('.json'))
      .length;
  }

  /**
   * Calcular tiempo estimado
   */
  calculateEstimatedTime(pdfCount) {
    if (pdfCount === 0) return 'N/A';
    
    // Estimaciones basadas en experiencia
    const minutesPerPDF = 1.5; // Tiempo promedio por PDF
    const baseOverhead = 10; // Tiempo base para setup, índices, etc.
    
    const totalMinutes = Math.ceil(pdfCount * minutesPerPDF + baseOverhead);
    
    if (totalMinutes < 60) {
      return `${totalMinutes} minutos`;
    } else {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${hours}h ${minutes}m`;
    }
  }

  /**
   * Mostrar resumen final
   */
  showFinalSummary() {
    const duration = this.stats.endTime - this.stats.startTime;
    const durationMinutes = Math.floor(duration / 60000);
    const durationSeconds = Math.floor((duration % 60000) / 1000);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 PROCESO COMPLETO FINALIZADO');
    console.log('='.repeat(60));
    
    console.log(`⏱️  Duración total: ${durationMinutes}m ${durationSeconds}s`);
    console.log(`✅ Pasos completados: ${this.stats.completedSteps.length}/${CONFIG.steps.length}`);
    console.log(`❌ Errores: ${this.stats.errors.length}`);
    
    if (this.stats.completedSteps.length === CONFIG.steps.length) {
      console.log('\n🚀 ¡IMPORTACIÓN COMPLETADA EXITOSAMENTE!');
      console.log('');
      console.log('Tu plataforma BuscAdis ahora tiene:');
      console.log('✅ Miles de publicaciones reales');
      console.log('✅ Base de datos optimizada');
      console.log('✅ Índices de búsqueda rápida');
      console.log('✅ Datos verificados y limpios');
      console.log('');
      console.log('🌐 La aplicación está lista para uso en producción');
      console.log('');
      console.log('📊 Próximos pasos recomendados:');
      console.log('   1. Probar la aplicación web');
      console.log('   2. Verificar búsquedas y filtros');
      console.log('   3. Configurar el dominio de producción');
      console.log('   4. Implementar analytics y monitoreo');
    } else {
      console.log('\n⚠️  PROCESO PARCIALMENTE COMPLETADO');
      console.log('');
      console.log('Pasos completados:');
      this.stats.completedSteps.forEach(step => {
        console.log(`   ✅ ${step}`);
      });
      
      if (this.stats.errors.length > 0) {
        console.log('\nErrores encontrados:');
        this.stats.errors.forEach(error => {
          console.log(`   ❌ ${error.step}: ${error.error}`);
        });
      }
      
      console.log('\n💡 Recomendación: Revisar errores y ejecutar pasos faltantes manualmente');
    }
    
    console.log('\n📁 Reportes y logs disponibles en:');
    console.log('   - data/import-reports/');
    console.log('   - data/verification-reports/');
    console.log('   - data/validation-reports/');
  }

  /**
   * Utilidad para sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Funciones de utilidad para ejecución selectiva
async function runSingleStep(stepName) {
  const importer = new MasterImporter();
  
  try {
    console.log(`🚀 Ejecutando paso: ${stepName}`);
    await importer.executeStep(stepName, 1);
    console.log(`✅ Paso "${stepName}" completado`);
  } catch (error) {
    console.error(`❌ Error en paso "${stepName}":`, error.message);
    process.exit(1);
  } finally {
    importer.rl.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'help' || command === '--help' || command === '-h') {
    console.log(`
🚀 BUSCADIS - SCRIPT MAESTRO DE IMPORTACIÓN

COMANDOS:
  node import-all.js                 # Ejecutar proceso completo
  node import-all.js setup          # Solo verificar configuración
  node import-all.js extract        # Solo extraer PDFs
  node import-all.js validate       # Solo validar datos
  node import-all.js import         # Solo importar a BD
  node import-all.js indexes        # Solo crear índices
  node import-all.js verify         # Solo verificar

EJEMPLOS:
  node import-all.js                 # Proceso completo (recomendado)
  node import-all.js extract        # Solo procesar PDFs
  node import-all.js help           # Mostrar esta ayuda

PREPARACIÓN:
  1. Colocar PDFs en: data/pdfs-originales/
  2. Configurar MONGODB_URI en .env.local
  3. Ejecutar: node import-all.js
    `);
    process.exit(0);
  }
  
  if (CONFIG.steps.some(step => step.name === command)) {
    // Ejecutar paso específico
    runSingleStep(command);
  } else {
    // Ejecutar proceso completo
    const importer = new MasterImporter();
    
    importer.runComplete()
      .then(() => {
        console.log('\n🎉 Proceso maestro completado');
        process.exit(0);
      })
      .catch(error => {
        console.error('\n❌ Error en proceso maestro:', error);
        process.exit(1);
      });
  }
}

module.exports = MasterImporter; 