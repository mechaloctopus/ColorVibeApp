// Optimized Color Engine with Memoization and Performance Enhancements
import { hexToRgb, rgbToHsl, hslToHex, rgbToCmyk, rgbToLab } from './colorEngine';

// LRU Cache for color calculations
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    if (this.cache.has(key)) {
      const value = this.cache.get(key)!;
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }
}

// Global caches for different color operations
const colorConversionCache = new LRUCache<string, any>(500);
const paletteGenerationCache = new LRUCache<string, string[]>(200);
const colorAnalysisCache = new LRUCache<string, any>(300);

// Optimized color conversion with caching
export function optimizedHexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cached = colorConversionCache.get(`hex2rgb:${hex}`);
  if (cached) return cached;

  const result = hexToRgb(hex);
  if (result) {
    colorConversionCache.set(`hex2rgb:${hex}`, result);
  }
  return result;
}

export function optimizedRgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const key = `rgb2hsl:${r},${g},${b}`;
  const cached = colorConversionCache.get(key);
  if (cached) return cached;

  const result = rgbToHsl(r, g, b);
  colorConversionCache.set(key, result);
  return result;
}

export function optimizedHslToHex(h: number, s: number, l: number): string {
  const key = `hsl2hex:${h},${s},${l}`;
  const cached = colorConversionCache.get(key);
  if (cached) return cached;

  const result = hslToHex(h, s, l);
  colorConversionCache.set(key, result);
  return result;
}

// Batch color conversion for better performance
export function batchHslToHex(colors: Array<{ h: number; s: number; l: number }>): string[] {
  return colors.map(({ h, s, l }) => optimizedHslToHex(h, s, l));
}

// Optimized palette generation with caching
export function generateOptimizedPalette(
  baseHue: number,
  paletteType: string,
  saturation: number = 70,
  lightness: number = 50
): string[] {
  const key = `palette:${paletteType}:${baseHue}:${saturation}:${lightness}`;
  const cached = paletteGenerationCache.get(key);
  if (cached) return cached;

  let palette: string[] = [];

  switch (paletteType) {
    case 'complementary':
      palette = [
        optimizedHslToHex(baseHue, saturation, lightness),
        optimizedHslToHex((baseHue + 180) % 360, saturation, lightness),
      ];
      break;
    case 'triadic':
      palette = [
        optimizedHslToHex(baseHue, saturation, lightness),
        optimizedHslToHex((baseHue + 120) % 360, saturation, lightness),
        optimizedHslToHex((baseHue + 240) % 360, saturation, lightness),
      ];
      break;
    case 'tetradic':
      palette = [
        optimizedHslToHex(baseHue, saturation, lightness),
        optimizedHslToHex((baseHue + 90) % 360, saturation, lightness),
        optimizedHslToHex((baseHue + 180) % 360, saturation, lightness),
        optimizedHslToHex((baseHue + 270) % 360, saturation, lightness),
      ];
      break;
    case 'pentadic':
      for (let i = 0; i < 5; i++) {
        palette.push(optimizedHslToHex((baseHue + (i * 72)) % 360, saturation, lightness));
      }
      break;
    case 'hexadic':
      for (let i = 0; i < 6; i++) {
        palette.push(optimizedHslToHex((baseHue + (i * 60)) % 360, saturation, lightness));
      }
      break;
    case 'heptadic':
      for (let i = 0; i < 7; i++) {
        palette.push(optimizedHslToHex((baseHue + (i * 51.43)) % 360, saturation, lightness));
      }
      break;
    case 'octadic':
      for (let i = 0; i < 8; i++) {
        palette.push(optimizedHslToHex((baseHue + (i * 45)) % 360, saturation, lightness));
      }
      break;
    default:
      palette = [optimizedHslToHex(baseHue, saturation, lightness)];
  }

  paletteGenerationCache.set(key, palette);
  return palette;
}

// Optimized color analysis with caching
export interface OptimizedColorAnalysis {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  cmyk: { c: number; m: number; y: number; k: number };
  lab: { l: number; a: number; b: number };
  temperature: number;
  luminance: number;
  contrast: {
    white: number;
    black: number;
    wcagAA: boolean;
    wcagAAA: boolean;
  };
}

