// Tipos base comunes para todas las publicaciones
export interface BasePublication {
  id: string;
  title: string;
  description: string;
  user_id: string;
  category_id: string;
  subcategory_id: string;
  subsubcategory_id: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'inactive' | 'deleted';
  location: {
    latitude: number;
    longitude: number;
    city: string;
    country: string;
    address?: string;
  };
  images?: string[];
  contact: {
    name?: string;
    email: string;
    phone: string;
  };
}

// Interfaces específicas por categoría
export interface JobPublication extends BasePublication {
  job_type: string;
  salary_range: string;
  requirements: string[];
  benefits: string[];
  employment_type?: 'full-time' | 'part-time' | 'contract' | 'freelance';
  experience_level?: string;
  education_level?: string;
}

export interface RealEstatePublication extends BasePublication {
  property_type: string;
  price_range: string;
  price: number;
  currency: string;
  features: {
    bedrooms?: number;
    bathrooms?: number;
    area: number;
    parking?: number;
    amenities: string[];
  };
  operation_type: 'sale' | 'rent';
}

export interface VehiclePublication extends BasePublication {
  vehicle_type: string;
  year_model: string;
  brand: string;
  model: string;
  mileage: number;
  fuel_type: string;
  transmission: string;
  price: number;
  currency: string;
  features: string[];
  condition: 'new' | 'used';
}

export interface ServicePublication extends BasePublication {
  service_type: string;
  price_type: 'fixed' | 'hourly' | 'quote';
  price?: number;
  currency?: string;
  availability: string[];
  service_area: string[];
  experience_years?: number;
}

export interface ProductPublication extends BasePublication {
  product_type: string;
  price_range: string;
  price: number;
  currency: string;
  condition: 'new' | 'used' | 'refurbished';
  brand?: string;
  model?: string;
  specifications: Record<string, any>;
  warranty?: string;
}

export interface EventPublication extends BasePublication {
  event_type: string;
  event_date: string;
  start_time: string;
  end_time?: string;
  venue: string;
  capacity?: number;
  price?: number;
  currency?: string;
  organizer: string;
  registration_required: boolean;
}

export interface CommunityPublication extends BasePublication {
  community_type: string;
  target_audience: string[];
  schedule?: string;
  requirements?: string[];
  participation_type: 'free' | 'paid';
  price?: number;
  currency?: string;
}

export interface BusinessPublication extends BasePublication {
  business_type: string;
  investment_range: string;
  revenue?: number;
  employees?: number;
  years_operating?: number;
  included_assets: string[];
  reason_for_selling?: string;
  financial_summary?: {
    monthly_revenue?: number;
    monthly_expenses?: number;
    net_profit?: number;
  };
}

// Tipo unión para cualquier tipo de publicación
export type Publication =
  | JobPublication
  | RealEstatePublication
  | VehiclePublication
  | ServicePublication
  | ProductPublication
  | EventPublication
  | CommunityPublication
  | BusinessPublication;

// Enums útiles
export type PublicationCategory =
  | 'empleos'
  | 'inmuebles'
  | 'vehiculos'
  | 'servicios'
  | 'productos'
  | 'turismo'
  | 'eventos'
  | 'educacion'
  | 'mascotas';

export interface PublicationImage {
  id: string;
  url: string;
  width: number;
  height: number;
  size: number;
  type: string;
  thumbnailUrl?: string;
}

export interface PublicationLocation {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
}

export interface PublicationPrice {
  amount: number;
  currency: string;
  type: 'fixed' | 'negotiable' | 'free';
}

export interface PublicationUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  rating?: number;
  totalPublications?: number;
  memberSince: Date;
}

export interface Publication {
  id: string;
  title: string;
  description: string;
  category_id: string;
  subcategory_id?: string;
  subsubcategory_id?: string;
  category_type: PublicationCategory;
  price: PublicationPrice;
  location: PublicationLocation;
  images: PublicationImage[];
  user: PublicationUser;
  status: 'draft' | 'published' | 'expired' | 'deleted';
  views: number;
  favorites: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface PublicationFilters {
  category?: PublicationCategory;
  subcategory?: string;
  subsubcategory?: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // in kilometers
  };
  sortBy?: 'date' | 'price' | 'relevance';
  sortOrder?: 'asc' | 'desc';
  status?: Publication['status'];
  page?: number;
  limit?: number;
  searchTerm?: string;
}

export interface PublicationResponse {
  data: Publication[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
} 