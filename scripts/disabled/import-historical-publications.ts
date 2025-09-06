#!/usr/bin/env ts-node

import { MongoClient, Db } from 'mongodb';
import * as fs from 'fs';
import * as path from 'path';
import { Publication } from '../src/types/publications';
import { 
  prepareHistoricalPublication, 
  validateHistoricalPublication,
  calculateHistoricalStats 
} from '../src/utils/publicationUtils';

// Configuración
const MONGODB_URI = process.env.MONGODB_URI!;
const MONGODB_DB = process.env.MONGODB_DB || 'buscadis';
const BATCH_SIZE = 100; // Procesar en lotes para evitar sobrecarga
const DELAY_BETWEEN_BATCHES = 1000; // 1 segundo entre lotes

// Interfaces para el parsing de PDF
interface PDFAdData {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  subSubcategory?: string;
  price?: number;
  currency?: 'PEN' | 'USD';
  contact: {
    phones: string[];
    email?: string;
    name?: string;
  };
  location: {
    district?: string;
    address?: string;
    referencePoint?: string;
  };
  originalPublicationDate: Date;
  magazineEdition: string;
  magazineYear: number;
  originalAdSize?: string;
  originalPageNumber?: number;
  attributes?: Record<string, any>;
}

interface ImportStats {
  total: number;
  successful: number;
  failed: number;
  skipped: number;
  errors: string[];
  categories: Record<string, number>;
  dateRange: {
    earliest: Date | null;
    latest: Date | null;
  };
}

class HistoricalPublicationImporter {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private stats: ImportStats;

  constructor() {
    this.stats = {
      total: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      errors: [],
      categories: {},
      dateRange: {
        earliest: null,
        latest: null
      }
    };
  }

