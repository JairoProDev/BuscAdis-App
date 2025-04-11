/**
 * Tipos para el manejo de publicaciones en la aplicación
 */

// Categorías principales
export type MainCategory = 
  | 'empleos' 
  | 'inmuebles' 
  | 'vehiculos' 
  | 'servicios'
  | 'productos'
  | 'mascotas';

// Subcategorías por cada categoría principal
export type EmploymentSubcategory = 
  | 'administrativo'
  | 'ventas'
  | 'atencion-cliente'
  | 'educacion'
  | 'salud'
  | 'tecnologia'
  | 'marketing'
  | 'gastronomia'
  | 'construccion'
  | 'turismo'
  | 'otros';

export type RealEstateSubcategory = 
  | 'casas'
  | 'departamentos'
  | 'terrenos'
  | 'locales'
  | 'oficinas'
  | 'habitaciones'
  | 'otros';

export type VehicleSubcategory = 
  | 'autos'
  | 'camionetas'
  | 'motos'
  | 'camiones'
  | 'maquinaria'
  | 'otros';

export type ServiceSubcategory = 
  | 'profesionales'
  | 'hogar'
  | 'transporte'
  | 'educacion'
  | 'eventos'
  | 'belleza'
  | 'otros';

// Subsubcategorías
export type EmploymentType = 
  | 'tiempo-completo'
  | 'medio-tiempo'
  | 'temporal'
  | 'freelance'
  | 'practicas'
  | 'por-horas';

export type RealEstateType = 
  | 'venta'
  | 'alquiler'
  | 'anticresis'
  | 'traspaso';

export type VehicleType = 
  | 'nuevo'
  | 'usado'
  | 'alquiler';

export type ServiceType = 
  | 'puntual'
  | 'recurrente'
  | 'por-proyecto';

// Enumeración para estados de publicación
export enum PublicationStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  SOLD = 'sold',
  EXPIRED = 'expired',
  DELETED = 'deleted'
}

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

/**
 * Función para clasificar anuncios basados en su contenido
 * @param title Título del anuncio
 * @param description Descripción del anuncio
 * @returns Categorización sugerida
 */
export function classifyPublication(title: string, description: string): {
  category: MainCategory;
  subcategory: string;
  subsubcategory?: string;
} {
  const text = `${title} ${description}`.toLowerCase();
  
  // Palabras clave para categorías
  const employmentKeywords = ['empleo', 'trabajo', 'se busca', 'oferta laboral', 'contrato', 'sueldo', 'salario', 'requisitos', 'curriculum', 'cv', 'rrhh', 'postular'];
  const realEstateKeywords = ['casa', 'departamento', 'alquiler', 'alquilo', 'vendo', 'terreno', 'habitación', 'inmueble', 'propiedad', 'ambiente', 'dormitorio', 'baño'];
  const vehicleKeywords = ['auto', 'carro', 'vehículo', 'moto', 'camioneta', 'camión', 'modelo', 'año', 'kilometraje', 'motor'];
  const serviceKeywords = ['servicio', 'ofrezco', 'técnico', 'reparación', 'instalación', 'mantenimiento', 'profesor', 'clases'];
  
  // Detectar categoría principal
  let category: MainCategory = 'productos'; // Categoría por defecto
  
  if (employmentKeywords.some(keyword => text.includes(keyword))) {
    category = 'empleos';
  } else if (realEstateKeywords.some(keyword => text.includes(keyword))) {
    category = 'inmuebles';
  } else if (vehicleKeywords.some(keyword => text.includes(keyword))) {
    category = 'vehiculos';
  } else if (serviceKeywords.some(keyword => text.includes(keyword))) {
    category = 'servicios';
  }
  
  // Detectar subcategoría (simplificado)
  let subcategory = 'otros';
  let subsubcategory: string | undefined;
  
  // Empleos: detectar tipo de trabajo
  if (category === 'empleos') {
    if (text.includes('ventas') || text.includes('vendedor')) {
      subcategory = 'ventas';
    } else if (text.includes('administrativo') || text.includes('secretaria')) {
      subcategory = 'administrativo';
    } else if (text.includes('profesor') || text.includes('colegio') || text.includes('enseñanza')) {
      subcategory = 'educacion';
    }
    
    // Detectar jornada
    if (text.includes('tiempo completo')) {
      subsubcategory = 'tiempo-completo';
    } else if (text.includes('medio tiempo') || text.includes('part time')) {
      subsubcategory = 'medio-tiempo';
    } else if (text.includes('temporal') || text.includes('campaña')) {
      subsubcategory = 'temporal';
    }
  }
  
  // Inmuebles: detectar tipo propiedad
  if (category === 'inmuebles') {
    if (text.includes('casa')) {
      subcategory = 'casas';
    } else if (text.includes('departamento') || text.includes('depa')) {
      subcategory = 'departamentos';
    } else if (text.includes('terreno')) {
      subcategory = 'terrenos';
    } else if (text.includes('oficina')) {
      subcategory = 'oficinas';
    } else if (text.includes('habitación') || text.includes('cuarto')) {
      subcategory = 'habitaciones';
    }
    
    // Detectar tipo de operación
    if (text.includes('venta') || text.includes('vendo')) {
      subsubcategory = 'venta';
    } else if (text.includes('alquiler') || text.includes('alquilo')) {
      subsubcategory = 'alquiler';
    } else if (text.includes('anticresis')) {
      subsubcategory = 'anticresis';
    }
  }
  
  return {
    category,
    subcategory,
    subsubcategory
  };
} 