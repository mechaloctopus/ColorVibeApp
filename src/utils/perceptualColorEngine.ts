// Advanced Perceptual Color Engine - Ultra Premium Color Science
import { optimizedHexToRgb, optimizedRgbToHsl } from './optimizedColorEngine';

// CIECAM02 Color Appearance Model - Industry Standard
export interface ViewingConditions {
  whitePoint: { x: number; y: number; z: number };
  adaptingLuminance: number; // cd/m²
  backgroundLuminance: number; // cd/m²
  surroundCondition: 'dark' | 'dim' | 'average';
  discountingIlluminant: boolean;
}

export interface ColorAppearance {
  lightness: number; // J
  chroma: number; // C
  hue: number; // h
  brightness: number; // Q
  colorfulness: number; // M
  saturation: number; // s
}

// Simultaneous Contrast Engine
export interface ContrastContext {
  backgroundColor: string;
  surroundingColors: string[];
  adaptationLevel: number;
  contrastEffect: {
    hueDrift: number;
    saturationBoost: number;
    lightnessShift: number;
  };
}

// Temporal Color Memory Model
export interface ColorMemory {
  originalColor: string;
  timeElapsed: number; // seconds
  memoryStrength: number; // 0-1
  perceivedColor: string;
  confidenceLevel: number;
}

// Cultural Color Semantics
export interface CulturalColorMeaning {
  culture: string;
  color: string;
  meanings: string[];
  emotionalWeight: number;
  contextualUsage: string[];
  taboos: string[];
  celebrations: string[];
}

// Standard Viewing Conditions
export const VIEWING_CONDITIONS = {
  sRGB: {
    whitePoint: { x: 95.047, y: 100.0, z: 108.883 },
    adaptingLuminance: 64,
    backgroundLuminance: 20,
    surroundCondition: 'average' as const,
    discountingIlluminant: false,
  },
  print: {
    whitePoint: { x: 96.422, y: 100.0, z: 82.521 },
    adaptingLuminance: 160,
    backgroundLuminance: 32,
    surroundCondition: 'average' as const,
    discountingIlluminant: true,
  },
  darkRoom: {
    whitePoint: { x: 95.047, y: 100.0, z: 108.883 },
    adaptingLuminance: 16,
    backgroundLuminance: 3.2,
    surroundCondition: 'dark' as const,
    discountingIlluminant: false,
  },
} as const;

// Advanced Perceptual Color Engine
export class PerceptualColorEngine {
  private static memoryCache = new Map<string, ColorMemory>();
  private static contrastCache = new Map<string, ContrastContext>();
  
  // CIECAM02 Color Appearance Model
  static calculateColorAppearance(
    color: string, 
    viewingConditions: ViewingConditions = VIEWING_CONDITIONS.sRGB
  ): ColorAppearance {
    const rgb = optimizedHexToRgb(color);
    if (!rgb) throw new Error('Invalid color');
    
    // Convert RGB to XYZ
    const xyz = this.rgbToXyz(rgb);
    
    // Apply CIECAM02 forward transform
    const appearance = this.ciecam02Forward(xyz, viewingConditions);
    
    return appearance;
  }
  
  // Simultaneous Contrast Analysis
  static analyzeSimultaneousContrast(
    targetColor: string,
    backgroundColor: string,
    surroundingColors: string[] = []
  ): ContrastContext {
    const cacheKey = `${targetColor}-${backgroundColor}-${surroundingColors.join(',')}`;
    const cached = this.contrastCache.get(cacheKey);
    if (cached) return cached;
    
    const targetRgb = optimizedHexToRgb(targetColor)!;
    const backgroundRgb = optimizedHexToRgb(backgroundColor)!;
    
    // Calculate adaptation level based on background
    const backgroundLuminance = this.calculateRelativeLuminance(backgroundRgb);
    const adaptationLevel = Math.min(1, backgroundLuminance * 2);
    
    // Calculate contrast effects
    const contrastEffect = this.calculateContrastEffects(
      targetRgb,
      backgroundRgb,
      surroundingColors.map(c => optimizedHexToRgb(c)!),
      adaptationLevel
    );
    
    const context: ContrastContext = {
      backgroundColor,
      surroundingColors,
      adaptationLevel,
      contrastEffect,
    };
    
    this.contrastCache.set(cacheKey, context);
    return context;
  }
  
