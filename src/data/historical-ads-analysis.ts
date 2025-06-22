/**
 * ANÁLISIS COMPLETO DE ANUNCIOS HISTÓRICOS
 * Definición de todos los ángulos posibles para extracción de datos
 * BuscaDis - Transformación de datos históricos en insights estratégicos
 */

export interface HistoricalAdAnalysis {
  // DATOS BÁSICOS DEL ANUNCIO
  basicInfo: {
    originalText: string;           // Texto original completo
    publicationDate: Date;          // Fecha de publicación
    magazineIssue: string;          // Número de revista
    category: string;               // Categoría principal
    subcategory: string;            // Subcategoría
    adSize: 'miniatura' | 'pequeño' | 'mediano' | 'grande' | 'extra';
    estimatedCost: number;          // Costo estimado por tamaño
  };

  // ANÁLISIS DE CONTENIDO
  contentAnalysis: {
    title: string;                  // Título extraído
    description: string;            // Descripción principal
    keyWords: string[];             // Palabras clave identificadas
    language: 'es' | 'qu' | 'en';   // Idioma detectado
    sentiment: 'positive' | 'neutral' | 'negative'; // Sentimiento
    urgencyLevel: 'low' | 'medium' | 'high';        // Nivel de urgencia
    professionalLevel: number;      // Nivel de profesionalismo (1-10)
  };

  // INFORMACIÓN DE CONTACTO
  contactInfo: {
    phoneNumbers: string[];         // Números de teléfono
    whatsappNumbers: string[];      // WhatsApp
    emails: string[];               // Emails
    addresses: string[];            // Direcciones
    socialMedia: string[];          // Redes sociales
    preferredContact: string;       // Método de contacto preferido
  };

  // ANÁLISIS GEOGRÁFICO
  locationAnalysis: {
    explicitLocations: string[];    // Ubicaciones mencionadas
    neighborhoods: string[];        // Barrios/urbanizaciones
    districts: string[];            // Distritos
    landmarks: string[];            // Referencias/puntos de referencia
    coordinates?: {                 // Coordenadas estimadas
      lat: number;
      lng: number;
      accuracy: number;
    };
  };

  // ANÁLISIS ECONÓMICO
  economicAnalysis: {
    prices: {
      amount: number;
      currency: string;
      type: 'rent' | 'sale' | 'service' | 'salary' | 'hourly';
      period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'one-time';
    }[];
    priceRange: {
      min: number;
      max: number;
      average: number;
    };
    economicKeywords: string[];     // Palabras clave económicas
    paymentMethods: string[];       // Métodos de pago mencionados
  };

  // ANÁLISIS TEMPORAL
  temporalAnalysis: {
    timeReferences: string[];       // Referencias temporales
    availability: {
      immediate: boolean;
      startDate?: Date;
      endDate?: Date;
      schedule?: string;
    };
    seasonality: 'seasonal' | 'permanent' | 'temporary';
    publicationFrequency: number;   // Frecuencia de publicación
  };

  // ANÁLISIS DE COMPETENCIA
  competitorAnalysis: {
    similarAds: string[];           // IDs de anuncios similares
    uniqueSellingPoints: string[];  // Puntos únicos de venta
    competitiveAdvantages: string[]; // Ventajas competitivas
    marketPosition: 'premium' | 'mid' | 'budget';
  };

  // ANÁLISIS DE AUDIENCIA
  audienceAnalysis: {
    targetAudience: string[];       // Audiencia objetivo
    demographics: {
      ageRange?: string;
      gender?: string;
      socioeconomicLevel?: string;
      profession?: string;
    };
    psychographics: {
      interests: string[];
      lifestyle: string[];
      values: string[];
    };
  };

  // ANÁLISIS DE RENDIMIENTO PREDICHO
  performanceAnalysis: {
    expectedViews: number;          // Vistas esperadas
    expectedResponses: number;      // Respuestas esperadas
    conversionProbability: number;  // Probabilidad de conversión
    qualityScore: number;           // Puntuación de calidad (1-100)
    seoScore: number;               // Puntuación SEO (1-100)
  };

