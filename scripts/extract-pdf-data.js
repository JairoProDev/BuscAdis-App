/**
 * EXTRACTOR AUTOMÁTICO DE PDFs - BUSCADIS
 * Convierte PDFs de revistas de avisos clasificados a JSON estructurado
 */

const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const { execSync } = require('child_process');

// Configuración
const CONFIG = {
  // Directorios
  inputDir: path.join(__dirname, '../data/pdfs-originales'),
  outputDir: path.join(__dirname, '../data/json-procesados'),
  textDir: path.join(__dirname, '../data/textos-extraidos'),
  
  // Procesamiento
  batchSize: 5, // Procesar 5 PDFs a la vez
  enableOCR: true, // Usar OCR si el PDF es imagen
  validateExtraction: true, // Validar datos extraídos
  
  // Patrones de extracción
  patterns: {
    // Patrones regex para detectar avisos
    adSeparators: [
      /^\s*-{3,}\s*$/gm,      // Líneas con guiones
      /^\s*={3,}\s*$/gm,      // Líneas con igual
      /^\s*\*{3,}\s*$/gm,     // Líneas con asteriscos
      /^\s*\d+\.\s*$/gm,      // Números con punto
    ],
    
    // Patrones para extraer información
    phone: /(?:\+51\s?)?(?:9\d{8}|\d{2,3}[-\s]?\d{6,7})/g,
    whatsapp: /(?:whatsapp|wsp|what|wa)[\s:]*(?:\+51\s?)?9\d{8}/gi,
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    price: /(?:S\/\.?\s?|USD\s?|US\$\s?)?([\d,]+(?:\.\d{2})?)/g,
    
    // Categorías comunes
    categories: {
      'inmuebles': ['casa', 'departamento', 'depa', 'terreno', 'local', 'oficina', 'alquiler', 'venta', 'inmueble'],
      'empleos': ['trabajo', 'empleo', 'se busca', 'requiere', 'solicita', 'personal', 'trabajador'],
      'vehiculos': ['auto', 'carro', 'moto', 'camion', 'vehiculo', 'toyota', 'nissan', 'hyundai'],
      'servicios': ['servicio', 'clases', 'reparo', 'limpieza', 'construccion', 'profesor'],
      'productos': ['vendo', 'se vende', 'producto', 'equipo', 'herramienta', 'mueble'],
      'eventos': ['evento', 'fiesta', 'concierto', 'show', 'espectaculo'],
      'comunidad': ['intercambio', 'trueque', 'busco', 'regalo', 'donacion'],
      'negocios': ['negocio', 'inversion', 'sociedad', 'empresa', 'fondo de comercio']
    }
  }
};

/**
 * Clase principal para extraer datos de PDFs
 */
class PDFExtractor {
  constructor() {
    this.ensureDirectories();
    this.stats = {
      totalPDFs: 0,
      processedPDFs: 0,
      totalAds: 0,
      validAds: 0,
      errors: []
    };
  }

