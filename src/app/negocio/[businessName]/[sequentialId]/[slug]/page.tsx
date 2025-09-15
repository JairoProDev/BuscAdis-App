import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPublicationBySlugOrId } from '@/lib/publications';
import DedicatedPublicationPage from '@/components/publications/dedicated/DedicatedPublicationPage';

interface PageProps {
  params: Promise<{
    businessName: string;
    sequentialId: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { businessName, sequentialId, slug } = await params;
  
  try {
    const publication = await getPublicationBySlugOrId(sequentialId, slug);
    
    if (!publication) {
      return {
        title: 'Adiso no encontrado - BuscAdis',
        description: 'El adiso que buscas no existe o ha sido eliminado.'
      };
    }

    return {
      title: `${publication.title} - ${businessName} - BuscAdis`,
      description: publication.description || `Adiso de ${businessName}: ${publication.title}`,
      openGraph: {
        title: `${publication.title} - ${businessName}`,
        description: publication.description || `Adiso de ${businessName}: ${publication.title}`,
        images: publication.images?.length ? [publication.images[0]] : [],
      },
    };
  } catch (error) {
    return {
      title: 'Error - BuscAdis',
      description: 'Ocurrió un error al cargar el adiso.'
    };
  }
}

export default async function BusinessAdisoPage({ params }: PageProps) {
  const { businessName, sequentialId, slug } = await params;
  
  try {
    const publication = await getPublicationBySlugOrId(sequentialId, slug);
    
    if (!publication) {
      notFound();
    }

    // Get related publications (same category)
    const relatedPublications = await getRelatedPublications(publication.categorySlug, publication.id);

    return (
      <DedicatedPublicationPage 
        publication={publication}
        relatedPublications={relatedPublications}
      />
    );
  } catch (error) {
    console.error('Error loading publication:', error);
    notFound();
  }
}

async function getRelatedPublications(categorySlug: string, excludeId: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/publications/related?category=${categorySlug}&id=${excludeId}&limit=4`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return data.publications || [];
  } catch (error) {
    console.error('Error fetching related publications:', error);
    return [];
  }
}
