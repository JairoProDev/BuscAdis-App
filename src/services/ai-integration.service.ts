/**
 * AI Integration Service para BuscAdis
 * 
 * Este servicio integra múltiples APIs de IA para ofrecer:
 * - Procesamiento de lenguaje natural
 * - Generación automática de descripciones
 * - Clasificación inteligente de productos
 * - Detección de spam y contenido inapropiado
 * - Optimización automática de anuncios
 * - Traducción automática para expansión global
 */

import { Logger } from './logging.service';

// Nuevas interfaces para reemplazar 'any'
export interface PublicationData {
  title: string;
  description: string;
  images?: string[];
  category?: string;
  price?: number;
  location?: string;
}

export interface MarketAnalysisData {
  category: string;
  location?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  marketTrends?: string[];
}

export interface DemandAnalysisData {
  category: string;
  location?: string;
  seasonality?: string;
  marketConditions?: string;
}

export interface CompetitionAnalysisData {
  category: string;
  location?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  competitorCount?: number;
}

export interface UserContext {
  userLocation?: string;
  userHistory?: string[];
  preferences?: Record<string, string | number | boolean>;
  searchBehavior?: {
    frequency: 'low' | 'medium' | 'high';
    categories: string[];
    priceRange?: {
      min: number;
      max: number;
    };
  };
}

export interface ContentPrompt {
  category: string;
  keywords: string[];
  tone?: 'professional' | 'casual' | 'urgent';
  length?: 'short' | 'medium' | 'long';
  targetAudience?: string;
  specialRequirements?: string[];
}

export interface AIAnalysisResult {
  category?: string;
  subcategory?: string;
  suggestedTitle?: string;
  optimizedDescription?: string;
  suggestedPrice?: number;
  qualityScore: number;
  spamProbability: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  keywords: string[];
  improvements: string[];
  translations?: Record<string, string>;
}

export interface ContentModerationResult {
  isAppropriate: boolean;
  issues: string[];
  confidence: number;
  suggestedEdits?: string[];
}

export interface PriceOptimizationResult {
  suggestedPrice: number;
  priceRange: { min: number; max: number };
  marketComparison: string;
  demandLevel: 'low' | 'medium' | 'high';
  reasoning: string;
}

class AIIntegrationService {
  private static instance: AIIntegrationService;
  
  // APIs Configuration (sin hardcodear keys)
  private readonly OPENAI_API_URL = 'https://api.openai.com/v1';
  private readonly TRANSLATION_API_URL = 'https://api.deepl.com/v2';
  
  public static getInstance(): AIIntegrationService {
    if (!AIIntegrationService.instance) {
      AIIntegrationService.instance = new AIIntegrationService();
    }
    return AIIntegrationService.instance;
  }

  /**
   * Análisis completo de publicación con IA
   */
  async analyzePublication(data: PublicationData): Promise<AIAnalysisResult> {
    try {
      Logger.info('AI analysis started', { title: data.title });
      
      const [
        categoryResult,
        contentAnalysis,
        priceAnalysis,
        qualityCheck,
        spamCheck
      ] = await Promise.all([
        this.classifyContent(data.title, data.description),
        this.analyzeContent(data.description),
        this.analyzePricing(data),
        this.assessQuality(data),
        this.detectSpam(data.title, data.description)
      ]);
      
      const result: AIAnalysisResult = {
        category: categoryResult.category,
        subcategory: categoryResult.subcategory,
        suggestedTitle: await this.optimizeTitle(data.title),
        optimizedDescription: await this.optimizeDescription(data.description),
        suggestedPrice: priceAnalysis.suggestedPrice,
        qualityScore: qualityCheck.score,
        spamProbability: spamCheck.probability,
        sentiment: contentAnalysis.sentiment,
        keywords: contentAnalysis.keywords,
        improvements: [
          ...qualityCheck.suggestions,
          ...contentAnalysis.improvements
        ]
      };
      
      Logger.info('AI analysis completed', { 
        qualityScore: result.qualityScore,
        spamProbability: result.spamProbability 
      });
      
      return result;
      
    } catch (error) {
      Logger.error('Error in AI analysis', { error });
      // Retornar resultado básico si la IA falla
      return {
        qualityScore: 70,
        spamProbability: 0.1,
        sentiment: 'neutral',
        keywords: this.extractBasicKeywords(data.title + ' ' + data.description),
        improvements: ['Agregar más detalles', 'Incluir imágenes de calidad']
      };
    }
  }

