/**
 * Estructura Global del Marketplace BuscAdis
 * 
 * Sistema jerárquico diseñado para escalar globalmente:
 * - Categorías principales (lo que vende/busca)
 * - Sectores (industrias/nichos específicos)
 * - Subcategorías (especializaciones)
 * - Metadatos (atributos específicos por categoría)
 * - Configuración regional (adaptación local)
 */

export interface MarketplaceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  priority: number; // 1-10, mayor prioridad = más visible
  isCore: boolean; // Categorías principales
  parentId?: string;
  subcategories: MarketplaceSubcategory[];
  attributes: CategoryAttribute[];
  seoData: SEOData;
  regional: RegionalConfiguration;
}

export interface MarketplaceSubcategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  priority: number;
  attributes: CategoryAttribute[];
}

export interface CategoryAttribute {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean' | 'range' | 'date';
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  schema: Record<string, unknown>;
}

export interface RegionalConfiguration {
  availability: string[]; // Códigos de país ISO
  localNames: Record<string, string>;
  localAttributes: Record<string, CategoryAttribute[]>;
  pricing: {
    currency: string[];
    typical_ranges: Record<string, { min: number; max: number }>;
  };
}

// CATEGORÍAS PRINCIPALES (CORE) - Las más importantes
export const CORE_CATEGORIES: MarketplaceCategory[] = [
  {
    id: 'empleos',
    name: 'Empleos',
    slug: 'empleos',
    description: 'Oportunidades laborales en todas las industrias',
    icon: 'briefcase',
    priority: 10,
    isCore: true,
    subcategories: [
      {
        id: 'tiempo_completo',
        name: 'Tiempo Completo',
        slug: 'tiempo-completo',
        description: 'Empleos de 40+ horas semanales',
        priority: 10,
        attributes: [
          { id: 'salary', name: 'Salario', type: 'range', required: true },
          { id: 'experience', name: 'Experiencia', type: 'select', required: true, 
            options: ['Sin experiencia', '1-2 años', '3-5 años', '5+ años'] },
          { id: 'education', name: 'Educación', type: 'select', required: false,
            options: ['Secundaria', 'Técnico', 'Universitario', 'Postgrado'] }
        ]
      },
      {
        id: 'medio_tiempo',
        name: 'Medio Tiempo',
        slug: 'medio-tiempo',
        description: 'Empleos de 20-40 horas semanales',
        priority: 8,
        attributes: []
      },
      {
        id: 'freelance',
        name: 'Freelance',
        slug: 'freelance',
        description: 'Proyectos independientes y consultorías',
        priority: 7,
        attributes: []
      }
    ],
    attributes: [
      { id: 'job_type', name: 'Tipo de Empleo', type: 'select', required: true,
        options: ['Presencial', 'Remoto', 'Híbrido'] },
      { id: 'industry', name: 'Industria', type: 'select', required: true,
        options: ['Tecnología', 'Salud', 'Educación', 'Finanzas', 'Retail', 'Turismo'] }
    ],
    seoData: {
      title: 'Empleos en {location} - BuscAdis',
      description: 'Encuentra las mejores oportunidades laborales en {location}',
      keywords: ['empleos', 'trabajo', 'ofertas laborales', 'vacantes'],
      schema: { '@type': 'JobPosting' }
    },
    regional: {
      availability: ['PE', 'BO', 'EC', 'CO', 'CL', 'AR', 'MX', 'US', 'ES'],
      localNames: {
        'en': 'Jobs',
        'pt': 'Empregos',
        'fr': 'Emplois'
      },
      localAttributes: {},
      pricing: {
        currency: ['PEN', 'USD', 'EUR'],
        typical_ranges: {
          'PE': { min: 1000, max: 5000 },
          'US': { min: 30000, max: 100000 }
        }
      }
    }
  },
  {
    id: 'inmuebles',
    name: 'Inmuebles',
    slug: 'inmuebles',
    description: 'Propiedades en venta y alquiler',
    icon: 'home',
    priority: 10,
    isCore: true,
    subcategories: [
      {
        id: 'casas',
        name: 'Casas',
        slug: 'casas',
        description: 'Casas independientes y adosadas',
        priority: 10,
        attributes: [
          { id: 'bedrooms', name: 'Dormitorios', type: 'number', required: true,
            validation: { min: 1, max: 10 } },
          { id: 'bathrooms', name: 'Baños', type: 'number', required: true,
            validation: { min: 1, max: 10 } },
          { id: 'area', name: 'Área (m²)', type: 'number', required: true },
          { id: 'parking', name: 'Estacionamiento', type: 'boolean', required: false }
        ]
      },
      {
        id: 'departamentos',
        name: 'Departamentos',
        slug: 'departamentos',
        description: 'Apartamentos y condominios',
        priority: 9,
        attributes: []
      },
      {
        id: 'terrenos',
        name: 'Terrenos',
        slug: 'terrenos',
        description: 'Lotes y terrenos para construcción',
        priority: 7,
        attributes: []
      }
    ],
    attributes: [
      { id: 'transaction_type', name: 'Tipo', type: 'select', required: true,
        options: ['Venta', 'Alquiler', 'Anticretico'] },
      { id: 'property_age', name: 'Antigüedad', type: 'select', required: false,
        options: ['Nuevo', '1-5 años', '6-10 años', '11-20 años', '20+ años'] }
    ],
    seoData: {
      title: 'Inmuebles en {location} - Casas y Departamentos',
      description: 'Encuentra la propiedad perfecta en {location}',
      keywords: ['inmuebles', 'casas', 'departamentos', 'propiedades'],
      schema: { '@type': 'RealEstate' }
    },
    regional: {
      availability: ['PE', 'BO', 'EC', 'CO', 'CL', 'AR'],
      localNames: {
        'en': 'Real Estate',
        'pt': 'Imóveis'
      },
      localAttributes: {},
      pricing: {
        currency: ['PEN', 'USD'],
        typical_ranges: {
          'PE': { min: 50000, max: 500000 }
        }
      }
    }
  },
  {
    id: 'vehiculos',
    name: 'Vehículos',
    slug: 'vehiculos',
    description: 'Autos, motos y vehículos comerciales',
    icon: 'car',
    priority: 9,
    isCore: true,
    subcategories: [
      {
        id: 'autos',
        name: 'Autos',
        slug: 'autos',
        description: 'Automóviles particulares',
        priority: 10,
        attributes: [
          { id: 'brand', name: 'Marca', type: 'select', required: true,
            options: ['Toyota', 'Hyundai', 'Nissan', 'Chevrolet', 'Ford', 'Honda'] },
          { id: 'model', name: 'Modelo', type: 'text', required: true },
          { id: 'year', name: 'Año', type: 'number', required: true,
            validation: { min: 1990, max: 2025 } },
          { id: 'mileage', name: 'Kilometraje', type: 'number', required: true },
          { id: 'fuel_type', name: 'Combustible', type: 'select', required: true,
            options: ['Gasolina', 'Diesel', 'GLP', 'Híbrido', 'Eléctrico'] }
        ]
      },
      {
        id: 'motos',
        name: 'Motos',
        slug: 'motos',
        description: 'Motocicletas y scooters',
        priority: 8,
        attributes: []
      }
    ],
    attributes: [
      { id: 'condition', name: 'Condición', type: 'select', required: true,
        options: ['Nuevo', 'Usado - Excelente', 'Usado - Bueno', 'Usado - Regular'] },
      { id: 'transmission', name: 'Transmisión', type: 'select', required: true,
        options: ['Manual', 'Automática', 'Semi-automática'] }
    ],
    seoData: {
      title: 'Vehículos en {location} - Autos y Motos',
      description: 'Compra y vende vehículos en {location}',
      keywords: ['vehículos', 'autos', 'motos', 'carros'],
      schema: { '@type': 'Vehicle' }
    },
    regional: {
      availability: ['PE', 'BO', 'EC', 'CO', 'CL', 'AR'],
      localNames: {
        'en': 'Vehicles',
        'pt': 'Veículos'
      },
      localAttributes: {},
      pricing: {
        currency: ['PEN', 'USD'],
        typical_ranges: {
          'PE': { min: 5000, max: 100000 }
        }
      }
    }
  },
  {
    id: 'servicios',
    name: 'Servicios',
    slug: 'servicios',
    description: 'Servicios profesionales y técnicos',
    icon: 'wrench',
    priority: 8,
    isCore: true,
    subcategories: [
      {
        id: 'hogar',
        name: 'Para el Hogar',
        slug: 'hogar',
        description: 'Servicios domésticos y de mantenimiento',
        priority: 9,
        attributes: []
      },
      {
        id: 'profesionales',
        name: 'Profesionales',
        slug: 'profesionales',
        description: 'Servicios especializados',
        priority: 8,
        attributes: []
      }
    ],
    attributes: [
      { id: 'service_type', name: 'Tipo de Servicio', type: 'select', required: true,
        options: ['Por hora', 'Por proyecto', 'Mensualidad', 'Emergencia'] },
      { id: 'availability', name: 'Disponibilidad', type: 'multiselect', required: false,
        options: ['Lunes-Viernes', 'Fines de semana', '24/7', 'Solo citas'] }
    ],
    seoData: {
      title: 'Servicios en {location} - Profesionales',
      description: 'Encuentra servicios profesionales en {location}',
      keywords: ['servicios', 'profesionales', 'técnicos'],
      schema: { '@type': 'Service' }
    },
    regional: {
      availability: ['PE', 'BO', 'EC', 'CO', 'CL', 'AR'],
      localNames: {
        'en': 'Services',
        'pt': 'Serviços'
      },
      localAttributes: {},
      pricing: {
        currency: ['PEN', 'USD'],
        typical_ranges: {
          'PE': { min: 50, max: 500 }
        }
      }
    }
  }
];