export function analyzeColorOptimized(hex: string): OptimizedColorAnalysis | null {
  const cached = colorAnalysisCache.get(hex);
  if (cached) return cached;

  const rgb = optimizedHexToRgb(hex);
  if (!rgb) return null;

  const hsl = optimizedRgbToHsl(rgb.r, rgb.g, rgb.b);
  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
  const lab = rgbToLab(rgb.r, rgb.g, rgb.b);

  // Calculate color temperature (optimized)
  const temperature = calculateOptimizedColorTemperature(rgb);
  
  // Calculate relative luminance (optimized)
  const luminance = calculateOptimizedRelativeLuminance(rgb);
  
  // Calculate contrast ratios
  const contrastWhite = calculateOptimizedContrastRatio(luminance, 1);
  const contrastBlack = calculateOptimizedContrastRatio(luminance, 0);

  const analysis: OptimizedColorAnalysis = {
    hex,
    rgb,
    hsl,
    cmyk,
    lab,
    temperature,
    luminance,
    contrast: {
      white: contrastWhite,
      black: contrastBlack,
      wcagAA: Math.max(contrastWhite, contrastBlack) >= 4.5,
      wcagAAA: Math.max(contrastWhite, contrastBlack) >= 7,
    },
  };

  colorAnalysisCache.set(hex, analysis);
  return analysis;
}

// Optimized color temperature calculation
function calculateOptimizedColorTemperature(rgb: { r: number; g: number; b: number }): number {
  const { r, g, b } = rgb;
  
  // Use bit shifting for faster division
  const rNorm = r * 0.00392156862745098; // r / 255
  const gNorm = g * 0.00392156862745098; // g / 255
  const bNorm = b * 0.00392156862745098; // b / 255
  
  const ratio = (rNorm - bNorm) / (rNorm + bNorm + 0.001);
  const temperature = 6500 + (ratio * 2000);
  
  return Math.max(2000, Math.min(10000, Math.round(temperature)));
}

// Optimized relative luminance calculation
function calculateOptimizedRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const { r, g, b } = rgb;
  
  // Pre-calculated constants for performance
  const rLinear = r <= 10 ? r * 0.0003035269835488375 : Math.pow((r * 0.003718420208023472 + 0.0513), 2.4);
  const gLinear = g <= 10 ? g * 0.0003035269835488375 : Math.pow((g * 0.003718420208023472 + 0.0513), 2.4);
  const bLinear = b <= 10 ? b * 0.0003035269835488375 : Math.pow((b * 0.003718420208023472 + 0.0513), 2.4);
  
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

// Optimized contrast ratio calculation
function calculateOptimizedContrastRatio(lum1: number, lum2: number): number {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private static measurements = new Map<string, number[]>();

  static startMeasurement(label: string): () => void {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      const duration = end - start;
      
      if (!this.measurements.has(label)) {
        this.measurements.set(label, []);
      }
      
      const measurements = this.measurements.get(label)!;
      measurements.push(duration);
      
      // Keep only last 100 measurements
      if (measurements.length > 100) {
        measurements.shift();
      }
    };
  }

  static getAverageTime(label: string): number {
    const measurements = this.measurements.get(label);
    if (!measurements || measurements.length === 0) return 0;
    
    const sum = measurements.reduce((a, b) => a + b, 0);
    return sum / measurements.length;
  }

  static getPerformanceReport(): Record<string, { average: number; count: number }> {
    const report: Record<string, { average: number; count: number }> = {};
    
    for (const [label, measurements] of this.measurements) {
      const sum = measurements.reduce((a, b) => a + b, 0);
      report[label] = {
        average: sum / measurements.length,
        count: measurements.length,
      };
    }
    
    return report;
  }

  static clearMeasurements(): void {
    this.measurements.clear();
  }
}

// Memory management utilities
export function clearColorCaches(): void {
  colorConversionCache.clear();
  paletteGenerationCache.clear();
  colorAnalysisCache.clear();
}

export function getCacheStats(): {
  conversions: number;
  palettes: number;
  analyses: number;
} {
  return {
    conversions: (colorConversionCache as any).size || 0,
    palettes: (paletteGenerationCache as any).size || 0,
    analyses: (colorAnalysisCache as any).size || 0,
  };
}

// Debounced function utility for performance
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttled function utility for performance
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
