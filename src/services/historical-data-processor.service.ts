/**
 * SERVICIO PROCESAMIENTO MASIVO DE DATOS HISTÓRICOS
 * BuscaDis - Extracción e importación de anuncios de revistas
 */

import { HistoricalAdJSON, BulkImportAd, AITrainingData } from '../data/historical-ads-json-structure';
import { HistoricalAdAnalysis, DATA_EXTRACTION_CONFIG } from '../data/historical-ads-analysis';

export interface ProcessingResult {
  success: boolean;
  totalProcessed: number;
  totalDuplicates: number;
  totalErrors: number;
  processedAds: HistoricalAdJSON[];
  duplicates: HistoricalAdJSON[];
  errors: ProcessingError[];
}

export interface ProcessingError {
  originalText: string;
  error: string;
  errorType: 'parsing' | 'validation' | 'classification' | 'duplicate';
}

export interface BulkImportConfig {
  detectDuplicates: boolean;
  autoClassify: boolean;
  extractContacts: boolean;
  geocodeLocations: boolean;
  generatePredictions: boolean;
  qualityThreshold: number;        // 0-100
  batchSize: number;               // Número de anuncios a procesar por lote
  maxConcurrency: number;          // Máximo de procesamiento concurrente
}

export class HistoricalDataProcessorService {
  private defaultConfig: BulkImportConfig = {
    detectDuplicates: true,
    autoClassify: true,
    extractContacts: true,
    geocodeLocations: false,       // Costoso, solo si es necesario
    generatePredictions: true,
    qualityThreshold: 60,
    batchSize: 100,
    maxConcurrency: 5
  };

  /**
   * Procesa anuncios históricos en lotes masivos
   */
  async processBulkAds(
    rawAds: BulkImportAd[], 
    config: Partial<BulkImportConfig> = {}
  ): Promise<ProcessingResult> {
    const finalConfig = { ...this.defaultConfig, ...config };
    
    console.log('🚀 Iniciando procesamiento masivo', {
      totalAds: rawAds.length,
      config: finalConfig
    });

    const result: ProcessingResult = {
      success: true,
      totalProcessed: 0,
      totalDuplicates: 0,
      totalErrors: 0,
      processedAds: [],
      duplicates: [],
      errors: []
    };

    try {
      // Procesar en lotes para no sobrecargar memoria
      const batches = this.createBatches(rawAds, finalConfig.batchSize);
      
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`📦 Procesando lote ${i + 1}/${batches.length} (${batch.length} anuncios)`);
        
        const batchResult = await this.processBatch(batch, finalConfig);
        
        // Acumular resultados
        result.totalProcessed += batchResult.totalProcessed;
        result.totalDuplicates += batchResult.totalDuplicates;
        result.totalErrors += batchResult.totalErrors;
        result.processedAds.push(...batchResult.processedAds);
        result.duplicates.push(...batchResult.duplicates);
        result.errors.push(...batchResult.errors);
        
        console.log(`✅ Lote ${i + 1} completado`, {
          procesados: batchResult.totalProcessed,
          duplicados: batchResult.totalDuplicates,
          errores: batchResult.totalErrors
        });
      }

      console.log('🎉 Procesamiento masivo completado', {
        totalProcesados: result.totalProcessed,
        totalDuplicados: result.totalDuplicates,
        totalErrores: result.totalErrors,
        tasaExito: (result.totalProcessed / rawAds.length * 100).toFixed(2) + '%'
      });

