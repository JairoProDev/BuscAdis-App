import { NextResponse } from 'next/server'
import { MongoClient, Db } from 'mongodb'
import type { CachedDatabase } from '@/types/api'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const MONGODB_URI = process.env.MONGODB_URI!
const MONGODB_DB = process.env.MONGODB_DB || 'buscadis'

// Cache simple en memoria para sugerencias frecuentes
const suggestionCache = new Map<string, { data: { suggestions: Suggestion[]; query: string; category: string; hasMore: boolean }; timestamp: number }>()
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutos

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

interface Suggestion {
  id: string;
  text: string;
  type: 'recent' | 'trending' | 'ai' | 'category';
  score: number;
  category?: string;
  count?: number;
  examples?: string[];
}

async function connectToDatabase(): Promise<CachedDatabase> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  try {
    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    
    const db = client.db(MONGODB_DB)
    
    cachedClient = client
    cachedDb = db
    
    return { client, db }
  } catch (error) {
    console.error('Failed to connect to MongoDB', error)
    throw error
  }
}

// Sugerencias estáticas por categoría para fallback
const categoryBasedSuggestions = {
  inmuebles: [
    'departamento en alquiler',
    'casa en venta', 
    'oficinas comerciales',
    'terrenos',
    'locales comerciales',
    'departamento amoblado',
    'casa con jardín',
    'loft moderno',
    'penthouse',
    'estudio'
  ],
  vehiculos: [
    'autos usados',
    'camionetas 4x4', 
    'motos',
    'vehículos comerciales',
    'repuestos',
    'auto automático',
    'camioneta diesel',
    'moto lineal',
    'auto sedan',
    'pickup'
  ],
  empleos: [
    'trabajo remoto',
    'desarrollador web',
    'vendedor',
    'administrativo', 
    'profesionales IT',
    'marketing digital',
    'contabilidad',
    'enfermería',
    'ingeniería',
    'turismo'
  ],
  servicios: [
    'plomero',
    'electricista',
    'jardinero',
    'profesor particular',
    'diseñador gráfico',
    'limpieza hogar',
    'mecánico automotriz',
    'carpintero',
    'pintor',
    'chef a domicilio'
  ],
  productos: [
    'laptop gaming',
    'celular smartphone',
    'muebles hogar',
    'electrodomésticos',
    'ropa fashion',
    'libros educativos',
    'instrumentos musicales',
    'equipos deporte',
    'herramientas trabajo',
    'productos belleza'
  ]
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.toLowerCase().trim() || ''
    const category = searchParams.get('category')?.toLowerCase() || ''
    const limit = parseInt(searchParams.get('limit') || '8')

    // Verificar cache
    const cacheKey = `${query}-${category}-${limit}`
    const cached = suggestionCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data)
    }

    const suggestions: Suggestion[] = []

    if (query.length >= 2) {
      // Obtener sugerencias inteligentes de la base de datos
      try {
        const { db } = await connectToDatabase()
        
        if (!db) {
          throw new Error('Database connection failed')
        }
        
        // 1. Sugerencias de búsquedas populares/recientes
        const trends = db.collection('search_trends')
        const popularSearches = await trends.find({
          query: { $regex: query, $options: 'i' },
          count: { $gte: 2 }
        })
        .sort({ count: -1 })
        .limit(3)
        .toArray()

        suggestions.push(...popularSearches.map((item: Record<string, unknown>): Suggestion => ({
          id: `popular-${item._id as string}`,
          text: (item.originalQuery as string) || (item.query as string),
          type: 'trending',
          score: item.count as number,
          count: item.count as number
        })))

        // 2. Sugerencias de títulos de publicaciones existentes desde la colección unificada
        try {
          const collection = db.collection('adisos')
          
          // Construir filtro de categoría si se especifica
          const matchFilter: Record<string, unknown> = {
            $or: [
              { title: { $regex: query, $options: 'i' } },
              { description: { $regex: query, $options: 'i' } }
            ],
            status: 'active'
          }

          // Agregar filtro de categoría si se especifica
          if (category) {
            matchFilter.category = category
          }
          
          const publicationSuggestions = await collection.aggregate([
            {
              $match: matchFilter
            },
            {
              $project: {
                title: 1,
                category: 1,
                words: { $split: ['$title', ' '] }
              }
            },
            { $unwind: '$words' },
            {
              $match: {
                words: { $regex: `^${query}`, $options: 'i' }
              }
            },
            {
              $group: {
                _id: { $toLower: '$words' },
                count: { $sum: 1 },
                examples: { $addToSet: '$title' },
                categories: { $addToSet: '$category' }
              }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
          ]).toArray()

          suggestions.push(...publicationSuggestions.map((item: Record<string, unknown>): Suggestion => ({
            id: `word-${item._id as string}`,
            text: item._id as string,
            type: 'ai',
            score: item.count as number,
            category: Array.isArray(item.categories) ? item.categories[0] as string : undefined,
            examples: (item.examples as string[]).slice(0, 2)
          })))

        } catch (err) {
          console.warn('Error searching in unified adisos collection:', err)
        }

      } catch (dbError) {
        console.warn('Database error, using fallback suggestions:', dbError)
      }
    }

    // 3. Sugerencias estáticas como fallback
    const staticSuggestions = category && categoryBasedSuggestions[category as keyof typeof categoryBasedSuggestions]
      ? categoryBasedSuggestions[category as keyof typeof categoryBasedSuggestions]
      : Object.values(categoryBasedSuggestions).flat()

    const filteredStatic = staticSuggestions
      .filter(suggestion => 
        query ? suggestion.toLowerCase().includes(query) : true
      )
      .slice(0, Math.max(0, limit - suggestions.length))
      .map((suggestion, index): Suggestion => ({
        id: `static-${category}-${index}`,
        text: suggestion,
        type: 'category',
        score: 1,
        category
      }))

    suggestions.push(...filteredStatic)

    // Remover duplicados y ordenar por relevancia
    const uniqueSuggestions = suggestions
      .reduce((acc: Suggestion[], current: Suggestion) => {
        const exists = acc.find(item => 
          item.text.toLowerCase() === current.text.toLowerCase()
        )
        if (!exists) {
          acc.push(current)
        } else if (current.score > exists.score) {
          // Reemplazar con mejor score
          const index = acc.indexOf(exists)
          acc[index] = current
        }
        return acc
      }, [])
      .sort((a: Suggestion, b: Suggestion) => b.score - a.score)
      .slice(0, limit)

    const result = {
      suggestions: uniqueSuggestions,
      query,
      category,
      hasMore: uniqueSuggestions.length === limit
    }

    // Guardar en cache
    suggestionCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    })

    // Limpiar cache viejo periódicamente
    if (suggestionCache.size > 1000) {
      const cutoff = Date.now() - CACHE_DURATION
      for (const [key, value] of suggestionCache.entries()) {
        if (value.timestamp < cutoff) {
          suggestionCache.delete(key)
        }
      }
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error generating suggestions:', error)
    
    // Fallback básico en caso de error
    const { searchParams } = new URL(request.url)
    const queryParam = searchParams.get('q') || ''
    const fallbackSuggestions: Suggestion[] = queryParam 
      ? ['buscar ' + queryParam, queryParam + ' en venta', queryParam + ' usado', queryParam + ' nuevo']
          .map((text, index) => ({
            id: `fallback-${index}`,
            text,
            type: 'category',
            score: 1
          }))
      : []

    return NextResponse.json({
      suggestions: fallbackSuggestions,
      query: queryParam,
      category: searchParams.get('category') || '',
      hasMore: false,
      error: 'Partial functionality available'
    })
  }
} 