/**
 * EJEMPLO PRÁCTICO DE USO DE DATOS HISTÓRICOS
 * BuscaDis - Demostración de funcionalidades con datos reales
 */

import { HistoricalAdJSON } from '../data/historical-ads-json-structure';
import { HistoricalDataProcessorService } from '../services/historical-data-processor.service';

// EJEMPLO 1: PROCESAMIENTO DE DATOS HISTÓRICOS
export async function ejemploProcesarDatosHistoricos() {
  console.log('🚀 EJEMPLO: Procesamiento de datos históricos');
  
  // Datos simulados como los que tienes en tus revistas
  const datosRevistasOriginales = [
    {
      originalText: `Alquilo departamento amplio consta de 4 
        dormitorios, sala-comedor, cocina, hall, baño, 
        lavandería y azotea en 4to. piso; ubicado en Urb. 
        Lucrepata E-9, Cusco. Razón Cel. 991535226.`,
      magazineName: 'El Cusco',
      issueNumber: '2024-001',
      publicationDate: '2024-01-15',
      pageNumber: 12,
      adSize: 'mediano',
      estimatedCost: 40
    },
    {
      originalText: `COLEGIO PRIVADO
        Requiere Coordinadora pedagógica, secretaria, profesora 
        de nivel primario, docente de Comunicación. También 
        Auxiliares y Personal de limpieza. Enviar CV a los 
        WhatsApp 979721481, 953521124.`,
      magazineName: 'El Cusco',
      issueNumber: '2024-001',
      publicationDate: '2024-01-15',
      pageNumber: 15,
      adSize: 'grande',
      estimatedCost: 60
    }
  ];

  // Procesamiento
  const processor = new HistoricalDataProcessorService();
  const resultado = await processor.processBulkAds(datosRevistasOriginales, {
    detectDuplicates: true,
    autoClassify: true,
    extractContacts: true,
    qualityThreshold: 60
  });

  console.log('📊 Resultados del procesamiento:');
  console.log(`- Anuncios procesados: ${resultado.totalProcessed}`);
  console.log(`- Duplicados detectados: ${resultado.totalDuplicates}`);
  console.log(`- Errores: ${resultado.totalErrors}`);

  // Generar estadísticas
  const estadisticas = processor.generateStats(resultado);
  console.log('📈 Estadísticas:', estadisticas);

  return resultado;
}

// EJEMPLO 2: AUTOCOMPLETADO INTELIGENTE
export class AutocompletadoInteligente {
  private datosHistoricos: HistoricalAdJSON[] = [];

  constructor(datosHistoricos: HistoricalAdJSON[]) {
    this.datosHistoricos = datosHistoricos;
  }

  /**
   * Sugiere información basada en el número de teléfono del usuario
   */
  sugerirPorTelefono(telefono: string): Record<string, unknown> {
    console.log(`🔍 Buscando historial para teléfono: ${telefono}`);
    
    const anunciosAnteriores = this.datosHistoricos.filter(ad => 
      ad.contact.phoneNumbers.includes(telefono) ||
      ad.contact.whatsappNumbers.includes(telefono)
    );

    if (anunciosAnteriores.length === 0) {
      return { mensaje: 'Usuario nuevo', sugerencias: [] };
    }

    // Analizar patrones del usuario
    const categoriasFrecuentes = this.analizarCategoriasFrecuentes(anunciosAnteriores);
    const ubicacionesFrecuentes = this.analizarUbicacionesFrecuentes(anunciosAnteriores);
    const rangosPrecios = this.analizarRangosPrecios(anunciosAnteriores);

    return {
      mensaje: `Usuario conocido - ${anunciosAnteriores.length} anuncios anteriores`,
      sugerencias: {
        categoriaPreferida: categoriasFrecuentes[0],
        todasLasCategorias: categoriasFrecuentes,
        ubicacionesUsadas: ubicacionesFrecuentes,
        rangoPrecios: rangosPrecios,
        ultimaPublicacion: anunciosAnteriores[0].source.publicationDate,
        tipoAnunciante: this.determinarTipoAnunciante(anunciosAnteriores)
      }
    };
  }

