import { NextResponse } from 'next/server'
import { mongoDbGetById } from '@/lib/mongodb.server'

export const dynamic = 'force-dynamic' // Disable caching to ensure data is always fresh
export const runtime = 'nodejs' // Mark as server-side only

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    
    // Get publication by ID using server-side MongoDB utility
    const publication = await mongoDbGetById('publications', id)
    
    if (!publication) {
      return new NextResponse(
        JSON.stringify({ error: 'Publication not found' }),
        { status: 404 }
      )
    }
    
    return NextResponse.json(publication)
  } catch (error) {
    console.error('Error fetching publication:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch publication' }),
      { status: 500 }
    )
  }
} 