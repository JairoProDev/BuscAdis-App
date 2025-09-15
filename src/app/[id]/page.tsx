import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PublicationData } from '@/types/publication'
import { PublicationDetailProvider } from '@/hooks/usePublicationDetail'
import HomePageContent from '@/components/home/HomePageContent'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  
  try {
    // Fetch publication data for metadata
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/publications/${id}`, {
      next: { revalidate: 60 }
    });
    
    if (!response.ok) {
      return {
        title: 'Adiso - BuscAdis',
        description: 'Encuentra las mejores oportunidades en BuscAdis'
      };
    }
    
    const data = await response.json();
    const publication = data.publication;
    
    if (!publication) {
      return {
        title: 'Adiso - BuscAdis',
        description: 'Encuentra las mejores oportunidades en BuscAdis'
      };
    }
    
    return {
      title: `${publication.title} - BuscAdis`,
      description: publication.description || 'Encuentra las mejores oportunidades en BuscAdis',
      openGraph: {
        title: `${publication.title} - BuscAdis`,
        description: publication.description || 'Encuentra las mejores oportunidades en BuscAdis',
        type: 'website',
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Adiso - BuscAdis',
      description: 'Encuentra las mejores oportunidades en BuscAdis'
    };
  }
}

export default async function AdisoPage({ params }: PageProps) {
  const { id } = await params;
  
  let publication: PublicationData | null = null;
  
  try {
    // Fetch publication data
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/publications/${id}`, {
      next: { revalidate: 60 }
    });
    
    if (!response.ok) {
      console.error('Failed to fetch publication:', response.status);
      notFound();
    }
    
    const data = await response.json();
    publication = data.publication;
    
    if (!publication) {
      console.error('Publication not found');
      notFound();
    }
  } catch (error) {
    console.error('Error fetching publication:', error);
    notFound();
  }
  
  // Pass the publication ID to the home page so it can pre-select the adiso
  return <HomePageContent preSelectedPublicationId={id} allPublications={[publication]} />
}