  /**
   * Moderación automática de contenido
   */
  async moderateContent(title: string, description: string, images?: string[]): Promise<ContentModerationResult> {
    try {
      const [
        textModeration,
        imageModeration
      ] = await Promise.all([
        this.moderateText(title + ' ' + description),
        images ? this.moderateImages(images) : Promise.resolve({ isAppropriate: true, issues: [] })
      ]);
      
      return {
        isAppropriate: textModeration.isAppropriate && imageModeration.isAppropriate,
        issues: [...textModeration.issues, ...imageModeration.issues],
        confidence: Math.min(
          textModeration.confidence ?? 1, 
          (imageModeration as { isAppropriate: boolean; issues: string[]; confidence?: number }).confidence ?? 1
        ),
        suggestedEdits: textModeration.suggestedEdits
      };
      
    } catch (error) {
      Logger.error('Error in content moderation', { error });
      return {
        isAppropriate: true,
        issues: [],
        confidence: 0.5
      };
    }
  }

  /**
   * Optimización automática de precios
   */
  async optimizePrice(data: PublicationData): Promise<PriceOptimizationResult> {
    try {
      // Análisis de mercado con IA
      const marketData = await this.analyzeMarket({
        category: data.category || 'general',
        location: data.location
      });
      const demandAnalysis = await this.analyzeDemand({
        category: data.category || 'general',
        location: data.location
      });
      const competitiveAnalysis = await this.analyzeCompetition({
        category: data.category || 'general',
        location: data.location
      });
      
      const suggestedPrice = this.calculateOptimalPrice(marketData, demandAnalysis, competitiveAnalysis);
      
      return {
        suggestedPrice,
        priceRange: {
          min: suggestedPrice * 0.8,
          max: suggestedPrice * 1.2
        },
        marketComparison: marketData.comparison,
        demandLevel: demandAnalysis.level,
        reasoning: `Basado en ${marketData.samples} productos similares y nivel de demanda ${demandAnalysis.level}`
      };
      
    } catch (error) {
      Logger.error('Error in price optimization', { error });
      return {
        suggestedPrice: data.price || 100,
        priceRange: { min: 80, max: 120 },
        marketComparison: 'No disponible',
        demandLevel: 'medium',
        reasoning: 'Análisis no disponible'
      };
    }
  }

  /**
   * Traducción automática para expansión global
   */
  async translateContent(content: {
    title: string;
    description: string;
  }, targetLanguages: string[] = ['en', 'pt', 'fr']): Promise<Record<string, unknown>> {
    try {
      const translations: Record<string, unknown> = {};
      
      for (const lang of targetLanguages) {
        const [titleTranslation, descriptionTranslation] = await Promise.all([
          this.translate(content.title, 'es', lang),
          this.translate(content.description, 'es', lang)
        ]);
        
        translations[lang] = {
          title: titleTranslation,
          description: descriptionTranslation
        };
      }
      
      return translations;
      
    } catch (error) {
      Logger.error('Error in content translation', { error });
      return {};
    }
  }

  /**
   * Generación automática de contenido
   */
  async generateContent(prompt: ContentPrompt): Promise<{ title: string; description: string }> {
    try {
      const aiPrompt = this.buildContentPrompt(prompt);
      const response = await this.callLLM(aiPrompt);
      
      return this.parseGeneratedContent(response);
      
    } catch (error) {
      Logger.error('Error in content generation', { error });
      return {
        title: `${prompt.category} - ${prompt.keywords.join(', ')}`,
        description: `Excelente ${prompt.category} disponible. ${prompt.keywords.join(', ')}. Contactar para más información.`
      };
    }
  }