  /**
   * Sugiere título y descripción basado en la categoría
   */
  sugerirContenido(categoria: string, subcategoria: string): Record<string, unknown> {
    console.log(`💡 Generando sugerencias para: ${categoria} -> ${subcategoria}`);
    
    const anunciosSimilares = this.datosHistoricos.filter(ad => 
      ad.content.category === categoria && 
      ad.content.subcategory === subcategoria
    );

    if (anunciosSimilares.length === 0) {
      return { mensaje: 'No hay datos históricos para esta categoría' };
    }

    // Analizar patrones de contenido exitoso
    const titulosExitosos = anunciosSimilares
      .filter(ad => ad.analysis.qualityScore > 80)
      .map(ad => ad.content.title);

    const palabrasClave = this.extraerPalabrasClave(anunciosSimilares);
    const preciosComunes = this.analizarPreciosComunes(anunciosSimilares);

    return {
      sugerenciasTitulo: titulosExitosos.slice(0, 3),
      palabrasClavePopulares: palabrasClave.slice(0, 10),
      preciosReferencia: preciosComunes,
      ejemplosExitosos: anunciosSimilares
        .filter(ad => ad.analysis.qualityScore > 85)
        .slice(0, 2)
        .map(ad => ({
          titulo: ad.content.title,
          precio: ad.commercial.prices[0]?.amount,
          calidad: ad.analysis.qualityScore
        }))
    };
  }

  private analizarCategoriasFrecuentes(anuncios: HistoricalAdJSON[]): string[] {
    const conteo: { [key: string]: number } = {};
    anuncios.forEach(ad => {
      conteo[ad.content.category] = (conteo[ad.content.category] || 0) + 1;
    });
    
    return Object.entries(conteo)
      .sort(([,a], [,b]) => b - a)
      .map(([categoria]) => categoria);
  }

  private analizarUbicacionesFrecuentes(anuncios: HistoricalAdJSON[]): string[] {
    const ubicaciones = new Set<string>();
    anuncios.forEach(ad => {
      ad.location.explicit.neighborhoods.forEach(barrio => ubicaciones.add(barrio));
      ad.location.explicit.districts.forEach(distrito => ubicaciones.add(distrito));
    });
    
    return Array.from(ubicaciones).slice(0, 5);
  }

  private analizarRangosPrecios(anuncios: HistoricalAdJSON[]): Record<string, number> | null {
    const precios = anuncios
      .filter(ad => ad.commercial.prices.length > 0)
      .map(ad => ad.commercial.prices[0].amount);

    if (precios.length === 0) return null;

    return {
      minimo: Math.min(...precios),
      maximo: Math.max(...precios),
      promedio: precios.reduce((a, b) => a + b, 0) / precios.length,
      sugerido: Math.round(precios.reduce((a, b) => a + b, 0) / precios.length)
    };
  }

  private determinarTipoAnunciante(anuncios: HistoricalAdJSON[]): string {
    const tiposContacto = anuncios.map(ad => ad.contact.personType);
    const esMayormenteBusiness = tiposContacto.filter(tipo => tipo === 'business').length > anuncios.length / 2;
    
    if (esMayormenteBusiness) return 'Empresa/Negocio';
    if (anuncios.length > 10) return 'Usuario Frecuente';
    if (anuncios.length > 3) return 'Usuario Regular';
    return 'Usuario Ocasional';
  }

  private extraerPalabrasClave(anuncios: HistoricalAdJSON[]): string[] {
    const todasLasPalabras: string[] = [];
    anuncios.forEach(ad => {
      todasLasPalabras.push(...ad.content.tags);
    });

    // Contar frecuencia
    const frecuencia: { [key: string]: number } = {};
    todasLasPalabras.forEach(palabra => {
      frecuencia[palabra] = (frecuencia[palabra] || 0) + 1;
    });

    return Object.entries(frecuencia)
      .sort(([,a], [,b]) => b - a)
      .map(([palabra]) => palabra);
  }

