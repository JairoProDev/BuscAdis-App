import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import PublicationPageClient from './PublicationPageClient'

interface CategoryPublicationPageProps {
  params: Promise<{
    category: string
    id: string
  }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

// Categorías válidas
const validCategories = [
  'empleos', 'inmuebles', 'vehiculos', 'servicios', 
  'productos', 'eventos', 'negocios', 'comunidad'
]

const categoryNames: Record<string, string> = {
  empleos: 'Empleos',
  inmuebles: 'Inmuebles',
  vehiculos: 'Vehículos',
  servicios: 'Servicios',
  productos: 'Productos',
  eventos: 'Eventos',
  negocios: 'Negocios',
  comunidad: 'Comunidad'
}

export async function generateMetadata({ params }: CategoryPublicationPageProps): Promise<Metadata> {
  const { category, id } = await params
  const categoryName = categoryNames[category] || 'Anuncio'
  
  return {
    title: `${categoryName} #${id} - BuscAdis`,
    description: `Ver detalles del anuncio en ${categoryName.toLowerCase()}.`,
  }
}

export default async function CategoryPublicationPage({ params, searchParams }: CategoryPublicationPageProps) {
  const { category, id } = await params
  
  // Si es 'adiso' o 'adisos', redirigir a la ruta correcta
  if (category === 'adiso' || category === 'adisos') {
    redirect(`/adiso/${id}`)
  }
  
  if (!validCategories.includes(category)) {
    redirect('/')
  }
  
  const resolvedSearchParams = searchParams ? await searchParams : {}
  
  // Renderizar la página de búsqueda con el anuncio seleccionado (mantener URL limpia)
  return <PublicationPageClient category={category} publicationId={id} searchParams={resolvedSearchParams} />
}