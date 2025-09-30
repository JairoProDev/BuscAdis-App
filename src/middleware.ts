/**
 * Middleware
 * 
 * Handles request logging and monitoring.
 * In production, only logs errors and important events.
 * In development, logs all requests for debugging.
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const isDev = process.env.NODE_ENV === 'development'

export function middleware(request: NextRequest) {
  // Only log in development, exclude health checks and metrics
  if (isDev && !request.url.includes('/metrics') && !request.url.includes('/health')) {
    console.log(`[${request.method}] ${request.url}`)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
    * Match all request paths except for the ones starting with:
    * - _next/static (static files)
    * - _next/image (image optimization files)  
    * - favicon.ico (favicon file)
    */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}