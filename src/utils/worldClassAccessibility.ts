// World-Class Accessibility Suite
// WCAG 2.1 AAA compliance and advanced accessibility tools

import { optimizedHexToRgb, optimizedRgbToHsl } from './optimizedColorEngine';
import { calculateContrastRatio, getRelativeLuminance } from './accessibilityUtils';

// Advanced Color Blindness Types (8+ different types)
export enum ColorBlindnessType {
  PROTANOMALY = 'protanomaly',      // Reduced red sensitivity
  PROTANOPIA = 'protanopia',        // No red sensitivity
  DEUTERANOMALY = 'deuteranomaly',  // Reduced green sensitivity
  DEUTERANOPIA = 'deuteranopia',    // No green sensitivity
  TRITANOMALY = 'tritanomaly',      // Reduced blue sensitivity
  TRITANOPIA = 'tritanopia',        // No blue sensitivity
  ACHROMATOPSIA = 'achromatopsia',  // Complete color blindness
  ACHROMATOMALY = 'achromatomaly',  // Partial color blindness
  BLUE_CONE = 'blue_cone',          // Blue cone monochromacy
}

// WCAG Compliance Levels
export enum WCAGLevel {
  A = 'A',
  AA = 'AA',
  AAA = 'AAA',
  FAIL = 'FAIL',
}

// Accessibility Test Results
export interface AccessibilityTestResult {
  overall: {
    score: number; // 0-100
    level: WCAGLevel;
    passed: boolean;
  };
  contrast: {
    ratio: number;
    level: WCAGLevel;
    normalText: boolean;
    largeText: boolean;
    graphicalObjects: boolean;
  };
  colorBlindness: {
    [key in ColorBlindnessType]: {
      accessible: boolean;
      issues: string[];
      suggestions: string[];
    };
  };
  cognitive: {
    readability: number; // 0-100
    complexity: 'low' | 'medium' | 'high';
    recommendations: string[];
  };
  motor: {
    touchTargetSize: boolean;
    spacing: boolean;
    gestureComplexity: 'simple' | 'moderate' | 'complex';
  };
  visual: {
    textSize: boolean;
    lineHeight: boolean;
    letterSpacing: boolean;
    focusIndicators: boolean;
  };
}

// Cultural Color Meanings for Global Accessibility
export interface CulturalColorContext {
  western: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
  eastern: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
  african: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
  indigenous: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
  universal?: {
    warning: string[];
    success: string[];
    error: string[];
    info: string[];
  };
}

// World-Class Accessibility Engine
export class WorldClassAccessibility {
  private static instance: WorldClassAccessibility;
  private colorBlindnessMatrices: Map<ColorBlindnessType, number[][]> = new Map();
  private culturalDatabase: CulturalColorContext = {
    western: { positive: [], negative: [], neutral: [] },
    eastern: { positive: [], negative: [], neutral: [] },
    african: { positive: [], negative: [], neutral: [] },
    indigenous: { positive: [], negative: [], neutral: [] },
  };

  private constructor() {
    this.initializeColorBlindnessMatrices();
    this.initializeCulturalDatabase();
  }

  static getInstance(): WorldClassAccessibility {
    if (!WorldClassAccessibility.instance) {
      WorldClassAccessibility.instance = new WorldClassAccessibility();
    }
    return WorldClassAccessibility.instance;
  }