  /**
   * Crear directorios necesarios
   */
  ensureDirectories() {
    [CONFIG.inputDir, CONFIG.outputDir, CONFIG.textDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Creado directorio: ${dir}`);
      }
    });
  }

  /**
   * Procesar todos los PDFs
   */
  async processAllPDFs() {
    console.log('🚀 INICIANDO EXTRACCIÓN MASIVA DE PDFs');
    console.log('=====================================');
    
    try {
      // Obtener lista de PDFs
      const pdfFiles = this.getPDFFiles();
      this.stats.totalPDFs = pdfFiles.length;
      
      console.log(`📄 Encontrados ${pdfFiles.length} archivos PDF`);
      
      if (pdfFiles.length === 0) {
        console.log(`❌ No se encontraron archivos PDF en: ${CONFIG.inputDir}`);
        console.log(`💡 Coloca tus PDFs en: ${CONFIG.inputDir}`);
        return;
      }

      // Procesar en lotes
      for (let i = 0; i < pdfFiles.length; i += CONFIG.batchSize) {
        const batch = pdfFiles.slice(i, i + CONFIG.batchSize);
        console.log(`\n🔄 Procesando lote ${Math.floor(i / CONFIG.batchSize) + 1}/${Math.ceil(pdfFiles.length / CONFIG.batchSize)}`);
        
        await this.processBatch(batch);
        
        // Pausa entre lotes
        if (i + CONFIG.batchSize < pdfFiles.length) {
          console.log('⏳ Pausa de 2 segundos...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      this.printFinalStats();
      
    } catch (error) {
      console.error('❌ Error en procesamiento masivo:', error);
      throw error;
    }
  }

  /**
   * Obtener lista de archivos PDF
   */
  getPDFFiles() {
    return fs.readdirSync(CONFIG.inputDir)
      .filter(file => file.toLowerCase().endsWith('.pdf'))
      .sort(); // Procesar en orden alfabético
  }

  /**
   * Procesar un lote de PDFs
   */
  async processBatch(pdfFiles) {
    const promises = pdfFiles.map(file => this.processPDF(file));
    await Promise.allSettled(promises);
  }

  /**
   * Procesar un PDF individual
   */
  async processPDF(fileName) {
    const filePath = path.join(CONFIG.inputDir, fileName);
    const baseName = path.basename(fileName, '.pdf');
    
    console.log(`📖 Procesando: ${fileName}`);
    
    try {
      // 1. Extraer texto del PDF
      const text = await this.extractTextFromPDF(filePath);
      
      // 2. Guardar texto extraído
      const textPath = path.join(CONFIG.textDir, `${baseName}.txt`);
      fs.writeFileSync(textPath, text, 'utf8');
      
      // 3. Procesar texto y extraer avisos
      const ads = this.extractAdsFromText(text, fileName);
      
      // 4. Validar avisos extraídos
      const validAds = CONFIG.validateExtraction ? this.validateAds(ads) : ads;
      
      // 5. Guardar JSON resultante
      const jsonPath = path.join(CONFIG.outputDir, `${baseName}.json`);
      const outputData = {
        metadata: {
          sourceFile: fileName,
          extractionDate: new Date().toISOString(),
          method: 'automatic',
          totalAds: validAds.length,
          textLength: text.length
        },
        publications: validAds
      };
      
      fs.writeFileSync(jsonPath, JSON.stringify(outputData, null, 2), 'utf8');
      
      // 6. Actualizar estadísticas
      this.stats.processedPDFs++;
      this.stats.totalAds += validAds.length;
      this.stats.validAds += validAds.length;
      
      console.log(`✅ ${fileName}: ${validAds.length} avisos extraídos`);
      
    } catch (error) {
      this.stats.errors.push({
        file: fileName,
        error: error.message
      });
      console.error(`❌ Error procesando ${fileName}:`, error.message);
    }
  }

  /**
   * Extraer texto del PDF
   */
  async extractTextFromPDF(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      
      let text = data.text;
      
      // Si el texto está vacío y OCR está habilitado
      if (text.trim().length < 100 && CONFIG.enableOCR) {
        console.log('   🔍 Texto insuficiente, intentando OCR...');
        text = await this.extractWithOCR(filePath);
      }
      
      return text;
    } catch (error) {
      throw new Error(`Error extrayendo texto: ${error.message}`);
    }
  }

  /**
   * Extraer texto usando OCR (para PDFs de imagen)
   */
  async extractWithOCR(filePath) {
    try {
      // Usar tesseract si está disponible
      const command = `tesseract "${filePath}" stdout -l spa`;
      const text = execSync(command, { encoding: 'utf8' });
      return text;
    } catch (error) {
      console.log('   ⚠️  OCR no disponible, usando texto parcial');
      return ''; // Retornar texto vacío si OCR falla
    }
  }

  /**
   * Extraer avisos del texto
   */
  extractAdsFromText(text, fileName) {
    console.log('   🔍 Extrayendo avisos del texto...');
    
    // Dividir texto en posibles avisos
    const sections = this.splitTextIntoSections(text);
    
    // Procesar cada sección
    const ads = [];
    sections.forEach((section, index) => {
      const ad = this.processTextSection(section, fileName, index + 1);
      if (ad) {
        ads.push(ad);
      }
    });
    
    console.log(`   📊 Encontrados ${ads.length} avisos potenciales`);
    return ads;
  }

  /**
   * Dividir texto en secciones (posibles avisos)
   */
  splitTextIntoSections(text) {
    // Intentar dividir por patrones comunes
    let sections = [];
    
    // Dividir por líneas vacías (método más común)
    sections = text.split(/\n\s*\n/).filter(section => section.trim().length > 20);
    
    // Si hay pocas secciones, intentar otros separadores
    if (sections.length < 10) {
      // Intentar dividir por números al inicio de línea
      sections = text.split(/\n(?=\d+\.)/g).filter(section => section.trim().length > 20);
    }
    
    // Si aún hay pocas secciones, dividir por cantidad de caracteres
    if (sections.length < 5) {
      const avgLength = Math.max(200, text.length / 50); // Estimación
      sections = this.splitByLength(text, avgLength);
    }
    
    return sections;
  }

  /**
   * Dividir texto por longitud estimada
   */
  splitByLength(text, avgLength) {
    const sections = [];
    const lines = text.split('\n');
    let currentSection = '';
    
    for (const line of lines) {
      currentSection += line + '\n';
      
      if (currentSection.length >= avgLength) {
        sections.push(currentSection.trim());
        currentSection = '';
      }
    }
    
    if (currentSection.trim()) {
      sections.push(currentSection.trim());
    }
    
    return sections;
  }

  /**
   * Procesar una sección de texto como aviso
   */
  processTextSection(section, fileName, sectionNumber) {
    const text = section.trim();
    
    // Filtrar secciones muy cortas o que no parecen avisos
    if (text.length < 30) return null;
    
    // Extraer información básica
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    if (lines.length < 2) return null;
    
    // Primer línea como título (o primera línea significativa)
    const title = this.extractTitle(lines);
    if (!title) return null;
    
    // Resto como descripción
    const description = this.extractDescription(lines, title);
    
    // Información de contacto
    const contact = this.extractContact(text);
    
    // Precio
    const pricing = this.extractPricing(text);
    
    // Categoría (estimada)
    const category = this.estimateCategory(text);
    
    // Ubicación
    const location = this.extractLocation(text);
    
    return {
      title: title,
      description: description,
      category: category.main,
      subcategory: category.sub,
      location: location,
      contact: contact,
      pricing: pricing,
      metadata: {
        sourceFile: fileName,
        sectionNumber: sectionNumber,
        extractionMethod: 'automatic',
        confidence: this.calculateConfidence(text, title, description, contact)
      }
    };
  }

  /**
   * Extraer título del aviso
   */
  extractTitle(lines) {
    // Buscar la primera línea que parezca un título
    for (const line of lines) {
      if (line.length > 10 && line.length < 100) {
        // Evitar líneas que son claramente datos de contacto
        if (!CONFIG.patterns.phone.test(line) && !CONFIG.patterns.email.test(line)) {
          return line;
        }
      }
    }
    
    // Si no encontramos título, usar primera línea
    return lines[0] ? lines[0].substring(0, 80) : null;
  }

  /**
   * Extraer descripción del aviso
   */
  extractDescription(lines, title) {
    // Unir todas las líneas excepto la del título
    const descriptionLines = lines.filter(line => line !== title);
    return descriptionLines.join(' ').substring(0, 500);
  }

  /**
   * Extraer información de contacto
   */
  extractContact(text) {
    const phones = text.match(CONFIG.patterns.phone) || [];
    const emails = text.match(CONFIG.patterns.email) || [];
    
    // Limpiar números de teléfono
    const cleanPhones = phones.map(phone => phone.replace(/\s+/g, ''));
    
    return {
      phones: cleanPhones,
      emails: emails,
      hasContact: cleanPhones.length > 0 || emails.length > 0
    };
  }

  /**
   * Extraer información de precio
   */
  extractPricing(text) {
    const priceMatches = text.match(CONFIG.patterns.price);
    
    if (!priceMatches) {
      return { hasPrice: false };
    }
    
    // Tomar el primer precio encontrado
    const priceText = priceMatches[0];
    const amount = parseFloat(priceText.replace(/[^\d.]/g, ''));
    
    // Detectar moneda
    const currency = text.includes('USD') || text.includes('US$') ? 'USD' : 'PEN';
    
    return {
      amount: amount,
      currency: currency,
      hasPrice: true,
      originalText: priceText
    };
  }

  /**
   * Estimar categoría del aviso
   */
  estimateCategory(text) {
    const textLower = text.toLowerCase();
    
    for (const [category, keywords] of Object.entries(CONFIG.patterns.categories)) {
      for (const keyword of keywords) {
        if (textLower.includes(keyword)) {
          return {
            main: category,
            sub: this.estimateSubcategory(category, textLower),
            confidence: 0.8
          };
        }
      }
    }
    
    return {
      main: 'productos', // Categoría por defecto
      sub: 'general',
      confidence: 0.3
    };
  }

  /**
   * Estimar subcategoría
   */
  estimateSubcategory(category, text) {
    const subcategories = {
      'inmuebles': {
        'casas': ['casa', 'vivienda'],
        'departamentos': ['departamento', 'depa'],
        'terrenos': ['terreno', 'lote'],
        'locales': ['local', 'comercial']
      },
      'empleos': {
        'profesionales': ['profesional', 'ingeniero', 'doctor'],
        'servicios': ['limpieza', 'seguridad', 'vendedor'],
        'construccion': ['construccion', 'albañil', 'soldador']
      },
      'vehiculos': {
        'autos': ['auto', 'carro', 'sedan'],
        'motos': ['moto', 'motocicleta'],
        'camiones': ['camion', 'camioneta']
      }
    };
    
    if (subcategories[category]) {
      for (const [sub, keywords] of Object.entries(subcategories[category])) {
        for (const keyword of keywords) {
          if (text.includes(keyword)) {
            return sub;
          }
        }
      }
    }
    
    return 'general';
  }

  /**
   * Extraer ubicación
   */
  extractLocation(text) {
    // Buscar ubicaciones comunes en Cusco
    const locations = [
      'cusco', 'san blas', 'centro historico', 'wanchaq', 'santiago',
      'san sebastian', 'pisaq', 'urubamba', 'ollantaytambo', 'machu picchu'
    ];
    
    const textLower = text.toLowerCase();
    for (const location of locations) {
      if (textLower.includes(location)) {
        return location;
      }
    }
    
    return 'cusco'; // Ubicación por defecto
  }

  /**
   * Calcular confianza de la extracción
   */
  calculateConfidence(text, title, description, contact) {
    let confidence = 0.5; // Base
    
    // Factores que aumentan confianza
    if (title && title.length > 10) confidence += 0.1;
    if (description && description.length > 50) confidence += 0.1;
    if (contact.hasContact) confidence += 0.2;
    if (text.length > 100) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Validar avisos extraídos
   */
  validateAds(ads) {
    return ads.filter(ad => {
      // Filtros de validación
      if (!ad.title || ad.title.length < 5) return false;
      if (!ad.description || ad.description.length < 20) return false;
      if (!ad.contact || !ad.contact.hasContact) return false;
      if (ad.metadata.confidence < 0.4) return false;
      
      return true;
    });
  }

  /**
   * Imprimir estadísticas finales
   */
  printFinalStats() {
    console.log('\n🎉 EXTRACCIÓN COMPLETADA');
    console.log('========================');
    console.log(`📄 PDFs procesados: ${this.stats.processedPDFs}/${this.stats.totalPDFs}`);
    console.log(`📊 Total avisos extraídos: ${this.stats.totalAds}`);
    console.log(`✅ Avisos válidos: ${this.stats.validAds}`);
    console.log(`❌ Errores: ${this.stats.errors.length}`);
    
    if (this.stats.errors.length > 0) {
      console.log('\n❌ ERRORES ENCONTRADOS:');
      this.stats.errors.forEach(error => {
        console.log(`   - ${error.file}: ${error.error}`);
      });
    }
    
    console.log(`\n📁 Archivos JSON generados en: ${CONFIG.outputDir}`);
    console.log(`📁 Archivos de texto en: ${CONFIG.textDir}`);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const extractor = new PDFExtractor();
  
  extractor.processAllPDFs()
    .then(() => {
      console.log('\n🚀 Proceso completado exitosamente');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error en proceso:', error);
      process.exit(1);
    });
}

module.exports = PDFExtractor; 