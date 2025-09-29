// @ts-nocheck

// src/app/api/debug/db/route.ts
import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Logging function
function log(message: string, data?: any) {
  console.log(`[DEBUG-DB] ${new Date().toISOString()}: ${message}`, data || '');
}

export async function GET() {
  log('=== DEBUG ENDPOINT CALLED ===');
  log('Environment:', process.env.NODE_ENV);
  log('MongoDB URI exists:', !!process.env.MONGODB_URI);
  log('MongoDB DB:', process.env.MONGODB_DB);
  
  try {
    log('Creating MongoDB client...');
    const client = new MongoClient(process.env.MONGODB_URI!);
    
    log('Connecting to MongoDB...');
    await client.connect();
    log('MongoDB connected successfully');
    
    const db = client.db(process.env.MONGODB_DB || 'buscadis');
    log('Database object created:', db.databaseName);
    
    const collection = db.collection('adisos');
    log('Collection object created: adisos');
    
    // Test basic connection
    log('Testing basic connection...');
    const count = await collection.countDocuments();
    log('Total documents count:', count);
    
    const sample = await collection.findOne();
    log('Sample document found:', !!sample);
    
    // Test specific queries
    log('Testing empleos query...');
    const empleosCount = await collection.countDocuments({ category: 'empleos' });
    log('Empleos documents count:', empleosCount);
    
    const empleosSample = await collection.findOne({ category: 'empleos' });
    log('Empleos sample found:', !!empleosSample);
    
    // Test the exact query used in the API
    log('Testing API query...');
    const apiQuery = { category: 'empleos' };
    const apiResults = await collection.find(apiQuery).limit(3).toArray();
    log('API query results count:', apiResults.length);
    
    log('Closing MongoDB connection...');
    await client.close();
    log('MongoDB connection closed');
    
    const response = {
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
      timestamp: new Date().toISOString(),
      // Additional debug info
      vercelRegion: process.env.VERCEL_REGION,
      nodeVersion: process.version,
      platform: process.platform
    };
    
    log('Returning successful response:', response);
    return NextResponse.json(response);
    
  } catch (error) {
    log('ERROR OCCURRED:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    const errorResponse = {
      success: false,
      error: error.message,
      errorType: error.name,
      stack: error.stack,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      vercelRegion: process.env.VERCEL_REGION,
      nodeVersion: process.version,
      platform: process.platform
    };
    
    log('Returning error response:', errorResponse);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}