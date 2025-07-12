import { NextResponse } from 'next/server'
import { getMongoClient } from '@/lib/mongodb-server'

export async function POST(request: Request) {
  try {
    const { email, name, preferences } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const client = await getMongoClient();
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection('newsletter_subscribers');

    // Check if already subscribed
    const existing = await collection.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { error: 'Email already subscribed' },
        { status: 409 }
      );
    }

    // Add subscriber
    const subscriber = {
      email: email.toLowerCase(),
      name: name || '',
      preferences: preferences || {},
      subscribedAt: new Date(),
      status: 'active'
    };

    await collection.insertOne(subscriber);

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter'
    });

  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { email, preferences } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const client = await getMongoClient();
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection('newsletter_subscribers');

    const result = await collection.updateOne(
      { email: email.toLowerCase() },
      { 
        $set: { 
          preferences: preferences || {},
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully'
    });

  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const client = await getMongoClient();
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection('newsletter_subscribers');

    const result = await collection.deleteOne({ email: email.toLowerCase() });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed'
    });

  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 