  // ANÁLISIS DE PATRONES
  patternAnalysis: {
    textPatterns: string[];         // Patrones de texto identificados
    structurePatterns: string[];    // Patrones de estructura
    contactPatterns: string[];      // Patrones de contacto
    locationPatterns: string[];     // Patrones de ubicación
    repeatedElements: string[];     // Elementos repetidos
  };

  // ANÁLISIS DE INTENCIÓN
  intentAnalysis: {
    primaryIntent: string;          // Intención principal
    secondaryIntents: string[];     // Intenciones secundarias
    callToAction: string[];         // Llamadas a la acción
    urgencyIndicators: string[];    // Indicadores de urgencia
    trustIndicators: string[];      // Indicadores de confianza
  };

  // METADATOS DE PROCESAMIENTO
  processingMetadata: {
    extractionDate: Date;           // Fecha de extracción
    processingVersion: string;      // Versión del procesador
    confidenceScore: number;        // Puntuación de confianza (1-100)
    manualVerification: boolean;    // Verificación manual requerida
    errors: string[];               // Errores encontrados
    warnings: string[];             // Advertencias
  };
}

// DEFINICIÓN DE INSIGHTS ESTRATÉGICOS EXTRAÍBLES
export const STRATEGIC_INSIGHTS = {
  // ANÁLISIS DE MERCADO
  marketAnalysis: {
    categoryTrends: "Tendencias por categoría a lo largo del tiempo",
    seasonalPatterns: "Patrones estacionales de publicación",
    priceEvolution: "Evolución de precios por categoría",
    geographicDistribution: "Distribución geográfica de anuncios",
    competitorLandscape: "Panorama competitivo por sector"
  },

  // ANÁLISIS DE USUARIOS
  userAnalysis: {
    behaviorPatterns: "Patrones de comportamiento de publicación",
    loyaltyAnalysis: "Análisis de lealtad (re-publicaciones)",
    segmentation: "Segmentación de usuarios por características",
    lifetimeValue: "Valor de vida del cliente estimado",
    acquisitionChannels: "Canales de adquisición preferidos"
  },

  // ANÁLISIS DE CONTENIDO
  contentAnalysis: {
    effectiveFormats: "Formatos de anuncio más efectivos",
    keywordTrends: "Tendencias de palabras clave",
    successPatterns: "Patrones de éxito en anuncios",
    contentQuality: "Análisis de calidad de contenido",
    languagePreferences: "Preferencias de idioma por región"
  },

  // ANÁLISIS PREDICTIVO
  predictiveAnalysis: {
    demandForecasting: "Predicción de demanda por categoría",
    priceForecasting: "Predicción de precios",
    seasonalityPrediction: "Predicción de estacionalidad",
    userBehaviorPrediction: "Predicción de comportamiento de usuario",
    marketGrowthPrediction: "Predicción de crecimiento del mercado"
  },

  // ANÁLISIS DE OPORTUNIDADES
  opportunityAnalysis: {
    underservedSegments: "Segmentos desatendidos del mercado",
    pricingOpportunities: "Oportunidades de precios",
    geographicOpportunities: "Oportunidades geográficas",
    categoryOpportunities: "Oportunidades por categoría",
    innovationOpportunities: "Oportunidades de innovación"
  },

  // ANÁLISIS DE RIESGOS
  riskAnalysis: {
    marketRisks: "Riesgos del mercado identificados",
    competitorThreats: "Amenazas de competidores",
    regulatoryRisks: "Riesgos regulatorios",
    economicRisks: "Riesgos económicos",
    technologicalRisks: "Riesgos tecnológicos"
  }
};

