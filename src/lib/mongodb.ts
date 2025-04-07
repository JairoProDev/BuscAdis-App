/**
 * Main MongoDB entry point
 * This module re-exports the shared MongoDB client
 */
import getMongoClient, { mongoFetch } from './mongodb-shared';

export { mongoFetch };
export default getMongoClient; 

{/*
import { MongoClient } from 'mongodb';

// Extend the NodeJS global namespace to include _mongoClientPromise
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined; // Allows TypeScript to recognize this property globally
}

// URI and connection options
const uri = process.env.MONGO_URI || ''; // Ensure MONGO_URI is properly defined in your environment
const options = {}; // Add MongoDB client options if necessary

// Declare the MongoClient and promise
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Check if MONGO_URI is defined
if (!process.env.MONGO_URI) {
  throw new Error('Por favor define la variable MONGO_URI en tu archivo .env');
}

// Different handling for development and production environments
if (process.env.NODE_ENV === 'development') {
  // Use a global variable in development to prevent multiple connections during hot reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, always create a new connection
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
*/}