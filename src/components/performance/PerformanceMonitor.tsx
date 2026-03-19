'use client';

import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

/**
 * Performance monitoring component for React 19
 * Tracks Core Web Vitals and custom metrics
 */
export function PerformanceMonitor() {
  const metricsRef = useRef<Partial<PerformanceMetrics>>({});

  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') return;

    // Measure First Contentful Paint
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          metricsRef.current.fcp = entry.startTime;
          console.log('FCP:', entry.startTime);
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['paint'] });
    } catch (e) {
      console.warn('Performance observer not supported');
    }

    // Measure Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      metricsRef.current.lcp = lastEntry.startTime;
      console.log('LCP:', lastEntry.startTime);
    });

    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP observer not supported');
    }

    // Measure Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      metricsRef.current.cls = clsValue;
      console.log('CLS:', clsValue);
    });

    try {
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS observer not supported');
    }

    // Measure First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        metricsRef.current.fid =
          (entry as any).processingStart - entry.startTime;
        console.log('FID:', metricsRef.current.fid);
      }
    });

    try {
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID observer not supported');
    }

    // Measure Time to First Byte
    const navigation = performance.getEntriesByType(
      'navigation',
    )[0] as PerformanceNavigationTiming;
    if (navigation) {
      metricsRef.current.ttfb =
        navigation.responseStart - navigation.requestStart;
      console.log('TTFB:', metricsRef.current.ttfb);
    }

    // Send metrics to analytics (example)
    const sendMetrics = () => {
      // Send to your analytics service
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'web_vitals', {
          event_category: 'Web Vitals',
          custom_map: {
            fcp: 'fcp',
            lcp: 'lcp',
            fid: 'fid',
            cls: 'cls',
            ttfb: 'ttfb',
          },
          fcp: metricsRef.current.fcp,
          lcp: metricsRef.current.lcp,
          fid: metricsRef.current.fid,
          cls: metricsRef.current.cls,
          ttfb: metricsRef.current.ttfb,
        });
      }
    };

    // Send metrics when page unloads
    window.addEventListener('beforeunload', sendMetrics);

    return () => {
      observer.disconnect();
      lcpObserver.disconnect();
      clsObserver.disconnect();
      fidObserver.disconnect();
      window.removeEventListener('beforeunload', sendMetrics);
    };
  }, []);

  // Component doesn't render anything
  return null;
}

/**
 * Custom hook for measuring render performance
 */
export function useRenderPerformance(componentName: string) {
  const renderStart = useRef<number>(0);
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current++;
    if (renderStart.current) {
      const renderTime = performance.now() - renderStart.current;
      console.log(
        `${componentName} render #${renderCount.current}: ${renderTime.toFixed(2)}ms`,
      );
    }
  });

  // Mark render start
  renderStart.current = performance.now();

  return {
    renderCount: renderCount.current,
  };
}

/**
 * Component to measure and display render performance (dev only)
 */
export function RenderProfiler({
  componentName,
  children,
}: {
  componentName: string;
  children: React.ReactNode;
}) {
  const { renderCount } = useRenderPerformance(componentName);

  if (process.env.NODE_ENV === 'development') {
    return (
      <div data-component={componentName} data-renders={renderCount}>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
