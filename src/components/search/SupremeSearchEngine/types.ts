// Types específicos para el Supreme Search Engine

export interface SearchResult {
  id: string
  title: string
  description: string
  price?: number
  location: string
  category: string
  image: string
  publishedAt: string
  views: number
  isFavorite: boolean
  isPromoted?: boolean
  isPremium?: boolean
  condition?: string
  tags?: string[]
  contactInfo?: {
    phone?: string
    whatsapp?: string
    email?: string
  }
}

export interface SearchQuery {
  text?: string
  category?: string
  subcategory?: string
  subsubcategory?: string
  location?: {
    city?: string
    region?: string
    coordinates?: { lat: number; lng: number }
    radius?: number
  }
  price?: {
    min?: number
    max?: number
    currency?: string
  }
  filters?: Record<string, unknown>
  sortBy?: 'relevance' | 'date' | 'price_asc' | 'price_desc' | 'distance' | 'views'
  page?: number
  limit?: number
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
  page: number
  pages: number
  suggestions?: string[]
  facets?: SearchFacet[]
  searchTime: number
  query: SearchQuery
}

export interface SearchFacet {
  id: string
  label: string
  values: Array<{
    value: string
    label: string
    count: number
  }>
}

export interface SearchSuggestion {
  id: string
  text: string
  type: 'recent' | 'trending' | 'ai' | 'category'
  categoryId?: string
  subcategoryId?: string
  score?: number
  icon?: React.ComponentType<{ className?: string }>
}

export interface VoiceSearchOptions {
  language?: string
  continuous?: boolean
  interimResults?: boolean
}

export interface ImageSearchOptions {
  maxFileSize?: number
  acceptedTypes?: string[]
  ocrEnabled?: boolean
  similarityThreshold?: number
}

export interface SearchEngineConfig {
  enableVoiceSearch: boolean
  enableImageSearch: boolean
  enableAiSuggestions: boolean
  enableRealTimeResults: boolean
  debounceDelay: number
  maxSuggestions: number
  maxQuickResults: number
}

export type ViewMode = 'grid' | 'list' | 'map'

export type SearchVariant = 'header' | 'page' | 'compact' 