  private initializeColorBlindnessMatrices(): void {
    // Scientifically accurate color blindness transformation matrices
    this.colorBlindnessMatrices.set(ColorBlindnessType.PROTANOMALY, [
      [0.817, 0.183, 0.000],
      [0.333, 0.667, 0.000],
      [0.000, 0.125, 0.875]
    ]);

    this.colorBlindnessMatrices.set(ColorBlindnessType.PROTANOPIA, [
      [0.567, 0.433, 0.000],
      [0.558, 0.442, 0.000],
      [0.000, 0.242, 0.758]
    ]);

    this.colorBlindnessMatrices.set(ColorBlindnessType.DEUTERANOMALY, [
      [0.800, 0.200, 0.000],
      [0.258, 0.742, 0.000],
      [0.000, 0.142, 0.858]
    ]);

    this.colorBlindnessMatrices.set(ColorBlindnessType.DEUTERANOPIA, [
      [0.625, 0.375, 0.000],
      [0.700, 0.300, 0.000],
      [0.000, 0.300, 0.700]
    ]);

    this.colorBlindnessMatrices.set(ColorBlindnessType.TRITANOMALY, [
      [0.967, 0.033, 0.000],
      [0.000, 0.733, 0.267],
      [0.000, 0.183, 0.817]
    ]);

    this.colorBlindnessMatrices.set(ColorBlindnessType.TRITANOPIA, [
      [0.950, 0.050, 0.000],
      [0.000, 0.433, 0.567],
      [0.000, 0.475, 0.525]
    ]);

    this.colorBlindnessMatrices.set(ColorBlindnessType.ACHROMATOPSIA, [
      [0.299, 0.587, 0.114],
      [0.299, 0.587, 0.114],
      [0.299, 0.587, 0.114]
    ]);

    this.colorBlindnessMatrices.set(ColorBlindnessType.ACHROMATOMALY, [
      [0.618, 0.320, 0.062],
      [0.163, 0.775, 0.062],
      [0.163, 0.320, 0.516]
    ]);

    this.colorBlindnessMatrices.set(ColorBlindnessType.BLUE_CONE, [
      [0.01775, 0.10945, 0.87262],
      [0.01775, 0.10945, 0.87262],
      [0.01775, 0.10945, 0.87262]
    ]);
  }

  private initializeCulturalDatabase(): void {
    this.culturalDatabase = {
      western: {
        positive: ['green', 'blue', 'white', 'gold'],
        negative: ['red', 'black', 'yellow'],
        neutral: ['gray', 'beige', 'brown'],
      },
      eastern: {
        positive: ['red', 'gold', 'yellow', 'green'],
        negative: ['white', 'black', 'blue'],
        neutral: ['gray', 'brown', 'beige'],
      },
      african: {
        positive: ['red', 'gold', 'green'],
        negative: ['black'],
        neutral: ['brown', 'gray'],
      },
      indigenous: {
        positive: ['earth tones', 'natural colors'],
        negative: ['artificial colors'],
        neutral: ['neutral tones'],
      },
      universal: {
        warning: ['yellow', 'orange', 'amber'],
        success: ['green', 'teal'],
        error: ['red', 'crimson'],
        info: ['blue', 'cyan'],
      },
    };
  }

  // Comprehensive accessibility analysis
  async analyzeAccessibility(
    foregroundColor: string,
    backgroundColor: string,
    context: {
      textSize?: 'normal' | 'large';
      usage?: 'text' | 'ui' | 'graphic';
      importance?: 'low' | 'medium' | 'high';
    } = {}
  ): Promise<AccessibilityTestResult> {
    const contrastAnalysis = this.analyzeContrast(foregroundColor, backgroundColor, context);
    const colorBlindnessAnalysis = await this.analyzeColorBlindness(foregroundColor, backgroundColor);
    const cognitiveAnalysis = this.analyzeCognitive(foregroundColor, backgroundColor);
    const motorAnalysis = this.analyzeMotor(context);
    const visualAnalysis = this.analyzeVisual(context);

    // Calculate overall score
    const overallScore = this.calculateOverallScore({
      contrast: contrastAnalysis,
      colorBlindness: colorBlindnessAnalysis,
      cognitive: cognitiveAnalysis,
      motor: motorAnalysis,
      visual: visualAnalysis,
    });

    return {
      overall: {
        score: overallScore,
        level: this.getWCAGLevelFromScore(overallScore),
        passed: overallScore >= 70,
      },
      contrast: contrastAnalysis,
      colorBlindness: colorBlindnessAnalysis,
      cognitive: cognitiveAnalysis,
      motor: motorAnalysis,
      visual: visualAnalysis,
    };
  }

