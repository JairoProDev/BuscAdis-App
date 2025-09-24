import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

// Legacy route: /anuncio/[id] -> redirect to /adiso/[id]
export default async function LegacyAnuncioPage({ params }: PageProps) {
  const { id } = await params
  redirect(`/adiso/${id}`)
}


