import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{
    id: string
    slug: string
  }>
}

// Esta página simplemente redirige a la versión sin slug para mantener URLs limpias
export default async function PublicationWithSlugPage({ params }: PageProps) {
  const { id } = await params
  
  // Redirigir a la URL sin slug para mantener consistencia
  redirect(`/adiso/${id}`)
}
