import { redirect } from 'next/navigation'

interface CategoryPublicationWithSlugPageProps {
  params: Promise<{
    category: string
    id: string
    slug: string
  }>
}

// Esta página redirige a la versión sin slug para mantener URLs limpias
export default async function CategoryPublicationWithSlugPage({ params }: CategoryPublicationWithSlugPageProps) {
  const { category, id } = await params
  
  // Redirigir a la URL sin slug para mantener consistencia
  redirect(`/${category}/${id}`)
}
