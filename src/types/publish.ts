import { Category } from './blog'

export type AdStatus = 'draft' | 'pending' | 'published' | 'featured' | 'expired' | 'rejected'

export type PricingPlan = 'free' | 'basic' | 'premium' | 'professional'

export type MediaType = 'image' | 'video' | '3d' | 'document'

export interface Location {
  address?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  coordinates?: {
    lat: number
    lon: number
  }
}

export interface MediaFile {
  id?: string
  url?: string
  file: File
  preview: string
  type?: MediaType
  thumbnail?: string
  title?: string
  description?: string
  size?: number
  order?: number
  isPrimary?: boolean
}

export interface PriceInfo {
  amount: number
  currency: string
  negotiable?: boolean
  period?: 'hour' | 'day' | 'week' | 'month' | 'year'
  type: string
  maxAmount?: number
  pricePerUnit?: boolean
  unit?: string
}

export interface ContactInfo {
  name: string
  email: string
  phone?: string
  whatsapp?: string
  showEmail: boolean
  showPhone: boolean
  showWhatsapp: boolean
  preferredContact: 'email' | 'phone' | 'whatsapp'
  availableHours?: {
    from: string
    to: string
    timezone: string
  }
}

export interface AdFeatures {
  [key: string]: string | number | boolean | string[]
}

export interface AdStatistics {
  views: number
  favorites: number
  shares: number
  inquiries: number
  lastViewed: string
  averageViewDuration: number
  clickThroughRate: number
}

export interface AdSettings {
  visibility: 'public' | 'private' | 'unlisted'
  commentingEnabled: boolean
  sharingEnabled: boolean
  autoRenew: boolean
  notifyOnInquiries: boolean
  hideFromSearch: boolean
  featuredUntil?: string
  expiresAt: string
}

export interface Advertisement {
  id: string
  userId: string
  title: string
  description: string
  category: Category
  subcategory?: string
  condition?: 'new' | 'like_new' | 'good' | 'fair' | 'for_parts'
  quantity?: number
  brand?: string
  model?: string
  year?: number
  features: AdFeatures
  media: MediaFile[]
  location: Location
  price: PriceInfo
  contact: ContactInfo
  status: AdStatus
  plan: PricingPlan
  settings: AdSettings
  statistics: AdStatistics
  keywords: string[]
  createdAt: string
  updatedAt: string
  publishedAt?: string
  language: string
  verificationStatus: 'pending' | 'verified' | 'rejected'
  moderationNotes?: string[]
  urgencyLevel?: 'normal' | 'urgent' | 'very_urgent'
  warranty?: {
    type: string
    duration: number
    description: string
  }
  certificates?: {
    type: string
    number: string
    issuer: string
    validUntil: string
  }[]
  customFields?: {
    [key: string]: any
  }
}

export interface PublishStep {
  id: string
  title: string
  description: string
  isCompleted: boolean
  isOptional: boolean
  validationErrors: string[]
}

export interface PublishProgress {
  currentStep: number
  steps: PublishStep[]
  completedSteps: number
  totalSteps: number
  lastSaved: string
  canPublish: boolean
}

export interface CategoryConfig {
  id: string
  name: string
  icon: string
  requiredFields: string[]
  optionalFields: string[]
  features: {
    id: string
    name: string
    type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect'
    options?: string[]
    unit?: string
    validation?: {
      required?: boolean
      min?: number
      max?: number
      pattern?: string
    }
  }[]
  mediaRequirements: {
    minImages: number
    maxImages: number
    allowVideo: boolean
    allow3D: boolean
    allowDocuments: boolean
    maxFileSize: number
    recommendedDimensions: {
      width: number
      height: number
    }
  }
  pricingOptions: {
    allowNegotiation: boolean
    allowRange: boolean
    allowPricePerUnit: boolean
    requirePrice: boolean
    minPrice?: number
    maxPrice?: number
    supportedCurrencies: string[]
  }
  customSections?: {
    id: string
    title: string
    fields: {
      id: string
      name: string
      type: string
      required: boolean
      options?: string[]
    }[]
  }[]
}

export interface CategoryOption {
  id: string
  name: string
  icon?: string
  description?: string
  subcategories?: CategoryOption[]
}

export interface CategorySelectorProps {
  selectedCategory?: CategoryOption
  onSelect: (category: CategoryOption) => void
}

export interface MediaUploaderProps {
  files: MediaFile[]
  onFilesChange: (files: MediaFile[]) => void
  maxFiles?: number
}

export interface LocationSelectorProps {
  value?: Location
  onChange: (location: Location) => void
}

export interface PriceSelectorProps {
  value?: PriceInfo
  onChange: (price: PriceInfo) => void
}

export interface PublishStepProps {
  onComplete: () => void
  onBack?: () => void
  isLoading?: boolean
} 