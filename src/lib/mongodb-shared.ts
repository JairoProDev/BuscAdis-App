/**
 * Shared MongoDB module that handles both server and client environments
 * This module detects the current environment and provides the appropriate MongoDB client
 */

// Import the server and browser clients
import getServerMongoClient from './mongodb-server';
import getBrowserMongoClient, { mongoFetch } from './mongodb-browser';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Export the appropriate client based on environment
const getMongoClient = isBrowser ? getBrowserMongoClient : getServerMongoClient;

// Also export mongoFetch for direct API calls from browser
export { mongoFetch };
export default getMongoClient; 