  private analizarPreciosComunes(anuncios: HistoricalAdJSON[]): Record<string, number> | null {
    const precios = anuncios
      .filter(ad => ad.commercial.prices.length > 0)
      .map(ad => ad.commercial.prices[0].amount);

    if (precios.length === 0) return null;

    // Agrupar por rangos
    const rangos = {
      'Económico (< S/. 500)': precios.filter(p => p < 500).length,
      'Medio (S/. 500 - 1500)': precios.filter(p => p >= 500 && p <= 1500).length,
      'Alto (> S/. 1500)': precios.filter(p => p > 1500).length
    };

    return rangos;
  }
}

// EJEMPLO 3: ANÁLISIS DE MERCADO
export class AnalizadorMercado {
  private datosHistoricos: HistoricalAdJSON[] = [];

  constructor(datosHistoricos: HistoricalAdJSON[]) {
    this.datosHistoricos = datosHistoricos;
  }

  /**
   * Analiza tendencias de mercado por categoría
   */
  analizarTendencias(): Record<string, unknown> {
    console.log('📊 Analizando tendencias de mercado...');

    const tendencias = {
      porCategoria: this.analizarPorCategoria(),
      porUbicacion: this.analizarPorUbicacion(),
      porPrecio: this.analizarPorPrecio(),
      porTiempo: this.analizarPorTiempo(),
      competidores: this.analizarCompetidores()
    };

    return tendencias;
  }

  /**
   * Identifica oportunidades de mercado
   */
  identificarOportunidades(): Record<string, unknown> {
    console.log('🎯 Identificando oportunidades de mercado...');

    const oportunidades = {
      categoriasDesatendidas: this.encontrarCategoriasDesatendidas(),
      zonasConPocaOferta: this.encontrarZonasConPocaOferta(),
      nichosPremium: this.encontrarNichosPremium(),
      tendenciasEmergentes: this.encontrarTendenciasEmergentes()
    };

    return oportunidades;
  }

  private analizarPorCategoria(): Record<string, unknown> {
    const stats: { [key: string]: any } = {};
    
    this.datosHistoricos.forEach(ad => {
      const categoria = ad.content.category;
      if (!stats[categoria]) {
        stats[categoria] = {
          cantidad: 0,
          precios: [],
          calidad: [],
          ubicaciones: new Set()
        };
      }
      
      stats[categoria].cantidad++;
      stats[categoria].calidad.push(ad.analysis.qualityScore);
      
      if (ad.commercial.prices.length > 0) {
        stats[categoria].precios.push(ad.commercial.prices[0].amount);
      }
      
      ad.location.explicit.districts.forEach(distrito => {
        stats[categoria].ubicaciones.add(distrito);
      });
    });

    // Procesar estadísticas
    Object.keys(stats).forEach(categoria => {
      const data = stats[categoria];
      
      data.precioPromedio = data.precios.length > 0 
        ? data.precios.reduce((a: number, b: number) => a + b, 0) / data.precios.length 
        : 0;
      
      data.calidadPromedio = data.calidad.reduce((a: number, b: number) => a + b, 0) / data.calidad.length;
      data.ubicaciones = Array.from(data.ubicaciones);
      data.participacionMercado = (data.cantidad / this.datosHistoricos.length * 100).toFixed(2) + '%';
    });

    return stats;
  }

