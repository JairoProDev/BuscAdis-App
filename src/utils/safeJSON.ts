/**
 * Safely parses a JSON string, returning a fallback value if parsing fails.
 * 
 * @param str - The JSON string to parse
 * @param fallback - The fallback value to return if parsing fails
 * @returns The parsed JSON object or the fallback value
 */
export function safeJSONParse<T>(str: string | null | undefined, fallback: T): T {
  if (!str) return fallback;
  try {
    return JSON.parse(str) as T;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return fallback;
  }
}

/**
 * Safely stringify a value to JSON, returning a fallback string if stringification fails.
 * 
 * @param value - The value to stringify
 * @param fallback - The fallback string to return if stringification fails
 * @returns The stringified JSON or the fallback string
 */
export function safeJSONStringify(value: unknown, fallback: string = '[]'): string {
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.error('Error stringifying to JSON:', error);
    return fallback;
  }
}

/**
 * Safely stores a value in localStorage as JSON.
 * 
 * @param key - The localStorage key
 * @param value - The value to store
 * @returns true if successful, false otherwise
 */
export function safeLocalStorageSet(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, safeJSONStringify(value));
    return true;
  } catch (error) {
    console.error(`Error storing ${key} in localStorage:`, error);
    return false;
  }
}

/**
 * Safely retrieves and parses a JSON value from localStorage.
 * 
 * @param key - The localStorage key
 * @param fallback - The fallback value to return if retrieval or parsing fails
 * @returns The parsed value or the fallback
 */
export function safeLocalStorageGet<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return safeJSONParse(item, fallback);
  } catch (error) {
    console.error(`Error retrieving ${key} from localStorage:`, error);
    return fallback;
  }
} 