import { MongoClient } from 'mongodb';

// This is a singleton pattern to maintain a single connection to MongoDB
let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient>;

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// MongoDB connection URI from environment variable
const uri = process.env.MONGODB_URI || '';

if (!uri) {
  throw new Error(
    'Please define the MONGODB_URI environment variable'
  );
}

if (isBrowser) {
  // For browser environment - This is just a stub, we'll use the API endpoints
  // instead of direct MongoDB connections from the browser
  const mockPromise = Promise.resolve({} as MongoClient);
  clientPromise = mockPromise;
} else {
  // For Node.js environment (server-side)
  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri);
    clientPromise = client.connect();
  }
}

export default clientPromise;

// For browser safety, export a function to make API calls to MongoDB via our API routes
export const mongoFetch = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const response = await fetch(`${baseUrl}${endpoint}`, options);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching from MongoDB API:', error);
    throw error;
  }
}; 