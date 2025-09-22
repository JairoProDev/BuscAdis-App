/**
 * ESTRUCTURA JSON ÓPTIMA PARA ANUNCIOS HISTÓRICOS
 * BuscaDis - Formato de datos para almacenamiento e IA
 */

export interface HistoricalAdJSON {
  // IDENTIFICACIÓN ÚNICA
  id: string;                          // UUID único del adiso
  legacyId?: string;                   // ID del sistema anterior si existe
  
  // METADATOS DE ORIGEN
  source: {
    magazineName: string;              // "El Cusco", "Correo", etc.
    issueNumber: string;               // Número de edición
    publicationDate: string;           // YYYY-MM-DD
    pageNumber?: number;               // Página donde apareció
    position?: string;                 // Posición en la página
    extractionDate: string;            // Fecha de extracción YYYY-MM-DD
    extractionMethod: 'manual' | 'ai' | 'ocr';
  };

  // CONTENIDO PRINCIPAL
  content: {
    originalText: string;              // Texto original completo
    title: string;                     // Título extraído/generado
    description: string;               // Descripción limpia
    category: string;                  // Categoría principal
    subcategory: string;               // Subcategoría
    subsubcategory?: string;           // Sub-subcategoría si aplica
    tags: string[];                    // Etiquetas/palabras clave
    language: 'es' | 'qu' | 'en';      // Idioma detectado
  };

  // INFORMACIÓN COMERCIAL
  commercial: {
    type: 'sale' | 'rent' | 'service' | 'job' | 'wanted' | 'exchange';
    adSize: 'miniatura' | 'pequeño' | 'mediano' | 'grande' | 'extra';
    estimatedCost: number;             // Costo estimado de publicación
    duration: number;                  // Duración en días (normalmente 3)
    
    // PRECIOS EXTRAÍDOS
    prices: {
      amount: number;
      currency: 'PEN' | 'USD';
      type: 'fixed' | 'negotiable' | 'range';
      period?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'hourly';
      minPrice?: number;               // Para rangos
      maxPrice?: number;               // Para rangos
    }[];
  };

  // INFORMACIÓN DE CONTACTO
  contact: {
    phoneNumbers: string[];            // Números de teléfono
    whatsappNumbers: string[];         // WhatsApp
    emails: string[];                  // Correos electrónicos
    socialMedia: string[];             // Redes sociales
    websites: string[];                // Sitios web
    preferredMethod: string;           // Método preferido de contacto
    
    // INFORMACIÓN PERSONAL INFERIDA
    personType: 'individual' | 'business' | 'unknown';
    businessName?: string;             // Nombre del negocio si aplica
    contactName?: string;              // Nombre de contacto si se menciona
  };

  // UBICACIÓN GEOGRÁFICA
  location: {
    // UBICACIONES EXPLÍCITAS MENCIONADAS
    explicit: {
      neighborhoods: string[];         // Urb. Lucrepata, Los Sauces, etc.
      districts: string[];             // Wanchaq, San Blas, etc.
      streets: string[];               // Av. Túpac Amaru, etc.
      landmarks: string[];             // Referencias mencionadas
      fullAddress?: string;            // Dirección completa si está
    };
    
    // UBICACIÓN GEOCODIFICADA
    geocoded?: {
      lat: number;
      lng: number;
      accuracy: 'exact' | 'approximate' | 'city' | 'region';
      source: 'google' | 'osm' | 'manual';
    };
    
    // ÁREA DE COBERTURA
    coverage: {
      radius?: number;                 // Radio en km si aplica
      zones: string[];                 // Zonas de cobertura
    };
  };

  // ANÁLISIS DE CONTENIDO
  analysis: {
    sentiment: 'positive' | 'neutral' | 'negative';
    urgencyLevel: 'low' | 'medium' | 'high';
    professionalLevel: 1 | 2 | 3 | 4 | 5;   // 1=amateur, 5=muy profesional
    qualityScore: number;              // 0-100
    completenessScore: number;         // 0-100 qué tan completo está
    
    // CARACTERÍSTICAS DEL TEXTO
    textStats: {
      wordCount: number;
      characterCount: number;
      sentenceCount: number;
      paragraphCount: number;
      averageWordsPerSentence: number;
    };
    
    // ELEMENTOS DETECTADOS
    features: {
      hasPrice: boolean;
      hasLocation: boolean;
      hasContact: boolean;
      hasUrgency: boolean;
      hasPhotos: boolean;              // Si menciona fotos
      hasSpecifications: boolean;      // Si tiene especificaciones técnicas
    };
  };

  // CLASIFICACIÓN E INTENCIÓN
  classification: {
    primaryIntent: string;             // Intención principal
    secondaryIntents: string[];        // Intenciones secundarias
    targetAudience: string[];          // Audiencia objetivo
    marketSegment: 'premium' | 'mid' | 'budget' | 'luxury';
    
    // CLASIFICACIÓN AUTOMÁTICA POR IA
    aiClassification: {
      confidence: number;              // 0-100
      suggestedCategory: string;
      suggestedSubcategory: string;
      alternativeCategories: string[];
    };
  };

  // DETECCIÓN DE DUPLICADOS
  duplicates: {
    isDuplicate: boolean;
    originalAdId?: string;             // ID del adiso original
    similarityScore?: number;          // 0-100
    duplicateType: 'exact' | 'similar' | 'variant' | 'repost';
    differences?: string[];            // Diferencias encontradas
  };

