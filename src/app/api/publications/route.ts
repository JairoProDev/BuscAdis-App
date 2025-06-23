import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { Logger } from '@/services/logging.service'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Configuración de MongoDB
const MONGODB_URI = process.env.MONGODB_URI!
const MONGODB_DB = process.env.MONGODB_DB || 'buscadis'

// Mapeo de categorías a colecciones
const CATEGORY_COLLECTIONS = {
  inmuebles: 'publications_inmuebles',
  empleos: 'publications_empleos',
  vehiculos: 'publications_vehiculos',
  servicios: 'publications_servicios',
  productos: 'publications_productos',
  eventos: 'publications_eventos',
  comunidad: 'publications_comunidad',
  negocios: 'publications_negocios'
}

// Cache de conexión
let cachedClient: MongoClient | null = null
let cachedDb: any = null

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  try {
    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    
    const db = client.db(MONGODB_DB)
    
    cachedClient = client
    cachedDb = db
    
    Logger.info('Connected to MongoDB successfully')
    return { client, db }
  } catch (error) {
    Logger.error('Failed to connect to MongoDB', { error })
    throw error
  }
}

export async function GET(request: Request) {
  try {
    Logger.debug('GET /api/publications received')
    const { searchParams } = new URL(request.url)

    // Extract query parameters
    const category = searchParams.get('category') || ''
    const searchQuery = searchParams.get('query') || searchParams.get('search') || ''
    const location = searchParams.get('location') || ''
    const minPrice = searchParams.get('minPrice') || ''
    const maxPrice = searchParams.get('maxPrice') || ''
    const sortBy = searchParams.get('sortBy') || 'recent'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || 'active'

    Logger.debug('Search parameters', { 
      category, searchQuery, location, minPrice, maxPrice, sortBy, page, limit, status
    })

    // Conectar a la base de datos
    const { db } = await connectToDatabase()

    let allPublications: any[] = []
    let totalCount = 0

    // Construir query de filtros
    const buildQuery = () => {
      const query: any = {}
      
      // Filtro por estado
      if (status) {
        query.status = status
      }
      
      // Filtro por búsqueda de texto
      if (searchQuery) {
        query.$or = [
          { title: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } },
          { contactName: { $regex: searchQuery, $options: 'i' } }
        ]
      }
      
      // Filtro por ubicación
      if (location) {
        query.location = { $regex: location, $options: 'i' }
      }
      
      // Filtro por precio
      if (minPrice || maxPrice) {
        query.price = {}
        if (minPrice) query.price.$gte = parseFloat(minPrice)
        if (maxPrice) query.price.$lte = parseFloat(maxPrice)
      }
      
      return query
    }

    const mongoQuery = buildQuery()

    if (category && CATEGORY_COLLECTIONS[category as keyof typeof CATEGORY_COLLECTIONS]) {
      // Buscar en una categoría específica
      const collectionName = CATEGORY_COLLECTIONS[category as keyof typeof CATEGORY_COLLECTIONS]
      const collection = db.collection(collectionName)
      
      // Obtener documentos con paginación
      const skip = (page - 1) * limit
      
      const [publications, total] = await Promise.all([
        collection
          .find(mongoQuery)
          .sort(getSortOptions(sortBy))
          .skip(skip)
          .limit(limit)
          .toArray(),
        collection.countDocuments(mongoQuery)
      ])
      
      allPublications = publications
      totalCount = total
      
      Logger.debug(`Found ${publications.length} publications in ${collectionName}`)
      
    } else {
      // Buscar en todas las categorías
      const searchPromises = Object.entries(CATEGORY_COLLECTIONS).map(async ([cat, collectionName]) => {
        try {
          const collection = db.collection(collectionName)
          const publications = await collection.find(mongoQuery).toArray()
          
          // Agregar categoría a cada publicación
          return publications.map(pub => ({
            ...pub,
            categorySlug: cat,
            category: cat
          }))
        } catch (error) {
          Logger.warn(`Error searching in ${collectionName}`, { error })
          return []
        }
      })
      
      const results = await Promise.all(searchPromises)
      const combinedPublications = results.flat()
      
      // Ordenar todos los resultados
      combinedPublications.sort((a, b) => {
        switch (sortBy) {
          case 'price_asc':
            return (a.price || 0) - (b.price || 0)
          case 'price_desc':
            return (b.price || 0) - (a.price || 0)
          case 'recent':
          default:
            const dateA = new Date(a.createdAt || a.created_at || 0)
            const dateB = new Date(b.createdAt || b.created_at || 0)
            return dateB.getTime() - dateA.getTime()
        }
      })
      
      // Aplicar paginación
      totalCount = combinedPublications.length
      const skip = (page - 1) * limit
      allPublications = combinedPublications.slice(skip, skip + limit)
      
      Logger.debug(`Found ${allPublications.length} publications across all categories`)
    }

    // Formatear datos para el frontend
    const formattedPublications = allPublications.map(pub => ({
      ...pub,
      id: pub._id?.toString() || pub.id,
      _id: pub._id?.toString(),
      location: pub.location?.district || pub.location?.province || pub.location || 'Cusco',
      fullLocation: pub.location,
      price: pub.amount || pub.price || 0,
      amount: pub.amount || pub.price || 0,
      images: pub.images && pub.images.length > 0 ? pub.images : ['/images/placeholder-image.jpg'],
      currency: pub.currency || 'PEN',
      status: pub.status || 'active',
      createdAt: pub.createdAt || pub.created_at || new Date().toISOString(),
      subcategory: pub.subcategorySlug || pub.subcategory,
      subsubcategory: pub.subSubcategorySlug || pub.subsubcategory,
      contactName: pub.contact?.name || 'Contacto',
      contactPhone: pub.contact?.phones?.[0] || '',
      district: pub.location?.district || '',
      province: pub.location?.province || '',
      negotiable: pub.negotiable || false
    }))

    Logger.info(`Returning ${formattedPublications.length} publications`, { 
      total: totalCount, 
      page, 
      category: category || 'all',
      searchQuery 
    })

    return NextResponse.json({
      publications: formattedPublications,
      total: totalCount,
      page: page,
      pages: Math.ceil(totalCount / limit),
      success: true,
      hasMore: page * limit < totalCount
    })

  } catch (error) {
    Logger.error('Critical error in GET /api/publications', { error })
    
    return NextResponse.json({
      publications: [],
      total: 0,
      page: 1,
      pages: 1,
      success: false,
      error: 'Error interno del servidor',
      hasMore: false
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    Logger.debug('POST /api/publications received')
    
    const data = await request.json()
    Logger.debug('Received publication data', { title: data.title, category: data.categorySlug })

    // Validaciones básicas
    if (!data.title || !data.description) {
      return NextResponse.json(
        { error: 'Título y descripción son requeridos' },
        { status: 400 }
      )
    }

    if (!data.categorySlug || !CATEGORY_COLLECTIONS[data.categorySlug as keyof typeof CATEGORY_COLLECTIONS]) {
      return NextResponse.json(
        { error: 'Categoría inválida' },
        { status: 400 }
      )
    }

    // Conectar a la base de datos
    const { db } = await connectToDatabase()

    // Preparar documento para inserción
    const now = new Date()
    const newPublication = {
      ...data,
      _id: generateObjectId(),
      id: `pub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      status: data.status || 'active',
      createdAt: now,
      updatedAt: now,
      // Campos adicionales
      views: 0,
      premium: data.premium || false,
      verified: false,
      engagement: {
        views: 0,
        likes: 0,
        shares: 0,
        saves: 0
      },
      metadata: {
        source: 'web_form',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    }

    // Insertar en la colección correspondiente
    const collectionName = CATEGORY_COLLECTIONS[data.categorySlug as keyof typeof CATEGORY_COLLECTIONS]
    const collection = db.collection(collectionName)
    
    const result = await collection.insertOne(newPublication)
    
    if (!result.insertedId) {
      throw new Error('Failed to insert publication')
    }

    Logger.info('Publication created successfully', { 
      id: newPublication.id, 
      category: data.categorySlug,
      collection: collectionName 
    })

    return NextResponse.json({
      success: true,
      publication: {
        ...newPublication,
        _id: result.insertedId.toString()
      },
      message: 'Publicación creada exitosamente'
    })

  } catch (error) {
    Logger.error('Critical error in POST /api/publications', { error })
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Función auxiliar para generar ObjectId
function generateObjectId() {
  return new Date().getTime().toString(16) + Math.random().toString(16).substring(2, 14)
}

// Función auxiliar para opciones de ordenamiento
function getSortOptions(sortBy: string) {
  switch (sortBy) {
    case 'price_asc':
      return { price: 1 }
    case 'price_desc':
      return { price: -1 }
    case 'recent':
    default:
      return { createdAt: -1 }
  }
} 