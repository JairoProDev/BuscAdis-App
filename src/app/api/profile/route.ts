import { NextResponse } from 'next/server'
import { mongoDbQuery, mongoDbInsert, mongoDbUpdate } from '@/lib/mongodb.server'

export const dynamic = 'force-dynamic' // Disable caching to ensure data is always fresh
export const runtime = 'nodejs' // Mark as server-side only

// Get or create profile
export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    if (!data.userId) {
      return NextResponse.json(
        { error: 'Se requiere un ID de usuario' },
        { status: 400 }
      )
    }
    
    // Search for existing profile
    const profiles = await mongoDbQuery('profiles', { id: data.userId }, {})
    const existingProfile = profiles.length > 0 ? profiles[0] : null
    
    if (existingProfile) {
      // Update existing profile
      const updateData = {
        fullName: data.fullName || existingProfile.fullName,
        phone: data.phone || existingProfile.phone,
        email: data.email || existingProfile.email,
        updatedAt: new Date().toISOString()
      }
      
      // Update directly with MongoDB
      await mongoDbUpdate('profiles', data.userId, updateData)
      
      return NextResponse.json({
        ...existingProfile,
        ...updateData
      })
    } else {
      // Create new profile
      const newProfile = {
        id: data.userId,
        fullName: data.fullName || '',
        phone: data.phone || '',
        email: data.email || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      // Insert directly with MongoDB
      await mongoDbInsert('profiles', newProfile)
      
      return NextResponse.json(newProfile)
    }
  } catch (error: any) {
    console.error('Error in profile API:', error)
    return NextResponse.json(
      { error: `Error en el servidor: ${error.message}` },
      { status: 500 }
    )
  }
} 