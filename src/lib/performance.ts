/**
 * PERFORMANCE MONITORING SYSTEM FOR BUSCADIS
 * 
 * This system provides:
 * 1. Core Web Vitals monitoring
 * 2. Custom performance metrics
 * 3. Real User Monitoring (RUM)
 * 4. Performance budgets
 * 5. Automatic optimization suggestions
 */

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
}

interface CoreWebVitals {
  CLS: number; // Cumulative Layout Shift
  FID: number; // First Input Delay
  FCP: number; // First Contentful Paint
  LCP: number; // Largest Contentful Paint
  TTFB: number; // Time to First Byte
}

interface PerformanceBudget {
  LCP: number; // ms
  FID: number; // ms
  CLS: number; // score
  FCP: number; // ms
  TTFB: number; // ms
  bundleSize: number; // bytes
  imageSize: number; // bytes
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const PERFORMANCE_BUDGET: PerformanceBudget = {
  LCP: 2500, // 2.5s
  FID: 100,  // 100ms
  CLS: 0.1,  // 0.1
  FCP: 1800, // 1.8s
  TTFB: 800, // 800ms
  bundleSize: 250000, // 250KB
  imageSize: 1000000, // 1MB
};

// ============================================================================
// CORE WEB VITALS MONITORING
// ============================================================================

class CoreWebVitalsMonitor {
  private metrics: Partial<CoreWebVitals> = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window === 'undefined') return;
    this.initializeObservers();
  }

  private initializeObservers(): void {
    // Largest Contentful Paint
    this.observeLCP();
    
    // First Input Delay
    this.observeFID();
    
    // Cumulative Layout Shift
    this.observeCLS();
    
    // First Contentful Paint
    this.observeFCP();
    
    // Time to First Byte
    this.observeTTFB();
  }

  private observeLCP(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        this.metrics.LCP = lastEntry.startTime;
        this.reportMetric('LCP', lastEntry.startTime);
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('LCP observation not supported:', error);
    }
  }

  private observeFID(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.metrics.FID = entry.processingStart - entry.startTime;
          this.reportMetric('FID', this.metrics.FID);
        });
      });
      
      observer.observe({ entryTypes: ['first-input'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('FID observation not supported:', error);
    }
  }

  private observeCLS(): void {
    if (!('PerformanceObserver' in window)) return;

    let clsValue = 0;
    
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.metrics.CLS = clsValue;
            this.reportMetric('CLS', clsValue);
          }
        });
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('CLS observation not supported:', error);
    }
  }

  private observeFCP(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.metrics.FCP = entry.startTime;
          this.reportMetric('FCP', entry.startTime);
        });
      });
      
      observer.observe({ entryTypes: ['paint'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('FCP observation not supported:', error);
    }
  }

  private observeTTFB(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const navEntry = entry as PerformanceNavigationTiming;
          if (navEntry.responseStart > 0) {
            this.metrics.TTFB = navEntry.responseStart - navEntry.requestStart;
            this.reportMetric('TTFB', this.metrics.TTFB);
          }
        });
      });
      
      observer.observe({ entryTypes: ['navigation'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('TTFB observation not supported:', error);
    }
  }

  private getRating(metric: keyof PerformanceBudget, value: number): 'good' | 'needs-improvement' | 'poor' {
    const budget = PERFORMANCE_BUDGET[metric];
    const thresholds = {
      LCP: { good: budget * 0.8, poor: budget * 1.2 },
      FID: { good: budget * 0.8, poor: budget * 1.2 },
      CLS: { good: budget * 0.8, poor: budget * 1.2 },
      FCP: { good: budget * 0.8, poor: budget * 1.2 },
      TTFB: { good: budget * 0.8, poor: budget * 1.2 },
    };

    if (value <= thresholds[metric as keyof typeof thresholds].good) {
      return 'good';
    } else if (value <= thresholds[metric as keyof typeof thresholds].poor) {
      return 'needs-improvement';
    } else {
      return 'poor';
    }
  }

  private reportMetric(name: string, value: number): void {
    const metric: PerformanceMetric = {
      name,
      value,
      rating: this.getRating(name as keyof PerformanceBudget, value),
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // Send to analytics
    this.sendToAnalytics(metric);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance Metric - ${name}:`, value, `(${metric.rating})`);
    }
  }

  private sendToAnalytics(metric: PerformanceMetric): void {
    // Send to Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'web_vitals', {
        metric_name: metric.name,
        metric_value: Math.round(metric.value),
        metric_rating: metric.rating,
        custom_map: {
          metric_id: metric.name,
        },
      });
    }

    // Send to custom analytics endpoint
    fetch('/api/analytics/performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metric),
    }).catch(error => {
      console.warn('Failed to send performance metric:', error);
    });
  }

  getMetrics(): Partial<CoreWebVitals> {
    return { ...this.metrics };
  }

  disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// ============================================================================
// CUSTOM PERFORMANCE METRICS
// ============================================================================

class CustomPerformanceMonitor {
  private marks: Map<string, number> = new Map();
  private measures: Map<string, number> = new Map();

  mark(name: string): void {
    if (typeof window === 'undefined') return;
    
    this.marks.set(name, performance.now());
    performance.mark(name);
  }

  measure(name: string, startMark?: string, endMark?: string): number {
    if (typeof window === 'undefined') return 0;

    try {
      let startTime: number;
      let endTime: number;

      if (startMark && endMark) {
        startTime = this.marks.get(startMark) || 0;
        endTime = this.marks.get(endMark) || performance.now();
      } else if (startMark) {
        startTime = this.marks.get(startMark) || 0;
        endTime = performance.now();
      } else {
        startTime = 0;
        endTime = performance.now();
      }

      const duration = endTime - startTime;
      this.measures.set(name, duration);
      
      performance.measure(name, startMark, endMark);
      
      return duration;
    } catch (error) {
      console.warn('Performance measure failed:', error);
      return 0;
    }
  }

  getMeasure(name: string): number | undefined {
    return this.measures.get(name);
  }

  getAllMeasures(): Record<string, number> {
    return Object.fromEntries(this.measures);
  }

  clearMarks(name?: string): void {
    if (name) {
      this.marks.delete(name);
      performance.clearMarks(name);
    } else {
      this.marks.clear();
      performance.clearMarks();
    }
  }

  clearMeasures(name?: string): void {
    if (name) {
      this.measures.delete(name);
      performance.clearMeasures(name);
    } else {
      this.measures.clear();
      performance.clearMeasures();
    }
  }
}

// ============================================================================
// PERFORMANCE OPTIMIZATION SUGGESTIONS
// ============================================================================

class PerformanceOptimizer {
  private suggestions: string[] = [];

  analyzeMetrics(metrics: Partial<CoreWebVitals>): string[] {
    this.suggestions = [];

    // LCP Analysis
    if (metrics.LCP && metrics.LCP > PERFORMANCE_BUDGET.LCP) {
      this.suggestions.push(
        `LCP is ${metrics.LCP.toFixed(0)}ms (budget: ${PERFORMANCE_BUDGET.LCP}ms). ` +
        'Consider optimizing images, using WebP format, implementing lazy loading, or reducing server response time.'
      );
    }

    // FID Analysis
    if (metrics.FID && metrics.FID > PERFORMANCE_BUDGET.FID) {
      this.suggestions.push(
        `FID is ${metrics.FID.toFixed(0)}ms (budget: ${PERFORMANCE_BUDGET.FID}ms). ` +
        'Consider reducing JavaScript execution time, breaking up long tasks, or using web workers.'
      );
    }

    // CLS Analysis
    if (metrics.CLS && metrics.CLS > PERFORMANCE_BUDGET.CLS) {
      this.suggestions.push(
        `CLS is ${metrics.CLS.toFixed(3)} (budget: ${PERFORMANCE_BUDGET.CLS}). ` +
        'Consider reserving space for images, avoiding dynamically injected content, or using font-display: swap.'
      );
    }

    // FCP Analysis
    if (metrics.FCP && metrics.FCP > PERFORMANCE_BUDGET.FCP) {
      this.suggestions.push(
        `FCP is ${metrics.FCP.toFixed(0)}ms (budget: ${PERFORMANCE_BUDGET.FCP}ms). ` +
        'Consider optimizing CSS delivery, reducing render-blocking resources, or using critical CSS inlining.'
      );
    }

    // TTFB Analysis
    if (metrics.TTFB && metrics.TTFB > PERFORMANCE_BUDGET.TTFB) {
      this.suggestions.push(
        `TTFB is ${metrics.TTFB.toFixed(0)}ms (budget: ${PERFORMANCE_BUDGET.TTFB}ms). ` +
        'Consider using a CDN, optimizing server response time, or implementing caching strategies.'
      );
    }

    return this.suggestions;
  }

  getOptimizationTips(): string[] {
    return [
      'Use Next.js Image component for automatic optimization',
      'Implement lazy loading for below-the-fold content',
      'Use WebP and AVIF image formats',
      'Minimize and compress CSS and JavaScript',
      'Use a Content Delivery Network (CDN)',
      'Implement service worker for caching',
      'Optimize font loading with font-display: swap',
      'Use HTTP/2 server push for critical resources',
      'Implement resource hints (preload, prefetch, preconnect)',
      'Monitor and optimize bundle size',
    ];
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const performanceMonitor = {
  coreWebVitals: new CoreWebVitalsMonitor(),
  custom: new CustomPerformanceMonitor(),
  optimizer: new PerformanceOptimizer(),
  budget: PERFORMANCE_BUDGET,
};

export default performanceMonitor;
