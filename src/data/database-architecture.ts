/**
 * ARQUITECTURA COMPLETA DE BASE DE DATOS PARA BUSCADIS
 * Diseñada para escala global, IA/ML, y red social
 */

// =============================================================================
// 1. ESTRUCTURA JSON PARA IMPORTAR ANUNCIOS MASIVAMENTE
// =============================================================================

export interface BulkPublicationImport {
  publications: PublicationBulkData[]
  metadata: ImportMetadata
}

export interface ImportMetadata {
  source: string
  importDate: string
  totalCount: number
  region: string
  language: string
  currency: string
  timezone: string
}

export interface PublicationBulkData {
  // Campos básicos requeridos
  title: string
  description: string
  category: string
  subcategory?: string
  subsubcategory?: string
  
  // Ubicación geográfica (CRUCIAL para búsqueda local global)
  location: {
    country: string
    region: string // Estado/Provincia/Departamento
    city: string
    district?: string // Distrito/Barrio/Zona
    address?: string
    coordinates?: {
      lat: number
      lng: number
      accuracy?: number // Radio de precisión en metros
    }
    timezone: string
    postalCode?: string
  }
  
  // Información de contacto (flexible)
  contact: {
    phones?: string[] // Múltiples teléfonos
    whatsapp?: string[]
    email?: string[]
    website?: string
    socialMedia?: {
      facebook?: string
      instagram?: string
      tiktok?: string
      youtube?: string
    }
    preferredContact?: 'phone' | 'whatsapp' | 'email' | 'website'
  }
  
  // Precio (muy flexible para diferentes tipos)
  pricing?: {
    price?: number
    currency: string
    type: 'fixed' | 'negotiable' | 'range' | 'hourly' | 'monthly' | 'free' | 'exchange'
    minPrice?: number
    maxPrice?: number
    period?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'once'
    isPromoted?: boolean
    originalPrice?: number // Para descuentos
  }
  
  // Medios (muy flexible)
  media?: {
    images?: string[] // URLs o base64
    videos?: string[]
    documents?: string[]
    virtualTour?: string
    mainImage?: string // Imagen principal
  }
  
  // Datos específicos por categoría (completamente dinámico)
  categoryData?: Record<string, unknown>
  
  // Metadatos para IA/ML
  aiMetadata?: {
    tags?: string[] // Tags automáticos de IA
    sentiment?: 'positive' | 'neutral' | 'negative'
    quality?: number // Score de calidad 0-100
    completeness?: number // Qué tan completo está el anuncio
    trustScore?: number // Score de confianza
    extractedFeatures?: Record<string, unknown> // Features extraídas por IA
  }
  
  // Usuario (si está disponible)
  userInfo?: {
    userId?: string
    userName?: string
    userType?: 'individual' | 'business' | 'agency'
    verified?: boolean
  }
  
  // Control y tracking
  metadata: {
    source: string // 'manual', 'bulk_import', 'api', 'scraping'
    importId?: string
    externalId?: string // ID del sistema original
    language: string
    publishDate?: string
    expiryDate?: string
    status?: 'draft' | 'active' | 'paused' | 'expired' | 'deleted'
    visibility?: 'public' | 'private' | 'premium' | 'featured'
  }
}

// =============================================================================
// 2. ESTRUCTURA DE BASE DE DATOS GLOBAL Y ESCALABLE
// =============================================================================

