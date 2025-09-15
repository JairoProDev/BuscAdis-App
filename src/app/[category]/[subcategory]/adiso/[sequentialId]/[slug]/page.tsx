import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPublicationBySlugOrId } from '@/lib/publications';
import DedicatedPublicationPage from '@/components/publications/dedicated/DedicatedPublicationPage';

interface PageProps {
  params: Promise<{
    category: string;
    subcategory: string;
    sequentialId: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, subcategory, sequentialId, slug } = await params;
  
  try {
    const publication = await getPublicationBySlugOrId(sequentialId, slug);
    
    if (!publication) {
      return {
        title: 'Adiso no encontrado',
        description: 'El adiso solicitado no existe o ha sido eliminado.'
      };
    }

    return {
      title: `${publication.title} - ${category.charAt(0).toUpperCase() + category.slice(1)} - ${subcategory.charAt(0).toUpperCase() + subcategory.slice(1)}`,
      description: publication.description || `Adiso de ${category} - ${subcategory}: ${publication.title}`,
      openGraph: {
        title: publication.title,
        description: publication.description || `Adiso de ${category} - ${subcategory}: ${publication.title}`,
        images: publication.images && publication.images.length > 0 ? [publication.images[0]] : [],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Error al cargar el adiso',
      description: 'Ocurrió un error al cargar el adiso.'
    };
  }
}

export default async function SubcategoryAdisoPage({ params }: PageProps) {
  const { category, subcategory, sequentialId, slug } = await params;
  
  try {
    const publication = await getPublicationBySlugOrId(sequentialId, slug);
    
    if (!publication) {
      notFound();
    }

    // Verificar que la categoría y subcategoría coincidan
    if (publication.categorySlug !== category || publication.subcategorySlug !== subcategory) {
      notFound();
    }

    // Get related publications (same category and subcategory)
    const relatedPublications = []; // TODO: Implementar búsqueda de publicaciones relacionadas

    return (
      <DedicatedPublicationPage 
        publication={publication}
        relatedPublications={relatedPublications}
        showBackButton={true}
        backButtonUrl={`/${category}/${subcategory}`}
        backButtonText={`Volver a ${category.charAt(0).toUpperCase() + category.slice(1)} - ${subcategory.charAt(0).toUpperCase() + subcategory.slice(1)}`}
      />
    );
  } catch (error) {
    console.error('Error loading publication:', error);
    notFound();
  }
}
