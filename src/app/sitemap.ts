import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://buscadis.com';
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/buscar`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/publicar`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/empleos`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/inmuebles`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/vehiculos`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/servicios`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/productos`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/eventos`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/negocios`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/comunidad`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
  ];

  // Dynamic publication pages (you would fetch these from your database)
  // This is a placeholder - in production you'd fetch actual publications
  const dynamicPages: MetadataRoute.Sitemap = [];
  
  try {
    // Fetch recent publications for sitemap
    // In production, you'd implement this to fetch from your database
    // const publications = await fetchPublicationsForSitemap();
    
    // For now, we'll return just the static pages
    // You can uncomment and implement the dynamic pages later
    
    /*
    publications.forEach((publication) => {
      dynamicPages.push({
        url: `${baseUrl}/${publication.categorySlug}/${publication.subcategorySlug || 'general'}/${publication.subSubcategorySlug || 'general'}/${publication.id}/${encodeURIComponent(publication.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''))}`,
        lastModified: new Date(publication.updatedAt || publication.createdAt),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      });
    });
    */
  } catch (error) {
    console.error('Error generating dynamic sitemap entries:', error);
  }

  return [...staticPages, ...dynamicPages];
} 