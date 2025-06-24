import { NextResponse } from 'next/server'
import { mongoDbQuery } from '@/lib/mongodb-server'

export const dynamic = 'force-dynamic' // Disable caching to ensure data is always fresh
export const runtime = 'nodejs' // Mark as server-side only

export async function GET(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const params = await context.params
    const { userId } = params
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    // Search across all publication collections
    const collections = [
      'publications_inmuebles',
      'publications_vehiculos', 
      'publications_empleos',
      'publications_servicios',
      'publications_productos',
      'publications_eventos',
      'publications_negocios',
      'publications_comunidad'
    ]
    
    let allPublications: any[] = []
    
    for (const collectionName of collections) {
      try {
        const publicationsResult = await mongoDbQuery(collectionName, { 
          $or: [
            { userId: userId },
            { 'contact.userId': userId },
            { 'contact.email': userId } // In case userId is actually an email
          ]
        }, { sort: { createdAt: -1 } })
        
        const publications = Array.isArray(publicationsResult) ? publicationsResult : []
        
        // Add category information to each publication
        const category = collectionName.replace('publications_', '')
        const categorizedPublications = publications.map((pub: any) => ({
          ...pub,
          id: pub._id.toString(),
          category: category,
          collection: collectionName
        }))
        
        allPublications.push(...categorizedPublications)
      } catch (error) {
        console.log(`Error searching in ${collectionName}:`, error)
        continue
      }
    }
    
    // Sort all publications by creation date
    allPublications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    
    return NextResponse.json({
      publications: allPublications,
      total: allPublications.length
    })
  } catch (error) {
    console.error('Error fetching user publications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 