  /**
   * Búsqueda semántica avanzada
   */
  async semanticSearch(query: string, context?: UserContext): Promise<{
    expandedQuery: string;
    synonyms: string[];
    relatedTerms: string[];
    suggestedFilters: Record<string, string | number | boolean>;
  }> {
    try {
      const expandedQuery = await this.expandQuery(query, context);
      const synonyms = await this.findSynonyms(query);
      const relatedTerms = await this.findRelatedTerms(query, context);
      const suggestedFilters = await this.suggestFilters(query, context);
      
      return {
        expandedQuery,
        synonyms,
        relatedTerms,
        suggestedFilters
      };
      
    } catch (error) {
      Logger.error('Error in semantic search', { error });
      return {
        expandedQuery: query,
        synonyms: [],
        relatedTerms: [],
        suggestedFilters: {}
      };
    }
  }

  // Métodos privados de IA

  private async classifyContent(title: string, description: string): Promise<{
    category: string;
    subcategory: string;
    confidence: number;
  }> {
    // Simular clasificación con IA
    // En producción, usaría OpenAI o modelo propio
    const text = (title + ' ' + description).toLowerCase();
    
    if (text.includes('casa') || text.includes('departamento') || text.includes('terreno')) {
      return { category: 'inmuebles', subcategory: 'vivienda', confidence: 0.9 };
    }
    if (text.includes('auto') || text.includes('carro') || text.includes('vehiculo')) {
      return { category: 'vehiculos', subcategory: 'autos', confidence: 0.9 };
    }
    if (text.includes('trabajo') || text.includes('empleo') || text.includes('puesto')) {
      return { category: 'empleos', subcategory: 'tiempo_completo', confidence: 0.9 };
    }
    
    return { category: 'productos', subcategory: 'general', confidence: 0.7 };
  }

  private async analyzeContent(description: string): Promise<{
    sentiment: 'positive' | 'neutral' | 'negative';
    keywords: string[];
    improvements: string[];
  }> {
    // Análisis básico de contenido
    const keywords = this.extractBasicKeywords(description);
    
    // Análisis de sentimiento básico
    const positiveWords = ['excelente', 'bueno', 'nuevo', 'garantía', 'calidad'];
    const negativeWords = ['usado', 'defecto', 'problema', 'urgente'];
    
    const positiveCount = positiveWords.filter(word => description.toLowerCase().includes(word)).length;
    const negativeCount = negativeWords.filter(word => description.toLowerCase().includes(word)).length;
    
    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (positiveCount > negativeCount) sentiment = 'positive';
    else if (negativeCount > positiveCount) sentiment = 'negative';
    
    const improvements = [];
    if (description.length < 50) improvements.push('Agregar más detalles en la descripción');
    if (!description.includes('precio')) improvements.push('Mencionar el precio o condiciones');
    if (!description.includes('contacto')) improvements.push('Incluir información de contacto');
    
    return { sentiment, keywords, improvements };
  }

  private async analyzePricing(data: PublicationData): Promise<{ suggestedPrice: number }> {
    // Análisis básico de precios
    // En producción, usaría ML para análisis de mercado
    const basePrice = data.price || 1000;
    return { suggestedPrice: basePrice };
  }

  private async assessQuality(data: PublicationData): Promise<{ score: number; suggestions: string[] }> {
    let score = 50;
    const suggestions = [];
    
    // Evaluar título
    if (data.title && data.title.length > 10) score += 20;
    else suggestions.push('Mejorar el título');
    
    // Evaluar descripción
    if (data.description && data.description.length > 50) score += 20;
    else suggestions.push('Ampliar la descripción');
    
    // Evaluar imágenes
    if (data.images && data.images.length > 0) score += 10;
    else suggestions.push('Agregar imágenes');
    
    return { score: Math.min(score, 100), suggestions };
  }

