#!/usr/bin/env ts-node

import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI!;
const MONGODB_DB = process.env.MONGODB_DB || 'buscadis';

interface MigrationStats {
  total: number;
  updated: number;
  skipped: number;
  errors: string[];
}

class PublicationMigration {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private stats: MigrationStats;

  constructor() {
    this.stats = {
      total: 0,
      updated: 0,
      skipped: 0,
      errors: []
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
   * Migra las publicaciones existentes agregando los nuevos campos
   */
  async migratePublications(): Promise<void> {
    if (!this.db) throw new Error('No hay conexión a la base de datos');

    const collection = this.db.collection('publications');
    
    // Obtener todas las publicaciones
    const publications = await collection.find({}).toArray();
    this.stats.total = publications.length;

    console.log(`📊 Migrando ${this.stats.total} publicaciones...`);

    for (const publication of publications) {
      try {
        const updateData: any = {};

        // Agregar campos faltantes para publicaciones históricas
        if (!publication.originalPublicationDate) {
          // Si no tiene fecha original, usar createdAt
          updateData.originalPublicationDate = publication.createdAt || new Date();
        }

        if (!publication.expirationDate) {
          // Calcular fecha de caducidad (3 días después de la publicación original)
          const originalDate = new Date(publication.originalPublicationDate || publication.createdAt);
          const expirationDate = new Date(originalDate);
          expirationDate.setDate(expirationDate.getDate() + 3);
          updateData.expirationDate = expirationDate;
        }

        if (!publication.hasOwnProperty('isHistoricalPublication')) {
          // Determinar si es histórica basándose en si tiene userId
          updateData.isHistoricalPublication = !publication.userId;
        }

        if (!publication.status) {
          // Determinar estado basándose en la fecha de caducidad
          const now = new Date();
          const expirationDate = new Date(publication.expirationDate || updateData.expirationDate);
          
          if (expirationDate < now) {
            updateData.status = 'expired';
          } else {
            updateData.status = 'active';
          }
        }

        if (!publication.magazineEdition) {
          // Generar edición basándose en la fecha
          const date = new Date(publication.originalPublicationDate || publication.createdAt);
          updateData.magazineEdition = `Edición ${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        }

        if (!publication.magazineYear) {
          const date = new Date(publication.originalPublicationDate || publication.createdAt);
          updateData.magazineYear = date.getFullYear();
        }

        // Agregar campos de metadata si no existen
        if (!publication.originalAdSize) {
          updateData.originalAdSize = '1/4 página'; // Valor por defecto
        }

        if (!publication.originalPageNumber) {
          updateData.originalPageNumber = Math.floor(Math.random() * 50) + 1; // Valor aleatorio
        }

        // Actualizar la publicación si hay cambios
        if (Object.keys(updateData).length > 0) {
          updateData.updatedAt = new Date();
          
          await collection.updateOne(
            { _id: publication._id },
            { $set: updateData }
          );

          this.stats.updated++;
          console.log(`✅ Migrada publicación: ${publication.title?.substring(0, 50)}...`);
        } else {
          this.stats.skipped++;
        }

      } catch (error) {
        this.stats.errors.push(`Error migrando publicación ${publication._id}: ${error}`);
        console.error(`❌ Error migrando publicación:`, error);
      }
    }
  }

  /**
   * Crea índices para optimizar las consultas
   */
  async createIndexes(): Promise<void> {
    if (!this.db) throw new Error('No hay conexión a la base de datos');

    const collection = this.db.collection('publications');
    
    console.log('🔍 Creando índices...');

    try {
      // Índice para búsquedas por estado y fecha
      await collection.createIndex({ 
        status: 1, 
        expirationDate: 1 
      });
      console.log('✅ Índice: status + expirationDate');

      // Índice para publicaciones históricas
      await collection.createIndex({ 
        isHistoricalPublication: 1, 
        originalPublicationDate: -1 
      });
      console.log('✅ Índice: isHistoricalPublication + originalPublicationDate');

      // Índice para búsquedas por categoría y estado
      await collection.createIndex({ 
        categorySlug: 1, 
        status: 1, 
        createdAt: -1 
      });
      console.log('✅ Índice: categorySlug + status + createdAt');

      // Índice para búsquedas por ubicación
      await collection.createIndex({ 
        'location.district': 1, 
        status: 1 
      });
      console.log('✅ Índice: location.district + status');

      // Índice de texto para búsquedas
      await collection.createIndex({ 
        title: 'text', 
        description: 'text' 
      });
      console.log('✅ Índice de texto: title + description');

    } catch (error) {
      console.error('❌ Error creando índices:', error);
      this.stats.errors.push(`Error creando índices: ${error}`);
    }
  }

  /**
   * Genera estadísticas de la migración
   */
  async generateStats(): Promise<void> {
    if (!this.db) throw new Error('No hay conexión a la base de datos');

    const collection = this.db.collection('publications');
    
    console.log('\n📊 ESTADÍSTICAS DE LA BASE DE DATOS');
    console.log('====================================');

    // Total de publicaciones
    const total = await collection.countDocuments();
    console.log(`Total de publicaciones: ${total}`);

    // Por estado
    const active = await collection.countDocuments({ status: 'active' });
    const expired = await collection.countDocuments({ status: 'expired' });
    const archived = await collection.countDocuments({ status: 'archived' });
    
    console.log(`\nPor estado:`);
    console.log(`  Activas: ${active}`);
    console.log(`  Caducadas: ${expired}`);
    console.log(`  Archivadas: ${archived}`);

    // Por tipo
    const historical = await collection.countDocuments({ isHistoricalPublication: true });
    const current = await collection.countDocuments({ isHistoricalPublication: false });
    
    console.log(`\nPor tipo:`);
    console.log(`  Históricas: ${historical}`);
    console.log(`  Actuales: ${current}`);

    // Por categoría
    const categories = await collection.aggregate([
      { $group: { _id: '$categorySlug', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    console.log(`\nPor categoría:`);
    categories.forEach(cat => {
      console.log(`  ${cat._id}: ${cat.count}`);
    });

    // Rango de fechas
    const dateRange = await collection.aggregate([
      { $group: { 
        _id: null, 
        earliest: { $min: '$originalPublicationDate' }, 
        latest: { $max: '$originalPublicationDate' } 
      }}
    ]).toArray();

    if (dateRange.length > 0) {
      const { earliest, latest } = dateRange[0];
      console.log(`\nRango de fechas:`);
      console.log(`  Más antigua: ${earliest ? new Date(earliest).toDateString() : 'N/A'}`);
      console.log(`  Más reciente: ${latest ? new Date(latest).toDateString() : 'N/A'}`);
    }
  }

  /**
   * Genera reporte final
   */
  generateReport(): void {
    console.log('\n📊 REPORTE FINAL DE MIGRACIÓN');
    console.log('==============================');
    console.log(`Total procesadas: ${this.stats.total}`);
    console.log(`Actualizadas: ${this.stats.updated}`);
    console.log(`Omitidas: ${this.stats.skipped}`);
    
    if (this.stats.errors.length > 0) {
      console.log(`\n❌ Errores encontrados: ${this.stats.errors.length}`);
      this.stats.errors.slice(0, 5).forEach(error => {
        console.log(`  - ${error}`);
      });
      if (this.stats.errors.length > 5) {
        console.log(`  ... y ${this.stats.errors.length - 5} errores más`);
      }
    }
  }
}

// Función principal
async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI no está configurada en las variables de entorno');
    process.exit(1);
  }

  const migration = new PublicationMigration();
  
  try {
    await migration.connect();
    
    console.log('🚀 Iniciando migración de publicaciones...');
    
    // Migrar publicaciones
    await migration.migratePublications();
    
    // Crear índices
    await migration.createIndexes();
    
    // Generar estadísticas
    await migration.generateStats();
    
    // Generar reporte
    migration.generateReport();
    
    console.log('\n✅ Migración completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  } finally {
    await migration.disconnect();
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main();
}

export { PublicationMigration }; 