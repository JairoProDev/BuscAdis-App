import { NextResponse } from 'next/server'
import { mongoDbQuery } from '@/lib/mongodb.server'

export const dynamic = 'force-dynamic' // Disable caching to ensure data is always fresh
export const runtime = 'nodejs' // Mark as server-side only

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    const userId = params.userId;

    // Search for existing profile
    const profilesResult = await mongoDbQuery('profiles', { id: userId }, {});
    let existingProfile = null;
    if (Array.isArray(profilesResult) && profilesResult.length > 0) {
      existingProfile = profilesResult[0];
    }

    if (!existingProfile) {
      return new NextResponse(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404 }
      );
    }

    return NextResponse.json(existingProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return new NextResponse(
      JSON.stringify({ error: `Failed to fetch profile: ${(error as Error).message}` }),
      { status: 500 }
    );
  }
} 