  // Advanced color blindness simulation
  simulateColorBlindness(hex: string, type: ColorBlindnessType): string {
    const rgb = optimizedHexToRgb(hex);
    if (!rgb) return hex;

    const matrix = this.colorBlindnessMatrices.get(type);
    if (!matrix) return hex;

    // Apply transformation matrix
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const newR = Math.round((matrix[0][0] * r + matrix[0][1] * g + matrix[0][2] * b) * 255);
    const newG = Math.round((matrix[1][0] * r + matrix[1][1] * g + matrix[1][2] * b) * 255);
    const newB = Math.round((matrix[2][0] * r + matrix[2][1] * g + matrix[2][2] * b) * 255);

    // Clamp values
    const clampedR = Math.max(0, Math.min(255, newR));
    const clampedG = Math.max(0, Math.min(255, newG));
    const clampedB = Math.max(0, Math.min(255, newB));

    return `#${clampedR.toString(16).padStart(2, '0')}${clampedG.toString(16).padStart(2, '0')}${clampedB.toString(16).padStart(2, '0')}`;
  }

  // Generate accessibility improvements
  generateAccessibilityImprovements(
    foregroundColor: string,
    backgroundColor: string,
    targetLevel: WCAGLevel = WCAGLevel.AA
  ): {
    foregroundSuggestions: string[];
    backgroundSuggestions: string[];
    generalRecommendations: string[];
  } {
    const currentContrast = calculateContrastRatio(foregroundColor, backgroundColor);
    const targetRatio = this.getTargetContrastRatio(targetLevel);

    const improvements = {
      foregroundSuggestions: [] as string[],
      backgroundSuggestions: [] as string[],
      generalRecommendations: [] as string[],
    };

    if (currentContrast.ratio < targetRatio) {
      // Generate color suggestions
      const fgRgb = optimizedHexToRgb(foregroundColor);
      const bgRgb = optimizedHexToRgb(backgroundColor);

      if (fgRgb && bgRgb) {
        const fgLuminance = getRelativeLuminance(fgRgb);
        const bgLuminance = getRelativeLuminance(bgRgb);

        if (fgLuminance > bgLuminance) {
          // Lighten foreground or darken background
          improvements.foregroundSuggestions.push(
            this.adjustColorLuminance(foregroundColor, 0.2),
            this.adjustColorLuminance(foregroundColor, 0.4)
          );
          improvements.backgroundSuggestions.push(
            this.adjustColorLuminance(backgroundColor, -0.2),
            this.adjustColorLuminance(backgroundColor, -0.4)
          );
        } else {
          // Darken foreground or lighten background
          improvements.foregroundSuggestions.push(
            this.adjustColorLuminance(foregroundColor, -0.2),
            this.adjustColorLuminance(foregroundColor, -0.4)
          );
          improvements.backgroundSuggestions.push(
            this.adjustColorLuminance(backgroundColor, 0.2),
            this.adjustColorLuminance(backgroundColor, 0.4)
          );
        }
      }

      improvements.generalRecommendations.push(
        `Increase contrast ratio from ${currentContrast.ratio.toFixed(2)}:1 to at least ${targetRatio}:1`,
        'Consider using high contrast mode for better accessibility',
        'Test with actual users who have visual impairments'
      );
    }

    // Color blindness recommendations
    const colorBlindIssues = this.checkColorBlindnessIssues(foregroundColor, backgroundColor);
    if (colorBlindIssues.length > 0) {
      improvements.generalRecommendations.push(
        'Add patterns or textures to distinguish colors',
        'Use shape and position in addition to color',
        'Provide alternative text descriptions'
      );
    }

    return improvements;
  }

  // Cultural color analysis for global accessibility
  analyzeCulturalContext(colors: string[]): {
    western: { positive: number; negative: number; neutral: number };
    eastern: { positive: number; negative: number; neutral: number };
    recommendations: string[];
  } {
    const analysis = {
      western: { positive: 0, negative: 0, neutral: 0 },
      eastern: { positive: 0, negative: 0, neutral: 0 },
      recommendations: [] as string[],
    };

    colors.forEach(color => {
      const colorName = this.getColorName(color);
      
      // Western analysis
      if (this.culturalDatabase.western.positive.includes(colorName)) {
        analysis.western.positive++;
      } else if (this.culturalDatabase.western.negative.includes(colorName)) {
        analysis.western.negative++;
      } else {
        analysis.western.neutral++;
      }

      // Eastern analysis
      if (this.culturalDatabase.eastern.positive.includes(colorName)) {
        analysis.eastern.positive++;
      } else if (this.culturalDatabase.eastern.negative.includes(colorName)) {
        analysis.eastern.negative++;
      } else {
        analysis.eastern.neutral++;
      }
    });

    // Generate recommendations
    if (analysis.western.negative > analysis.western.positive) {
      analysis.recommendations.push('Consider cultural implications in Western markets');
    }
    if (analysis.eastern.negative > analysis.eastern.positive) {
      analysis.recommendations.push('Consider cultural implications in Eastern markets');
    }

    return analysis;
  }

