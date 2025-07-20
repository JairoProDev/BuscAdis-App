'use client';

import React, { useEffect, useState, useCallback } from 'react';

interface PerformanceMetrics {
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
  fcp: number;
}

interface PerformanceMonitorProps {
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
  showDebug?: boolean;
}

export default function PerformanceMonitor({ 
  onMetricsUpdate, 
  showDebug = false 
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: 0,
    fid: 0,
    cls: 0,
    ttfb: 0,
    fcp: 0,
  });

  const [isSupported, setIsSupported] = useState(false);

  // Verificar soporte de Web Vitals
  useEffect(() => {
    setIsSupported('PerformanceObserver' in window);
  }, []);

  // Medir LCP (Largest Contentful Paint)
  const measureLCP = useCallback(() => {
    if (!isSupported) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      if (lastEntry) {
        const lcp = lastEntry.startTime;
        setMetrics(prev => ({ ...prev, lcp }));
        onMetricsUpdate?.({ ...metrics, lcp });
      }
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  }, [isSupported, onMetricsUpdate, metrics]);

  // Medir FID (First Input Delay)
  const measureFID = useCallback(() => {
    if (!isSupported) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        const fid = (entry as any).processingStart - entry.startTime;
        setMetrics(prev => ({ ...prev, fid }));
        onMetricsUpdate?.({ ...metrics, fid });
      });
    });

    observer.observe({ entryTypes: ['first-input'] });
  }, [isSupported, onMetricsUpdate, metrics]);

  // Medir CLS (Cumulative Layout Shift)
  const measureCLS = useCallback(() => {
    if (!isSupported) return;

    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          setMetrics(prev => ({ ...prev, cls: clsValue }));
          onMetricsUpdate?.({ ...metrics, cls: clsValue });
        }
      });
    });

    observer.observe({ entryTypes: ['layout-shift'] });
  }, [isSupported, onMetricsUpdate, metrics]);

  // Medir TTFB (Time to First Byte)
  const measureTTFB = useCallback(() => {
    if (!isSupported) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry: any) => {
        if (entry.entryType === 'navigation') {
          const ttfb = entry.responseStart - entry.requestStart;
          setMetrics(prev => ({ ...prev, ttfb }));
          onMetricsUpdate?.({ ...metrics, ttfb });
        }
      });
    });

    observer.observe({ entryTypes: ['navigation'] });
  }, [isSupported, onMetricsUpdate, metrics]);

  // Medir FCP (First Contentful Paint)
  const measureFCP = useCallback(() => {
    if (!isSupported) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        const fcp = entry.startTime;
        setMetrics(prev => ({ ...prev, fcp }));
        onMetricsUpdate?.({ ...metrics, fcp });
      });
    });

    observer.observe({ entryTypes: ['first-contentful-paint'] });
  }, [isSupported, onMetricsUpdate, metrics]);

  // Inicializar mediciones
  useEffect(() => {
    if (!isSupported) return;

    measureLCP();
    measureFID();
    measureCLS();
    measureTTFB();
    measureFCP();
  }, [isSupported, measureLCP, measureFID, measureCLS, measureTTFB, measureFCP]);

  // Función para obtener el estado de rendimiento
  const getPerformanceStatus = (metric: keyof PerformanceMetrics, value: number) => {
    const thresholds = {
      lcp: { good: 2500, needsImprovement: 4000 },
      fid: { good: 100, needsImprovement: 300 },
      cls: { good: 0.1, needsImprovement: 0.25 },
      ttfb: { good: 800, needsImprovement: 1800 },
      fcp: { good: 1800, needsImprovement: 3000 },
    };

    const threshold = thresholds[metric];
    if (value <= threshold.good) return 'good';
    if (value <= threshold.needsImprovement) return 'needs-improvement';
    return 'poor';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-500';
      case 'needs-improvement': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (!showDebug) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-xs">
      <h3 className="font-bold mb-2">Performance Metrics</h3>
      <div className="space-y-1">
        {Object.entries(metrics).map(([key, value]) => {
          const status = getPerformanceStatus(key as keyof PerformanceMetrics, value);
          const color = getStatusColor(status);
          
          return (
            <div key={key} className="flex justify-between">
              <span className="uppercase">{key}:</span>
              <span className={color}>
                {value.toFixed(2)}ms
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 text-xs text-gray-400">
        {isSupported ? 'Web Vitals Supported' : 'Web Vitals Not Supported'}
      </div>
    </div>
  );
}

// Hook para usar métricas de rendimiento
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: 0,
    fid: 0,
    cls: 0,
    ttfb: 0,
    fcp: 0,
  });

  const handleMetricsUpdate = useCallback((newMetrics: PerformanceMetrics) => {
    setMetrics(newMetrics);
  }, []);

  return { metrics, handleMetricsUpdate };
} 