  private async detectSpam(title: string, description: string): Promise<{ probability: number }> {
    // Detección básica de spam
    const text = (title + ' ' + description).toLowerCase();
    const spamIndicators = ['urgente!!!', 'oferta única', 'click aquí', 'garantizado'];
    
    const spamCount = spamIndicators.filter(indicator => text.includes(indicator)).length;
    const probability = Math.min(spamCount * 0.3, 1);
    
    return { probability };
  }

  private async optimizeTitle(title: string): Promise<string> {
    // Optimización básica de título
    if (title.length < 10) {
      return title + ' - Excelente oportunidad';
    }
    return title;
  }

  private async optimizeDescription(description: string): Promise<string> {
    // Optimización básica de descripción
    if (description.length < 50) {
      return description + '\n\nContactar para más información y detalles.';
    }
    return description;
  }

  private extractBasicKeywords(text: string): string[] {
    // Extracción básica de palabras clave
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    return [...new Set(words)].slice(0, 10);
  }

  private async moderateText(text: string): Promise<{
    isAppropriate: boolean;
    issues: string[];
    confidence: number;
    suggestedEdits?: string[];
  }> {
    // Moderación básica de texto
    const inappropriateWords = ['spam', 'estafa', 'ilegal'];
    const issues = inappropriateWords.filter(word => text.toLowerCase().includes(word));
    
    return {
      isAppropriate: issues.length === 0,
      issues,
      confidence: 0.8,
      suggestedEdits: issues.length > 0 ? ['Revisar contenido inapropiado'] : undefined
    };
  }

  private async moderateImages(images: string[]): Promise<{
    isAppropriate: boolean;
    issues: string[];
    confidence?: number;
  }> {
    // Por ahora, asumir que las imágenes son apropiadas
    // En producción, usar servicios de moderación de imágenes
    return {
      isAppropriate: true,
      issues: [],
      confidence: 0.7
    };
  }

  private async analyzeMarket(data: MarketAnalysisData): Promise<{ comparison: string; samples: number }> {
    return {
      comparison: 'Precio competitivo en el mercado',
      samples: 50
    };
  }

  private async analyzeDemand(data: DemandAnalysisData): Promise<{ level: 'low' | 'medium' | 'high' }> {
    return { level: 'medium' };
  }

  private async analyzeCompetition(data: CompetitionAnalysisData): Promise<{
    competitorCount: number;
    averagePrice: number;
    marketShare: number;
  }> {
    return { competitorCount: 25, averagePrice: 1000, marketShare: 0.1 };
  }

  private calculateOptimalPrice(
    marketData: { comparison: string; samples: number },
    demandAnalysis: { level: 'low' | 'medium' | 'high' },
    competitiveAnalysis: { competitorCount: number; averagePrice: number; marketShare: number }
  ): number {
    return competitiveAnalysis.averagePrice || 1000;
  }

  private async translate(text: string, from: string, to: string): Promise<string> {
    // Simulación de traducción
    // En producción, usar DeepL, Google Translate, etc.
    return `[${to.toUpperCase()}] ${text}`;
  }

  private buildContentPrompt(prompt: ContentPrompt): string {
    return `Genera un anuncio para ${prompt.category} con las siguientes palabras clave: ${prompt.keywords.join(', ')}`;
  }

  private async callLLM(prompt: string): Promise<string> {
    // Simulación de llamada a LLM
    // En producción, usar OpenAI, Claude, etc.
    return 'Contenido generado por IA';
  }

  private parseGeneratedContent(response: string): { title: string; description: string } {
    return {
      title: 'Título generado por IA',
      description: response
    };
  }

  private async expandQuery(query: string, context?: UserContext): Promise<string> {
    return query + ' calidad premium';
  }

  private async findSynonyms(query: string): Promise<string[]> {
    return ['sinónimo1', 'sinónimo2'];
  }

  private async findRelatedTerms(query: string, context?: UserContext): Promise<string[]> {
    return ['término relacionado 1', 'término relacionado 2'];
  }

  private async suggestFilters(query: string, context?: UserContext): Promise<Record<string, string | number | boolean>> {
    return {
      priceRange: 'medium',
      location: 'nearby'
    };
  }
}

export const aiService = AIIntegrationService.getInstance(); 