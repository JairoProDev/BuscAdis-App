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
    const countPromises = categoryCollections.map(async (collection) => {
      try {
        // Use MongoDB's countDocuments() via a raw query
        const result = await mongoDbQuery(collection, {}, { count: true });
        return {
          id: collection.replace('publications_', ''),
          count: typeof result === 'number' ? result : (Array.isArray(result) ? result.length : 0)
        }
      } catch (err) {
        console.error(`Error counting for collection ${collection}:`, err)
        // If there's an error, return zero count rather than fake numbers
        return { 
          id: collection.replace('publications_', ''), 
          count: 0 
        }
      }
    })
    
    const counts = await Promise.all(countPromises)
    return NextResponse.json(counts)
  } catch (error) {
    console.error('Error fetching category counts:', error)
    // Return empty counts rather than fake counts if there's an error
    return NextResponse.json([
      { id: 'empleos', count: 0 },
      { id: 'inmuebles', count: 0 },
      { id: 'vehiculos', count: 0 },
      { id: 'servicios', count: 0 },
      { id: 'productos', count: 0 },
      { id: 'eventos', count: 0 },
      { id: 'negocios', count: 0 },
      { id: 'comunidad', count: 0 },
    ])
  }
} 