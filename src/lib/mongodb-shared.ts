/**
 * Shared MongoDB utilities that work in both browser and server environments
 * This file provides interfaces and type definitions that can be used safely
 * in both environments without importing server-only code on the client.
 */

// MongoDB collection names
export const COLLECTIONS = {
  PUBLICATIONS_INMUEBLES: 'publications_inmuebles',
  PUBLICATIONS_EMPLEOS: 'publications_empleos',
  PUBLICATIONS_SERVICIOS: 'publications_servicios',
  PUBLICATIONS_VEHICULOS: 'publications_vehiculos',
  PUBLICATIONS_PRODUCTOS: 'publications_productos',
  PUBLICATIONS_EVENTOS: 'publications_eventos',
  PUBLICATIONS_NEGOCIOS: 'publications_negocios',
  PUBLICATIONS_COMUNIDAD: 'publications_comunidad',
  USERS: 'users',
}

// API endpoints for browser-side MongoDB access
export const API_ENDPOINTS = {
  PUBLICATIONS: '/api/publications',
  PUBLICATIONS_BY_ID: (id: string) => `/api/publications/${id}`,
  USER_PUBLICATIONS: (userId: string) => `/api/users/${userId}/publications`,
}

// Standard error message for common MongoDB errors
export const MONGODB_ERRORS = {
  CONNECTION_FAILED: 'Could not connect to database',
  DOCUMENT_NOT_FOUND: 'Document not found',
  INVALID_ID: 'Invalid document ID',
}

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