  // Apply Simultaneous Contrast Correction
  static applyContrastCorrection(color: string, context: ContrastContext): string {
    const rgb = optimizedHexToRgb(color)!;
    const hsl = optimizedRgbToHsl(rgb.r, rgb.g, rgb.b);
    
    // Apply perceptual corrections
    const correctedHsl = {
      h: (hsl.h + context.contrastEffect.hueDrift + 360) % 360,
      s: Math.max(0, Math.min(100, hsl.s * (1 + context.contrastEffect.saturationBoost))),
      l: Math.max(0, Math.min(100, hsl.l + context.contrastEffect.lightnessShift)),
    };
    
    return this.hslToHex(correctedHsl.h, correctedHsl.s, correctedHsl.l);
  }
  
  // Temporal Color Memory Simulation
  static simulateColorMemory(color: string, timeElapsed: number): ColorMemory {
    const cacheKey = `${color}-${Math.floor(timeElapsed)}`;
    const cached = this.memoryCache.get(cacheKey);
    if (cached) return cached;
    
    const rgb = optimizedHexToRgb(color)!;
    const hsl = optimizedRgbToHsl(rgb.r, rgb.g, rgb.b);
    
    // Memory decay model based on research
    const memoryStrength = Math.exp(-timeElapsed / 30); // 30-second half-life
    const confidenceLevel = Math.max(0.1, memoryStrength);
    
    // Colors fade toward neutral gray over time
    const grayPoint = 50; // Middle gray lightness
    const memoryFade = 1 - memoryStrength;
    
    const perceivedHsl = {
      h: hsl.h, // Hue is most stable in memory
      s: hsl.s * (1 - memoryFade * 0.3), // Saturation fades moderately
      l: hsl.l + (grayPoint - hsl.l) * memoryFade * 0.2, // Lightness drifts toward middle
    };
    
    const perceivedColor = this.hslToHex(perceivedHsl.h, perceivedHsl.s, perceivedHsl.l);
    
    const memory: ColorMemory = {
      originalColor: color,
      timeElapsed,
      memoryStrength,
      perceivedColor,
      confidenceLevel,
    };
    
    this.memoryCache.set(cacheKey, memory);
    return memory;
  }
  
  // Cultural Color Semantics Analysis
  static analyzeCulturalMeaning(color: string, culture: string = 'western'): CulturalColorMeaning {
    const rgb = optimizedHexToRgb(color)!;
    const hsl = optimizedRgbToHsl(rgb.r, rgb.g, rgb.b);
    
    // Simplified cultural analysis based on hue
    const meanings = this.getCulturalMeanings(hsl.h, culture);
    const emotionalWeight = this.calculateEmotionalWeight(hsl, culture);
    const contextualUsage = this.getContextualUsage(hsl.h, culture);
    const taboos = this.getCulturalTaboos(hsl.h, culture);
    const celebrations = this.getCulturalCelebrations(hsl.h, culture);
    
    return {
      culture,
      color,
      meanings,
      emotionalWeight,
      contextualUsage,
      taboos,
      celebrations,
    };
  }
  
  // Advanced Color Harmony with Perceptual Weighting
  static generatePerceptualHarmony(
    baseColor: string,
    harmonyType: string,
    viewingConditions: ViewingConditions = VIEWING_CONDITIONS.sRGB
  ): string[] {
    const baseAppearance = this.calculateColorAppearance(baseColor, viewingConditions);
    const harmony: string[] = [baseColor];
    
    switch (harmonyType) {
      case 'perceptual-complementary':
        // Use perceptual hue instead of mathematical hue
        const compHue = (baseAppearance.hue + 180) % 360;
        harmony.push(this.appearanceToHex(baseAppearance.lightness, baseAppearance.chroma, compHue));
        break;
        
      case 'perceptual-triadic':
        for (let i = 1; i < 3; i++) {
          const triadicHue = (baseAppearance.hue + i * 120) % 360;
          harmony.push(this.appearanceToHex(baseAppearance.lightness, baseAppearance.chroma, triadicHue));
        }
        break;
        
      case 'lightness-series':
        // Generate series based on perceptual lightness steps
        const lightnessSteps = [20, 35, 50, 65, 80];
        lightnessSteps.forEach(lightness => {
          if (Math.abs(lightness - baseAppearance.lightness) > 5) {
            harmony.push(this.appearanceToHex(lightness, baseAppearance.chroma, baseAppearance.hue));
          }
        });
        break;
        
      case 'chroma-series':
        // Generate series based on perceptual chroma steps
        const chromaSteps = [10, 30, 50, 70, 90];
        chromaSteps.forEach(chroma => {
          if (Math.abs(chroma - baseAppearance.chroma) > 5) {
            harmony.push(this.appearanceToHex(baseAppearance.lightness, chroma, baseAppearance.hue));
          }
        });
        break;
    }
    
    return harmony;
  }
  
