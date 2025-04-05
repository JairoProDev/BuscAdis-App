/**
 * Main MongoDB entry point
 * This module re-exports the shared MongoDB client
 */
import getMongoClient, { mongoFetch } from './mongodb-shared';

export { mongoFetch };
export default getMongoClient; 