// A. COLECCIONES PRINCIPALES (Sharding por región)
export const DATABASE_COLLECTIONS = {
  // Publicaciones sharded por región geográfica
  PUBLICATIONS_GLOBAL: 'publications_global', // Índice maestro
  PUBLICATIONS_NORTHAMERICA: 'publications_na',
  PUBLICATIONS_SOUTHAMERICA: 'publications_sa', 
  PUBLICATIONS_EUROPE: 'publications_eu',
  PUBLICATIONS_ASIA: 'publications_as',
  PUBLICATIONS_AFRICA: 'publications_af',
  PUBLICATIONS_OCEANIA: 'publications_oc',
  
  // Usuarios globales
  USERS: 'users',
  USER_PROFILES: 'user_profiles',
  USER_PREFERENCES: 'user_preferences',
  USER_ACTIVITY: 'user_activity',
  
  // Sistema de recomendaciones y newsfeed
  RECOMMENDATIONS: 'recommendations',
  USER_INTERACTIONS: 'user_interactions',
  NEWSFEED_CACHE: 'newsfeed_cache',
  TRENDING_CONTENT: 'trending_content',
  
  // IA y Machine Learning
  AI_EMBEDDINGS: 'ai_embeddings', // Vectores para búsqueda semántica
  ML_MODELS: 'ml_models',
  AI_ANALYTICS: 'ai_analytics',
  CONTENT_CLUSTERS: 'content_clusters',
  
  // Geolocalización y regiones
  LOCATIONS: 'locations',
  REGIONS: 'regions',
  CITIES: 'cities',
  
  // Categorías dinámicas
  CATEGORIES: 'categories',
  CATEGORY_ATTRIBUTES: 'category_attributes',
  
  // Análisis y métricas
  ANALYTICS_EVENTS: 'analytics_events',
  SEARCH_QUERIES: 'search_queries',
  PERFORMANCE_METRICS: 'performance_metrics'
}

// B. ESTRUCTURA DE PUBLICACIÓN COMPLETA PARA BD
export interface PublicationDocument {
  _id: string
  
  // Información básica
  title: string
  description: string
  slug: string
  
  // Categorización jerárquica
  category: {
    id: string
    name: string
    slug: string
  }
  subcategory?: {
    id: string
    name: string
    slug: string
  }
  subsubcategory?: {
    id: string
    name: string
    slug: string
  }
  
  // Geolocalización inteligente
  location: {
    // Datos estructurados para sharding
    continent: string
    country: string
    countryCode: string
    region: string
    regionCode: string
    city: string
    district?: string
    address?: string
    postalCode?: string
    
    // Coordenadas para búsqueda geoespacial
    coordinates: {
      type: 'Point'
      coordinates: [number, number] // [lng, lat] formato GeoJSON
    }
    
    // Metadatos geográficos
    timezone: string
    currency: string
    language: string
    
    // Para búsquedas optimizadas
    searchRadius: number // Radio de búsqueda por defecto en km
    administrativeLevels: string[] // Para jerarquía de búsqueda
  }
  
  // Usuario propietario
  userId: string
  userProfile: {
    displayName: string
    userType: 'individual' | 'business' | 'agency' | 'institution'
    verified: boolean
    trustScore: number
    responseRate?: number
    avgResponseTime?: number
  }
  
  // Información de contacto flexible
  contact: {
    methods: ContactMethod[]
    primaryMethod: string
    businessHours?: BusinessHours
    instantMessaging?: boolean
  }
  
  // Sistema de precios flexible
  pricing?: {
    type: 'fixed' | 'negotiable' | 'range' | 'hourly' | 'daily' | 'monthly' | 'free' | 'exchange'
    amount?: number
    minAmount?: number
    maxAmount?: number
    currency: string
    period?: string
    conditions?: string[]
    discounts?: Discount[]
  }
  
  // Media y contenido rico
  media: {
    images: MediaFile[]
    videos?: MediaFile[]
    documents?: MediaFile[]
    virtualTour?: string
    mainImageIndex: number
  }
  
  // Atributos dinámicos por categoría
  attributes: Record<string, AttributeValue>
  
  // Sistema de estado y ciclo de vida
  status: {
    current: 'draft' | 'active' | 'paused' | 'expired' | 'sold' | 'deleted' | 'flagged'
    history: StatusChange[]
    visibility: 'public' | 'private' | 'premium' | 'featured'
    isPromoted: boolean
    featuredUntil?: Date
  }
  
