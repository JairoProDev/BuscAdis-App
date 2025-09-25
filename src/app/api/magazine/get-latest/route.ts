import { NextResponse } from 'next/server';
import { fetchLatestMagazine } from '@/features/magazine/services/magazine.service';

export async function GET() {
  try {
    const latestMagazine = await fetchLatestMagazine();
    
    if (!latestMagazine) {
      return NextResponse.json({ message: 'No magazines found' }, { status: 404 });
    }
    
    return NextResponse.json({ magazine: latestMagazine });
  } catch (error) {
    console.error('[Magazine API] Error fetching latest magazine:', error);
    return NextResponse.json(
      { message: 'Error fetching latest magazine', error: (error as Error).message },
      { status: 500 }
    );
  }
}