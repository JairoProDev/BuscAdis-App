// @ts-nocheck

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  console.log(`[MIDDLEWARE] ${new Date().toISOString()}: ${request.method} ${request.url}`);
  
  // Log API requests specifically
  if (request.url.includes('/api/')) {
    console.log(`[MIDDLEWARE] API Request: ${request.url}`);
    console.log(`[MIDDLEWARE] Request headers:`, Object.fromEntries(request.headers.entries()));
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}