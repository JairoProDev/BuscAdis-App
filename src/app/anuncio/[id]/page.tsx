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
    // Intentar por sequentialId primero
    let response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/publications/by-sequential/${id}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      // Fallback a ID normal
      response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/publications/${id}`, {
        cache: 'no-store'
      })
    }
    
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    return data.publication || null
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
  
  // Formatear la publicación para el componente
  const formattedPublication = {
    id: publication.id,
    sequentialId: publication.sequentialId,
    title: publication.title || 'Sin título',
    description: publication.description || '',
    categorySlug: publication.categorySlug || 'general',
    subcategorySlug: publication.subcategorySlug,
    subSubcategorySlug: publication.subSubcategorySlug,
    transactionType: publication.transactionType || 'sale',
    value: publication.price || 0,
    currency: publication.currency || 'PEN',
    valueType: 'fixed',
    size: 0,
    location: publication.location || { district: '', province: '', city: '', country: 'Perú' },
    images: Array.isArray(publication.images) ? publication.images : [],
    whatsapp: publication.whatsapp || '',
    createdAt: publication.createdAt || new Date().toISOString(),
    views: publication.views || 0,
    featured: !!publication.featured,
    premium: !!publication.premium,
  }
  
  return <DedicatedPublicationPage publication={formattedPublication} />
}
