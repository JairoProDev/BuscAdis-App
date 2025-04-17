/**
 * Utilidades para la generación y manejo de URLs
 */

/**
 * Genera una URL SEO-friendly para una publicación
 * @param id - ID de la publicación (MongoDB _id, puede seguir siendo necesario para lookup)
 * @param title - Título de la publicación
 * @param publicationSlug - Slug único y SEO-friendly de la publicación (preferido sobre el ID en la URL visible)
 * @param category - Categoría de la publicación (opcional)
 * @param subcategory - Subcategoría de la publicación (opcional)
 * @param subsubcategory - Sub-subcategoría de la publicación (opcional)
 * @param includeTitleInSlug - Si el slug ya contiene el título o si se debe añadir aparte (opcional, por defecto true asumiendo slug no tiene título)
 * @returns URL SEO-friendly
 */
export function generateSeoUrl(
  id: string, // Keep ID for potential lookup / modal param
  title: string,
  publicationSlug?: string, // Add dedicated slug parameter
  category?: string,
  subcategory?: string,
  subsubcategory?: string,
  includeTitleInSlug: boolean = true // Renamed parameter for clarity
): string {
  if (!id && !publicationSlug) {
    console.warn('generateSeoUrl: ID and publicationSlug are both missing');
    return '/'; // Return root or a default path
  }

  // Use the provided publication slug if available, otherwise generate from title
  const effectiveSlug = publicationSlug ? slugify(publicationSlug) : slugify(title);
  
  // Generate a fallback title slug only if needed and not included in publicationSlug
  const titleSlugForPath = includeTitleInSlug && !publicationSlug ? slugify(title) : '' ;

  // Normalize category parts
  const normalizedCategory = category ? slugify(category) : '';
  const normalizedSubcategory = subcategory ? slugify(subcategory) : '';
  const normalizedSubsubcategory = subsubcategory ? slugify(subsubcategory) : '';
  
  // Construir la URL: /category/subcategory/subsubcategory/effective-slug
  let url = '';
  
  if (normalizedCategory) {
    url += `/${normalizedCategory}`;
    
    if (normalizedSubcategory) {
      url += `/${normalizedSubcategory}`;
      
      if (normalizedSubsubcategory) {
        url += `/${normalizedSubsubcategory}`;
      }
    }
    
    // Use the effective slug (publicationSlug or title slug) 
    // Optionally add title slug if needed
    url += `/${effectiveSlug}`;
    if (titleSlugForPath) {
        url += `-${titleSlugForPath}`; // Append title if slug didn't contain it
    }

  } else {
    // Fallback if no category: /publicaciones/effective-slug
    url = `/publicaciones/${effectiveSlug}`;
    if (titleSlugForPath) {
        url += `-${titleSlugForPath}`;
    }
  }
  
  // Remove trailing hyphens that might occur if titleSlugForPath is empty
  url = url.replace(/-+$/, ''); 

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