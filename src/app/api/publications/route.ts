import { NextResponse } from 'next/server';
import { MongoClient, Db } from 'mongodb'
import { Logger } from '@/services/logging.service'
import type { SortDirection } from 'mongodb';

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0 // Disable caching completely
export const fetchCache = 'force-no-store'

/**
 * API Route: Publications
 * 
 * Handles GET and POST requests for publications.
 * Uses MongoDB connection pooling for optimal performance.
 * 
 * IMPORTANT: The MongoDB client connection is cached and reused across requests.
 * Do NOT close the client after each request as it will break the connection pool.
 */

// Configuración de MongoDB
const MONGODB_URI = process.env.MONGODB_URI!
const MONGODB_DB = process.env.MONGODB_DB || 'buscadis'
const UNIFIED_COLLECTION = 'adisos'

// Cache de conexión
let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    Logger.info('Using cached MongoDB connection')
    return { client: cachedClient, db: cachedDb }
  }

  try {
    Logger.info('Creating new MongoDB connection...', {
      hasUri: !!MONGODB_URI,
      dbName: MONGODB_DB
    })
    
    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    
    const db = client.db(MONGODB_DB)
    
    // Test the connection
    await db.admin().ping()
    
    cachedClient = client
    cachedDb = db
    
    Logger.info('Connected to MongoDB successfully', { dbName: MONGODB_DB })
    return { client, db }
  } catch (error) {
    const err = error as Error
    Logger.error('Failed to connect to MongoDB', { 
      error: err.message,
      name: err.name,
      hasUri: !!MONGODB_URI,
      dbName: MONGODB_DB
    })
    throw new Error(`MongoDB connection failed: ${err.message}`)
  }
}

