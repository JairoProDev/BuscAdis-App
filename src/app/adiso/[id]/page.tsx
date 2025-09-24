import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPublicationBySlugOrId } from '@/lib/publications'
import DedicatedPublicationPage from '@/components/publications/dedicated/DedicatedPublicationPage'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { id } = await params
    const publication = await getPublicationBySlugOrId(id)
    if (!publication) {
      return {
        title: 'Adiso no encontrado | BuscAdis',
        description: 'El adiso solicitado no existe o fue eliminado.'
      }
    }
    return {
      title: `${publication.title} | BuscAdis`,
      description: publication.description?.slice(0, 150) || 'Detalle del adiso'
    }
  } catch {
    return {
      title: 'Adiso | BuscAdis'
    }
  }
}

export default async function AdisoPage({ params }: PageProps) {
  const { id } = await params

  try {
    const publication = await getPublicationBySlugOrId(id)
    if (!publication) {
      notFound()
    }

    return (
      <DedicatedPublicationPage 
        publication={publication!}
        relatedPublications={[]}
      />
    )
  } catch (error) {
    console.error('Error loading adiso page:', error)
    notFound()
  }
}


