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

  // Create a clean slug from the title
  const titleSlug = slugify(title);
  
  // Use the provided publication slug if available, otherwise use title slug
  let effectiveSlug = '';
  
  if (publicationSlug) {
    // Use the provided slug
    effectiveSlug = slugify(publicationSlug);
    // No need to append title, as publicationSlug should already be SEO-friendly
    includeTitleInSlug = false;
  } else {
    // Generate slug from title
    effectiveSlug = titleSlug;
    // Since we're using the title as the slug, don't append it again
    includeTitleInSlug = false;
  }

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
    
    // Just add the effective slug without appending the title again
    url += `/${effectiveSlug}`;

  } else {
    // Fallback if no category: /publicaciones/effective-slug
    url = `/publicaciones/${effectiveSlug}`;
  }
  
  // Remove trailing hyphens that might occur
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