  async connect(): Promise<void> {
    try {
      console.log('🔌 Conectando a MongoDB...');
      this.client = new MongoClient(MONGODB_URI);
      await this.client.connect();
      this.db = this.client.db(MONGODB_DB);
      console.log('✅ Conexión exitosa a MongoDB');
    } catch (error) {
      console.error('❌ Error conectando a MongoDB:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      console.log('🔌 Conexión cerrada');
    }
  }

  /**
   * Procesa un archivo PDF y extrae los anuncios
   */
  async processPDFFile(filePath: string): Promise<PDFAdData[]> {
    console.log(`📄 Procesando archivo: ${path.basename(filePath)}`);
    
    // TODO: Implementar extracción real de PDF
    // Por ahora, simulamos datos de ejemplo
    return this.simulatePDFExtraction(filePath);
  }

  /**
   * Simula la extracción de datos de un PDF
   * En producción, aquí usarías una librería como pdf-parse o similar
   */
  private simulatePDFExtraction(filePath: string): PDFAdData[] {
    const fileName = path.basename(filePath);
    const dateMatch = fileName.match(/(\d{4})-(\d{2})-(\d{2})/);
    
    if (!dateMatch) {
      throw new Error(`Formato de fecha no válido en el archivo: ${fileName}`);
    }

    const [, year, month, day] = dateMatch;
    const publicationDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    // Simular 650 anuncios por revista
    const ads: PDFAdData[] = [];
    
    for (let i = 0; i < 650; i++) {
      ads.push({
        title: `Anuncio ${i + 1} - ${this.getRandomTitle()}`,
        description: `Descripción del anuncio ${i + 1}. ${this.getRandomDescription()}`,
        category: this.getRandomCategory(),
        subcategory: this.getRandomSubcategory(),
        price: Math.random() > 0.3 ? Math.floor(Math.random() * 50000) + 100 : undefined,
        currency: 'PEN' as const,
        contact: {
          phones: [`+51${Math.floor(Math.random() * 900000000) + 100000000}`],
          name: Math.random() > 0.2 ? `Contacto ${i + 1}` : undefined,
        },
        location: {
          district: this.getRandomDistrict(),
        },
        originalPublicationDate: publicationDate,
        magazineEdition: fileName.replace('.pdf', ''),
        magazineYear: parseInt(year),
        originalAdSize: this.getRandomAdSize(),
        originalPageNumber: Math.floor(Math.random() * 50) + 1,
        attributes: this.getRandomAttributes(),
      });
    }

    return ads;
  }

  /**
   * Convierte datos del PDF al formato de Publication
   */
  private convertToPublication(pdfData: PDFAdData): Partial<Publication> {
    return {
      title: pdfData.title,
      description: pdfData.description,
      categorySlug: pdfData.category,
      subcategorySlug: pdfData.subcategory,
      subSubcategorySlug: pdfData.subSubcategory,
      amount: pdfData.price,
      currency: pdfData.currency,
      contact: pdfData.contact,
      location: {
        province: 'Cusco',
        district: pdfData.location.district,
        address: pdfData.location.address,
        referencePoint: pdfData.location.referencePoint,
      },
      originalPublicationDate: pdfData.originalPublicationDate,
      magazineEdition: pdfData.magazineEdition,
      magazineYear: pdfData.magazineYear,
      originalAdSize: pdfData.originalAdSize,
      originalPageNumber: pdfData.originalPageNumber,
      attributes: pdfData.attributes,
      images: [], // Las publicaciones históricas no tienen imágenes
    };
  }

  /**
   * Inserta un lote de publicaciones en la base de datos
   */
  async insertBatch(publications: Publication[]): Promise<void> {
    if (!this.db) throw new Error('No hay conexión a la base de datos');

    try {
      const collection = this.db.collection('publications');
      
      // Insertar en lotes para mejor rendimiento
      const result = await collection.insertMany(publications, { 
        ordered: false // Continuar aunque algunos fallen
      });

      console.log(`✅ Lote insertado: ${result.insertedCount} publicaciones`);
      
      // Actualizar estadísticas
      this.stats.successful += result.insertedCount;
      this.stats.failed += publications.length - result.insertedCount;

    } catch (error) {
      console.error('❌ Error insertando lote:', error);
      this.stats.failed += publications.length;
      this.stats.errors.push(`Error en lote: ${error}`);
    }
  }

  /**
   * Procesa todos los archivos PDF en un directorio
   */
  async processDirectory(directoryPath: string): Promise<void> {
    console.log(`📁 Procesando directorio: ${directoryPath}`);
    
    const files = fs.readdirSync(directoryPath)
      .filter(file => file.endsWith('.pdf'))
      .sort(); // Procesar en orden cronológico

    console.log(`📊 Encontrados ${files.length} archivos PDF`);

    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      
      try {
        const pdfData = await this.processPDFFile(filePath);
        console.log(`📄 ${file}: ${pdfData.length} anuncios extraídos`);

        // Convertir y validar
        const validPublications: Publication[] = [];
        
        for (const ad of pdfData) {
          try {
            const publicationData = this.convertToPublication(ad);
            
            if (validateHistoricalPublication(publicationData)) {
              const publication = prepareHistoricalPublication(publicationData);
              validPublications.push(publication);
              
              // Actualizar estadísticas
              this.stats.categories[publication.categorySlug] = 
                (this.stats.categories[publication.categorySlug] || 0) + 1;
              
              // Actualizar rango de fechas
              if (!this.stats.dateRange.earliest || 
                  publication.originalPublicationDate! < this.stats.dateRange.earliest) {
                this.stats.dateRange.earliest = publication.originalPublicationDate!;
              }
              if (!this.stats.dateRange.latest || 
                  publication.originalPublicationDate! > this.stats.dateRange.latest) {
                this.stats.dateRange.latest = publication.originalPublicationDate!;
              }
            } else {
              this.stats.skipped++;
            }
          } catch (error) {
            this.stats.failed++;
            this.stats.errors.push(`Error procesando anuncio: ${error}`);
          }
        }

        // Insertar en lotes
        for (let i = 0; i < validPublications.length; i += BATCH_SIZE) {
          const batch = validPublications.slice(i, i + BATCH_SIZE);
          await this.insertBatch(batch);
          
          // Pausa entre lotes
          if (i + BATCH_SIZE < validPublications.length) {
            await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
          }
        }

        this.stats.total += pdfData.length;

      } catch (error) {
        console.error(`❌ Error procesando ${file}:`, error);
        this.stats.errors.push(`Error en archivo ${file}: ${error}`);
      }
    }
  }