  // ANÁLISIS TEMPORAL
  temporal: {
    seasonality: 'seasonal' | 'year-round' | 'temporary';
    timeReferences: string[];          // Referencias temporales encontradas
    availability: {
      immediate: boolean;
      startDate?: string;              // YYYY-MM-DD
      endDate?: string;                // YYYY-MM-DD
      schedule?: string;               // Horarios mencionados
    };
    
    // FRECUENCIA DE REPUBLICACIÓN
    republication: {
      isRepublished: boolean;
      previousPublications: string[];   // IDs de publicaciones anteriores
      frequency?: 'weekly' | 'monthly' | 'irregular';
    };
  };

  // ANÁLISIS COMPETITIVO
  competition: {
    competitors: string[];             // IDs de adisos similares/competidores
    uniqueSellingPoints: string[];     // Puntos únicos de venta
    competitiveAdvantages: string[];   // Ventajas competitivas
    priceComparison: {
      isAboveMarket: boolean;
      isBelowMarket: boolean;
      marketAverage?: number;
      pricePosition: 'cheap' | 'fair' | 'expensive' | 'premium';
    };
  };

  // PREDICCIONES Y MACHINE LEARNING
  predictions: {
    expectedViews: number;             // Vistas esperadas
    expectedResponses: number;         // Respuestas esperadas
    conversionProbability: number;     // 0-1
    successProbability: number;        // 0-1
    
    // RECOMENDACIONES DE IA
    aiRecommendations: {
      priceOptimization?: number;      // Precio recomendado
      categoryOptimization?: string;   // Categoría recomendada
      contentImprovements: string[];   // Mejoras sugeridas
      seoImprovements: string[];       // Mejoras SEO
    };
  };

  // DATOS PARA ENTRENAMIENTO DE IA
  training: {
    // CARACTERÍSTICAS NUMÉRICAS PARA ML
    features: {
      text_length: number;
      word_count: number;
      sentence_count: number;
      price_mentioned: 0 | 1;
      contact_methods_count: number;
      location_specificity: number;    // 0-1
      urgency_level: number;           // 0-1
      professional_score: number;      // 0-1
      category_relevance: number;      // 0-1
      seasonal_factor: number;         // 0-1
    };
    
    // VECTORES DE TEXTO
    textVectors?: {
      tfidf?: number[];                // Vector TF-IDF
      word2vec?: number[];             // Vector Word2Vec
      bert?: number[];                 // Vector BERT
    };
  };

  // ESTADO DE PROCESAMIENTO
  processing: {
    status: 'pending' | 'processing' | 'completed' | 'error' | 'manual_review';
    version: string;                   // Versión del procesador
    confidenceScore: number;           // 0-100
    manualVerificationNeeded: boolean;
    errors: string[];                  // Errores encontrados
    warnings: string[];                // Advertencias
    
    // VERIFICACIÓN HUMANA
    humanVerification?: {
      verifiedBy?: string;             // Usuario que verificó
      verificationDate?: string;       // YYYY-MM-DD
      corrections: string[];           // Correcciones hechas
      approved: boolean;
    };
  };

  // METADATOS ADICIONALES
  metadata: {
    created: string;                   // YYYY-MM-DDTHH:mm:ssZ
    updated: string;                   // YYYY-MM-DDTHH:mm:ssZ
    version: number;                   // Versión del documento
    flags: string[];                   // Banderas especiales
    notes?: string;                    // Notas adicionales
    
    // ÍNDICES PARA BÚSQUEDA
    searchableText: string;            // Texto optimizado para búsqueda
    keywords: string[];                // Palabras clave para indexación
    boost: number;                     // Factor de boost para búsqueda (1.0 = normal)
  };
}

// ESTRUCTURA SIMPLIFICADA PARA IMPORTACIÓN MASIVA
export interface BulkImportAd {
  originalText: string;
  magazineName: string;
  issueNumber: string;
  publicationDate: string;           // YYYY-MM-DD
  pageNumber?: number;
  adSize?: string;
  estimatedCost?: number;
}

// ESTRUCTURA PARA EXPORTACIÓN A IA
export interface AITrainingData {
  id: string;
  text: string;
  category: string;
  subcategory: string;
  features: number[];               // Array de características numéricas
  labels: number[];                 // Array de etiquetas para supervisión
  metadata: {
    date: string;
    quality: number;
    verified: boolean;
  };
}

// EJEMPLO DE USO PARA GEMINI/IA EXTRACTION
export const GEMINI_EXTRACTION_PROMPT = `
Extrae la siguiente información del texto de adiso:
1. Título (máximo 60 caracteres)
2. Descripción (resumen del adiso)
3. Categoría (inmuebles, empleos, vehiculos, servicios, productos, educacion, salud, turismo, mascotas)
4. Subcategoría (específica de la categoría)
5. Tipo (venta, alquiler, servicio, trabajo, etc.)
6. Precio (si se menciona)
7. Ubicación (direcciones, barrios, referencias)
8. Contacto (teléfonos, WhatsApp, emails)
9. Características especiales
10. Nivel de urgencia (bajo, medio, alto)

Responde en formato JSON siguiendo la estructura HistoricalAdJSON.
`;

export default HistoricalAdJSON; 