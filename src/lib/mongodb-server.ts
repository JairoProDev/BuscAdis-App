/**
 * Server-side MongoDB client implementation
 * This uses the real MongoDB driver and is only imported on the server
 */

import { MongoClient } from 'mongodb';

// MongoDB connection string should be in environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'test';

// Create cached connection variable
let cachedClient: MongoClient | null = null;
let cachedDb: any = null;

// Create a new MongoDB client with connection pooling
export default async function getServerMongoClient() {
  // If we already have a connection, use it
  if (cachedClient && cachedDb) {
    return cachedClient;
  }

  // If no connection, create a new one
  if (!cachedClient) {
    cachedClient = new MongoClient(MONGODB_URI, {
      // Connection pooling options
      maxPoolSize: 10,
      minPoolSize: 5,
    });

    // Connect to the database
    await cachedClient.connect();
    cachedDb = cachedClient.db(MONGODB_DB);
  }

  return cachedClient;
} 