  private analizarPorUbicacion(): Record<string, unknown> {
    const ubicaciones: { [key: string]: any } = {};
    
    this.datosHistoricos.forEach(ad => {
      ad.location.explicit.districts.forEach(distrito => {
        if (!ubicaciones[distrito]) {
          ubicaciones[distrito] = {
            cantidad: 0,
            categorias: new Set(),
            precios: [],
            calidad: []
          };
        }
        
        ubicaciones[distrito].cantidad++;
        ubicaciones[distrito].categorias.add(ad.content.category);
        ubicaciones[distrito].calidad.push(ad.analysis.qualityScore);
        
        if (ad.commercial.prices.length > 0) {
          ubicaciones[distrito].precios.push(ad.commercial.prices[0].amount);
        }
      });
    });

    // Procesar estadísticas
    Object.keys(ubicaciones).forEach(distrito => {
      const data = ubicaciones[distrito];
      
      data.precioPromedio = data.precios.length > 0 
        ? data.precios.reduce((a: number, b: number) => a + b, 0) / data.precios.length 
        : 0;
      
      data.calidadPromedio = data.calidad.reduce((a: number, b: number) => a + b, 0) / data.calidad.length;
      data.categorias = Array.from(data.categorias);
      data.densidad = data.cantidad / this.datosHistoricos.length;
    });

    return ubicaciones;
  }

  private analizarPorPrecio(): Record<string, unknown> {
    const precios = this.datosHistoricos
      .filter(ad => ad.commercial.prices.length > 0)
      .map(ad => ad.commercial.prices[0].amount);

    if (precios.length === 0) return { mensaje: 'No hay datos de precios' };

    const sorted = precios.sort((a, b) => a - b);
    
    return {
      total: precios.length,
      minimo: sorted[0],
      maximo: sorted[sorted.length - 1],
      promedio: precios.reduce((a, b) => a + b, 0) / precios.length,
      mediana: sorted[Math.floor(sorted.length / 2)],
      quartiles: {
        q1: sorted[Math.floor(sorted.length * 0.25)],
        q2: sorted[Math.floor(sorted.length * 0.5)],
        q3: sorted[Math.floor(sorted.length * 0.75)]
      },
      distribucion: {
        'Económico (< S/. 500)': precios.filter(p => p < 500).length,
        'Medio (S/. 500 - 1500)': precios.filter(p => p >= 500 && p <= 1500).length,
        'Alto (S/. 1500 - 5000)': precios.filter(p => p > 1500 && p <= 5000).length,
        'Premium (> S/. 5000)': precios.filter(p => p > 5000).length
      }
    };
  }

  private analizarPorTiempo(): Record<string, unknown> {
    const porMes: { [key: string]: number } = {};
    
    this.datosHistoricos.forEach(ad => {
      const fecha = new Date(ad.source.publicationDate);
      const mesKey = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;
      porMes[mesKey] = (porMes[mesKey] || 0) + 1;
    });

    return {
      publicacionesPorMes: porMes,
      tendencia: this.calcularTendencia(Object.values(porMes)),
      mesConMasPublicaciones: Object.entries(porMes)
        .sort(([,a], [,b]) => b - a)[0],
      mesConMenosPublicaciones: Object.entries(porMes)
        .sort(([,a], [,b]) => a - b)[0]
    };
  }

  private analizarCompetidores(): Record<string, unknown> {
    // Analizar números de teléfono más frecuentes
    const telefonos: { [key: string]: number } = {};
    
    this.datosHistoricos.forEach(ad => {
      ad.contact.phoneNumbers.forEach(telefono => {
        telefonos[telefono] = (telefonos[telefono] || 0) + 1;
      });
    });

    const competidoresTop = Object.entries(telefonos)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([telefono, cantidad]) => ({
        telefono,
        publicaciones: cantidad,
        porcentajeDelMercado: (cantidad / this.datosHistoricos.length * 100).toFixed(2) + '%'
      }));

