import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, Db } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI!
const MONGODB_DB = process.env.MONGODB_DB || 'buscadis'
const COLLECTION = 'adisos'

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

async function getDb() {
  if (cachedClient && cachedDb) return cachedDb
  const client = new MongoClient(MONGODB_URI)
  await client.connect()
  cachedClient = client
  cachedDb = client.db(MONGODB_DB)
  return cachedDb
}

export async function GET(request: NextRequest) {
  try {
    // Simple auth check: read user from localstorage is client-only; on server, expect header x-user-id (temporary)
    const userId = request.headers.get('x-user-id') || ''
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    const db = await getDb()
    const adisos = await db.collection(COLLECTION)
      .find({ advertiserId: userId })
      .project({ title: 1, status: 1, category: 1, createdAt: 1, sequentialId: 1 })
      .sort({ createdAt: -1 })
      .toArray()
    return NextResponse.json({ adisos })
  } catch (error) {
    console.error('Error fetching user adisos:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}



