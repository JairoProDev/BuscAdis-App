import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const MONGODB_URI = process.env.MONGODB_URI!
const MONGODB_DB = process.env.MONGODB_DB || 'buscadis'

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
    
    return { client, db }
  } catch (error) {
    console.error('Failed to connect to MongoDB', error)
    throw error
  }
}

export async function POST(request: Request) {
  try {
    const { query, category, resultsCount, timestamp, userAgent, location } = await request.json()

    if (!query?.trim()) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const searchAnalytics = db.collection('search_analytics')

    // Guardar la búsqueda
    const searchRecord = {
      query: query.trim().toLowerCase(),
      originalQuery: query.trim(),
      category: category || null,
      resultsCount: resultsCount || 0,
      timestamp: new Date(timestamp || Date.now()),
      userAgent,
      location,
      sessionId: generateSessionId(userAgent, timestamp),
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD para agregaciones
      hour: new Date().getHours(),
      dayOfWeek: new Date().getDay()
    }

    await searchAnalytics.insertOne(searchRecord)

    // Actualizar contadores de tendencias
    const trends = db.collection('search_trends')
    await trends.updateOne(
      { 
        query: query.trim().toLowerCase(),
        date: searchRecord.date 
      },
      { 
        $inc: { count: 1 },
        $set: { 
          lastSearched: new Date(),
          originalQuery: query.trim()
        }
      },
      { upsert: true }
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Search tracked successfully' 
    })

  } catch (error) {
    console.error('Error tracking search:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// Obtener trending searches
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const days = parseInt(searchParams.get('days') || '7')
    const limit = parseInt(searchParams.get('limit') || '10')

    const { db } = await connectToDatabase()
    const trends = db.collection('search_trends')

    // Calcular fecha de inicio
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const startDateStr = startDate.toISOString().split('T')[0]

    // Query para obtener trending searches
    const query: any = {
      date: { $gte: startDateStr },
      count: { $gte: 2 } // Mínimo 2 búsquedas para ser trending
    }

    const pipeline = [
      { $match: query },
      {
        $group: {
          _id: '$query',
          totalCount: { $sum: '$count' },
          originalQuery: { $first: '$originalQuery' },
          lastSearched: { $max: '$lastSearched' }
        }
      },
      { $sort: { totalCount: -1 } },
      { $limit: limit },
      {
        $project: {
          query: '$_id',
          originalQuery: 1,
          count: '$totalCount',
          lastSearched: 1,
          growth: { $literal: '+15%' }, // Placeholder para cálculo real
          trend: { $literal: 'up' }
        }
      }
    ]

    const trendingSearches = await trends.aggregate(pipeline).toArray()

    return NextResponse.json({ 
      trends: trendingSearches,
      period: `${days} days`,
      total: trendingSearches.length
    })

  } catch (error) {
    console.error('Error getting trending searches:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

function generateSessionId(userAgent: string, timestamp: string): string {
  const date = new Date(timestamp || Date.now())
  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  
  // Simple hash for session ID (día + userAgent simplificado)
  const hash = btoa(userAgent?.slice(0, 50) + dayStart.getTime())
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 16)
  
  return hash
} 