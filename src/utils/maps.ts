/**
 * Maps utilities including geocoding and coordinate handling
 * Optimized to stay within Google Maps Platform free tier limits
 */

/**
 * Interface for standardized location coordinates
 */
export interface LocationCoordinates {
  lat: number;
  lng: number;
}

/**
 * Cache for geocoded addresses to reduce API calls
 */
const geocodeCache: Record<string, LocationCoordinates> = {};

/**
 * Geocode an address to coordinates using the Google Maps Geocoding API
 * Uses caching to minimize API calls and stay within free limits
 */
export async function geocodeAddress(address: string): Promise<LocationCoordinates | null> {
  // Return from cache if available
  if (geocodeCache[address]) {
    return geocodeCache[address];
  }
  
  // API key should be from env variables
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    console.error('Google Maps API key is missing');
    return null;
  }
  
  // Properly encode the address for URL
  const encodedAddress = encodeURIComponent(address);
  
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.warn(`Geocoding failed for address: ${address}`, data.status);
      return null;
    }
    
    const location = data.results[0].geometry.location;
    const coordinates: LocationCoordinates = {
      lat: location.lat,
      lng: location.lng
    };
    
    // Cache the result
    geocodeCache[address] = coordinates;
    
    return coordinates;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Calculate distance between two coordinate points in kilometers
 * Using Haversine formula
 */
export function calculateDistance(
  point1: LocationCoordinates,
  point2: LocationCoordinates
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = degreesToRadians(point2.lat - point1.lat);
  const dLon = degreesToRadians(point2.lng - point1.lng);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(point1.lat)) *
    Math.cos(degreesToRadians(point2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  
  return distance;
}

/**
 * Helper function to convert degrees to radians
 */
function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format a distance in a user-friendly way
 */
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${distance.toFixed(1)} km`;
} 