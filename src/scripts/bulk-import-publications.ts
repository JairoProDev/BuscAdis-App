/**
 * SCRIPT PARA IMPORTACIÓN MASIVA DE PUBLICACIONES
 * Convierte texto plano o CSVs a la estructura de BuscAdis
 */

import fs from 'fs'
import path from 'path'
import { MongoClient } from 'mongodb'
import { Logger } from '@/services/logging.service'
import { BulkPublicationImport, PublicationBulkData, PublicationDocument } from '@/data/database-architecture'

// =============================================================================
// 1. CONFIGURACIÓN DEL IMPORTADOR
// =============================================================================

interface ImportConfig {
  sourceFile: string
  sourceFormat: 'json' | 'csv' | 'txt' | 'xlsx'
  mapping: FieldMapping
  validation: ValidationConfig
  processing: ProcessingConfig
  output: OutputConfig
}

interface FieldMapping {
  // Mapeo de campos del archivo fuente a la estructura de BuscAdis
  title: string | ((row: any) => string)
  description: string | ((row: any) => string)
  category: string | ((row: any) => string)
  subcategory?: string | ((row: any) => string)
  location?: LocationMapping
  contact?: ContactMapping
  pricing?: PricingMapping
  media?: MediaMapping
  // ... otros campos
}

interface LocationMapping {
  country?: string | ((row: any) => string)
  region?: string | ((row: any) => string)
  city?: string | ((row: any) => string)
  address?: string | ((row: any) => string)
  coordinates?: {
    lat: string | ((row: any) => number)
    lng: string | ((row: any) => number)
  }
}

interface ContactMapping {
  phone?: string | ((row: any) => string)
  whatsapp?: string | ((row: any) => string)
  email?: string | ((row: any) => string)
}

interface PricingMapping {
  price?: string | ((row: any) => number)
  currency?: string | ((row: any) => string)
  type?: string | ((row: any) => string)
}

interface MediaMapping {
  images?: string | ((row: any) => string[])
  mainImage?: string | ((row: any) => string)
}

interface ValidationConfig {
  strictMode: boolean
  requiredFields: string[]
  customValidators?: Record<string, (value: any) => boolean>
}

interface ProcessingConfig {
  batchSize: number
  enableAI: boolean
  generateSlugs: boolean
  geocodeAddresses: boolean
  generateThumbnails: boolean
  extractKeywords: boolean
  detectLanguage: boolean
}

interface OutputConfig {
  insertToDatabase: boolean
  generateJSONFile: boolean
  outputPath?: string
  logLevel: 'minimal' | 'detailed' | 'verbose'
}

// =============================================================================
// 2. CLASE PRINCIPAL DEL IMPORTADOR
// =============================================================================

export class BulkPublicationImporter {
  private config: ImportConfig
  private client: MongoClient | null = null
  private db: any = null
  
  constructor(config: ImportConfig) {
    this.config = config
  }
  
