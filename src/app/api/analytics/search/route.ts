import { NextResponse } from 'next/server'
import { MongoClient, Db } from 'mongodb'
import { getMongoClient } from '@/lib/mongodb-server'
import type { SearchAnalytics, SearchSuggestion, TrendingSearch, CachedDatabase } from '@/types/api'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const MONGODB_URI = process.env.MONGODB_URI!
const MONGODB_DB = process.env.MONGODB_DB || 'buscadis'

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

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

export async function POST(request: Request) {
  try {
    const body: {
      query: string;
      filters?: Record<string, unknown>;
      userId?: string;
      sessionId?: string;
    } = await request.json();
    const { query, filters, userId, sessionId } = body;

    // Validate required fields
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Create search analytics entry
    const searchAnalytics: SearchAnalytics = {
      query: query.toLowerCase().trim(),
      filters: filters || {},
      userId: userId || null,
      sessionId: sessionId || null,
      timestamp: new Date(),
      userAgent: request.headers.get('user-agent') || '',
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '',
    };

    // Insert into database
    const client = await getMongoClient();
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection('search_analytics');

    await collection.insertOne(searchAnalytics);

    // Get search suggestions based on query
    const suggestions = await getSearchSuggestions(query);

    return NextResponse.json({
      success: true,
      suggestions,
      analytics: {
        query: searchAnalytics.query,
        timestamp: searchAnalytics.timestamp,
      }
    });

  } catch (error) {
    console.error('Search analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
  try {
    const client = await getMongoClient();
    const db = client.db(process.env.MONGODB_DB);
    
    // Search across multiple collections
    const collections = ['inmuebles', 'vehiculos', 'empleos', 'servicios', 'productos', 'eventos'];
    const suggestions: SearchSuggestion[] = [];

    for (const collectionName of collections) {
      const collection = db.collection(collectionName);
      
      // Search in title and description fields
      const results = await collection.find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ]
      }).limit(5).toArray();

      results.forEach((item: { title?: string; description?: string; _id: import('mongodb').ObjectId }) => {
        const text = item.title || item.description || '';
        if (text) {
          suggestions.push({
            text: text.substring(0, 100),
            type: collectionName,
            count: 1
          });
        }
      });
    }

    // Group and count suggestions
    const groupedSuggestions = suggestions.reduce((acc: Record<string, SearchSuggestion>, suggestion) => {
      const key = suggestion.text.toLowerCase();
      if (acc[key]) {
        acc[key].count += suggestion.count;
      } else {
        acc[key] = suggestion;
      }
      return acc;
    }, {});

    return Object.values(groupedSuggestions)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

  } catch (error) {
    console.error('Error getting search suggestions:', error);
    return [];
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
    if (!db) {
      throw new Error('Failed to connect to database')
    }
    const trends = db.collection('search_trends')

    // Calcular fecha de inicio
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const startDateStr = startDate.toISOString().split('T')[0]

    // Query para obtener trending searches
    const query: Record<string, unknown> = {
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