// SECTORES ESPECIALIZADOS - Nichos específicos
export const SPECIALIZED_SECTORS: MarketplaceCategory[] = [
  {
    id: 'educacion',
    name: 'Educación',
    slug: 'educacion',
    description: 'Cursos, tutorías y formación',
    icon: 'academic-cap',
    priority: 7,
    isCore: false,
    subcategories: [
      {
        id: 'cursos_online',
        name: 'Cursos Online',
        slug: 'cursos-online',
        description: 'Formación virtual',
        priority: 8,
        attributes: []
      },
      {
        id: 'tutorias',
        name: 'Tutorías',
        slug: 'tutorias',
        description: 'Clases particulares',
        priority: 7,
        attributes: []
      }
    ],
    attributes: [],
    seoData: {
      title: 'Educación en {location} - Cursos y Tutorías',
      description: 'Encuentra oportunidades educativas en {location}',
      keywords: ['educación', 'cursos', 'tutorías'],
      schema: { '@type': 'EducationalOrganization' }
    },
    regional: {
      availability: ['PE', 'BO', 'EC', 'CO', 'CL', 'AR'],
      localNames: {
        'en': 'Education',
        'pt': 'Educação'
      },
      localAttributes: {},
      pricing: {
        currency: ['PEN', 'USD'],
        typical_ranges: {
          'PE': { min: 100, max: 2000 }
        }
      }
    }
  },
  {
    id: 'turismo',
    name: 'Turismo',
    slug: 'turismo',
    description: 'Tours, hospedaje y experiencias',
    icon: 'globe-alt',
    priority: 8,
    isCore: false,
    subcategories: [
      {
        id: 'tours',
        name: 'Tours',
        slug: 'tours',
        description: 'Experiencias turísticas',
        priority: 9,
        attributes: []
      },
      {
        id: 'hospedaje',
        name: 'Hospedaje',
        slug: 'hospedaje',
        description: 'Hoteles y alojamiento',
        priority: 8,
        attributes: []
      }
    ],
    attributes: [],
    seoData: {
      title: 'Turismo en {location} - Tours y Hospedaje',
      description: 'Descubre experiencias turísticas en {location}',
      keywords: ['turismo', 'tours', 'hospedaje'],
      schema: { '@type': 'TouristAttraction' }
    },
    regional: {
      availability: ['PE', 'BO', 'EC', 'CO', 'CL', 'AR'],
      localNames: {
        'en': 'Tourism',
        'pt': 'Turismo'
      },
      localAttributes: {},
      pricing: {
        currency: ['PEN', 'USD'],
        typical_ranges: {
          'PE': { min: 50, max: 1000 }
        }
      }
    }
  },
  {
    id: 'mascotas',
    name: 'Mascotas',
    slug: 'mascotas',
    description: 'Todo para tu mascota',
    icon: 'heart',
    priority: 6,
    isCore: false,
    subcategories: [
      {
        id: 'adopcion',
        name: 'Adopción',
        slug: 'adopcion',
        description: 'Mascotas en adopción',
        priority: 9,
        attributes: []
      },
      {
        id: 'servicios_veterinarios',
        name: 'Servicios Veterinarios',
        slug: 'veterinarios',
        description: 'Cuidado profesional',
        priority: 8,
        attributes: []
      }
    ],
    attributes: [],
    seoData: {
      title: 'Mascotas en {location} - Adopción y Servicios',
      description: 'Todo para mascotas en {location}',
      keywords: ['mascotas', 'adopción', 'veterinarios'],
      schema: { '@type': 'PetStore' }
    },
    regional: {
      availability: ['PE', 'BO', 'EC', 'CO', 'CL', 'AR'],
      localNames: {
        'en': 'Pets',
        'pt': 'Animais'
      },
      localAttributes: {},
      pricing: {
        currency: ['PEN', 'USD'],
        typical_ranges: {
          'PE': { min: 20, max: 500 }
        }
      }
    }
  }
];