  // Helper Methods
  private static rgbToXyz(rgb: { r: number; g: number; b: number }): { x: number; y: number; z: number } {
    // sRGB to XYZ conversion with gamma correction
    let r = rgb.r / 255;
    let g = rgb.g / 255;
    let b = rgb.b / 255;
    
    // Apply gamma correction
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
    
    // sRGB to XYZ matrix
    const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
    const y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
    const z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;
    
    return { x: x * 100, y: y * 100, z: z * 100 };
  }
  
  private static ciecam02Forward(
    xyz: { x: number; y: number; z: number },
    conditions: ViewingConditions
  ): ColorAppearance {
    // Simplified CIECAM02 implementation
    // In production, would use full CIECAM02 transform
    
    const { x, y, z } = xyz;
    const { adaptingLuminance, backgroundLuminance } = conditions;
    
    // Calculate basic appearance attributes
    const lightness = 100 * Math.pow(y / conditions.whitePoint.y, 0.42);
    const chroma = Math.sqrt(Math.pow(x - conditions.whitePoint.x, 2) + Math.pow(z - conditions.whitePoint.z, 2)) / 2;
    const hue = Math.atan2(z - conditions.whitePoint.z, x - conditions.whitePoint.x) * 180 / Math.PI;
    const brightness = lightness * Math.sqrt(adaptingLuminance / 64);
    const colorfulness = chroma * Math.pow(adaptingLuminance / 64, 0.25);
    const saturation = colorfulness / brightness * 100;
    
    return {
      lightness: Math.max(0, Math.min(100, lightness)),
      chroma: Math.max(0, chroma),
      hue: (hue + 360) % 360,
      brightness: Math.max(0, brightness),
      colorfulness: Math.max(0, colorfulness),
      saturation: Math.max(0, Math.min(100, saturation)),
    };
  }
  
  private static calculateContrastEffects(
    target: { r: number; g: number; b: number },
    background: { r: number; g: number; b: number },
    surrounding: { r: number; g: number; b: number }[],
    adaptationLevel: number
  ) {
    const targetHsl = optimizedRgbToHsl(target.r, target.g, target.b);
    const backgroundHsl = optimizedRgbToHsl(background.r, background.g, background.b);
    
    // Calculate hue drift (colors shift away from background hue)
    let hueDrift = 0;
    const hueDifference = Math.abs(targetHsl.h - backgroundHsl.h);
    if (hueDifference < 30) {
      hueDrift = (30 - hueDifference) * 0.5 * adaptationLevel;
      if (targetHsl.h > backgroundHsl.h) hueDrift = -hueDrift;
    }
    
    // Calculate saturation boost (colors appear more saturated on neutral backgrounds)
    const backgroundSaturation = backgroundHsl.s;
    const saturationBoost = (100 - backgroundSaturation) / 100 * 0.2 * adaptationLevel;
    
    // Calculate lightness shift (colors shift away from background lightness)
    let lightnessShift = 0;
    const lightnessDifference = Math.abs(targetHsl.l - backgroundHsl.l);
    if (lightnessDifference < 20) {
      lightnessShift = (20 - lightnessDifference) * 0.3 * adaptationLevel;
      if (targetHsl.l > backgroundHsl.l) lightnessShift = -lightnessShift;
    }
    
    return { hueDrift, saturationBoost, lightnessShift };
  }
  