  /**
   * Genera un reporte final de la importación
   */
  generateReport(): void {
    console.log('\n📊 REPORTE FINAL DE IMPORTACIÓN');
    console.log('================================');
    console.log(`Total procesados: ${this.stats.total}`);
    console.log(`Insertados exitosamente: ${this.stats.successful}`);
    console.log(`Fallidos: ${this.stats.failed}`);
    console.log(`Omitidos: ${this.stats.skipped}`);
    
    if (this.stats.dateRange.earliest && this.stats.dateRange.latest) {
      console.log(`Rango de fechas: ${this.stats.dateRange.earliest.toDateString()} - ${this.stats.dateRange.latest.toDateString()}`);
    }
    
    console.log('\n📈 Por categoría:');
    Object.entries(this.stats.categories)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`  ${category}: ${count}`);
      });
    
    if (this.stats.errors.length > 0) {
      console.log('\n❌ Errores encontrados:');
      this.stats.errors.slice(0, 10).forEach(error => {
        console.log(`  - ${error}`);
      });
      if (this.stats.errors.length > 10) {
        console.log(`  ... y ${this.stats.errors.length - 10} errores más`);
      }
    }
  }

  // Métodos auxiliares para generar datos de ejemplo
  private getRandomTitle(): string {
    const titles = [
      'Vendo departamento',
      'Alquilo casa',
      'Busco trabajo',
      'Compro vehículo',
      'Ofrezco servicios',
      'Se busca personal',
      'Cambio terreno',
      'Vendo local comercial'
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  }

  private getRandomDescription(): string {
    const descriptions = [
      'Excelente ubicación, buen precio.',
      'Oportunidad única, no dejes pasar.',
      'Urgente venta, precio a tratar.',
      'Señor serio, trato directo.',
      'Excelentes condiciones, ver para creer.',
      'Ubicación privilegiada, fácil acceso.'
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  private getRandomCategory(): string {
    const categories = ['inmuebles', 'vehiculos', 'empleos', 'servicios', 'productos', 'eventos'];
    return categories[Math.floor(Math.random() * categories.length)];
  }

  private getRandomSubcategory(): string {
    const subcategories = ['departamentos', 'casas', 'terrenos', 'locales', 'oficinas'];
    return subcategories[Math.floor(Math.random() * subcategories.length)];
  }

  private getRandomDistrict(): string {
    const districts = ['Wanchaq', 'San Sebastián', 'Cusco', 'Santiago', 'San Blas'];
    return districts[Math.floor(Math.random() * districts.length)];
  }

  private getRandomAdSize(): string {
    const sizes = ['1/8 página', '1/4 página', '1/2 página', 'página completa'];
    return sizes[Math.floor(Math.random() * sizes.length)];
  }

  private getRandomAttributes(): Record<string, any> {
    const attributes: Record<string, any> = {};
    
    if (Math.random() > 0.5) {
      attributes.condicion = Math.random() > 0.5 ? 'nuevo' : 'usado';
    }
    
    if (Math.random() > 0.7) {
      attributes.marca = 'Marca Ejemplo';
    }
    
    return attributes;
  }
}

// Función principal
async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI no está configurada en las variables de entorno');
    process.exit(1);
  }

  const importer = new HistoricalPublicationImporter();
  
  try {
    await importer.connect();
    
    // Procesar directorio de PDFs
    const pdfDirectory = process.argv[2] || './pdfs';
    
    if (!fs.existsSync(pdfDirectory)) {
      console.error(`❌ El directorio ${pdfDirectory} no existe`);
      process.exit(1);
    }
    
    await importer.processDirectory(pdfDirectory);
    importer.generateReport();
    
  } catch (error) {
    console.error('❌ Error durante la importación:', error);
    process.exit(1);
  } finally {
    await importer.disconnect();
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main();
}

export { HistoricalPublicationImporter }; 