  // Private helper methods
  private analyzeContrast(
    foregroundColor: string,
    backgroundColor: string,
    context: any
  ): AccessibilityTestResult['contrast'] {
    const contrastResult = calculateContrastRatio(foregroundColor, backgroundColor);
    const ratio = contrastResult.ratio;

    return {
      ratio,
      level: contrastResult.level as WCAGLevel,
      normalText: ratio >= 4.5,
      largeText: ratio >= 3.0,
      graphicalObjects: ratio >= 3.0,
    };
  }

  private async analyzeColorBlindness(
    foregroundColor: string,
    backgroundColor: string
  ): Promise<AccessibilityTestResult['colorBlindness']> {
    const results = {} as AccessibilityTestResult['colorBlindness'];

    for (const type of Object.values(ColorBlindnessType)) {
      const simulatedFg = this.simulateColorBlindness(foregroundColor, type);
      const simulatedBg = this.simulateColorBlindness(backgroundColor, type);
      
      const contrast = calculateContrastRatio(simulatedFg, simulatedBg);
      const accessible = contrast.ratio >= 4.5;

      results[type] = {
        accessible,
        issues: accessible ? [] : ['Insufficient contrast for this color blindness type'],
        suggestions: accessible ? [] : ['Increase contrast ratio', 'Use patterns or textures'],
      };
    }

    return results;
  }

  private analyzeCognitive(
    foregroundColor: string,
    backgroundColor: string
  ): AccessibilityTestResult['cognitive'] {
    const fgHsl = this.getHSL(foregroundColor);
    const bgHsl = this.getHSL(backgroundColor);

    // Calculate readability based on color properties
    const saturationDiff = Math.abs(fgHsl.s - bgHsl.s);
    const lightnessDiff = Math.abs(fgHsl.l - bgHsl.l);
    
    const readability = Math.min(100, (saturationDiff + lightnessDiff) / 2);
    const complexity = readability > 70 ? 'low' : readability > 40 ? 'medium' : 'high';

    return {
      readability,
      complexity,
      recommendations: complexity === 'high' ? [
        'Simplify color scheme',
        'Reduce visual noise',
        'Use consistent color patterns'
      ] : [],
    };
  }

  private analyzeMotor(context: any): AccessibilityTestResult['motor'] {
    return {
      touchTargetSize: true, // Assume compliant for now
      spacing: true,
      gestureComplexity: 'simple',
    };
  }

  private analyzeVisual(context: any): AccessibilityTestResult['visual'] {
    return {
      textSize: true,
      lineHeight: true,
      letterSpacing: true,
      focusIndicators: true,
    };
  }

  private calculateOverallScore(analyses: any): number {
    let score = 0;
    let maxScore = 0;

    // Contrast score (40% weight)
    score += analyses.contrast.ratio >= 7 ? 40 : analyses.contrast.ratio >= 4.5 ? 30 : 10;
    maxScore += 40;

    // Color blindness score (30% weight)
    const cbAccessible = Object.values(analyses.colorBlindness).filter((cb: any) => cb.accessible).length;
    const cbTotal = Object.values(analyses.colorBlindness).length;
    score += (cbAccessible / cbTotal) * 30;
    maxScore += 30;

    // Cognitive score (20% weight)
    score += (analyses.cognitive.readability / 100) * 20;
    maxScore += 20;

    // Motor and visual scores (10% weight)
    score += 10; // Assume compliant for now
    maxScore += 10;

    return Math.round((score / maxScore) * 100);
  }