  // Engagement y métricas de red social
  engagement: {
    views: number
    uniqueViews: number
    likes: number
    shares: number
    saves: number
    comments: number
    clicksPhone: number
    clicksWhatsapp: number
    clicksEmail: number
    responseRate: number
    
    // Métricas temporales
    viewsByDay: Record<string, number>
    trendinessScore: number
    engagementRate: number
  }
  
  // IA y Machine Learning
  ai: {
    // Embeddings vectoriales para búsqueda semántica
    titleEmbedding?: number[]
    descriptionEmbedding?: number[]
    imageEmbeddings?: number[][]
    
    // Análisis de contenido
    extractedKeywords: string[]
    autoTags: string[]
    sentiment: 'positive' | 'neutral' | 'negative'
    qualityScore: number // 0-100
    completenessScore: number // 0-100
    trustScore: number // 0-100
    
    // Clasificación automática
    suggestedCategories: CategorySuggestion[]
    priceRecommendation?: PriceRecommendation
    
    // Detección de contenido
    contentFlags: string[]
    moderationStatus: 'approved' | 'pending' | 'flagged' | 'rejected'
    
    // Personalización
    targetAudience: string[]
    similarPublications: string[]
    recommendations: RecommendationWeight[]
  }
  
  // SEO y discoverabilidad
  seo: {
    metaTitle?: string
    metaDescription?: string
    keywords: string[]
    canonicalUrl?: string
    structuredData?: Record<string, unknown>
  }
  
  // Timestamps y tracking
  timestamps: {
    createdAt: Date
    updatedAt: Date
    publishedAt?: Date
    lastViewedAt?: Date
    expiresAt?: Date
    lastBumpedAt?: Date
  }
  
  // Metadatos del sistema
  system: {
    version: number
    source: string
    importId?: string
    externalId?: string
    migrationData?: Record<string, unknown>
    indexedAt?: Date
    lastProcessedAt?: Date
  }
}

// =============================================================================
// 3. INTERFACES DE SOPORTE
// =============================================================================

export interface ContactMethod {
  type: 'phone' | 'whatsapp' | 'email' | 'website' | 'social'
  value: string
  label?: string
  verified?: boolean
  primary?: boolean
}

export interface BusinessHours {
  monday?: TimeRange
  tuesday?: TimeRange
  wednesday?: TimeRange
  thursday?: TimeRange
  friday?: TimeRange
  saturday?: TimeRange
  sunday?: TimeRange
  timezone: string
}

export interface TimeRange {
  open: string // "09:00"
  close: string // "18:00"
  closed?: boolean
}

export interface MediaFile {
  url: string
  type: 'image' | 'video' | 'document'
  filename?: string
  size?: number
  width?: number
  height?: number
  duration?: number
  thumbnail?: string
  alt?: string
  caption?: string
}

export interface AttributeValue {
  value: string | number | boolean | Date | object | Array<unknown>
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object'
  label?: string
  unit?: string
  verified?: boolean
}

export interface StatusChange {
  status: string
  timestamp: Date
  reason?: string
  userId?: string
}

export interface CategorySuggestion {
  categoryId: string
  confidence: number
  reasons: string[]
}

export interface PriceRecommendation {
  suggestedPrice: number
  confidence: number
  marketAverage: number
  priceRange: {
    min: number
    max: number
  }
  factors: string[]
}

export interface RecommendationWeight {
  userId: string
  weight: number
  reasons: string[]
  context: string
}

export interface Discount {
  type: 'percentage' | 'fixed'
  value: number
  description: string
  validUntil?: Date
  conditions?: string[]
}

// =============================================================================
// 4. ESTRUCTURA PARA NEWSFEED Y RED SOCIAL
// =============================================================================

export interface NewsfeedItem {
  _id: string
  type: 'publication' | 'user_activity' | 'trending' | 'recommendation' | 'ad'
  
  // Referencia al contenido
  contentId: string
  contentType: string
  
