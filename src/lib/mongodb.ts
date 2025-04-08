/**
 * Main MongoDB entry point
 * This module re-exports the shared MongoDB client with dynamic imports
 * to avoid loading server-side code on the client
 */

/**
 * Dynamic MongoDB client that works in both server and client environments
 */

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Define types for our clients
interface MongoClientInterface {
  mongoFetch?: (endpoint: string, options: any) => Promise<any>;
  [key: string]: any;
}

// Dynamic import for browser environment
const getBrowserClient = async (): Promise<MongoClientInterface> => {
  const module = await import('./mongodb-browser');
  return module.default();
};

// Dynamic import for server environment
const getServerClient = async (): Promise<MongoClientInterface> => {
  const module = await import('./mongodb-server');
  return module.default();
};

// Export the appropriate client factory based on environment
export const getMongoClient = isBrowser ? getBrowserClient : getServerClient;

// Export the mongoFetch function for browser environments
export async function mongoFetch(endpoint: string, options = {}) {
  const client = await getMongoClient();
  if (client.mongoFetch) {
    return client.mongoFetch(endpoint, options);
  }
  throw new Error('mongoFetch not available in current environment');
}