// CONFIGURACIÓN DE EXTRACCIÓN DE DATOS
export const DATA_EXTRACTION_CONFIG = {
  // PATRONES REGEX PARA EXTRACCIÓN
  patterns: {
    phoneNumbers: /(\+?51\s?)?(\d{3}[-.\s]?\d{3}[-.\s]?\d{3}|\d{9})/g,
    whatsapp: /(whatsapp|wsp|wp)\s*:?\s*(\d{9})/i,
    emails: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    prices: /s\/\.?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
    addresses: /(av\.|avenida|jr\.|jirón|calle|ca\.|urb\.|urbanización|psj\.|pasaje)\s+[a-zA-Z0-9\s\-\.]+/gi,
    urgencyWords: /(urgente|inmediato|pronto|rápido|ya|ahora|emergencia)/gi,
    timeReferences: /(lunes|martes|miércoles|jueves|viernes|sábado|domingo|enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre|\d{1,2}\/\d{1,2}\/\d{2,4})/gi
  },

  // CATEGORIZACIÓN AUTOMÁTICA
  categorization: {
    keywords: {
      inmuebles: ['alquilo', 'vendo', 'casa', 'departamento', 'terreno', 'local', 'oficina'],
      empleos: ['solicita', 'requiere', 'busca', 'trabajo', 'empleo', 'personal'],
      vehiculos: ['auto', 'carro', 'moto', 'camión', 'camioneta', 'vehículo'],
      servicios: ['servicio', 'reparación', 'mantenimiento', 'instalación', 'limpieza'],
      educacion: ['clases', 'enseñanza', 'profesor', 'academia', 'instituto', 'universidad'],
      salud: ['doctor', 'médico', 'clínica', 'hospital', 'salud', 'consulta']
    }
  },

  // VALIDACIÓN DE DATOS
  validation: {
    requiredFields: ['originalText', 'category', 'contactInfo'],
    phoneValidation: /^(\+?51)?[9]\d{8}$/,
    priceValidation: /^\d+(\.\d{2})?$/,
    emailValidation: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },

  // ENRIQUECIMIENTO DE DATOS
  enrichment: {
    geoLocation: true,
    sentimentAnalysis: true,
    categoryPrediction: true,
    duplicateDetection: true,
    qualityScoring: true,
    seoOptimization: true
  }
};

// CASOS DE USO PARA IA
export const AI_USE_CASES = {
  adGeneration: {
    description: "Generación automática de anuncios basada en patrones históricos",
    trainingData: "Textos de anuncios categorizados por efectividad",
    expectedOutput: "Anuncios optimizados para conversión"
  },

  autoComplete: {
    description: "Autocompletado inteligente basado en historial",
    trainingData: "Patrones de texto y información de contacto",
    expectedOutput: "Sugerencias contextuales precisas"
  },

  priceOptimization: {
    description: "Optimización de precios basada en análisis histórico",
    trainingData: "Precios históricos y datos de rendimiento",
    expectedOutput: "Recomendaciones de precios óptimos"
  },

  contentModeration: {
    description: "Moderación automática de contenido",
    trainingData: "Anuncios clasificados como apropiados/inapropiados",
    expectedOutput: "Clasificación automática de contenido"
  },

  userPersonalization: {
    description: "Personalización de experiencia de usuario",
    trainingData: "Comportamientos y preferencias históricas",
    expectedOutput: "Recomendaciones personalizadas"
  },

  marketAnalysis: {
    description: "Análisis automático de tendencias de mercado",
    trainingData: "Datos históricos de publicaciones y precios",
    expectedOutput: "Insights de mercado y predicciones"
  }
};

// ESTRUCTURA DE DATOS PARA MACHINE LEARNING
export const ML_DATA_STRUCTURE = {
  features: [
    'text_length', 'word_count', 'sentence_count', 'price_mentioned',
    'contact_methods_count', 'location_specificity', 'urgency_level',
    'professional_score', 'category_relevance', 'seasonal_factor'
  ],
  
  labels: [
    'success_rate', 'view_count', 'response_rate', 'conversion_rate',
    'quality_score', 'spam_probability', 'duplicate_probability'
  ],

  preprocessing: {
    textNormalization: true,
    stopWordRemoval: true,
    stemming: true,
    vectorization: 'TF-IDF',
    featureScaling: true
  }
};

export default HistoricalAdAnalysis; 