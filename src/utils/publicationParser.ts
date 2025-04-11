/**
 * Utilidades para analizar y estructurar datos de publicaciones
 */
import { MainCategory, classifyPublication, PublicationInput } from '@/types/publication';

/**
 * Analiza texto plano de anuncios y los convierte en objetos estructurados
 * @param text Texto plano que contiene varios anuncios
 * @returns Array de publicaciones estructuradas
 */
export function parsePublicationsFromText(text: string): PublicationInput[] {
  // Dividir el texto en anuncios individuales (suponiendo que están separados por marcadores)
  const rawAds = text.split(/\s+Convocatoria:|^\s+•|\s+Empresa|^\s+En |^\s+Farmacia|^\s+Maestro|^\s+Alquilo|^\s+Vendo/gm)
    .map(ad => ad.trim())
    .filter(ad => ad.length > 30); // Filtrar fragmentos demasiado cortos
  
  return rawAds.map(adText => {
    // Extraer título (primera línea o frase significativa)
    let title = adText.split(/[.,:]|\n/)[0].trim();
    if (title.length < 10 || title.length > 100) {
      // Si el título es demasiado corto o largo, intentar extraer un título mejor
      const potentialTitles = adText.split(/\n|\./).filter(t => t.length > 10 && t.length < 100);
      title = potentialTitles.length > 0 ? potentialTitles[0].trim() : adText.substring(0, 80).trim();
    }
    
    // Extraer precio
    let price = 0;
    let priceMatch = adText.match(/S\/\.?\s*(\d+(?:,\d+)*(?:\.\d+)?)/i) || 
                    adText.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*soles/i) ||
                    adText.match(/s\/(\d+(?:,\d+)*(?:\.\d+)?)/i);
    
    if (priceMatch) {
      price = parseFloat(priceMatch[1].replace(/,/g, ''));
    }
    
    // Extraer tipo de precio
    let priceType: 'fixed' | 'negotiable' | 'free' | 'exchange' = 'fixed';
    if (adText.toLowerCase().includes('negociable') || adText.toLowerCase().includes('a tratar')) {
      priceType = 'negotiable';
    } else if (adText.toLowerCase().includes('gratis') || adText.toLowerCase().includes('gratuito')) {
      priceType = 'free';
    }
    
    // Extraer contacto
    const contactInfo = {
      name: '',
      phone: '',
      whatsapp: '',
      email: ''
    };
    
    // Buscar email
    const emailMatch = adText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
    if (emailMatch) {
      contactInfo.email = emailMatch[0];
    }
    
    // Buscar teléfono/celular
    const phoneMatches = adText.match(/(?:cel|telf|teléfono|celular|llamar)(?:\.|:|\s)+\s*(?:\+?51)?[- ]?(?:\d{3}[- ]?){3}/gi);
    const rawPhoneMatches = adText.match(/\b(?:\+?51)?[- ]?9\d{2}[- ]?\d{3}[- ]?\d{3}\b/g);
    
    if (phoneMatches && phoneMatches.length > 0) {
      const phoneNumber = phoneMatches[0].replace(/(?:cel|telf|teléfono|celular|llamar)(?:\.|:|\s)+\s*/gi, '')
        .replace(/[^0-9]/g, '');
      contactInfo.phone = phoneNumber;
      contactInfo.whatsapp = phoneNumber;
    } else if (rawPhoneMatches && rawPhoneMatches.length > 0) {
      const phoneNumber = rawPhoneMatches[0].replace(/[^0-9]/g, '');
      contactInfo.phone = phoneNumber;
      contactInfo.whatsapp = phoneNumber;
    }
    
    // Extraer ubicación
    const locationInfo = {
      city: 'Cusco', // Default por el contexto de los anuncios
      region: 'Cusco',
      district: ''
    };
    
    // Buscar distritos/zonas específicas
    const districts = ['Wanchaq', 'Santiago', 'San Sebastián', 'San Jerónimo', 'Ttio', 'Huancaro'];
    for (const district of districts) {
      if (adText.includes(district)) {
        locationInfo.district = district;
        break;
      }
    }
    
    // Clasificar la publicación
    const classification = classifyPublication(title, adText);
    
    // Generar un ID temporal único
    const tempId = `temp_${Math.random().toString(36).substring(2, 10)}`;
    
    // Crear el objeto de publicación
    const publication: PublicationInput = {
      title,
      description: adText,
      price,
      price_type: priceType,
      currency: 'PEN', // Sol peruano
      category: classification.category as MainCategory,
      subcategory: classification.subcategory,
      subsubcategory: classification.subsubcategory,
      images: [], // Sin imágenes por defecto
      location: locationInfo,
      contact: contactInfo,
      attributes: {}
    };
    
    // Extraer atributos específicos según categoría
    if (classification.category === 'empleos') {
      // Extraer tipo de trabajo
      if (adText.toLowerCase().includes('tiempo completo')) {
        publication.attributes.tipo_trabajo = 'Tiempo completo';
      } else if (adText.toLowerCase().includes('medio tiempo') || adText.toLowerCase().includes('part time')) {
        publication.attributes.tipo_trabajo = 'Medio tiempo';
      } else if (adText.toLowerCase().includes('por horas')) {
        publication.attributes.tipo_trabajo = 'Por horas';
      }
      
      // Extraer requisitos
      const requisitos = [];
      if (adText.toLowerCase().includes('requisito')) {
        const reqSection = adText.toLowerCase().split('requisito')[1]?.split(/\.|empresa|informes/i)[0];
        if (reqSection) {
          const reqs = reqSection.split(/,|;|\n/).map(r => r.trim()).filter(r => r.length > 3);
          requisitos.push(...reqs);
        }
      }
      if (requisitos.length > 0) {
        publication.attributes.requisitos = requisitos;
      }
    } else if (classification.category === 'inmuebles') {
      // Extraer características
      if (adText.toLowerCase().includes('dormitorio')) {
        const dormMatch = adText.match(/(\d+)\s*dormitorio/i);
        if (dormMatch) {
          publication.attributes.dormitorios = parseInt(dormMatch[1]);
        }
      }
      if (adText.toLowerCase().includes('baño')) {
        const bathMatch = adText.match(/(\d+)\s*baño/i);
        if (bathMatch) {
          publication.attributes.baños = parseInt(bathMatch[1]);
        }
      }
      if (adText.toLowerCase().includes('m²') || adText.toLowerCase().includes('metros cuadrados')) {
        const areaMatch = adText.match(/(\d+)\s*m²/i) || adText.match(/(\d+)\s*metros cuadrados/i);
        if (areaMatch) {
          publication.attributes.area = parseInt(areaMatch[1]);
        }
      }
    }
    
    return publication;
  });
}

/**
 * Transforma una publicación para prepararla para la API
 * @param publication Publicación estructurada
 * @returns Datos listos para enviar a la API
 */
export function preparePublicationForAPI(publication: PublicationInput): any {
  // Ajustar formato según requisitos de la API
  return {
    ...publication,
    price: publication.price || 0,
    created_at: new Date().toISOString(),
    status: 'active'
  };
} 