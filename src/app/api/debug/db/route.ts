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
    
    // Test specific queries
    const empleosCount = await collection.countDocuments({ category: 'empleos' });
    const empleosSample = await collection.findOne({ category: 'empleos' });
    
    // Test the exact query used in the API
    const apiQuery = { category: 'empleos' };
    const apiResults = await collection.find(apiQuery).limit(3).toArray();
    
    await client.close();
    
    return NextResponse.json({
      success: true,
      environment: process.env.NODE_ENV,
      database: process.env.MONGODB_DB,
      connectionString: process.env.MONGODB_URI?.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'),
      totalDocuments: count,
      empleosDocuments: empleosCount,
      sampleDocument: sample ? 'Found' : 'None',
      empleosSample: empleosSample ? 'Found' : 'None',
      apiQueryResults: apiResults.length,
      collectionName: 'adisos',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}