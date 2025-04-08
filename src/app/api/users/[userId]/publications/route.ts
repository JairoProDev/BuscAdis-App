import { NextResponse } from 'next/server'
import { mongoDbQuery } from '@/lib/mongodb.server'

export const dynamic = 'force-dynamic' // Disable caching to ensure data is always fresh
export const runtime = 'nodejs' // Mark as server-side only

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId
    
    // Build MongoDB query to fetch user's publications from each collection
    const query = { userId }
    
    // Execute the query using server-side MongoDB utilities across all collections
    // We'll fetch from each collection and combine the results
    const inmuebles = await mongoDbQuery('publications_inmuebles', query, {})
    const empleos = await mongoDbQuery('publications_empleos', query, {})
    const servicios = await mongoDbQuery('publications_servicios', query, {})
    const vehiculos = await mongoDbQuery('publications_vehiculos', query, {})
    
    // Combine all results
    const allPublications = [...inmuebles, ...empleos, ...servicios, ...vehiculos]
    
    // Sort by creation date descending (newest first)
    allPublications.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.created_at || 0)
      const dateB = new Date(b.createdAt || b.created_at || 0)
      return dateB.getTime() - dateA.getTime()
    })
    
    return NextResponse.json(allPublications)
  } catch (error) {
    console.error('Error fetching user publications:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch user publications' }),
      { status: 500 }
    )
  }
} 