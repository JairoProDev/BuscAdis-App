import EmpleoDetailPageClient from '@/components/empleos/EmpleoDetailPageClient';

interface PageProps {
  params: Promise<{
    subcategory: string;
    subsubcategory: string;
    id: string;
  }>;
}

export default async function EmpleoDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  return <EmpleoDetailPageClient id={id} />;
} 