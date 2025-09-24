import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import DedicatedPublicationPage from '@/components/publications/dedicated/DedicatedPublicationPage'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

async function fetchPublication(id: string) {
  try {
    // Fetch from both endpoints concurrently
    const [bySequentialResponse, byIdResponse] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/publications/by-sequential/${id}`, {
        cache: 'no-store'
      }),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/publications/${id}`, {
        cache: 'no-store'
      })
    ]);
    
    // Try sequential ID response first
    if (bySequentialResponse.ok) {
      const data = await bySequentialResponse.json();
      return data.publication || null;
    }
    
    // Fallback to normal ID
    if (byIdResponse.ok) {
      const data = await byIdResponse.json();
      return data.publication || null;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching publication:', error)
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const publication = await fetchPublication(id)
  
  if (!publication) {
    return {
      title: 'Adiso no encontrado - BuscaDis',
      description: 'El adiso que buscas no existe o ha sido eliminado.'
    }
  }
  
  const title = `${publication.title} - BuscaDis`
  const description = publication.description || 'Encuentra más oportunidades en BuscaDis.com'
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: publication.images && publication.images.length > 0 ? [publication.images[0]] : undefined,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: publication.images && publication.images.length > 0 ? [publication.images[0]] : undefined,
    },
    alternates: {
      canonical: `/adiso/${publication.sequentialId || publication.id}`,
    }
  }
}

export default async function PublicationPage({ params }: PageProps) {
  const { id } = await params
  const publication = await fetchPublication(id)
  
  if (!publication) {
    notFound()
  }
  
  // Redirect to the canonical URL if we have a sequential ID
  if (publication.sequentialId) {
    const slug = publication.title
      ? publication.title.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
      : publication.id;
    
    return Response.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/adisos/${publication.sequentialId}/${slug}`
    )
  }
  
  // Formatear la publicación para el componente
  const formattedPublication = {
    id: publication.id,
    sequentialId: publication.sequentialId,
    title: publication.title || 'Sin título',
    description: publication.description || '',
    categorySlug: publication.categorySlug || 'general',
    subcategorySlug: publication.subcategorySlug,
    subSubcategorySlug: publication.subSubcategorySlug,
    transactionType: 'sale',
    value: publication.price || 0,
    currency: publication.currency || 'PEN',
    valueType: 'fixed',
    size: 0,
    location: publication.location || { district: '', province: '', city: '', country: 'Perú' },
    images: Array.isArray(publication.images) ? publication.images : [],
    whatsapp: publication.contact?.phone || '',
    createdAt: publication.createdAt || new Date().toISOString(),
    views: publication.views || 0,
    featured: !!publication.featured,
    premium: !!publication.premium,
    attributes: publication.attributes || {},
  }
  
  
  return <DedicatedPublicationPage publication={formattedPublication} />
}
