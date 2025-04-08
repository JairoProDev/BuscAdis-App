import { NextResponse } from 'next/server'
import { mongoDbQuery, mongoDbInsert } from '@/lib/mongodb.server'

export const dynamic = 'force-dynamic' // Disable caching to ensure data is always fresh
export const runtime = 'nodejs' // Mark as server-side only

// Get all collections to search in
const CATEGORY_COLLECTIONS = {
  'empleos': 'publications_empleos',
  'inmuebles': 'publications_inmuebles',
  'vehiculos': 'publications_vehiculos',
  'servicios': 'publications_servicios',
  'productos': 'publications_productos',
  'eventos': 'publications_eventos',
  'negocios': 'publications_negocios',
  'comunidad': 'publications_comunidad'
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract query parameters
    const category = searchParams.get('category') || ''
    const subcategory = searchParams.get('subcategory') || ''
    const query = searchParams.get('query') || ''
    const location = searchParams.get('location') || ''
    const minPrice = searchParams.get('minPrice') || ''
    const maxPrice = searchParams.get('maxPrice') || ''
    const sortBy = searchParams.get('sortBy') || 'recent'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    
    // Build MongoDB query
    const mongoQuery: any = {}
    
    if (subcategory) mongoQuery.subcategory = subcategory
    
    if (query) {
      mongoQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    }
    
    if (location) {
      mongoQuery['location.city'] = { $regex: location, $options: 'i' }
    }
    
    if (minPrice || maxPrice) {
      mongoQuery.price = {}
      if (minPrice) mongoQuery.price.$gte = parseFloat(minPrice)
      if (maxPrice) mongoQuery.price.$lte = parseFloat(maxPrice)
    }
    
    // Sort options
    const sortOptions: any = {}
    switch (sortBy) {
      case 'price_asc':
        sortOptions.price = 1
        break
      case 'price_desc':
        sortOptions.price = -1
        break
      case 'recent':
      default:
        sortOptions.created_at = -1
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit
    
    // Determine which collection(s) to search
    let data: any[] = [];
    let totalCount = 0;
    
    if (category && CATEGORY_COLLECTIONS[category]) {
      // Search in specific category collection
      const collectionName = CATEGORY_COLLECTIONS[category];
      data = await mongoDbQuery(collectionName, mongoQuery, {
        sort: sortOptions,
        skip,
        limit
      });
      
      // Get total count for pagination from the same collection
      const countData = await mongoDbQuery(collectionName, mongoQuery, {});
      totalCount = countData.length;
    } else {
      // Search in all collections if no specific category
      const promises = Object.values(CATEGORY_COLLECTIONS).map(async (collection) => {
        return await mongoDbQuery(collection, mongoQuery, {
          sort: sortOptions,
          skip: 0, // We'll handle pagination after combining
          limit: 500 // Get more results to allow for pagination after combining
        });
      });
      
      const allResults = await Promise.all(promises);
      const combinedResults = allResults.flat(); // Combine all results
      
      // Sort the combined results
      combinedResults.sort((a, b) => {
        if (sortBy === 'price_asc') {
          return (a.price || 0) - (b.price || 0);
        } else if (sortBy === 'price_desc') {
          return (b.price || 0) - (a.price || 0);
        } else {
          // Default sort by date
          const dateA = new Date(a.created_at || 0).getTime();
          const dateB = new Date(b.created_at || 0).getTime();
          return dateB - dateA;
        }
      });
      
      // Apply pagination to the combined results
      totalCount = combinedResults.length;
      data = combinedResults.slice(skip, skip + limit);
    }
    
    return NextResponse.json({
      publications: data,
      total: totalCount,
      pages: Math.ceil(totalCount / limit),
      page
    })
  } catch (error) {
    console.error('Error in publications API:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch publications' }),
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    if (!data.title || !data.description) {
      return NextResponse.json(
        { error: 'El título y la descripción son obligatorios' },
        { status: 400 }
      )
    }
    
    // Determine collection based on category
    const categorySlug = data.category || 'inmuebles'
    const collectionName = CATEGORY_COLLECTIONS[categorySlug] || 'publications_inmuebles'
    
    const now = new Date()
    const publicationData = {
      ...data,
      id: data.id || `pub_${Date.now()}`, // Generate ID if not provided
      status: 'active',
      created_at: now,
      updated_at: now
    }
    
    // Save the publication using server-side MongoDB utility
    const result = await mongoDbInsert(collectionName, publicationData)
    
    return NextResponse.json({ 
      success: true,
      id: publicationData.id
    })
  } catch (error: any) {
    console.error('Error creating publication:', error)
    return NextResponse.json(
      { error: `Error al crear la publicación: ${error.message}` },
      { status: 500 }
    )
  }
} 