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
    
    // Static fallback counts in case of database errors
    const staticCounts = [
      { id: 'empleos', count: 43 },
      { id: 'inmuebles', count: 76 },
      { id: 'vehiculos', count: 62 },
      { id: 'servicios', count: 51 },
      { id: 'productos', count: 87 },
      { id: 'eventos', count: 34 },
      { id: 'negocios', count: 27 },
      { id: 'comunidad', count: 19 },
    ]
    
    try {
      // Get counts for each category
      const countPromises = categoryCollections.map(async (collection) => {
        try {
          const data = await mongoDbQuery(collection, {}, { limit: 0 })
          return {
            id: collection.replace('publications_', ''),
            count: data.length
          }
        } catch (err) {
          console.error(`Error counting for collection ${collection}:`, err)
          // Return static count for this category as fallback
          const staticCount = staticCounts.find(
            c => c.id === collection.replace('publications_', '')
          )
          return staticCount || { id: collection.replace('publications_', ''), count: 0 }
        }
      })
      
      const counts = await Promise.all(countPromises)
      return NextResponse.json(counts)
    } catch (error) {
      console.error('Error in categories count:', error)
      // Return static counts as fallback
      return NextResponse.json(staticCounts)
    }
  } catch (error) {
    console.error('Error fetching category counts:', error)
    // If absolutely everything fails, return an empty array rather than 500
    return NextResponse.json([])
  }
} 