// Performance Monitoring Hook
// Centralized performance tracking for AI-assisted optimization

import { useEffect, useRef, useState } from 'react';
import { ConfigUtils } from '../config';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  animationFrameRate: number;
  touchResponseTime: number;
}

interface PerformanceConfig {
  enabled: boolean;
  sampleRate: number; // 0-1, percentage of operations to monitor
  alertThresholds: {
    renderTime: number; // ms
    memoryUsage: number; // MB
    frameRate: number; // fps
    touchResponse: number; // ms
  };
}

const DEFAULT_CONFIG: PerformanceConfig = {
  enabled: ConfigUtils.isFeatureEnabled('PERFORMANCE_MONITORING'),
  sampleRate: 0.1, // Monitor 10% of operations
  alertThresholds: {
    renderTime: 16.67, // 60fps target
    memoryUsage: 40, // MB
    frameRate: 55, // fps
    touchResponse: 20, // ms
  },
};

export const usePerformanceMonitoring = (
  componentName: string,
  config: Partial<PerformanceConfig> = {}
) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0,
    animationFrameRate: 60,
    touchResponseTime: 0,
  });
  
  const renderStartTime = useRef<number>(0);
  const frameCount = useRef<number>(0);
  const lastFrameTime = useRef<number>(0);
  const touchStartTime = useRef<number>(0);
  
  // Start render timing
  const startRenderTiming = () => {
    if (!finalConfig.enabled || Math.random() > finalConfig.sampleRate) return;
    renderStartTime.current = performance.now();
  };
  
  // End render timing
  const endRenderTiming = () => {
    if (!finalConfig.enabled || renderStartTime.current === 0) return;
    
    const renderTime = performance.now() - renderStartTime.current;
    renderStartTime.current = 0;
    
    setMetrics(prev => ({ ...prev, renderTime }));
    
    // Alert if render time exceeds threshold
    if (renderTime > finalConfig.alertThresholds.renderTime) {
      console.warn(`[Performance] ${componentName} render time: ${renderTime.toFixed(2)}ms (threshold: ${finalConfig.alertThresholds.renderTime}ms)`);
    }
  };
  
  // Track touch response time
  const startTouchTiming = () => {
    if (!finalConfig.enabled) return;
    touchStartTime.current = performance.now();
  };
  
  const endTouchTiming = () => {
    if (!finalConfig.enabled || touchStartTime.current === 0) return;
    
    const touchResponseTime = performance.now() - touchStartTime.current;
    touchStartTime.current = 0;
    
    setMetrics(prev => ({ ...prev, touchResponseTime }));
    
    // Alert if touch response exceeds threshold
    if (touchResponseTime > finalConfig.alertThresholds.touchResponse) {
      console.warn(`[Performance] ${componentName} touch response: ${touchResponseTime.toFixed(2)}ms (threshold: ${finalConfig.alertThresholds.touchResponse}ms)`);
    }
  };
  
  // Monitor animation frame rate
  const monitorFrameRate = () => {
    if (!finalConfig.enabled) return;
    
    const now = performance.now();
    frameCount.current++;
    
    if (lastFrameTime.current === 0) {
      lastFrameTime.current = now;
      return;
    }
    
    const deltaTime = now - lastFrameTime.current;
    if (deltaTime >= 1000) { // Calculate FPS every second
      const fps = (frameCount.current * 1000) / deltaTime;
      frameCount.current = 0;
      lastFrameTime.current = now;
      
      setMetrics(prev => ({ ...prev, animationFrameRate: fps }));
      
      // Alert if frame rate drops below threshold
      if (fps < finalConfig.alertThresholds.frameRate) {
        console.warn(`[Performance] ${componentName} frame rate: ${fps.toFixed(1)}fps (threshold: ${finalConfig.alertThresholds.frameRate}fps)`);
      }
    }
  };
  
  // Monitor memory usage (simplified)
  const monitorMemoryUsage = () => {
    if (!finalConfig.enabled) return;
    
    // In a real implementation, this would use actual memory monitoring
    // For now, we'll simulate based on component complexity
    const estimatedMemory = Math.random() * 20 + 10; // 10-30 MB simulation
    
    setMetrics(prev => ({ ...prev, memoryUsage: estimatedMemory }));
    
    // Alert if memory usage exceeds threshold
    if (estimatedMemory > finalConfig.alertThresholds.memoryUsage) {
      console.warn(`[Performance] ${componentName} memory usage: ${estimatedMemory.toFixed(1)}MB (threshold: ${finalConfig.alertThresholds.memoryUsage}MB)`);
    }
  };
  
  // Performance monitoring effect
  useEffect(() => {
    if (!finalConfig.enabled) return;
    
    const frameRateInterval = setInterval(monitorFrameRate, 100);
    const memoryInterval = setInterval(monitorMemoryUsage, 5000);
    
    return () => {
      clearInterval(frameRateInterval);
      clearInterval(memoryInterval);
    };
  }, [finalConfig.enabled]);
  
  // Log performance summary
  const logPerformanceSummary = () => {
    if (!finalConfig.enabled) return;
    
    console.group(`[Performance Summary] ${componentName}`);
    console.log(`Render Time: ${metrics.renderTime.toFixed(2)}ms`);
    console.log(`Memory Usage: ${metrics.memoryUsage.toFixed(1)}MB`);
    console.log(`Frame Rate: ${metrics.animationFrameRate.toFixed(1)}fps`);
    console.log(`Touch Response: ${metrics.touchResponseTime.toFixed(2)}ms`);
    console.log(`Cache Hit Rate: ${(metrics.cacheHitRate * 100).toFixed(1)}%`);
    console.groupEnd();
  };
  
  // Get performance status
  const getPerformanceStatus = (): 'excellent' | 'good' | 'poor' | 'critical' => {
    if (!finalConfig.enabled) return 'good';
    
    const issues = [
      metrics.renderTime > finalConfig.alertThresholds.renderTime,
      metrics.memoryUsage > finalConfig.alertThresholds.memoryUsage,
      metrics.animationFrameRate < finalConfig.alertThresholds.frameRate,
      metrics.touchResponseTime > finalConfig.alertThresholds.touchResponse,
    ].filter(Boolean).length;
    
    if (issues === 0) return 'excellent';
    if (issues === 1) return 'good';
    if (issues === 2) return 'poor';
    return 'critical';
  };
  
  // Performance optimization suggestions
  const getOptimizationSuggestions = (): string[] => {
    const suggestions: string[] = [];
    
    if (metrics.renderTime > finalConfig.alertThresholds.renderTime) {
      suggestions.push('Consider memoizing expensive calculations');
      suggestions.push('Reduce component re-renders with React.memo');
    }
    
    if (metrics.memoryUsage > finalConfig.alertThresholds.memoryUsage) {
      suggestions.push('Check for memory leaks in useEffect cleanup');
      suggestions.push('Optimize image and cache sizes');
    }
    
    if (metrics.animationFrameRate < finalConfig.alertThresholds.frameRate) {
      suggestions.push('Move animations to UI thread with Reanimated');
      suggestions.push('Reduce animation complexity');
    }
    
    if (metrics.touchResponseTime > finalConfig.alertThresholds.touchResponse) {
      suggestions.push('Optimize touch handlers with throttling');
      suggestions.push('Reduce synchronous operations in touch events');
    }
    
    return suggestions;
  };
  
  return {
    // Metrics
    metrics,
    
    // Timing functions
    startRenderTiming,
    endRenderTiming,
    startTouchTiming,
    endTouchTiming,
    
    // Analysis functions
    logPerformanceSummary,
    getPerformanceStatus,
    getOptimizationSuggestions,
    
    // Configuration
    isEnabled: finalConfig.enabled,
    config: finalConfig,
  };
};

// Performance monitoring context for global metrics
export const PerformanceMonitoringContext = {
  globalMetrics: new Map<string, PerformanceMetrics>(),
  
  registerComponent: (name: string, metrics: PerformanceMetrics) => {
    PerformanceMonitoringContext.globalMetrics.set(name, metrics);
  },
  
  getGlobalSummary: () => {
    const components = Array.from(PerformanceMonitoringContext.globalMetrics.entries());
    
    return {
      totalComponents: components.length,
      averageRenderTime: components.reduce((sum, [, metrics]) => sum + metrics.renderTime, 0) / components.length,
      averageMemoryUsage: components.reduce((sum, [, metrics]) => sum + metrics.memoryUsage, 0) / components.length,
      averageFrameRate: components.reduce((sum, [, metrics]) => sum + metrics.animationFrameRate, 0) / components.length,
      worstPerformers: components
        .sort(([, a], [, b]) => b.renderTime - a.renderTime)
        .slice(0, 3)
        .map(([name]) => name),
    };
  },
};

// Export types for TypeScript support
export type { PerformanceMetrics, PerformanceConfig };