  // Usuario objetivo
  targetUserId: string
  
  // Puntuación para ordenamiento
  score: number
  relevanceFactors: RelevanceFactor[]
  
  // Personalización
  personalizedContent?: Record<string, unknown>
  
  // Control de freshness
  createdAt: Date
  expiresAt: Date
  lastInteraction?: Date
  
  // Métricas
  impressions: number
  interactions: number
  engagementRate: number
}

export interface RelevanceFactor {
  factor: string
  weight: number
  explanation: string
}

// =============================================================================
// 5. BASES DE DATOS VECTORIALES PARA IA
// =============================================================================

export interface VectorEmbedding {
  _id: string
  contentId: string
  contentType: 'title' | 'description' | 'image' | 'combined'
  
  // Vector de alta dimensionalidad
  embedding: number[] // Típicamente 384, 768, o 1536 dimensiones
  
  // Metadatos para búsqueda
  metadata: {
    category: string
    location: string
    language: string
    quality: number
    timestamp: Date
  }
  
  // Para clustering y análisis
  clusterId?: string
  similarityGroups?: string[]
}

// =============================================================================
// 6. ESTRUCTURA DE ÍNDICES PARA PERFORMANCE
// =============================================================================

export const DATABASE_INDEXES = {
  // Índices geoespaciales para búsqueda local
  GEOSPATIAL: [
    { 'location.coordinates': '2dsphere' },
    { 'location.city': 1, 'location.coordinates': '2dsphere' },
    { 'location.region': 1, 'location.coordinates': '2dsphere' }
  ],
  
  // Índices para búsqueda y filtrado
  SEARCH: [
    { 'title': 'text', 'description': 'text', 'ai.extractedKeywords': 'text' },
    { 'category.slug': 1, 'subcategory.slug': 1, 'status.current': 1 },
    { 'location.city': 1, 'category.slug': 1, 'timestamps.createdAt': -1 }
  ],
  
  // Índices para newsfeed y recomendaciones
  SOCIAL: [
    { 'userId': 1, 'timestamps.createdAt': -1 },
    { 'engagement.trendinessScore': -1, 'timestamps.createdAt': -1 },
    { 'ai.recommendations.userId': 1, 'ai.recommendations.weight': -1 }
  ],
  
  // Índices para IA y ML
  AI_ML: [
    { 'ai.qualityScore': -1 },
    { 'ai.extractedKeywords': 1 },
    { 'ai.targetAudience': 1 }
  ],
  
  // Índices para analytics
  ANALYTICS: [
    { 'timestamps.createdAt': -1 },
    { 'location.country': 1, 'timestamps.createdAt': -1 },
    { 'category.slug': 1, 'timestamps.createdAt': -1 }
  ]
}

// =============================================================================
// 7. CONFIGURACIÓN DE SHARDING PARA ESCALA GLOBAL
// =============================================================================

export const SHARDING_STRATEGY = {
  // Sharding primario por región geográfica
  PRIMARY: {
    shardKey: { 'location.continent': 1, 'location.country': 1 },
    strategy: 'range',
    chunks: [
      { min: { continent: 'North America' }, max: { continent: 'North America' } },
      { min: { continent: 'South America' }, max: { continent: 'South America' } },
      { min: { continent: 'Europe' }, max: { continent: 'Europe' } },
      { min: { continent: 'Asia' }, max: { continent: 'Asia' } },
      { min: { continent: 'Africa' }, max: { continent: 'Africa' } },
      { min: { continent: 'Oceania' }, max: { continent: 'Oceania' } }
    ]
  },
  
  // Sharding secundario para distribución de carga
  SECONDARY: {
    shardKey: { 'timestamps.createdAt': 1 },
    strategy: 'hash',
    purpose: 'load_distribution'
  }
}

const DatabaseArchitecture = {
  DATABASE_COLLECTIONS,
  DATABASE_INDEXES,
  SHARDING_STRATEGY
}

export default DatabaseArchitecture 