      return result;

    } catch (error) {
      console.error('❌ Error en procesamiento masivo:', error);
      result.success = false;
      return result;
    }
  }

  /**
   * Procesa un lote de anuncios
   */
  private async processBatch(
    batch: BulkImportAd[], 
    config: BulkImportConfig
  ): Promise<ProcessingResult> {
    const result: ProcessingResult = {
      success: true,
      totalProcessed: 0,
      totalDuplicates: 0,
      totalErrors: 0,
      processedAds: [],
      duplicates: [],
      errors: []
    };

    const promises = batch.map(ad => this.processIndividualAd(ad, config));
    const results = await Promise.allSettled(promises);

    for (const promiseResult of results) {
      if (promiseResult.status === 'fulfilled') {
        const adResult = promiseResult.value;
        
        if (adResult.success) {
          if (adResult.isDuplicate) {
            result.totalDuplicates++;
            result.duplicates.push(adResult.data!);
          } else {
            result.totalProcessed++;
            result.processedAds.push(adResult.data!);
          }
        } else {
          result.totalErrors++;
          result.errors.push({
            originalText: adResult.originalText,
            error: adResult.error!,
            errorType: 'parsing'
          });
        }
      } else {
        result.totalErrors++;
        result.errors.push({
          originalText: 'Desconocido',
          error: promiseResult.reason?.message || 'Error desconocido',
          errorType: 'parsing'
        });
      }
    }

    return result;
  }

  /**
   * Procesa un anuncio individual
   */
  private async processIndividualAd(
    rawAd: BulkImportAd, 
    config: BulkImportConfig
  ): Promise<{
    success: boolean;
    isDuplicate: boolean;
    data?: HistoricalAdJSON;
    error?: string;
    originalText: string;
  }> {
    try {
      // 1. EXTRACCIÓN BÁSICA
      const extractedData = this.extractBasicData(rawAd);
      
      // 2. ANÁLISIS DE CONTENIDO
      const contentAnalysis = this.analyzeContent(rawAd.originalText);
      
      // 3. EXTRACCIÓN DE CONTACTOS
      const contactInfo = config.extractContacts ? 
        this.extractContactInfo(rawAd.originalText) : this.getEmptyContactInfo();
      
      // 4. EXTRACCIÓN DE UBICACIÓN
      const locationInfo = this.extractLocationInfo(rawAd.originalText);
      
      // 5. ANÁLISIS DE PRECIOS
      const priceInfo = this.extractPriceInfo(rawAd.originalText);
      
      // 6. CLASIFICACIÓN AUTOMÁTICA
      const classification = config.autoClassify ? 
        this.autoClassifyAd(rawAd.originalText) : this.getDefaultClassification();
      
      // 7. GENERACIÓN DE ID ÚNICO
      const id = this.generateUniqueId(rawAd);
      
      // 8. DETECCIÓN DE DUPLICADOS
      const duplicateInfo = config.detectDuplicates ? 
        await this.detectDuplicates(rawAd.originalText, id) : { isDuplicate: false };
      
      // 9. CONSTRUCCIÓN DEL OBJETO COMPLETO
      const historicalAd: HistoricalAdJSON = {
        id,
        legacyId: rawAd.magazineName + '-' + rawAd.issueNumber + '-' + Date.now(),
        
        source: {
          magazineName: rawAd.magazineName,
          issueNumber: rawAd.issueNumber,
          publicationDate: rawAd.publicationDate,
          pageNumber: rawAd.pageNumber,
          extractionDate: new Date().toISOString().split('T')[0],
          extractionMethod: 'ai'
        },
        
        content: {
          originalText: rawAd.originalText,
          title: extractedData.title,
          description: extractedData.description,
          category: classification.category,
          subcategory: classification.subcategory,
          tags: contentAnalysis.keywords,
          language: this.detectLanguage(rawAd.originalText)
        },
        
        commercial: {
          type: classification.type,
          adSize: (rawAd.adSize as any) || 'pequeño',
          estimatedCost: rawAd.estimatedCost || this.estimateCost(rawAd.adSize || 'pequeño'),
          duration: 3, // Típicamente 3 días en revistas
          prices: priceInfo
        },
        
        contact: contactInfo,
        location: locationInfo,
        analysis: contentAnalysis.analysis,
        classification: classification.classification,
        duplicates: duplicateInfo,
        temporal: this.analyzeTemporalAspects(rawAd.originalText),
        competition: this.getEmptyCompetitionInfo(),
        predictions: config.generatePredictions ? 
          this.generatePredictions(rawAd.originalText, contentAnalysis) : this.getEmptyPredictions(),
        training: this.generateTrainingFeatures(rawAd.originalText, contentAnalysis),
        processing: {
          status: 'completed',
          version: '1.0.0',
          confidenceScore: contentAnalysis.analysis.qualityScore,
          manualVerificationNeeded: contentAnalysis.analysis.qualityScore < config.qualityThreshold,
          errors: [],
          warnings: []
        },
        metadata: {
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          version: 1,
          flags: [],
          searchableText: this.generateSearchableText(rawAd.originalText, extractedData),
          keywords: contentAnalysis.keywords,
          boost: 1.0
        }
      };
      
      return {
        success: true,
        isDuplicate: duplicateInfo.isDuplicate,
        data: historicalAd,
        originalText: rawAd.originalText
      };
      
    } catch (error) {
      console.error('Error procesando anuncio individual:', error);
      return {
        success: false,
        isDuplicate: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        originalText: rawAd.originalText
      };
    }
  }

  /**
   * Extrae datos básicos del anuncio
   */
  private extractBasicData(rawAd: BulkImportAd): { title: string; description: string } {
    const text = rawAd.originalText;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // El título es típicamente la primera oración o hasta 60 caracteres
    let title = sentences[0]?.trim() || '';
    if (title.length > 60) {
      title = title.substring(0, 57) + '...';
    }
    
    // La descripción es el texto completo limpio
    const description = text.trim().replace(/\s+/g, ' ');
    
    return { title, description };
  }

  /**
   * Analiza el contenido del anuncio
   */
  private analyzeContent(text: string): {
    keywords: string[];
    analysis: any;
  } {
    const words = text.toLowerCase().split(/\s+/);
    const keywords = this.extractKeywords(text);
    
    return {
      keywords,
      analysis: {
        sentiment: this.analyzeSentiment(text),
        urgencyLevel: this.analyzeUrgency(text),
        professionalLevel: this.analyzeProfessionalism(text),
        qualityScore: this.calculateQualityScore(text),
        completenessScore: this.calculateCompletenessScore(text),
        textStats: {
          wordCount: words.length,
          characterCount: text.length,
          sentenceCount: text.split(/[.!?]+/).length,
          paragraphCount: text.split(/\n\s*\n/).length,
          averageWordsPerSentence: words.length / text.split(/[.!?]+/).length
        },
        features: {
          hasPrice: /s\/\.?\s*\d+/.test(text),
          hasLocation: /(av\.|calle|jr\.|urb\.)/i.test(text),
          hasContact: /\d{9}/.test(text),
          hasUrgency: /(urgente|inmediato|pronto)/i.test(text),
          hasPhotos: /(foto|imagen|ver)/i.test(text),
          hasSpecifications: text.split(' ').length > 20
        }
      }
    };
  }

  /**
   * Extrae información de contacto
   */
  private extractContactInfo(text: string): any {
    const phoneNumbers = this.extractPhoneNumbers(text);
    const whatsappNumbers = this.extractWhatsAppNumbers(text);
    const emails = this.extractEmails(text);
    
    return {
      phoneNumbers,
      whatsappNumbers,
      emails,
      socialMedia: [],
      websites: [],
      preferredMethod: phoneNumbers.length > 0 ? 'phone' : 'unknown',
      personType: this.inferPersonType(text),
      businessName: this.extractBusinessName(text),
      contactName: this.extractContactName(text)
    };
  }

  /**
   * Genera características para entrenamiento de ML
   */
  private generateTrainingFeatures(text: string, contentAnalysis: any): any {
    return {
      features: {
        text_length: text.length,
        word_count: contentAnalysis.analysis.textStats.wordCount,
        sentence_count: contentAnalysis.analysis.textStats.sentenceCount,
        price_mentioned: contentAnalysis.analysis.features.hasPrice ? 1 : 0,
        contact_methods_count: this.countContactMethods(text),
        location_specificity: this.calculateLocationSpecificity(text),
        urgency_level: this.mapUrgencyToNumber(contentAnalysis.analysis.urgencyLevel),
        professional_score: contentAnalysis.analysis.professionalLevel / 5,
        category_relevance: 0.8, // Placeholder
        seasonal_factor: 0.5     // Placeholder
      }
    };
  }

  // MÉTODOS AUXILIARES DE EXTRACCIÓN

  private extractPhoneNumbers(text: string): string[] {
    const phoneRegex = DATA_EXTRACTION_CONFIG.patterns.phoneNumbers;
    const matches = text.match(phoneRegex) || [];
    return [...new Set(matches)]; // Eliminar duplicados
  }

  private extractWhatsAppNumbers(text: string): string[] {
    const whatsappRegex = DATA_EXTRACTION_CONFIG.patterns.whatsapp;
    const matches = text.match(whatsappRegex) || [];
    return matches.map(match => match.replace(/\D/g, ''));
  }

  private extractEmails(text: string): string[] {
    const emailRegex = DATA_EXTRACTION_CONFIG.patterns.emails;
    const matches = text.match(emailRegex) || [];
    return [...new Set(matches)];
  }

  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    // Contar frecuencia y retornar las más comunes
    const frequency: { [key: string]: number } = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  private autoClassifyAd(text: string): any {
    const categories = DATA_EXTRACTION_CONFIG.categorization.keywords;
    
    let bestCategory = 'productos';
    let bestScore = 0;
    
    for (const [category, keywords] of Object.entries(categories)) {
      const score = keywords.filter(keyword => 
        text.toLowerCase().includes(keyword)
      ).length;
      
      if (score > bestScore) {
        bestScore = score;
        bestCategory = category;
      }
    }
    
    return {
      category: bestCategory,
      subcategory: this.inferSubcategory(bestCategory, text),
      type: this.inferType(text),
      classification: {
        primaryIntent: 'sell',
        secondaryIntents: [],
        targetAudience: ['general'],
        marketSegment: 'mid',
        aiClassification: {
          confidence: Math.min(bestScore * 20, 95),
          suggestedCategory: bestCategory,
          suggestedSubcategory: this.inferSubcategory(bestCategory, text),
          alternativeCategories: []
        }
      }
    };
  }

  // MÉTODOS AUXILIARES ADICIONALES

  private createBatches<T>(array: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }

  private generateUniqueId(rawAd: BulkImportAd): string {
    const hash = this.simpleHash(rawAd.originalText + rawAd.magazineName + rawAd.issueNumber);
    return `hist_${hash}_${Date.now()}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private detectLanguage(text: string): 'es' | 'qu' | 'en' {
    // Detección simple basada en palabras comunes
    const spanishWords = ['el', 'la', 'de', 'que', 'y', 'es', 'en', 'un', 'se', 'no'];
    const quechuaWords = ['kay', 'chay', 'ima', 'mayqin', 'hayk', 'may'];
    
    let spanishCount = 0;
    let quechuaCount = 0;
    
    const words = text.toLowerCase().split(/\s+/);
    
    words.forEach(word => {
      if (spanishWords.includes(word)) spanishCount++;
      if (quechuaWords.includes(word)) quechuaCount++;
    });
    
    if (quechuaCount > spanishCount) return 'qu';
    if (spanishCount > 0) return 'es';
    return 'es'; // Default
  }

  private estimateCost(adSize: string): number {
    const sizes: { [key: string]: number } = {
      'miniatura': 15,
      'pequeño': 25,
      'mediano': 40,
      'grande': 60,
      'extra': 80
    };
    return sizes[adSize] || 25;
  }

  // Métodos que retornan datos vacíos/por defecto
  private getEmptyContactInfo(): any {
    return {
      phoneNumbers: [],
      whatsappNumbers: [],
      emails: [],
      socialMedia: [],
      websites: [],
      preferredMethod: 'unknown',
      personType: 'unknown'
    };
  }

  private getDefaultClassification(): any {
    return {
      category: 'productos',
      subcategory: 'varios',
      type: 'sale',
      classification: {
        primaryIntent: 'sell',
        secondaryIntents: [],
        targetAudience: ['general'],
        marketSegment: 'mid',
        aiClassification: {
          confidence: 50,
          suggestedCategory: 'productos',
          suggestedSubcategory: 'varios',
          alternativeCategories: []
        }
      }
    };
  }

  private getEmptyCompetitionInfo(): any {
    return {
      competitors: [],
      uniqueSellingPoints: [],
      competitiveAdvantages: [],
      priceComparison: {
        isAboveMarket: false,
        isBelowMarket: false,
        pricePosition: 'fair'
      }
    };
  }

  private getEmptyPredictions(): any {
    return {
      expectedViews: 100,
      expectedResponses: 5,
      conversionProbability: 0.05,
      successProbability: 0.3,
      aiRecommendations: {
        contentImprovements: [],
        seoImprovements: []
      }
    };
  }

  // Métodos de análisis simplificados
  private analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['excelente', 'bueno', 'mejor', 'calidad', 'oportunidad'];
    const negativeWords = ['urgente', 'barato', 'ocasión', 'emergencia'];
    
    let score = 0;
    positiveWords.forEach(word => {
      if (text.toLowerCase().includes(word)) score++;
    });
    negativeWords.forEach(word => {
      if (text.toLowerCase().includes(word)) score--;
    });
    
    if (score > 0) return 'positive';
    if (score < 0) return 'negative';
    return 'neutral';
  }

  private analyzeUrgency(text: string): 'low' | 'medium' | 'high' {
    const urgencyWords = ['urgente', 'inmediato', 'pronto', 'ya', 'emergencia'];
    const urgencyCount = urgencyWords.filter(word => 
      text.toLowerCase().includes(word)
    ).length;
    
    if (urgencyCount >= 2) return 'high';
    if (urgencyCount === 1) return 'medium';
    return 'low';
  }

  private analyzeProfessionalism(text: string): number {
    let score = 3; // Base score
    
    // Positive indicators
    if (text.includes('S/.')) score += 1;
    if (/\d{9}/.test(text)) score += 1;
    if (text.length > 100) score += 1;
    
    // Negative indicators
    if (text.includes('!!!')) score -= 1;
    if (text.toUpperCase() === text) score -= 2;
    
    return Math.max(1, Math.min(5, score));
  }

  private calculateQualityScore(text: string): number {
    let score = 50; // Base score
    
    // Length bonus
    if (text.length > 50) score += 10;
    if (text.length > 100) score += 10;
    
    // Contact info bonus
    if (/\d{9}/.test(text)) score += 15;
    
    // Price info bonus
    if (/s\/\.?\s*\d+/i.test(text)) score += 15;
    
    // Location bonus
    if (/(av\.|calle|jr\.|urb\.)/i.test(text)) score += 10;
    
    return Math.min(100, score);
  }

  private calculateCompletenessScore(text: string): number {
    let score = 0;
    const maxScore = 100;
    
    // Required elements
    if (text.length > 20) score += 20;
    if (/\d{9}/.test(text)) score += 25;
    if (/(av\.|calle|jr\.|urb\.)/i.test(text)) score += 20;
    if (/s\/\.?\s*\d+/i.test(text)) score += 25;
    if (text.split(' ').length > 10) score += 10;
    
    return Math.min(maxScore, score);
  }

  // Métodos adicionales simplificados
  private extractLocationInfo(text: string): any {
    const locations = text.match(/(av\.|avenida|jr\.|jirón|calle|ca\.|urb\.|urbanización|psj\.|pasaje)\s+[a-zA-Z0-9\s\-\.]+/gi) || [];
    
    return {
      explicit: {
        neighborhoods: [],
        districts: [],
        streets: locations,
        landmarks: [],
        fullAddress: locations[0] || undefined
      },
      coverage: {
        zones: []
      }
    };
  }

  private extractPriceInfo(text: string): any[] {
    const priceMatches = text.match(/s\/\.?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi) || [];
    
    return priceMatches.map(match => ({
      amount: parseFloat(match.replace(/[^\d.]/g, '')),
      currency: 'PEN',
      type: 'fixed',
      period: 'monthly'
    }));
  }

  private analyzeTemporalAspects(text: string): any {
    return {
      seasonality: 'year-round',
      timeReferences: [],
      availability: {
        immediate: true
      },
      republication: {
        isRepublished: false,
        previousPublications: []
      }
    };
  }

  private generatePredictions(text: string, contentAnalysis: any): any {
    const baseViews = Math.floor(Math.random() * 200) + 50;
    const qualityMultiplier = contentAnalysis.analysis.qualityScore / 100;
    
    return {
      expectedViews: Math.floor(baseViews * qualityMultiplier),
      expectedResponses: Math.floor(baseViews * qualityMultiplier * 0.05),
      conversionProbability: qualityMultiplier * 0.1,
      successProbability: qualityMultiplier * 0.4,
      aiRecommendations: {
        contentImprovements: [],
        seoImprovements: []
      }
    };
  }

  private generateSearchableText(originalText: string, extractedData: any): string {
    return `${extractedData.title} ${extractedData.description}`.toLowerCase();
  }

  private async detectDuplicates(text: string, id: string): Promise<any> {
    // Placeholder para detección de duplicados
    return {
      isDuplicate: false,
      duplicateType: 'exact',
      differences: []
    };
  }

  private inferPersonType(text: string): 'individual' | 'business' | 'unknown' {
    const businessWords = ['empresa', 'negocio', 'tienda', 'comercio', 'servicio'];
    const hasBusinessWords = businessWords.some(word => text.toLowerCase().includes(word));
    return hasBusinessWords ? 'business' : 'individual';
  }

  private extractBusinessName(text: string): string | undefined {
    // Simplificado - buscar palabras en mayúsculas que podrían ser nombres de negocio
    const words = text.split(' ');
    const capitalizedWords = words.filter(word => 
      word.length > 2 && word[0] === word[0].toUpperCase()
    );
    
    return capitalizedWords.length > 0 ? capitalizedWords.join(' ') : undefined;
  }

  private extractContactName(text: string): string | undefined {
    // Placeholder - detección de nombres propios
    return undefined;
  }

  private countContactMethods(text: string): number {
    let count = 0;
    if (/\d{9}/.test(text)) count++;
    if (/@/.test(text)) count++;
    if (/whatsapp|wsp/i.test(text)) count++;
    return count;
  }

  private calculateLocationSpecificity(text: string): number {
    const locationWords = ['av.', 'calle', 'jr.', 'urb.', 'psj.'];
    const count = locationWords.filter(word => text.toLowerCase().includes(word)).length;
    return Math.min(1, count / 3);
  }

  private mapUrgencyToNumber(urgency: string): number {
    switch (urgency) {
      case 'high': return 1;
      case 'medium': return 0.5;
      case 'low': return 0;
      default: return 0;
    }
  }

  private inferSubcategory(category: string, text: string): string {
    // Simplificado - retornar subcategoría genérica
    return 'varios';
  }

  private inferType(text: string): 'sale' | 'rent' | 'service' | 'job' | 'wanted' | 'exchange' {
    if (text.toLowerCase().includes('alquilo') || text.toLowerCase().includes('alquiler')) {
      return 'rent';
    }
    if (text.toLowerCase().includes('solicita') || text.toLowerCase().includes('requiere')) {
      return 'job';
    }
    if (text.toLowerCase().includes('servicio') || text.toLowerCase().includes('clases')) {
      return 'service';
    }
    return 'sale';
  }

  /**
   * Exporta datos para entrenamiento de IA
   */
  async exportForAI(processedAds: HistoricalAdJSON[]): Promise<AITrainingData[]> {
    return processedAds.map(ad => ({
      id: ad.id,
      text: ad.content.originalText,
      category: ad.content.category,
      subcategory: ad.content.subcategory,
      features: Object.values(ad.training.features),
      labels: [
        ad.predictions.expectedViews,
        ad.predictions.expectedResponses,
        ad.analysis.qualityScore,
        ad.predictions.conversionProbability
      ],
      metadata: {
        date: ad.source.publicationDate,
        quality: ad.analysis.qualityScore,
        verified: ad.processing.humanVerification?.approved || false
      }
    }));
  }

  /**
   * Genera estadísticas del procesamiento
   */
  generateStats(result: ProcessingResult): any {
    const totalAds = result.totalProcessed + result.totalDuplicates + result.totalErrors;
    
    return {
      resumen: {
        totalProcesados: result.totalProcessed,
        totalDuplicados: result.totalDuplicates,
        totalErrores: result.totalErrors,
        tasaExito: ((result.totalProcessed / totalAds) * 100).toFixed(2) + '%',
        tasaDuplicados: ((result.totalDuplicates / totalAds) * 100).toFixed(2) + '%',
        tasaErrores: ((result.totalErrors / totalAds) * 100).toFixed(2) + '%'
      },
      categorias: this.getCategoryStats(result.processedAds),
      calidad: this.getQualityStats(result.processedAds),
      contactos: this.getContactStats(result.processedAds),
      precios: this.getPriceStats(result.processedAds)
    };
  }

  private getCategoryStats(ads: HistoricalAdJSON[]): any {
    const stats: { [key: string]: number } = {};
    ads.forEach(ad => {
      stats[ad.content.category] = (stats[ad.content.category] || 0) + 1;
    });
    return stats;
  }

  private getQualityStats(ads: HistoricalAdJSON[]): any {
    const scores = ads.map(ad => ad.analysis.qualityScore);
    return {
      promedio: scores.reduce((a, b) => a + b, 0) / scores.length,
      minimo: Math.min(...scores),
      maximo: Math.max(...scores),
      mediana: scores.sort()[Math.floor(scores.length / 2)]
    };
  }

  private getContactStats(ads: HistoricalAdJSON[]): any {
    let conTelefono = 0;
    let conWhatsapp = 0;
    let conEmail = 0;
    
    ads.forEach(ad => {
      if (ad.contact.phoneNumbers.length > 0) conTelefono++;
      if (ad.contact.whatsappNumbers.length > 0) conWhatsapp++;
      if (ad.contact.emails.length > 0) conEmail++;
    });
    
    return { conTelefono, conWhatsapp, conEmail };
  }

  private getPriceStats(ads: HistoricalAdJSON[]): any {
    const prices = ads
      .filter(ad => ad.commercial.prices.length > 0)
      .map(ad => ad.commercial.prices[0].amount);
    
    if (prices.length === 0) return { mensaje: 'No se encontraron precios' };
    
    return {
      promedio: prices.reduce((a, b) => a + b, 0) / prices.length,
      minimo: Math.min(...prices),
      maximo: Math.max(...prices),
      conPrecio: prices.length,
      sinPrecio: ads.length - prices.length
    };
  }
}

export default HistoricalDataProcessorService; 