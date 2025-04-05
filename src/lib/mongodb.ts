// When imported, this will return either the real MongoDB client (server-side)
// or a mock client (client-side) that will prevent browser-specific errors
import clientPromise, { mongoFetch } from './mongodb-adapter';

export { mongoFetch };
export default clientPromise; 