    return {
      totalAnunciantes: Object.keys(telefonos).length,
      competidoresTop,
      concentracionMercado: this.calcularConcentracionMercado(competidoresTop)
    };
  }

  private encontrarCategoriasDesatendidas(): string[] {
    const categoriasExistentes = new Set(this.datosHistoricos.map(ad => ad.content.category));
    const todasLasCategorias = ['inmuebles', 'vehiculos', 'empleos', 'servicios', 'productos', 'educacion', 'salud', 'turismo', 'mascotas'];
    
    return todasLasCategorias.filter(categoria => !categoriasExistentes.has(categoria));
  }

  private encontrarZonasConPocaOferta(): string[] {
    const zonasConPocaOferta: string[] = [];
    const ubicaciones = this.analizarPorUbicacion();
    
    Object.entries(ubicaciones).forEach(([zona, data]: [string, any]) => {
      if (data.cantidad < 5) { // Menos de 5 anuncios
        zonasConPocaOferta.push(zona);
      }
    });

    return zonasConPocaOferta;
  }

  private encontrarNichosPremium(): unknown[] {
    return this.datosHistoricos
      .filter(ad => ad.commercial.prices.length > 0 && ad.commercial.prices[0].amount > 2000)
      .reduce((nichos: any[], ad) => {
        const nicho = `${ad.content.category}-${ad.content.subcategory}`;
        const existente = nichos.find(n => n.nicho === nicho);
        
        if (existente) {
          existente.cantidad++;
          existente.precios.push(ad.commercial.prices[0].amount);
        } else {
          nichos.push({
            nicho,
            cantidad: 1,
            precios: [ad.commercial.prices[0].amount]
          });
        }
        
        return nichos;
      }, [])
      .map(nicho => ({
        ...nicho,
        precioPromedio: nicho.precios.reduce((a: number, b: number) => a + b, 0) / nicho.precios.length
      }))
      .filter(nicho => nicho.cantidad >= 3); // Al menos 3 anuncios
  }

  private encontrarTendenciasEmergentes(): string[] {
    // Simplificado: palabras clave que aparecen frecuentemente en anuncios de alta calidad
    const palabrasEmergentes: { [key: string]: number } = {};
    
    this.datosHistoricos
      .filter(ad => ad.analysis.qualityScore > 80)
      .forEach(ad => {
        ad.content.tags.forEach(tag => {
          palabrasEmergentes[tag] = (palabrasEmergentes[tag] || 0) + 1;
        });
      });

    return Object.entries(palabrasEmergentes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([palabra]) => palabra);
  }

  private calcularTendencia(valores: number[]): string {
    if (valores.length < 2) return 'Insuficientes datos';
    
    const primera = valores[0];
    const ultima = valores[valores.length - 1];
    
    if (ultima > primera * 1.1) return 'Creciente';
    if (ultima < primera * 0.9) return 'Decreciente';
    return 'Estable';
  }

  private calcularConcentracionMercado(competidores: unknown[]): string {
    const top3 = competidores.slice(0, 3);
    const porcentajeTop3 = top3.reduce((sum, comp) => sum + parseFloat(comp.porcentajeDelMercado), 0);
    
    if (porcentajeTop3 > 60) return 'Alta concentración';
    if (porcentajeTop3 > 40) return 'Concentración media';
    return 'Mercado fragmentado';
  }
}

// EJEMPLO 4: RECOMENDACIONES PERSONALIZADAS
export class RecomendadorPersonalizado {
  private datosHistoricos: HistoricalAdJSON[] = [];

  constructor(datosHistoricos: HistoricalAdJSON[]) {
    this.datosHistoricos = datosHistoricos;
  }

