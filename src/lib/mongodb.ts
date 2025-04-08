/**
 * Main MongoDB entry point
 * This file provides a safe way to use MongoDB in both client and server environments
 * without bundling server-only code on the client.
 */

import { API_ENDPOINTS } from './mongodb-shared';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Safe MongoDB client interface that works in both environments
export interface MongoClientInterface {
  // Public methods that can be called from anywhere
  fetchPublications: (options: any) => Promise<any>;
  fetchPublicationById: (id: string) => Promise<any>;
  fetchPublicationsByUser: (userId: string) => Promise<any>;
  createPublication: (data: any) => Promise<any>;
  updatePublication: (id: string, data: any) => Promise<any>;
  deletePublication: (id: string) => Promise<any>;
}

/**
 * Get the appropriate MongoDB client based on the environment
 */
export async function getMongoClient(): Promise<MongoClientInterface> {
  if (isBrowser) {
    // In the browser, return a fetch-based client that calls API routes
    return {
      fetchPublications: async (options = {}) => {
        // Build query params
        const params = new URLSearchParams();
        Object.entries(options).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
            
        // Fetch from API
        const response = await fetch(`${API_ENDPOINTS.PUBLICATIONS}?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        return await response.json();
      },
      
      fetchPublicationById: async (id) => {
        const response = await fetch(API_ENDPOINTS.PUBLICATIONS_BY_ID(id));
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        return await response.json();
      },
      
      fetchPublicationsByUser: async (userId) => {
        const response = await fetch(API_ENDPOINTS.USER_PUBLICATIONS(userId));
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        return await response.json();
      },
      
      createPublication: async (data) => {
        const response = await fetch(API_ENDPOINTS.PUBLICATIONS, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        return await response.json();
      },
      
      updatePublication: async (id, data) => {
        const response = await fetch(API_ENDPOINTS.PUBLICATIONS_BY_ID(id), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        return await response.json();
      },
      
      deletePublication: async (id) => {
        const response = await fetch(API_ENDPOINTS.PUBLICATIONS_BY_ID(id), {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        return await response.json();
      }
    };
  } else {
    // On the server, dynamically import the server-side MongoDB client
    // This ensures the MongoDB code is not bundled with client-side code
    const { default: getServerClient } = await import('./mongodb-server');
    return await getServerClient();
  }
}
