import { NextResponse } from 'next/server'
import { mongoDbQuery } from '@/lib/mongodb.server'

export const dynamic = 'force-dynamic' // Disable caching to ensure data is always fresh
export const runtime = 'nodejs' // Mark as server-side only

export async function GET() {
  try {
    // The category collections to count
    const categoryCollections = [
      'publications_empleos',
      'publications_inmuebles',
      'publications_vehiculos', 
      'publications_servicios',
      'publications_productos',
      'publications_eventos',
      'publications_negocios',
      'publications_comunidad'
    ]
    
    // Get counts for each category
    const counts = await Promise.all(
      categoryCollections.map(async (collection) => {
        const data = await mongoDbQuery(collection, {}, { limit: 0 })
        return {
          id: collection.replace('publications_', ''),
          count: data.length
        }
      })
    )
    
    return NextResponse.json(counts)
  } catch (error) {
    console.error('Error fetching category counts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category counts' },
      { status: 500 }
    )
  }
} 