  // Método principal de importación
  async import(): Promise<{
    success: boolean
    imported: number
    errors: number
    results: ImportResult[]
  }> {
    try {
      Logger.info('🚀 Iniciando importación masiva de publicaciones')
      
      // 1. Cargar y parsear archivo fuente
      const sourceData = await this.loadSourceData()
      Logger.info(`📄 Cargados ${sourceData.length} registros del archivo fuente`)
      
      // 2. Conectar a base de datos si es necesario
      if (this.config.output.insertToDatabase) {
        await this.connectDatabase()
      }
      
      // 3. Procesar datos en lotes
      const results: ImportResult[] = []
      const batchSize = this.config.processing.batchSize
      
      for (let i = 0; i < sourceData.length; i += batchSize) {
        const batch = sourceData.slice(i, i + batchSize)
        Logger.info(`🔄 Procesando lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(sourceData.length / batchSize)}`)
        
        const batchResults = await this.processBatch(batch, i)
        results.push(...batchResults)
        
        // Pequeña pausa entre lotes para no sobrecargar el sistema
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      // 4. Generar archivo JSON si se solicita
      if (this.config.output.generateJSONFile) {
        await this.generateJSONOutput(results)
      }
      
      // 5. Cerrar conexión a base de datos
      if (this.client) {
        await this.client.close()
      }
      
      const successCount = results.filter(r => r.success).length
      const errorCount = results.filter(r => !r.success).length
      
      Logger.info(`✅ Importación completada: ${successCount} exitosos, ${errorCount} errores`)
      
      return {
        success: true,
        imported: successCount,
        errors: errorCount,
        results
      }
      
    } catch (error) {
      Logger.error('❌ Error en importación masiva', { error })
      throw error
    }
  }
  
  // Cargar datos del archivo fuente
  private async loadSourceData(): Promise<any[]> {
    const filePath = this.config.sourceFile
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Archivo no encontrado: ${filePath}`)
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    
    switch (this.config.sourceFormat) {
      case 'json':
        return JSON.parse(fileContent)
        
      case 'csv':
        return this.parseCSV(fileContent)
        
      case 'txt':
        return this.parseTXT(fileContent)
        
      default:
        throw new Error(`Formato no soportado: ${this.config.sourceFormat}`)
    }
  }
  
  // Parser para CSV
  private parseCSV(content: string): any[] {
    const lines = content.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
      const row: any = {}
      
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })
      
      return row
    })
  }
  
  // Parser para TXT (asume formato específico)
  private parseTXT(content: string): any[] {
    // Implementar parser personalizado según el formato de texto
    // Ejemplo: cada publicación separada por líneas vacías
    const publications = content.split('\n\n').filter(p => p.trim())
    
    return publications.map((pub, index) => {
      const lines = pub.split('\n')
      return {
        id: index + 1,
        title: lines[0] || '',
        description: lines.slice(1).join(' ').trim(),
        rawText: pub
      }
    })
  }
  
  // Conectar a base de datos
  private async connectDatabase(): Promise<void> {
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      throw new Error('MONGODB_URI no configurada')
    }
    
    this.client = new MongoClient(mongoUri)
    await this.client.connect()
    this.db = this.client.db(process.env.MONGODB_DB || 'buscadis')
    
    Logger.info('🔗 Conectado a MongoDB')
  }
  
  // Procesar un lote de datos
  private async processBatch(batch: any[], startIndex: number): Promise<ImportResult[]> {
    const results: ImportResult[] = []
    
    for (let i = 0; i < batch.length; i++) {
      const rowIndex = startIndex + i
      const rowData = batch[i]
      
      try {
        // 1. Mapear campos
        const mappedData = await this.mapFields(rowData)
        
        // 2. Validar datos
        const validation = this.validateData(mappedData)
        if (!validation.valid) {
          results.push({
            success: false,
            rowIndex,
            error: `Validación fallida: ${validation.errors.join(', ')}`,
            originalData: rowData
          })
          continue
        }
        
        // 3. Procesar con IA si está habilitado
        if (this.config.processing.enableAI) {
          await this.processWithAI(mappedData)
        }
        
        // 4. Convertir a estructura completa de BD
        const publication = await this.createPublicationDocument(mappedData)
        
        // 5. Insertar en base de datos si está configurado
        if (this.config.output.insertToDatabase && this.db) {
          await this.insertPublication(publication)
        }
        
        results.push({
          success: true,
          rowIndex,
          publicationId: publication._id,
          publication,
          originalData: rowData
        })
        
      } catch (error) {
        results.push({
          success: false,
          rowIndex,
          error: error instanceof Error ? error.message : 'Error desconocido',
          originalData: rowData
        })
      }
    }
    
    return results
  }
  
  // Mapear campos del archivo fuente a estructura de BuscAdis
  private async mapFields(rowData: any): Promise<PublicationBulkData> {
    const mapping = this.config.mapping
    
    const mapped: PublicationBulkData = {
      title: this.extractField(rowData, mapping.title),
      description: this.extractField(rowData, mapping.description),
      category: this.extractField(rowData, mapping.category),
      subcategory: mapping.subcategory ? this.extractField(rowData, mapping.subcategory) : undefined,
      
      location: {
        country: mapping.location?.country ? this.extractField(rowData, mapping.location.country) : 'Peru',
        region: mapping.location?.region ? this.extractField(rowData, mapping.location.region) : 'Cusco',
        city: mapping.location?.city ? this.extractField(rowData, mapping.location.city) : 'Cusco',
        district: mapping.location?.address ? this.extractField(rowData, mapping.location.address) : undefined,
        coordinates: mapping.location?.coordinates ? {
          lat: this.extractField(rowData, mapping.location.coordinates.lat),
          lng: this.extractField(rowData, mapping.location.coordinates.lng)
        } : undefined,
        timezone: 'America/Lima'
      },
      
      contact: {
        phones: mapping.contact?.phone ? [this.extractField(rowData, mapping.contact.phone)] : undefined,
        whatsapp: mapping.contact?.whatsapp ? [this.extractField(rowData, mapping.contact.whatsapp)] : undefined,
        email: mapping.contact?.email ? [this.extractField(rowData, mapping.contact.email)] : undefined
      },
      
      pricing: mapping.pricing ? {
        price: mapping.pricing.price ? this.extractField(rowData, mapping.pricing.price) : undefined,
        currency: mapping.pricing.currency ? this.extractField(rowData, mapping.pricing.currency) : 'PEN',
        type: mapping.pricing.type ? this.extractField(rowData, mapping.pricing.type) : 'fixed'
      } : undefined,
      
      media: mapping.media ? {
        images: mapping.media.images ? this.extractField(rowData, mapping.media.images) : undefined,
        mainImage: mapping.media.mainImage ? this.extractField(rowData, mapping.media.mainImage) : undefined
      } : undefined,
      
      metadata: {
        source: 'bulk_import',
        language: 'es',
        publishDate: new Date().toISOString(),
        status: 'active',
        visibility: 'public'
      }
    }
    
    return mapped
  }
  
  // Extraer campo usando mapping
  private extractField(rowData: any, fieldMapping: string | ((row: any) => any)): any {
    if (typeof fieldMapping === 'function') {
      return fieldMapping(rowData)
    } else {
      return rowData[fieldMapping]
    }
  }
  
  // Validar datos
  private validateData(data: PublicationBulkData): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    // Validaciones básicas
    if (!data.title || data.title.trim().length < 5) {
      errors.push('Título muy corto (mínimo 5 caracteres)')
    }
    
    if (!data.description || data.description.trim().length < 20) {
      errors.push('Descripción muy corta (mínimo 20 caracteres)')
    }
    
    if (!data.category) {
      errors.push('Categoría requerida')
    }
    
    if (!data.location.city) {
      errors.push('Ciudad requerida')
    }
    
    // Validaciones personalizadas
    if (this.config.validation.customValidators) {
      for (const [field, validator] of Object.entries(this.config.validation.customValidators)) {
        const value = (data as any)[field]
        if (!validator(value)) {
          errors.push(`Validación personalizada fallida para campo: ${field}`)
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
  
  // Procesar con IA
  private async processWithAI(data: PublicationBulkData): Promise<void> {
    if (this.config.processing.extractKeywords) {
      // Extraer keywords con IA
      data.aiMetadata = {
        ...data.aiMetadata,
        tags: await this.extractKeywords(data.title + ' ' + data.description)
      }
    }
    
    if (this.config.processing.detectLanguage) {
      // Detectar idioma
      const language = await this.detectLanguage(data.description)
      data.metadata.language = language
    }
  }
  
  // Convertir a documento completo de publicación
  private async createPublicationDocument(data: PublicationBulkData): Promise<PublicationDocument> {
    const now = new Date()
    
    return {
      _id: this.generateId(),
      title: data.title,
      description: data.description,
      slug: this.generateSlug(data.title),
      
      category: {
        id: data.category,
        name: data.category,
        slug: this.generateSlug(data.category)
      },
      
      subcategory: data.subcategory ? {
        id: data.subcategory,
        name: data.subcategory,
        slug: this.generateSlug(data.subcategory)
      } : undefined,
      
      location: {
        continent: this.getContinent(data.location.country),
        country: data.location.country,
        countryCode: this.getCountryCode(data.location.country),
        region: data.location.region,
        regionCode: this.getRegionCode(data.location.region),
        city: data.location.city,
        district: data.location.district,
        coordinates: data.location.coordinates ? {
          type: 'Point',
          coordinates: [data.location.coordinates.lng, data.location.coordinates.lat]
        } : {
          type: 'Point',
          coordinates: [-71.9675, -13.5319] // Coordenadas por defecto de Cusco
        },
        timezone: data.location.timezone || 'America/Lima',
        currency: 'PEN',
        language: data.metadata.language,
        searchRadius: 50,
        administrativeLevels: [data.location.country, data.location.region, data.location.city]
      },
      
      userId: 'bulk_import_user',
      userProfile: {
        displayName: 'Usuario Importado',
        userType: 'individual',
        verified: false,
        trustScore: 50
      },
      
      contact: {
        methods: this.buildContactMethods(data.contact),
        primaryMethod: 'phone'
      },
      
      pricing: data.pricing ? {
        type: data.pricing.type as any,
        amount: data.pricing.price,
        currency: data.pricing.currency
      } : undefined,
      
      media: {
        images: data.media?.images?.map(url => ({
          url,
          type: 'image' as const,
          alt: data.title
        })) || [],
        mainImageIndex: 0
      },
      
      attributes: {},
      
      status: {
        current: 'active',
        history: [{
          status: 'active',
          timestamp: now,
          reason: 'bulk_import'
        }],
        visibility: 'public',
        isPromoted: false
      },
      
      engagement: {
        views: 0,
        uniqueViews: 0,
        likes: 0,
        shares: 0,
        saves: 0,
        comments: 0,
        clicksPhone: 0,
        clicksWhatsapp: 0,
        clicksEmail: 0,
        responseRate: 0,
        viewsByDay: {},
        trendinessScore: 0,
        engagementRate: 0
      },
      
      ai: {
        extractedKeywords: data.aiMetadata?.tags || [],
        autoTags: [],
        sentiment: 'neutral',
        qualityScore: 70,
        completenessScore: this.calculateCompleteness(data),
        trustScore: 50,
        suggestedCategories: [],
        contentFlags: [],
        moderationStatus: 'approved',
        targetAudience: [],
        similarPublications: [],
        recommendations: []
      },
      
      seo: {
        keywords: data.aiMetadata?.tags || [],
        metaTitle: data.title,
        metaDescription: data.description.substring(0, 160)
      },
      
      timestamps: {
        createdAt: now,
        updatedAt: now,
        publishedAt: now
      },
      
      system: {
        version: 1,
        source: 'bulk_import',
        importId: this.generateId(),
        indexedAt: now
      }
    } as PublicationDocument
  }
  
  // Métodos auxiliares
  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }
  
  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }
  
  private getContinent(country: string): string {
    const continents: Record<string, string> = {
      'Peru': 'South America',
      'Colombia': 'South America',
      'Ecuador': 'South America',
      'Bolivia': 'South America',
      'Brazil': 'South America',
      'Argentina': 'South America',
      'Chile': 'South America',
      'Venezuela': 'South America',
      'Uruguay': 'South America',
      'Paraguay': 'South America',
      'Guyana': 'South America',
      'Suriname': 'South America',
      'French Guiana': 'South America'
    }
    return continents[country] || 'South America'
  }
  
  private getCountryCode(country: string): string {
    const codes: Record<string, string> = {
      'Peru': 'PE',
      'Colombia': 'CO',
      'Ecuador': 'EC',
      'Bolivia': 'BO'
    }
    return codes[country] || 'PE'
  }
  
  private getRegionCode(region: string): string {
    return region.substring(0, 3).toUpperCase()
  }
  
  private buildContactMethods(contact: any): any[] {
    const methods: any[] = []
    
    if (contact.phones) {
      contact.phones.forEach((phone: string) => {
        methods.push({
          type: 'phone',
          value: phone,
          verified: false,
          primary: methods.length === 0
        })
      })
    }
    
    if (contact.whatsapp) {
      contact.whatsapp.forEach((whatsapp: string) => {
        methods.push({
          type: 'whatsapp',
          value: whatsapp,
          verified: false
        })
      })
    }
    
    if (contact.email) {
      contact.email.forEach((email: string) => {
        methods.push({
          type: 'email',
          value: email,
          verified: false
        })
      })
    }
    
    return methods
  }
  
  private calculateCompleteness(data: PublicationBulkData): number {
    let score = 0
    const maxScore = 100
    
    // Título y descripción (40 puntos)
    if (data.title) score += 20
    if (data.description && data.description.length > 50) score += 20
    
    // Categorización (20 puntos)
    if (data.category) score += 10
    if (data.subcategory) score += 10
    
    // Contacto (20 puntos)
    if (data.contact?.phones) score += 10
    if (data.contact?.email) score += 10
    
    // Precio (10 puntos)
    if (data.pricing?.price) score += 10
    
    // Media (10 puntos)
    if (data.media?.images && data.media.images.length > 0) score += 10
    
    return Math.min(score, maxScore)
  }
  
  // Métodos de IA (placeholder - implementar con servicios reales)
  private async extractKeywords(text: string): Promise<string[]> {
    // Implementar extracción de keywords con IA
    const words = text.toLowerCase().split(' ')
    return words.filter(word => word.length > 3).slice(0, 10)
  }
  
  private async detectLanguage(text: string): Promise<string> {
    // Implementar detección de idioma
    return 'es' // Por defecto español
  }
  
  // Insertar en base de datos
  private async insertPublication(publication: PublicationDocument): Promise<void> {
    if (!this.db) return
    
    // Determinar colección basada en ubicación
    const continent = publication.location.continent.replace(' ', '').toLowerCase()
    const collectionName = `publications_${continent}`
    
    await this.db.collection(collectionName).insertOne(publication)
  }
  
  // Generar archivo JSON de salida
  private async generateJSONOutput(results: ImportResult[]): Promise<void> {
    const outputPath = this.config.output.outputPath || './import_results.json'
    
    const output = {
      summary: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        timestamp: new Date().toISOString()
      },
      results: results
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2))
    Logger.info(`📄 Archivo de resultados generado: ${outputPath}`)
  }
}

// =============================================================================
// 3. INTERFACES DE RESULTADO
// =============================================================================

interface ImportResult {
  success: boolean
  rowIndex: number
  publicationId?: string
  publication?: PublicationDocument
  error?: string
  originalData: any
}

// =============================================================================
// 4. CONFIGURACIONES PREDEFINIDAS
// =============================================================================

export const PRESET_CONFIGS = {
  // Configuración para CSV básico
  BASIC_CSV: {
    sourceFormat: 'csv' as const,
    mapping: {
      title: 'titulo',
      description: 'descripcion',
      category: 'categoria',
      location: {
        city: 'ciudad',
        region: 'region'
      },
      contact: {
        phone: 'telefono',
        email: 'email'
      },
      pricing: {
        price: 'precio',
        currency: () => 'PEN'
      }
    },
    validation: {
      strictMode: false,
      requiredFields: ['title', 'description', 'category']
    },
    processing: {
      batchSize: 100,
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
      logLevel: 'detailed' as const
    }
  },
  
  // Configuración para texto plano
  PLAIN_TEXT: {
    sourceFormat: 'txt' as const,
    mapping: {
      title: (row: any) => row.title || row.rawText.split('\n')[0],
      description: (row: any) => row.description || row.rawText,
      category: () => 'General'
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
      insertToDatabase: false,
      generateJSONFile: true,
      logLevel: 'minimal' as const
    }
  }
}

// =============================================================================
// 5. FUNCIÓN DE USO FÁCIL
// =============================================================================

export async function importPublications(
  sourceFile: string,
  configType: keyof typeof PRESET_CONFIGS = 'BASIC_CSV',
  overrides?: Partial<ImportConfig>
): Promise<any> {
  
  const baseConfig = PRESET_CONFIGS[configType]
  const config: ImportConfig = {
    sourceFile,
    ...baseConfig,
    ...overrides
  }
  
  const importer = new BulkPublicationImporter(config)
  return await importer.import()
}

export default BulkPublicationImporter 