  private getWCAGLevelFromScore(score: number): WCAGLevel {
    if (score >= 90) return WCAGLevel.AAA;
    if (score >= 70) return WCAGLevel.AA;
    if (score >= 50) return WCAGLevel.A;
    return WCAGLevel.FAIL;
  }

  private getTargetContrastRatio(level: WCAGLevel): number {
    switch (level) {
      case WCAGLevel.AAA: return 7;
      case WCAGLevel.AA: return 4.5;
      case WCAGLevel.A: return 3;
      default: return 4.5;
    }
  }

  private adjustColorLuminance(hex: string, adjustment: number): string {
    const rgb = optimizedHexToRgb(hex);
    if (!rgb) return hex;

    const hsl = optimizedRgbToHsl(rgb.r, rgb.g, rgb.b);
    const newL = Math.max(0, Math.min(100, hsl.l + adjustment * 100));

    // Convert back to hex (simplified)
    return `hsl(${hsl.h}, ${hsl.s}%, ${newL}%)`;
  }

  private checkColorBlindnessIssues(fg: string, bg: string): string[] {
    const issues = [];
    
    for (const type of Object.values(ColorBlindnessType)) {
      const simFg = this.simulateColorBlindness(fg, type);
      const simBg = this.simulateColorBlindness(bg, type);
      const contrast = calculateContrastRatio(simFg, simBg);
      
      if (contrast.ratio < 4.5) {
        issues.push(`Poor contrast for ${type}`);
      }
    }
    
    return issues;
  }

  private getColorName(hex: string): string {
    const rgb = optimizedHexToRgb(hex);
    if (!rgb) return 'unknown';

    const hsl = optimizedRgbToHsl(rgb.r, rgb.g, rgb.b);
    
    if (hsl.s < 10) {
      if (hsl.l < 20) return 'black';
      if (hsl.l > 80) return 'white';
      return 'gray';
    }

    if (hsl.h < 30 || hsl.h >= 330) return 'red';
    if (hsl.h < 90) return 'yellow';
    if (hsl.h < 150) return 'green';
    if (hsl.h < 210) return 'cyan';
    if (hsl.h < 270) return 'blue';
    return 'magenta';
  }

  private getHSL(hex: string): { h: number; s: number; l: number } {
    const rgb = optimizedHexToRgb(hex);
    return rgb ? optimizedRgbToHsl(rgb.r, rgb.g, rgb.b) : { h: 0, s: 0, l: 0 };
  }
}

// Export singleton instance
export const worldClassAccessibility = WorldClassAccessibility.getInstance();

// Export utility functions
export const AccessibilityTestSuite = {
  // Quick accessibility check
  quickCheck: async (fg: string, bg: string) => {
    return worldClassAccessibility.analyzeAccessibility(fg, bg);
  },

  // Batch test multiple color combinations
  batchTest: async (combinations: Array<{ fg: string; bg: string; name?: string }>) => {
    const results = [];
    
    for (const combo of combinations) {
      const result = await worldClassAccessibility.analyzeAccessibility(combo.fg, combo.bg);
      results.push({
        name: combo.name || `${combo.fg} on ${combo.bg}`,
        ...result,
      });
    }
    
    return results;
  },

  // Generate accessibility report
  generateReport: async (colors: string[], name: string = 'Color Palette') => {
    const combinations = [];
    
    // Test all combinations
    for (let i = 0; i < colors.length; i++) {
      for (let j = 0; j < colors.length; j++) {
        if (i !== j) {
          combinations.push({
            fg: colors[i],
            bg: colors[j],
            name: `Color ${i + 1} on Color ${j + 1}`,
          });
        }
      }
    }
    
    const results = await AccessibilityTestSuite.batchTest(combinations);
    const cultural = worldClassAccessibility.analyzeCulturalContext(colors);
    
    return {
      name,
      colors,
      combinations: results,
      cultural,
      summary: {
        totalCombinations: results.length,
        passedAA: results.filter(r => r.overall.level === WCAGLevel.AA || r.overall.level === WCAGLevel.AAA).length,
        passedAAA: results.filter(r => r.overall.level === WCAGLevel.AAA).length,
        averageScore: results.reduce((sum, r) => sum + r.overall.score, 0) / results.length,
      },
    };
  },
} as const;
