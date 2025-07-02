/**
 * Utilidades para la generación y manejo de URLs
 */

/**
 * Genera una URL SEO-friendly para una publicación
 * @param id - ID de la publicación (MongoDB _id, usado en la URL para routing)
 * @param title - Título de la publicación
 * @param publicationSlug - Slug único y SEO-friendly de la publicación (preferido sobre el ID en la URL visible)
 * @param category - Categoría de la publicación (opcional)
 * @param subcategory - Subcategoría de la publicación (opcional)
 * @param subsubcategory - Sub-subcategoría de la publicación (opcional)
 * @param includeTitleInSlug - Si el slug ya contiene el título o si se debe añadir aparte (opcional, por defecto true asumiendo slug no tiene título)
 * @returns URL SEO-friendly
 */
export function generateSeoUrl(
  id: string, // ID is used in URL for routing
  title: string,
  publicationSlug?: string, // Dedicated slug parameter
  category?: string,
  subcategory?: string,
  subsubcategory?: string,
  includeTitleInSlug: boolean = true // Whether to include title in the slug
): string {
  if (!id) {
    console.warn('generateSeoUrl: id is missing');
    return '/'; // Return root or a default path
  }

  // Create a clean slug from the title
  const titleSlug = slugify(title);
  
  // Normalize category parts
  const normalizedCategory = category ? slugify(category) : '';
  const normalizedSubcategory = subcategory ? slugify(subcategory) : '';
  const normalizedSubsubcategory = subsubcategory ? slugify(subsubcategory) : '';
  
  // Construir la URL basada en rutas existentes
  let url = '';
  
  // Para categorías específicas que tienen rutas dinámicas completas
  if (normalizedCategory && ['empleos', 'inmuebles', 'vehiculos'].includes(normalizedCategory)) {
    url = `/${normalizedCategory}`;
    
    // Agregar subcategoría (requerida para estas rutas)
    if (normalizedSubcategory) {
      url += `/${normalizedSubcategory}`;
      
      // Agregar sub-subcategoría si existe
      if (normalizedSubsubcategory) {
        url += `/${normalizedSubsubcategory}`;
      } else {
        // Si no hay subsubcategory, usar 'general' como default
        url += `/general`;
      }
    } else {
      // Si no hay subcategory, usar defaults
      url += `/general/general`;
    }
    
    // Agregar ID al final (requerido para el routing dinámico)
    url += `/${id}`;
  } else {
    // Fallback para otras categorías: usar /anuncios/[id] que sí existe
    url = `/anuncios/${id}`;
    
    // Opcionalmente agregar título como slug adicional
    if (titleSlug) {
      url += `/${titleSlug}`;
    }
  }
  
  return url;
}

/**
 * Limpia un string para usarlo como slug en URLs
 * @param text - Texto a convertir en slug
 * @returns Texto limpio para URL
 */
export function slugify(text: string): string {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // Allow alphanumeric, spaces, and specific accented characters
    // Remove characters that are not word characters, spaces, or hyphens
    .replace(/[^\w\s\-áéíóúñüÁÉÍÓÚÑÜ]/g, '') 
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '') // Trim hyphens from start/end
    .substring(0, 75); // Limit slug length
} 