  /**
   * Recomienda anuncios basado en el historial del usuario
   */
  recomendarAnuncios(perfilUsuario: unknown): HistoricalAdJSON[] {
    console.log('🎯 Generando recomendaciones personalizadas...');

    let anunciosRecomendados = [...this.datosHistoricos];

    // Filtrar por preferencias del usuario
    if (perfilUsuario.categoriasPreferidas) {
      anunciosRecomendados = anunciosRecomendados.filter(ad =>
        perfilUsuario.categoriasPreferidas.includes(ad.content.category)
      );
    }

    // Filtrar por ubicación
    if (perfilUsuario.ubicacionesPreferidas) {
      anunciosRecomendados = anunciosRecomendados.filter(ad =>
        ad.location.explicit.districts.some(distrito =>
          perfilUsuario.ubicacionesPreferidas.includes(distrito)
        )
      );
    }

    // Filtrar por rango de precio
    if (perfilUsuario.rangoPrecios) {
      anunciosRecomendados = anunciosRecomendados.filter(ad => {
        if (ad.commercial.prices.length === 0) return true;
        const precio = ad.commercial.prices[0].amount;
        return precio >= perfilUsuario.rangoPrecios.min && 
               precio <= perfilUsuario.rangoPrecios.max;
      });
    }

    // Ordenar por relevancia
    anunciosRecomendados.sort((a, b) => {
      const scoreA = this.calcularScoreRelevancia(a, perfilUsuario);
      const scoreB = this.calcularScoreRelevancia(b, perfilUsuario);
      return scoreB - scoreA;
    });

    // Retornar top 10
    return anunciosRecomendados.slice(0, 10);
  }

  private calcularScoreRelevancia(anuncio: HistoricalAdJSON, perfil: unknown): number {
    let score = 0;

    // Puntuación base por calidad
    score += anuncio.analysis.qualityScore * 0.3;

    // Puntuación por categoría preferida
    if (perfil.categoriasPreferidas?.includes(anuncio.content.category)) {
      score += 20;
    }

    // Puntuación por ubicación
    if (perfil.ubicacionesPreferidas?.some((loc: string) =>
      anuncio.location.explicit.districts.includes(loc)
    )) {
      score += 15;
    }

    // Puntuación por precio en rango
    if (perfil.rangoPrecios && anuncio.commercial.prices.length > 0) {
      const precio = anuncio.commercial.prices[0].amount;
      if (precio >= perfil.rangoPrecios.min && precio <= perfil.rangoPrecios.max) {
        score += 10;
      }
    }

    return score;
  }
}

// FUNCIÓN PRINCIPAL PARA EJECUTAR TODOS LOS EJEMPLOS
export async function ejecutarEjemplosCompletos() {
  console.log('🚀 EJECUTANDO EJEMPLOS COMPLETOS DE DATOS HISTÓRICOS\n');

  // 1. Procesar datos históricos
  const resultado = await ejemploProcesarDatosHistoricos();
  console.log('\n' + '='.repeat(50) + '\n');

  // 2. Probar autocompletado
  const autocompletado = new AutocompletadoInteligente(resultado.processedAds);
  const sugerencias = autocompletado.sugerirPorTelefono('991535226');
  console.log('💡 Sugerencias de autocompletado:', sugerencias);
  console.log('\n' + '='.repeat(50) + '\n');

  // 3. Análisis de mercado
  const analizador = new AnalizadorMercado(resultado.processedAds);
  const tendencias = analizador.analizarTendencias();
  console.log('📊 Análisis de mercado:', tendencias);
  console.log('\n' + '='.repeat(50) + '\n');

  // 4. Recomendaciones personalizadas
  const recomendador = new RecomendadorPersonalizado(resultado.processedAds);
  const recomendaciones = recomendador.recomendarAnuncios({
    categoriasPreferidas: ['inmuebles'],
    ubicacionesPreferidas: ['Cusco', 'San Blas'],
    rangoPrecios: { min: 500, max: 2000 }
  });
  console.log('🎯 Recomendaciones personalizadas:', recomendaciones.length, 'anuncios');

  console.log('\n✅ TODOS LOS EJEMPLOS EJECUTADOS EXITOSAMENTE');
  
  return {
    procesamiento: resultado,
    autocompletado: sugerencias,
    mercado: tendencias,
    recomendaciones: recomendaciones.length
  };
}

export default {
  ejemploProcesarDatosHistoricos,
  AutocompletadoInteligente,
  AnalizadorMercado,
  RecomendadorPersonalizado,
  ejecutarEjemplosCompletos
}; 