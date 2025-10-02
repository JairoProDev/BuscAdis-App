import { NextRequest, NextResponse } from 'next/server';
import { mongoDbInsert, getMongoClient } from '@/lib/mongodb-server';

export async function POST(request: NextRequest) {
  try {
    const { publicationId, category, action, timestamp } = await request.json();

    // Validate required fields
    if (!publicationId || !category || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const client = await getMongoClient();
    const db = client.db();
    const collection = db.collection('analytics');

    // Create analytics record
    const analyticsRecord = {
      publicationId,
      category,
      action,
      timestamp: timestamp || new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || '',
      ip: request.headers.get('x-forwarded-for') || 
          request.headers.get('x-real-ip') || 
          'unknown',
      referer: request.headers.get('referer') || '',
      createdAt: new Date()
    };

    await collection.insertOne(analyticsRecord);

    // Update publication metrics
    const publicationsCollection = db.collection('adisos');
    await publicationsCollection.updateOne(
      { _id: publicationId },
      { 
        $inc: { 
          'metrics.contactClicks': 1,
          'metrics.cardClicks': 1
        },
        $set: { 
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const client = await getMongoClient();
    const db = client.db();
    const collection = db.collection('analytics');

    const { searchParams } = new URL(request.url);
    const publicationId = searchParams.get('publicationId');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Build query
    const query: any = {};
    if (publicationId) query.publicationId = publicationId;
    if (category) query.category = category;

    // Get analytics data
    const analytics = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    // Get aggregated metrics
    const metrics = await collection.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalClicks: { $sum: 1 },
          uniquePublications: { $addToSet: '$publicationId' },
          categories: { $addToSet: '$category' },
          lastClick: { $max: '$createdAt' }
        }
      }
    ]).toArray();

    return NextResponse.json({
      analytics,
      metrics: metrics[0] || {
        totalClicks: 0,
        uniquePublications: [],
        categories: [],
        lastClick: null
      }
    });
  } catch (error) {
    console.error('Analytics GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
