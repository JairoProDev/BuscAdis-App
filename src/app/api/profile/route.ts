import { NextResponse } from 'next/server'
import { mongoDbQuery, mongoDbInsert, mongoDbUpdate } from '@/lib/mongodb-server'

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
      // Update existing profile (merge all fields)
      const updateData = {
        fullName: data.fullName ?? existingProfile.fullName,
        phone: data.phone ?? existingProfile.phone,
        email: data.email ?? existingProfile.email,
        bio: data.bio ?? existingProfile.bio,
        avatarUrl: data.avatarUrl ?? existingProfile.avatarUrl,
        occupation: data.occupation ?? existingProfile.occupation,
        gender: data.gender ?? existingProfile.gender,
        birthdate: data.birthdate ?? existingProfile.birthdate,
        interests: data.interests ?? existingProfile.interests,
        socialLinks: data.socialLinks ?? existingProfile.socialLinks,
        badges: data.badges ?? existingProfile.badges,
        points: data.points ?? existingProfile.points,
        progress: data.progress ?? existingProfile.progress,
        updatedAt: new Date().toISOString()
      };
      await mongoDbUpdate('profiles', data.userId, updateData);
      return NextResponse.json({ ...existingProfile, ...updateData });
    } else {
      // Create new profile
      const newProfile = {
        id: data.userId,
        fullName: data.fullName || '',
        phone: data.phone || '',
        email: data.email || '',
        bio: data.bio || '',
        avatarUrl: data.avatarUrl || '',
        occupation: data.occupation || '',
        gender: data.gender || '',
        birthdate: data.birthdate || '',
        interests: data.interests || [],
        socialLinks: data.socialLinks || [],
        badges: data.badges || [],
        points: data.points || 0,
        progress: data.progress || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await mongoDbInsert('profiles', newProfile);
      return NextResponse.json(newProfile);
    }
  } catch (error: any) {
    console.error('Error in profile API:', error)
    return NextResponse.json(
      { error: `Error en el servidor: ${error.message}` },
      { status: 500 }
    )
  }
} 