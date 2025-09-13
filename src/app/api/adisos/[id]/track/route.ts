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

    const seq = Number(id)
    if (!Number.isFinite(seq)) {
      return NextResponse.json({ success: false, message: 'Invalid sequentialId' }, { status: 400 })
    }

    const db = await getDb()
    const res = await db.collection(COLLECTION).updateOne({ sequentialId: seq }, { $inc: { [field]: 1 } })
    if (res.matchedCount === 0) {
      return NextResponse.json({ success: false, message: 'Adiso not found' }, { status: 404 })
    }
    // Optional interaction log with client metadata
    try {
      const userAgent = request.headers.get('user-agent') || ''
      const acceptLang = request.headers.get('accept-language') || ''
      const forwardedFor = request.headers.get('x-forwarded-for') || ''
      const userId = request.headers.get('x-user-id') || ''
      await db.collection('interactions').insertOne({
        adisoSequentialId: seq,
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
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}



