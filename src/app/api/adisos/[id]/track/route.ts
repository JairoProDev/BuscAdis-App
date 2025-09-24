import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, Db, ObjectId } from 'mongodb'

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

const EVENT_TO_FIELD: Record<string, string> = {
  detailView: 'metrics.detailViews',
  cardClick: 'metrics.cardClicks',
  contactClick: 'metrics.contactClicks',
  save: 'metrics.saves',
  share: 'metrics.shares',
  impression: 'metrics.impressions'
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const body = await request.json().catch(() => ({})) as { event?: string, client?: Record<string, unknown> }
    const event = body.event || 'detailView'
    const field = EVENT_TO_FIELD[event]
    if (!field) {
      return NextResponse.json({ success: false, message: 'Invalid event' }, { status: 400 })
    }

    const db = await getDb()
    
    // Try different search strategies to find the publication
    let publication = null
    const numericId = Number(id)
    
    // 1. Try by sequentialId (if numeric)
    if (Number.isFinite(numericId)) {
      publication = await db.collection(COLLECTION).findOne({ sequentialId: numericId })
    }
    
    // 2. Try by MongoDB ObjectId (if valid ObjectId format)
    if (!publication && /^[0-9a-fA-F]{24}$/.test(id)) {
      publication = await db.collection(COLLECTION).findOne({ _id: new ObjectId(id) })
    }
    
    // 3. Try by string id field
    if (!publication) {
      publication = await db.collection(COLLECTION).findOne({ id: id })
    }
    
    if (!publication) {
      return NextResponse.json({ success: false, message: 'Adiso not found' }, { status: 404 })
    }

    // Update metrics using the found publication's ID
    const updateQuery = publication._id ? { _id: publication._id } : 
                       publication.sequentialId ? { sequentialId: publication.sequentialId } : 
                       { id: publication.id }
    
    const res = await db.collection(COLLECTION).updateOne(updateQuery, { $inc: { [field]: 1 } })
    if (res.matchedCount === 0) {
      return NextResponse.json({ success: false, message: 'Failed to update metrics' }, { status: 500 })
    }
    // Optional interaction log with client metadata
    try {
      const userAgent = request.headers.get('user-agent') || ''
      const acceptLang = request.headers.get('accept-language') || ''
      const forwardedFor = request.headers.get('x-forwarded-for') || ''
      const userId = request.headers.get('x-user-id') || ''
      await db.collection('interactions').insertOne({
        adisoSequentialId: publication.sequentialId || publication._id || publication.id,
        event,
        createdAt: new Date(),
        userId: userId || undefined,
        client: {
          userAgent,
          acceptLang,
          forwardedFor,
          ...((body.client || {}) as Record<string, unknown>)
        }
      })
    } catch {}
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Tracking error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}



