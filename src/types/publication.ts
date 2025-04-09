/**
 * Tipos para el manejo de publicaciones en la aplicación
 */

export interface PublicationImage {
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
  caption?: string;
  isPrimary?: boolean;
  secureUrl?: string; // Para URLs HTTPS de Cloudinary
}

export interface PublicationLocation {
  city: string;
  region: string;
  district?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  reference?: string;
}

export interface PublicationPrice {
  amount: number;
  currency: 'PEN' | 'USD';
  isNegotiable?: boolean;
  rangeMin?: number;
  rangeMax?: number;
  period?: 'hour' | 'day' | 'week' | 'month' | 'year';
}

// Tipos específicos para cada categoría de publicación
export interface VehiclePublication {
  vehicle_type: string;
  year_model: number;
  brand: string;
  model: string;
  mileage: number;
  fuel_type: string;
  transmission: string;
  price: number;
  currency: string;
  features: string[];
  condition: string;
}

export interface JobPublication {
  job_type: string;
  company_name: string;
  employment_type: string;
  experience_level: string;
  education_level: string;
  salary_range: string;
  requirements: string[];
  benefits: string[];
}

export interface ProductPublication {
  product_type: string;
  price_range?: string;
  price: number;
  currency: string;
  condition: string;
  brand?: string;
  model?: string;
  specifications: string[];
  warranty?: string;
}

export interface RealEstatePublication {
  property_type: string;
  operation_type: 'sale' | 'rent';
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  parking_spots?: number;
  amenities: string[];
  price: number;
  currency: string;
}

export interface CommunityPublication {
  community_type: string;
  target_audience: string;
  schedule: string;
  requirements?: string[];
  participation_type: string;
  price: number;
  currency: string;
}

// Publicación base que puede ser extendida por tipos específicos
export interface Publication {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  price: PublicationPrice | number;
  currency?: string;
  location: PublicationLocation;
  contactName: string;
  contactEmail?: string;
  contactPhone: string;
  images: PublicationImage[];
  status: 'active' | 'inactive' | 'pending' | 'sold' | 'expired';
  created_at: string;
  updated_at: string;
  
  // Campos específicos según la categoría
  vehicleDetails?: VehiclePublication;
  jobDetails?: JobPublication;
  productDetails?: ProductPublication;
  realEstateDetails?: RealEstatePublication;
  communityDetails?: CommunityPublication;
}

// Opciones para filtrado de publicaciones
export interface PublicationFilters {
  // Filtros generales
  category?: string;
  subcategory?: string;
  priceMin?: number;
  priceMax?: number;
  currency?: string;
  city?: string;
  region?: string;
  district?: string;
  query?: string;
  
  // Ordenamiento
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc';
  
  // Filtros para vehículos
  vehicle_type?: string[];
  brand?: string[];
  model?: string[];
  year_min?: number;
  year_max?: number;
  mileage_max?: number;
  fuel_type?: string[];
  transmission?: string[];
  
  // Filtros para bienes raíces
  property_type?: string[];
  operation_type?: 'sale' | 'rent';
  area_min?: number;
  area_max?: number;
  bedrooms_min?: number;
  bathrooms_min?: number;
  
  // Filtros para empleos
  job_type?: string[];
  employment_type?: string[];
  experience_level?: string[];
  
  // Filtros para productos
  product_type?: string[];
  condition?: string[];
  
  // Paginación
  page?: number;
  limit?: number;
}

// Respuesta paginada de publicaciones
export interface PublicationResponse {
  publications: Publication[];
  total: number;
  page: number;
  limit: number;
}

// Estructura para crear o actualizar una publicación
export interface PublicationInput {
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  price: number | PublicationPrice;
  currency?: string;
  location: PublicationLocation;
  contactName: string;
  contactEmail?: string;
  contactPhone: string;
  images: File[] | PublicationImage[];
  
  // Campos específicos según categoría
  vehicleDetails?: Partial<VehiclePublication>;
  jobDetails?: Partial<JobPublication>;
  productDetails?: Partial<ProductPublication>;
  realEstateDetails?: Partial<RealEstatePublication>;
  communityDetails?: Partial<CommunityPublication>;
} 