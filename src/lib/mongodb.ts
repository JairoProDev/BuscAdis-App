/**
 * Main MongoDB entry point
 * This module re-exports the shared MongoDB client with dynamic imports
 * to avoid loading server-side code on the client
 */

// Check environment to determine which module to use
const isBrowser = typeof window !== 'undefined';

// For browser environments, we'll use the browser-compatible version
// For server environments, we'll use the full MongoDB client
async function getDynamicMongoClient() {
  if (isBrowser) {
    // Dynamic import for browser-only code
    const { default: getBrowserMongoClient, mongoFetch } = await import('./mongodb-browser');
    return { 
      default: getBrowserMongoClient,
      mongoFetch
    };
  } else {
    // Dynamic import for server-only code
    const { default: getServerMongoClient } = await import('./mongodb-server');
    return { 
      default: getServerMongoClient,
      // Provide a dummy mongoFetch in server context for API consistency
      mongoFetch: async () => ({ error: 'mongoFetch is only available in browser environments' })
    };
  }
}

// Export a function that dynamically imports the appropriate client
export default async function getMongoClient() {
  const { default: client } = await getDynamicMongoClient();
  return client();
}

// Export the mongoFetch function for browser environments
export async function mongoFetch(endpoint: string, options = {}) {
  const { mongoFetch: fetchFn } = await getDynamicMongoClient();
  return fetchFn(endpoint, options);
}

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