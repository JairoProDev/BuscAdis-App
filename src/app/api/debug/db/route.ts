// @ts-nocheck


// src/app/api/debug/db/route.ts
import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    
    const db = client.db(process.env.MONGODB_DB || 'buscadis');
    const collection = db.collection('adisos');
    
    // Test basic connection
    const count = await collection.countDocuments();
    const sample = await collection.findOne();
    
    await client.close();
    
    return NextResponse.json({
      success: true,
      environment: process.env.NODE_ENV,
      database: process.env.MONGODB_DB,
      connectionString: process.env.MONGODB_URI?.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'),
      totalDocuments: count,
      sampleDocument: sample ? 'Found' : 'None',
      collectionName: 'adisos'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      environment: process.env.NODE_ENV
    }, { status: 500 });
  }
}