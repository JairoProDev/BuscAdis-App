import { redirect } from 'next/navigation'

interface CategoryPublicationPageProps {
  params: Promise<{
    category: string
    id: string
  }>
}

// Categorías válidas
const validCategories = [
  'empleos', 'inmuebles', 'vehiculos', 'servicios', 
  'productos', 'eventos', 'negocios', 'comunidad'
]

export default async function CategoryPublicationPage({ params }: CategoryPublicationPageProps) {
  const { category, id } = await params
  
  // Si es 'adiso' o 'adiso', redirigir a la ruta correcta
  if (category === 'adiso' || category === 'adiso') {
    redirect(`/adiso/${id}`)
  }
  
  if (!validCategories.includes(category)) {
    redirect('/')
  }
  
  // Redirigir a la página de búsqueda con la categoría y el ID del adiso
  redirect(`/buscar?category=${category}&selectedId=${id}`)
}