// CONFIGURACIÓN GLOBAL
export const MARKETPLACE_CONFIG = {
  defaultLanguage: 'es',
  supportedLanguages: ['es', 'en', 'pt', 'fr'],
  defaultCurrency: 'PEN',
  supportedCurrencies: ['PEN', 'USD', 'EUR', 'BRL', 'COP', 'CLP', 'ARS'],
  
  // Configuración por región
  regionalDefaults: {
    'PE': { language: 'es', currency: 'PEN', timezone: 'America/Lima' },
    'US': { language: 'en', currency: 'USD', timezone: 'America/New_York' },
    'BR': { language: 'pt', currency: 'BRL', timezone: 'America/Sao_Paulo' },
    'MX': { language: 'es', currency: 'USD', timezone: 'America/Mexico_City' }
  },
  
  // Fases de expansión
  expansionPhases: {
    phase1: { // 2024 Q4
      regions: ['PE'],
      categories: ['empleos', 'inmuebles', 'vehiculos', 'servicios'],
      features: ['basic_search', 'voice_search', 'image_search']
    },
    phase2: { // 2025 Q2
      regions: ['PE', 'BO', 'EC'],
      categories: ['empleos', 'inmuebles', 'vehiculos', 'servicios', 'educacion', 'turismo'],
      features: ['ai_recommendations', 'advanced_filters', 'real_time_chat']
    },
    phase3: { // 2025 Q4
      regions: ['PE', 'BO', 'EC', 'CO', 'CL', 'AR'],
      categories: 'all',
      features: ['ai_pricing', 'auto_translation', 'premium_features']
    },
    phase4: { // 2026+
      regions: ['latam', 'us', 'eu'],
      categories: 'all',
      features: ['full_ai_integration', 'blockchain_verification', 'metaverse_showrooms']
    }
  }
};

// Función para obtener categorías por región y fase
export function getCategoriesForRegion(region: string, phase: string): MarketplaceCategory[] {
  const phaseConfig = MARKETPLACE_CONFIG.expansionPhases[phase as keyof typeof MARKETPLACE_CONFIG.expansionPhases];
  
  if (!phaseConfig || !phaseConfig.regions.includes(region)) {
    return [];
  }
  
  const allCategories = [...CORE_CATEGORIES, ...SPECIALIZED_SECTORS];
  
  if (phaseConfig.categories === 'all') {
    return allCategories.filter(cat => cat.regional.availability.includes(region));
  }
  
  return allCategories.filter(cat => 
    phaseConfig.categories.includes(cat.id) && 
    cat.regional.availability.includes(region)
  );
}

// Función para obtener configuración regional
export function getRegionalConfig(region: string): Record<string, unknown> {
  return MARKETPLACE_CONFIG.regionalDefaults[region as keyof typeof MARKETPLACE_CONFIG.regionalDefaults] || 
         MARKETPLACE_CONFIG.regionalDefaults['PE'];
} 