  private static calculateRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
    const { r, g, b } = rgb;
    const rLinear = r <= 10 ? r / 3294 : Math.pow((r / 269 + 0.0513), 2.4);
    const gLinear = g <= 10 ? g / 3294 : Math.pow((g / 269 + 0.0513), 2.4);
    const bLinear = b <= 10 ? b / 3294 : Math.pow((b / 269 + 0.0513), 2.4);
    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  }
  
  private static getCulturalMeanings(hue: number, culture: string): string[] {
    // Simplified cultural color meanings
    const meanings: Record<string, Record<string, string[]>> = {
      western: {
        red: ['passion', 'danger', 'love', 'energy'],
        orange: ['enthusiasm', 'creativity', 'warmth'],
        yellow: ['happiness', 'optimism', 'caution'],
        green: ['nature', 'growth', 'harmony', 'money'],
        blue: ['trust', 'stability', 'calm', 'professional'],
        purple: ['luxury', 'mystery', 'spirituality'],
        pink: ['femininity', 'romance', 'playfulness'],
      },
      eastern: {
        red: ['luck', 'prosperity', 'celebration', 'joy'],
        orange: ['spirituality', 'sacred', 'courage'],
        yellow: ['imperial', 'wisdom', 'earth'],
        green: ['harmony', 'balance', 'health'],
        blue: ['immortality', 'healing', 'wood'],
        purple: ['nobility', 'spiritual awareness'],
        pink: ['marriage', 'love', 'honor'],
      },
    };
    
    const colorName = this.hueToColorName(hue);
    return meanings[culture]?.[colorName] || ['neutral', 'balanced'];
  }
  
  private static calculateEmotionalWeight(hsl: { h: number; s: number; l: number }, culture: string): number {
    // Higher saturation and extreme lightness values have more emotional weight
    const saturationWeight = hsl.s / 100;
    const lightnessWeight = Math.abs(hsl.l - 50) / 50;
    return (saturationWeight + lightnessWeight) / 2;
  }
  
  private static getContextualUsage(hue: number, culture: string): string[] {
    const colorName = this.hueToColorName(hue);
    const usage: Record<string, string[]> = {
      red: ['warnings', 'call-to-action', 'branding', 'celebrations'],
      blue: ['corporate', 'technology', 'healthcare', 'trust-building'],
      green: ['environmental', 'financial', 'health', 'growth'],
      yellow: ['attention', 'optimism', 'children', 'food'],
      purple: ['luxury', 'beauty', 'spirituality', 'creativity'],
      orange: ['energy', 'sports', 'food', 'enthusiasm'],
      pink: ['beauty', 'fashion', 'romance', 'youth'],
    };
    return usage[colorName] || ['general', 'neutral'];
  }
  
  private static getCulturalTaboos(hue: number, culture: string): string[] {
    // Simplified - would be much more comprehensive in production
    if (culture === 'eastern' && this.hueToColorName(hue) === 'white') {
      return ['mourning', 'death', 'funerals'];
    }
    return [];
  }
  
  private static getCulturalCelebrations(hue: number, culture: string): string[] {
    const colorName = this.hueToColorName(hue);
    if (culture === 'eastern' && colorName === 'red') {
      return ['Chinese New Year', 'weddings', 'festivals'];
    }
    if (culture === 'western' && colorName === 'green') {
      return ['St. Patrick\'s Day', 'Christmas', 'Earth Day'];
    }
    return [];
  }
  
  private static hueToColorName(hue: number): string {
    if (hue < 15 || hue >= 345) return 'red';
    if (hue < 45) return 'orange';
    if (hue < 75) return 'yellow';
    if (hue < 165) return 'green';
    if (hue < 195) return 'cyan';
    if (hue < 255) return 'blue';
    if (hue < 285) return 'purple';
    if (hue < 315) return 'magenta';
    return 'pink';
  }
  
  private static hslToHex(h: number, s: number, l: number): string {
    const hNorm = h / 360;
    const sNorm = s / 100;
    const lNorm = l / 100;
    
    const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
    const x = c * (1 - Math.abs((hNorm * 6) % 2 - 1));
    const m = lNorm - c / 2;
    
    let r, g, b;
    if (hNorm < 1/6) { r = c; g = x; b = 0; }
    else if (hNorm < 2/6) { r = x; g = c; b = 0; }
    else if (hNorm < 3/6) { r = 0; g = c; b = x; }
    else if (hNorm < 4/6) { r = 0; g = x; b = c; }
    else if (hNorm < 5/6) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    
    const rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
    const gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
    const bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0');
    
    return `#${rHex}${gHex}${bHex}`;
  }
  
  private static appearanceToHex(lightness: number, chroma: number, hue: number): string {
    // Simplified conversion from CIECAM02 appearance to hex
    // In production, would use proper inverse CIECAM02 transform
    const s = Math.min(100, chroma * 2);
    const l = Math.min(100, lightness);
    return this.hslToHex(hue, s, l);
  }
}
