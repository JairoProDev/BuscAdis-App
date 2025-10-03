#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import * as pdf from 'pdf-parse';

interface PDFExtractionResult {
  text: string;
  pages: number;
  metadata: any;
}

interface AdExtractionResult {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  price?: number;
  contact: {
    phones: string[];
    email?: string;
    name?: string;
  };
  location: {
    district?: string;
    address?: string;
  };
  attributes?: Record<string, any>;
}

class PDFExtractor {
  /**
   * Extrae texto de un archivo PDF
   */
  async extractTextFromPDF(filePath: string): Promise<PDFExtractionResult> {
    try {
      console.log(`📄 Extrayendo texto de: ${path.basename(filePath)}`);
      
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      
      return {
        text: data.text,
        pages: data.numpages,
        metadata: data.info
      };
    } catch (error) {
      console.error(`❌ Error extrayendo PDF ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Parsea el texto extraído para identificar adisos
   */
  parseAdsFromText(text: string, publicationDate: Date): AdExtractionResult[] {
    const ads: AdExtractionResult[] = [];
    
    // Dividir el texto en líneas
    const lines = text.split('\n').filter(line => line.trim());
    
    let currentAd: Partial<AdExtractionResult> = {};
    let inAd = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detectar inicio de adiso (patrones comunes)
      if (this.isAdStart(line)) {
        if (inAd && this.isValidAd(currentAd)) {
          ads.push(this.finalizeAd(currentAd, publicationDate));
        }
        
        currentAd = {
          title: line,
          contact: { phones: [] },
          location: {}
        };
        inAd = true;
        continue;
      }
      
      if (inAd) {
        // Extraer información del adiso
        this.extractAdInfo(line, currentAd);
        
        // Detectar fin de adiso
        if (this.isAdEnd(line) || this.isNextAdStart(lines, i)) {
          if (this.isValidAd(currentAd)) {
            ads.push(this.finalizeAd(currentAd, publicationDate));
          }
          currentAd = {};
          inAd = false;
        }
      }
    }
    
    // Agregar último adiso si existe
    if (inAd && this.isValidAd(currentAd)) {
      ads.push(this.finalizeAd(currentAd, publicationDate));
    }
    
    return ads;
  }

  /**
   * Detecta si una línea es el inicio de un adiso
   */
  private isAdStart(line: string): boolean {
    const adStartPatterns = [
      /^(Vendo|Alquilo|Compro|Busco|Ofrezco|Se busca|Cambio|Vendo|Alquilo)/i,
      /^\d+\./, // Números de adiso
      /^[A-Z][A-Z\s]{3,}/, // Títulos en mayúsculas
    ];
    
    return adStartPatterns.some(pattern => pattern.test(line));
  }

  /**
   * Detecta si una línea es el fin de un adiso
   */
  private isAdEnd(line: string): boolean {
    const adEndPatterns = [
      /^\d{9,}$/, // Números de teléfono largos
      /^[A-Z\s]{10,}$/, // Bloques de texto en mayúsculas
      /^$/, // Línea vacía
    ];
    
    return adEndPatterns.some(pattern => pattern.test(line));
  }

  /**
   * Detecta si la siguiente línea es inicio de otro adiso
   */
  private isNextAdStart(lines: string[], currentIndex: number): boolean {
    if (currentIndex + 1 >= lines.length) return false;
    
    const nextLine = lines[currentIndex + 1].trim();
    return this.isAdStart(nextLine);
  }

  /**
   * Extrae información específica de una línea del adiso
   */
  private extractAdInfo(line: string, ad: Partial<AdExtractionResult>): void {
    // Extraer teléfonos
    const phoneMatches = line.match(/(\+51\s?)?(\d{3}\s?\d{3}\s?\d{3}|\d{9})/g);
    if (phoneMatches) {
      ad.contact!.phones.push(...phoneMatches);
    }
    
    // Extraer email
    const emailMatch = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      ad.contact!.email = emailMatch[0];
    }
    
    // Extraer precio
    const priceMatch = line.match(/S\/?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
    if (priceMatch) {
      ad.price = parseFloat(priceMatch[1].replace(/,/g, ''));
    }
    
    // Extraer ubicación
    const districts = ['Wanchaq', 'San Sebastián', 'Cusco', 'Santiago', 'San Blas', 'Magisterio'];
    for (const district of districts) {
      if (line.includes(district)) {
        ad.location!.district = district;
        break;
      }
    }
    
    // Extraer nombre de contacto
    if (line.includes('Sr.') || line.includes('Sra.') || line.includes('Contacto:')) {
      const nameMatch = line.match(/(?:Sr\.|Sra\.|Contacto:)\s*([A-Za-z\s]+)/);
      if (nameMatch) {
        ad.contact!.name = nameMatch[1].trim();
      }
    }
  }

  /**
   * Valida si un adiso tiene la información mínima requerida
   */
  private isValidAd(ad: Partial<AdExtractionResult>): boolean {
    return !!(
      ad.title &&
      ad.title.length > 5 &&
      ad.contact?.phones?.length > 0
    );
  }

  /**
   * Finaliza y limpia un adiso
   */
  private finalizeAd(ad: Partial<AdExtractionResult>, publicationDate: Date): AdExtractionResult {
    // Categorizar automáticamente basándose en el título
    const category = this.categorizeAd(ad.title || '');
    
    return {
      title: ad.title || 'Adiso sin título',
      description: ad.description || ad.title || 'Sin descripción',
      category: category.main,
      subcategory: category.sub,
      price: ad.price,
      contact: {
        phones: ad.contact?.phones || [],
        email: ad.contact?.email,
        name: ad.contact?.name
      },
      location: {
        district: ad.location?.district,
        address: ad.location?.address
      },
      attributes: ad.attributes
    };
  }

  /**
   * Categoriza automáticamente un adiso basándose en su título
   */
  private categorizeAd(title: string): { main: string; sub: string } {
    const lowerTitle = title.toLowerCase();
    
    // Inmuebles
    if (lowerTitle.includes('departamento') || lowerTitle.includes('casa') || 
        lowerTitle.includes('terreno') || lowerTitle.includes('local')) {
      return {
        main: 'inmuebles',
        sub: lowerTitle.includes('departamento') ? 'departamentos' :
             lowerTitle.includes('casa') ? 'casas' :
             lowerTitle.includes('terreno') ? 'terrenos' : 'locales'
      };
    }
    
    // Vehículos
    if (lowerTitle.includes('auto') || lowerTitle.includes('carro') || 
        lowerTitle.includes('moto') || lowerTitle.includes('camioneta')) {
      return {
        main: 'vehiculos',
        sub: lowerTitle.includes('auto') || lowerTitle.includes('carro') ? 'autos' :
             lowerTitle.includes('moto') ? 'motos' : 'camionetas'
      };
    }
    
    // Empleos
    if (lowerTitle.includes('trabajo') || lowerTitle.includes('empleo') || 
        lowerTitle.includes('busco') || lowerTitle.includes('se busca')) {
      return {
        main: 'empleos',
        sub: 'varios'
      };
    }
    
    // Servicios
    if (lowerTitle.includes('servicio') || lowerTitle.includes('ofrezco') || 
        lowerTitle.includes('profesional')) {
      return {
        main: 'servicios',
        sub: 'varios'
      };
    }
    
    // Productos
    if (lowerTitle.includes('vendo') || lowerTitle.includes('producto') || 
        lowerTitle.includes('artículo')) {
      return {
        main: 'productos',
        sub: 'varios'
      };
    }
    
    // Por defecto
    return {
      main: 'varios',
      sub: 'otros'
    };
  }

  /**
   * Procesa un directorio completo de PDFs
   */
  async processDirectory(directoryPath: string): Promise<AdExtractionResult[]> {
    const allAds: AdExtractionResult[] = [];
    
    const files = fs.readdirSync(directoryPath)
      .filter(file => file.endsWith('.pdf'))
      .sort();
    
    console.log(`📁 Procesando ${files.length} archivos PDF...`);
    
    for (const file of files) {
      try {
        const filePath = path.join(directoryPath, file);
        
        // Extraer fecha del nombre del archivo
        const dateMatch = file.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (!dateMatch) {
          console.warn(`⚠️ Formato de fecha no válido en: ${file}`);
          continue;
        }
        
        const [, year, month, day] = dateMatch;
        const publicationDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        
        // Extraer texto del PDF
        const extraction = await this.extractTextFromPDF(filePath);
        
        // Parsear adisos
        const ads = this.parseAdsFromText(extraction.text, publicationDate);
        
        console.log(`✅ ${file}: ${ads.length} adisos extraídos`);
        
        allAds.push(...ads);
        
      } catch (error) {
        console.error(`❌ Error procesando ${file}:`, error);
      }
    }
    
    return allAds;
  }
}

// Función principal para testing
async function main() {
  const extractor = new PDFExtractor();
  
  const pdfDirectory = process.argv[2] || './pdfs';
  
  if (!fs.existsSync(pdfDirectory)) {
    console.error(`❌ El directorio ${pdfDirectory} no existe`);
    process.exit(1);
  }
  
  try {
    const ads = await extractor.processDirectory(pdfDirectory);
    
    console.log(`\n📊 RESULTADOS DE EXTRACCIÓN`);
    console.log('==========================');
    console.log(`Total de adisos extraídos: ${ads.length}`);
    
    // Estadísticas por categoría
    const categoryStats: Record<string, number> = {};
    ads.forEach(ad => {
      categoryStats[ad.category] = (categoryStats[ad.category] || 0) + 1;
    });
    
    console.log('\nPor categoría:');
    Object.entries(categoryStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`  ${category}: ${count}`);
      });
    
    // Guardar resultados en JSON
    const outputPath = path.join(pdfDirectory, 'extracted_ads.json');
    fs.writeFileSync(outputPath, JSON.stringify(ads, null, 2));
    console.log(`\n💾 Resultados guardados en: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Error durante la extracción:', error);
    process.exit(1);
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main();
}

export { PDFExtractor }; 