export async function GET(request: Request) {
  const isDev = process.env.NODE_ENV === 'development';
  
  try {
    // Quick connection test
    Logger.info('API called', {
      env: process.env.NODE_ENV,
      hasMongoUri: !!process.env.MONGODB_URI,
      mongoDb: process.env.MONGODB_DB
    })
    
    const { searchParams } = new URL(request.url)
    
    if (isDev) {
      Logger.debug('GET /api/publications', { params: Object.fromEntries(searchParams.entries()) })
    }

    // Extract query parameters
    const category = searchParams.get('category') || ''
    const subcategory = searchParams.get('subcategory') || ''
    const subsubcategory = searchParams.get('subSubcategory') || searchParams.get('subsubcategory') || ''
    const searchQuery = searchParams.get('query') || searchParams.get('search') || ''
    const department = searchParams.get('department') || searchParams.get('region') || ''
    const province = searchParams.get('province') || ''
    const city = searchParams.get('city') || ''
    const district = searchParams.get('district') || ''
    const minPrice = searchParams.get('minPrice') || ''
    const maxPrice = searchParams.get('maxPrice') || ''
    const sortBy = searchParams.get('sortBy') || 'publicationDate'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    // Important: do NOT force a default status in production. Only filter when explicitly provided.
    const status = searchParams.get('status') || ''
    const premium = searchParams.get('premium') || ''

    // Log only in development
    if (isDev) {
      Logger.debug('Search parameters', { 
        category, subcategory, subsubcategory, searchQuery, department, province, city, district, minPrice, maxPrice, sortBy, page, limit, status, premium
      })
    }

    // Variables para almacenar resultados
    let allPublications: Record<string, unknown>[] = []
    let totalCount = 0

    // Construir query de filtros
    const buildQuery = () => {
      const query: Record<string, unknown> = {}
      const andConditions: Record<string, unknown>[] = []

      // Estado y premium
      if (status) query.status = status
      if (premium) query.premium = premium === 'true'

      // Clasificación - support both flat and nested category structure
      if (category && category !== 'all') {
        andConditions.push({
          $or: [
            { category: category },
            { 'category.slug': category },
            { 'category.id': category }
          ]
        })
      }
      if (subcategory) {
        andConditions.push({
          $or: [
            { subcategory: subcategory },
            { 'subcategory.slug': subcategory },
            { 'subcategory.id': subcategory }
          ]
        })
      }
      if (subsubcategory) {
        andConditions.push({
          $or: [
            { subsubcategory: subsubcategory },
            { 'subsubcategory.slug': subsubcategory },
            { 'subsubcategory.id': subsubcategory }
          ]
        })
      }

      // Ubicación
      if (department) query['location.region'] = { $regex: department, $options: 'i' }
      if (province) query['location.province'] = { $regex: province, $options: 'i' }
      if (city) query['location.city'] = { $regex: city, $options: 'i' }
      if (district) query['location.district'] = { $regex: district, $options: 'i' }

      // Texto - usar regex en lugar de $text para evitar errores de índice
      if (searchQuery) {
        andConditions.push({
          $or: [
            { title: { $regex: searchQuery, $options: 'i' } },
            { description: { $regex: searchQuery, $options: 'i' } }
          ]
        })
      }
      
      // Combine all $and conditions
      if (andConditions.length > 0) {
        query.$and = andConditions
      }

      // Precio
      if (minPrice || maxPrice) {
        query['pricing.amount'] = {}
        if (minPrice) (query['pricing.amount'] as Record<string, unknown>).$gte = parseFloat(minPrice)
        if (maxPrice) (query['pricing.amount'] as Record<string, unknown>).$lte = parseFloat(maxPrice)
      }

      return query
    }

    const mongoQuery = buildQuery()
    
    Logger.info('MongoDB query built:', { query: JSON.stringify(mongoQuery) })
    
    const { db: mongoDb } = await connectToDatabase()
    const collection = mongoDb.collection(UNIFIED_COLLECTION)

    // Paginación
    const skip = (page - 1) * limit
    
    Logger.info('Executing MongoDB query...',{ skip, limit })
    
    const [publications, total] = await Promise.all([
      collection
        .find(mongoQuery)
        .sort(getUnifiedSort(sortBy))
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(mongoQuery)
    ])
    
    Logger.info('MongoDB query completed', { found: publications?.length, total })
    
    allPublications = (publications as Record<string, unknown>[]) || []
    totalCount = total || 0
    
    // Connection pooling: client is cached and reused, no need to close

    // Formatear datos para el frontend
    const formattedPublications = allPublications.map(p => {
      const anyDoc = p as Record<string, unknown>
      const id = (anyDoc._id as { toString: () => string } | undefined)?.toString() || (anyDoc.id as string | undefined)
      const pricing = (anyDoc.pricing as { amount?: number, currency?: string } | undefined) || {}
      const loc = (anyDoc.location as Record<string, unknown> | undefined) || {}
      const contact = (anyDoc.contact as Record<string, unknown> | undefined) || {}

      return {
        ...anyDoc,
        id,
        _id: id,
        category: (anyDoc.category as string) || (anyDoc.categorySlug as string) || '',
        categorySlug: (anyDoc.category as string) || '',
        subcategory: (anyDoc.subcategory as string) || '',
        subsubcategory: (anyDoc.subsubcategory as string) || '',
        // Location as structured object
        location: {
          reference: (loc.reference as string) || (loc.address as string) || '',
          district: (loc.district as string) || '',
          province: ((loc.province as string) || (loc.region as string) || '') as string,
          city: (loc.city as string) || (loc.department as string) || 'Cusco',
          country: (loc.country as string) || (loc.countryCode as string) === 'PE' ? 'Perú' : 'Perú'
        },
        // Keep fullLocation for backwards compatibility
        fullLocation: loc,
        // Location string for simple display
        locationString: [loc.district, (loc.province as string) || (loc.region as string), (loc.city as string) || (loc.department as string)]
          .filter(Boolean)
          .join(', ') || 'Cusco, Perú',
        price: pricing.amount ?? (anyDoc.price as number | undefined) ?? 0,
        value: pricing.amount ?? (anyDoc.price as number | undefined) ?? 0,
        amount: pricing.amount ?? 0,
        currency: pricing.currency || (anyDoc.currency as string) || 'PEN',
        images: Array.isArray(anyDoc.images) && (anyDoc.images as unknown[])?.length
          ? (anyDoc.images as string[])
          : [],
        status: (anyDoc.status as string) || 'active',
        createdAt: (anyDoc.source as { originalPublicationDate?: string } | undefined)?.originalPublicationDate || (anyDoc.createdAt as string) || new Date().toISOString(),
        contactName: (contact.name as string) || 'Contacto',
        contactPhone: Array.isArray(contact.phones) ? (contact.phones as string[])[0] || '' : '',
        whatsapp: Array.isArray(contact.phones) ? (contact.phones as string[])[0] || '' : '',
        district: (loc.district as string) || '',
        province: ((loc.province as string) || (loc.region as string) || '') as string,
        negotiable: (anyDoc.negotiable as boolean) || false,
        description: (anyDoc.description as string) || ''
      }
    })

    if (isDev) {
      Logger.info(`Returning ${formattedPublications.length} publications`, { 
        total: totalCount, 
        page, 
        category: category || 'all'
      })
    }

    const response = NextResponse.json({
      publications: formattedPublications,
      total: totalCount,
      page: page,
      pages: Math.ceil(totalCount / limit),
      success: true,
      hasMore: page * limit < totalCount
    })

    // Force no cache - critical for Vercel deployment
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Surrogate-Control', 'no-store')

    return response

  } catch (error) {
    const errorObj = error as Error;
    
    Logger.error('Critical error in GET /api/publications', { 
      error: errorObj.message,
      stack: isDev ? errorObj.stack : undefined
    })
    
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

    if (!data.category && !data.categorySlug) {
      return NextResponse.json(
        { error: 'Categoría inválida' },
        { status: 400 }
      )
    }

    // Conectar a la base de datos
    const { db } = await connectToDatabase()

    // Preparar documento para inserción
    const now = new Date()

    // Compute next sequentialId atomically using counters collection
    const counters = db.collection('counters')
    const seqDoc = await counters.findOneAndUpdate(
      { _id: 'adisos_sequential' } as any,
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' }
    )
    const sequentialId = seqDoc?.value?.seq ?? 1;

    const newPublication = {
      ...data,
      _id: generateObjectId(),
      sequentialId,
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
      source: {
        type: 'web_form',
        userAgent: request.headers.get('user-agent') || 'unknown'
      },
      metrics: {
        impressions: 0, cardClicks: 0, detailViews: 0, shares: 0, saves: 0, contactClicks: 0, chatInteractions: 0
      }
    }

    // Insert into unified collection
    const collection = db.collection(UNIFIED_COLLECTION)
    
    const result = await collection.insertOne(newPublication)
    
    if (!result.insertedId) {
      throw new Error('Failed to insert publication')
    }

    Logger.info('Publication created successfully', { 
      sequentialId,
      category: data.category || data.categorySlug,
      collection: UNIFIED_COLLECTION 
    })

    return NextResponse.json({
      success: true,
      publication: { ...newPublication, _id: result.insertedId.toString() },
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
function getUnifiedSort(sortBy: string): { [key: string]: SortDirection } {
  switch (sortBy) {
    case 'price_asc':
      return { 'pricing.amount': 1 as SortDirection }
    case 'price_desc':
      return { 'pricing.amount': -1 as SortDirection }
    case 'publicationDate':
    default:
      // Ordenar por fecha de publicación original si existe, luego por createdAt
      return { 'source.originalPublicationDate': -1 as SortDirection, createdAt: -1 as SortDirection }
  }
}