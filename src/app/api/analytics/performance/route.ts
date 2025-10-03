/**
 * PERFORMANCE ANALYTICS API ENDPOINT
 * 
 * This endpoint collects and stores performance metrics for analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { mongoDbInsert, getMongoClient } from '@/lib/mongodb-server';

// ============================================================================
// INTERFACES
// ============================================================================

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  url: string;
  userAgent: string;
  sessionId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

interface PerformanceReport {
  sessionId: string;
  userId?: string;
  url: string;
  userAgent: string;
  metrics: PerformanceMetric[];
  timestamp: number;
  pageLoadTime?: number;
  bundleSize?: number;
  imageCount?: number;
  totalImageSize?: number;
}

// ============================================================================
// POST - Store Performance Metrics
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const data: PerformanceMetric | PerformanceReport = await request.json();
    
    // Validate required fields
    if (!data.name && !data.sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const client = await getMongoClient();
    const db = client.db();
    const collection = db.collection('performance_metrics');

    // Prepare document for storage
    const document = {
      ...data,
      timestamp: data.timestamp || Date.now(),
      createdAt: new Date(),
      ip: request.headers.get('x-forwarded-for') || 
          request.headers.get('x-real-ip') || 
          'unknown',
      referer: request.headers.get('referer') || '',
      userAgent: data.userAgent || request.headers.get('user-agent') || '',
    };

    // Store in database
    await collection.insertOne(document);

    // Update aggregated metrics
    await updateAggregatedMetrics(db, data);

    return NextResponse.json({ 
      success: true,
      message: 'Performance metric stored successfully'
    });

  } catch (error) {
    console.error('Performance analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET - Retrieve Performance Analytics
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');
    const metric = searchParams.get('metric');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');

    const client = await getMongoClient();
    const db = client.db();
    const collection = db.collection('performance_metrics');

    // Build query
    const query: any = {};
    if (sessionId) query.sessionId = sessionId;
    if (userId) query.userId = userId;
    if (metric) query.name = metric;
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate).getTime();
      if (endDate) query.timestamp.$lte = new Date(endDate).getTime();
    }

    // Get metrics
    const metrics = await collection
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    // Get aggregated statistics
    const stats = await getAggregatedStats(db, query);

    return NextResponse.json({
      metrics,
      stats,
      count: metrics.length,
      query
    });

  } catch (error) {
    console.error('Performance analytics GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function updateAggregatedMetrics(db: any, data: PerformanceMetric | PerformanceReport): Promise<void> {
  try {
    const aggregatedCollection = db.collection('performance_aggregated');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dateKey = today.toISOString().split('T')[0];
    
    if ('name' in data) {
      // Single metric
      const metricName = data.name;
      
      await aggregatedCollection.updateOne(
        { 
          date: dateKey,
          metric: metricName 
        },
        {
          $inc: {
            count: 1,
            totalValue: data.value,
            [`rating.${data.rating}`]: 1
          },
          $set: {
            lastUpdated: new Date(),
            averageValue: 0 // Will be calculated
          }
        },
        { upsert: true }
      );
      
      // Calculate average
      const doc = await aggregatedCollection.findOne({ 
        date: dateKey, 
        metric: metricName 
      });
      
      if (doc) {
        await aggregatedCollection.updateOne(
          { _id: doc._id },
          { 
            $set: { 
              averageValue: doc.totalValue / doc.count 
            } 
          }
        );
      }
    } else {
      // Performance report
      await aggregatedCollection.updateOne(
        { 
          date: dateKey,
          type: 'report' 
        },
        {
          $inc: {
            reportCount: 1,
            totalPageLoadTime: data.pageLoadTime || 0,
            totalBundleSize: data.bundleSize || 0,
            totalImageCount: data.imageCount || 0,
            totalImageSize: data.totalImageSize || 0
          },
          $set: {
            lastUpdated: new Date()
          }
        },
        { upsert: true }
      );
    }
  } catch (error) {
    console.error('Failed to update aggregated metrics:', error);
  }
}

async function getAggregatedStats(db: any, query: any): Promise<any> {
  try {
    const collection = db.collection('performance_metrics');
    const aggregatedCollection = db.collection('performance_aggregated');
    
    // Get recent aggregated data
    const aggregated = await aggregatedCollection
      .find({})
      .sort({ date: -1 })
      .limit(30)
      .toArray();
    
    // Get real-time statistics
    const stats = await collection.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$name',
          count: { $sum: 1 },
          averageValue: { $avg: '$value' },
          minValue: { $min: '$value' },
          maxValue: { $max: '$value' },
          ratings: {
            $push: '$rating'
          }
        }
      }
    ]).toArray();
    
    // Calculate rating percentages
    const statsWithRatings = stats.map(stat => {
      const total = stat.ratings.length;
      const ratingCounts = stat.ratings.reduce((acc: any, rating: string) => {
        acc[rating] = (acc[rating] || 0) + 1;
        return acc;
      }, {});
      
      return {
        ...stat,
        ratingPercentages: {
          good: ((ratingCounts.good || 0) / total * 100).toFixed(1),
          needsImprovement: ((ratingCounts['needs-improvement'] || 0) / total * 100).toFixed(1),
          poor: ((ratingCounts.poor || 0) / total * 100).toFixed(1)
        }
      };
    });
    
    return {
      aggregated,
      realTime: statsWithRatings
    };
  } catch (error) {
    console.error('Failed to get aggregated stats:', error);
    return { aggregated: [], realTime: [] };
  }
}

// ============================================================================
// DELETE - Clear Old Metrics (Cleanup)
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const daysOld = parseInt(searchParams.get('daysOld') || '90');
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const client = await getMongoClient();
    const db = client.db();
    
    // Delete old metrics
    const metricsResult = await db.collection('performance_metrics')
      .deleteMany({ 
        timestamp: { $lt: cutoffDate.getTime() } 
      });
    
    // Delete old aggregated data
    const aggregatedResult = await db.collection('performance_aggregated')
      .deleteMany({ 
        date: { $lt: cutoffDate.toISOString().split('T')[0] } 
      });
    
    return NextResponse.json({
      success: true,
      message: `Cleaned up metrics older than ${daysOld} days`,
      deletedMetrics: metricsResult.deletedCount,
      deletedAggregated: aggregatedResult.deletedCount
    });
    
  } catch (error) {
    console.error('Performance cleanup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
