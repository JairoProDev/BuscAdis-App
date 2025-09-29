// @ts-nocheck

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  console.log(`[TEST-API] ${new Date().toISOString()}: Test endpoint called`);
  
  return NextResponse.json({
    success: true,
    message: 'Test endpoint working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercelRegion: process.env.VERCEL_REGION,
    nodeVersion: process.version,
    platform: process.platform
  });
}
