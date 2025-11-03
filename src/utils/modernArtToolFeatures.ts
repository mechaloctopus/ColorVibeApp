// Modern Art Tool Features Integration
// Features inspired by Procreate, Adobe Creative Suite, Clip Studio Paint, etc.

import { optimizedHexToRgb, optimizedRgbToHsl, optimizedHslToHex } from './optimizedColorEngine';

// Color Sampling & Eyedropper (like Procreate/Photoshop)
export interface ColorSample {
  color: string;
  position: { x: number; y: number };
  timestamp: Date;
  context: 'image' | 'camera' | 'manual';
  metadata?: {
    imageName?: string;
    dominantColors?: string[];
    colorHarmony?: string;
  };
}

// Brush Color Libraries (like Procreate brush sets)
export interface ColorBrushSet {
  id: string;
  name: string;
  colors: string[];
  brushType: 'watercolor' | 'oil' | 'acrylic' | 'digital' | 'pencil' | 'marker';
  opacity: number;
  blendMode: 'normal' | 'multiply' | 'overlay' | 'soft-light' | 'hard-light';
  texture?: string;
  created: Date;
  tags: string[];
}

// Material Color Matching (like Clip Studio Paint)
export interface MaterialColorMatch {
  materialType: 'fabric' | 'metal' | 'wood' | 'stone' | 'skin' | 'nature' | 'food';
  baseColor: string;
  variations: {
    highlight: string;
    midtone: string;
    shadow: string;
    reflected: string;
  };
  lightingCondition: 'daylight' | 'tungsten' | 'fluorescent' | 'candlelight' | 'moonlight';
  surfaceProperties: {
    roughness: number; // 0-100
    metallic: number; // 0-100
    subsurface: number; // 0-100
  };
}

// Design System Color Tokens (like Figma/Sketch)
export interface DesignSystemToken {
  name: string;
  value: string;
  category: 'primary' | 'secondary' | 'accent' | 'neutral' | 'semantic' | 'surface';
  usage: string[];
  darkModeVariant?: string;
  contrastRatios: {
    onLight: number;
    onDark: number;
  };
  aliases?: string[]; // Alternative names
  deprecated?: boolean;
  replacedBy?: string;
}

// Color Memory & Learning System (AI-powered like Adobe Sensei)
export interface ColorMemoryEntry {
  color: string;
  frequency: number;
  contexts: string[];
  associations: string[];
  lastUsed: Date;
  userRating: number; // 1-5 stars
  aiSuggestions: string[];
  harmonicPartners: string[];
}

// Modern Art Tool Features Engine
export class ModernArtToolFeatures {
  private static instance: ModernArtToolFeatures;
  private colorSamples: ColorSample[] = [];
  private brushSets: ColorBrushSet[] = [];
  private materialLibrary: MaterialColorMatch[] = [];
  private designTokens: DesignSystemToken[] = [];
  private colorMemory: Map<string, ColorMemoryEntry> = new Map();

  private constructor() {
    this.initializeDefaultBrushSets();
    this.initializeMaterialLibrary();
    this.initializeDesignTokens();
  }

  static getInstance(): ModernArtToolFeatures {
    if (!ModernArtToolFeatures.instance) {
      ModernArtToolFeatures.instance = new ModernArtToolFeatures();
    }
    return ModernArtToolFeatures.instance;
  }

  // Advanced Color Sampling (like Procreate eyedropper)
  async sampleColorFromImage(
    imageData: ImageData,
    x: number,
    y: number,
    sampleSize: number = 1
  ): Promise<ColorSample> {
    const samples: string[] = [];
    const halfSize = Math.floor(sampleSize / 2);

    // Sample area around the point
    for (let dy = -halfSize; dy <= halfSize; dy++) {
      for (let dx = -halfSize; dx <= halfSize; dx++) {
        const pixelX = Math.max(0, Math.min(imageData.width - 1, x + dx));
        const pixelY = Math.max(0, Math.min(imageData.height - 1, y + dy));
        const index = (pixelY * imageData.width + pixelX) * 4;

        const r = imageData.data[index];
        const g = imageData.data[index + 1];
        const b = imageData.data[index + 2];
        const a = imageData.data[index + 3];

        if (a > 0) { // Only sample non-transparent pixels
          const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
          samples.push(hex);
        }
      }
    }

    // Calculate average color
    const avgColor = this.calculateAverageColor(samples);
    
    // Extract dominant colors from the sample area
    const dominantColors = this.extractDominantColors(samples);

    const colorSample: ColorSample = {
      color: avgColor,
      position: { x, y },
      timestamp: new Date(),
      context: 'image',
      metadata: {
        dominantColors,
        colorHarmony: this.analyzeColorHarmony(dominantColors),
      },
    };

    this.colorSamples.push(colorSample);
    this.updateColorMemory(avgColor, 'sampling');

    return colorSample;
  }

  // Smart Color Palette Generation (like Adobe Color)
  generateSmartPalette(
    baseColor: string,
    style: 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'tetradic' | 'compound',
    count: number = 5,
    options: {
      temperature?: 'warm' | 'cool' | 'neutral';
      saturation?: 'vibrant' | 'muted' | 'mixed';
      brightness?: 'light' | 'dark' | 'mixed';
      accessibility?: boolean;
    } = {}
  ): string[] {
    const { temperature, saturation = 'mixed', brightness = 'mixed', accessibility = false } = options;
    
    const rgb = optimizedHexToRgb(baseColor);
    if (!rgb) return [baseColor];

    const hsl = optimizedRgbToHsl(rgb.r, rgb.g, rgb.b);
    const palette: string[] = [baseColor];

    switch (style) {
      case 'monochromatic':
        palette.push(...this.generateMonochromaticPalette(hsl, count - 1, { saturation, brightness }));
        break;
      case 'analogous':
        palette.push(...this.generateAnalogousPalette(hsl, count - 1, { temperature }));
        break;
      case 'complementary':
        palette.push(...this.generateComplementaryPalette(hsl, count - 1));
        break;
      case 'triadic':
        palette.push(...this.generateTriadicPalette(hsl, count - 1));
        break;
      case 'tetradic':
        palette.push(...this.generateTetradicPalette(hsl, count - 1));
        break;
      case 'compound':
        palette.push(...this.generateCompoundPalette(hsl, count - 1));
        break;
    }

    // Apply accessibility adjustments if requested
    if (accessibility) {
      return this.adjustPaletteForAccessibility(palette);
    }

    // Update color memory for all generated colors
    palette.forEach(color => this.updateColorMemory(color, 'generation'));

    return palette.slice(0, count);
  }

  // Material-Based Color Matching (like Clip Studio Paint)
  generateMaterialColors(
    materialType: MaterialColorMatch['materialType'],
    baseColor: string,
    lightingCondition: MaterialColorMatch['lightingCondition'] = 'daylight'
  ): MaterialColorMatch {
    const rgb = optimizedHexToRgb(baseColor);
    if (!rgb) throw new Error('Invalid base color');

    const hsl = optimizedRgbToHsl(rgb.r, rgb.g, rgb.b);
    
    // Material-specific color adjustments
    const materialProperties = this.getMaterialProperties(materialType);
    
    const variations = {
      highlight: this.generateHighlight(hsl, materialProperties, lightingCondition),
      midtone: baseColor,
      shadow: this.generateShadow(hsl, materialProperties, lightingCondition),
      reflected: this.generateReflectedLight(hsl, materialProperties, lightingCondition),
    };

    const materialMatch: MaterialColorMatch = {
      materialType,
      baseColor,
      variations,
      lightingCondition,
      surfaceProperties: materialProperties,
    };

    this.materialLibrary.push(materialMatch);
    return materialMatch;
  }

  // Design System Token Management (like Figma/Sketch)
  createDesignSystemToken(
    name: string,
    color: string,
    category: DesignSystemToken['category'],
    usage: string[],
    darkModeVariant?: string
  ): DesignSystemToken {
    // Calculate contrast ratios
    const contrastRatios = {
      onLight: this.calculateContrastRatio(color, '#ffffff'),
      onDark: this.calculateContrastRatio(color, '#000000'),
    };

    const token: DesignSystemToken = {
      name,
      value: color,
      category,
      usage,
      darkModeVariant,
      contrastRatios,
      aliases: [],
      deprecated: false,
    };

    this.designTokens.push(token);
    this.updateColorMemory(color, 'design-system');

    return token;
  }

  // Brush Set Creation (like Procreate)
  createColorBrushSet(
    name: string,
    colors: string[],
    brushType: ColorBrushSet['brushType'],
    options: {
      opacity?: number;
      blendMode?: ColorBrushSet['blendMode'];
      texture?: string;
      tags?: string[];
    } = {}
  ): ColorBrushSet {
    const brushSet: ColorBrushSet = {
      id: this.generateId(),
      name,
      colors,
      brushType,
      opacity: options.opacity || 100,
      blendMode: options.blendMode || 'normal',
      texture: options.texture,
      created: new Date(),
      tags: options.tags || [],
    };

    this.brushSets.push(brushSet);
    
    // Update color memory for all colors in the set
    colors.forEach(color => this.updateColorMemory(color, 'brush-set'));

    return brushSet;
  }

  // AI-Powered Color Suggestions (like Adobe Sensei)
  getAIColorSuggestions(
    context: string,
    currentColors: string[] = [],
    userPreferences: {
      style?: 'modern' | 'classic' | 'bold' | 'subtle';
      mood?: 'energetic' | 'calm' | 'professional' | 'creative';
      industry?: 'tech' | 'healthcare' | 'finance' | 'art' | 'fashion';
    } = {}
  ): string[] {
    const { style = 'modern', mood = 'professional', industry = 'tech' } = userPreferences;
    
    // Analyze current colors to understand the palette direction
    const paletteAnalysis = this.analyzePaletteCharacteristics(currentColors);
    
    // Get suggestions based on memory and AI analysis
    const memorySuggestions = this.getMemoryBasedSuggestions(context);
    const trendSuggestions = this.getTrendBasedSuggestions(style, mood, industry);
    const harmonySuggestions = this.getHarmonyBasedSuggestions(currentColors);
    
    // Combine and rank suggestions
    const allSuggestions = [
      ...memorySuggestions,
      ...trendSuggestions,
      ...harmonySuggestions,
    ];
    
    // Remove duplicates and rank by relevance
    const uniqueSuggestions = [...new Set(allSuggestions)];
    return this.rankSuggestionsByRelevance(uniqueSuggestions, paletteAnalysis, userPreferences);
  }

  // Color History & Favorites (like all modern tools)
  getColorHistory(limit: number = 50): ColorSample[] {
    return this.colorSamples
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  getFavoriteColors(minRating: number = 4): ColorMemoryEntry[] {
    return Array.from(this.colorMemory.values())
      .filter(entry => entry.userRating >= minRating)
      .sort((a, b) => b.userRating - a.userRating);
  }

  // Export functions for integration
  exportBrushSet(brushSetId: string): ColorBrushSet | null {
    return this.brushSets.find(set => set.id === brushSetId) || null;
  }

  exportDesignTokens(format: 'json' | 'css' | 'scss' | 'figma' = 'json'): string {
    switch (format) {
      case 'css':
        return this.exportTokensAsCSS();
      case 'scss':
        return this.exportTokensAsSCSS();
      case 'figma':
        return this.exportTokensAsFigma();
      default:
        return JSON.stringify(this.designTokens, null, 2);
    }
  }

  // Private helper methods
  private initializeDefaultBrushSets(): void {
    // Create some default brush sets
    this.createColorBrushSet(
      'Watercolor Basics',
      ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
      'watercolor',
      { opacity: 70, blendMode: 'multiply', tags: ['basic', 'watercolor'] }
    );

    this.createColorBrushSet(
      'Digital Art',
      ['#FF3838', '#FF9500', '#FFDD00', '#30D158', '#007AFF'],
      'digital',
      { opacity: 100, blendMode: 'normal', tags: ['digital', 'vibrant'] }
    );
  }

  private initializeMaterialLibrary(): void {
    // Initialize with common material types
    const commonMaterials: Array<{ type: MaterialColorMatch['materialType']; baseColor: string }> = [
      { type: 'skin', baseColor: '#FDBCB4' },
      { type: 'wood', baseColor: '#8B4513' },
      { type: 'metal', baseColor: '#C0C0C0' },
      { type: 'fabric', baseColor: '#4169E1' },
    ];

    commonMaterials.forEach(({ type, baseColor }) => {
      this.generateMaterialColors(type, baseColor);
    });
  }

  private initializeDesignTokens(): void {
    // Create basic design system tokens
    this.createDesignSystemToken('primary', '#007AFF', 'primary', ['buttons', 'links', 'focus']);
    this.createDesignSystemToken('secondary', '#5856D6', 'secondary', ['accents', 'highlights']);
    this.createDesignSystemToken('success', '#30D158', 'semantic', ['success messages', 'confirmations']);
    this.createDesignSystemToken('warning', '#FF9500', 'semantic', ['warnings', 'alerts']);
    this.createDesignSystemToken('error', '#FF3B30', 'semantic', ['errors', 'destructive actions']);
  }

  private calculateAverageColor(colors: string[]): string {
    if (colors.length === 0) return '#000000';

    let totalR = 0, totalG = 0, totalB = 0;
    let validColors = 0;

    colors.forEach(color => {
      const rgb = optimizedHexToRgb(color);
      if (rgb) {
        totalR += rgb.r;
        totalG += rgb.g;
        totalB += rgb.b;
        validColors++;
      }
    });

    if (validColors === 0) return '#000000';

    const avgR = Math.round(totalR / validColors);
    const avgG = Math.round(totalG / validColors);
    const avgB = Math.round(totalB / validColors);

    return `#${avgR.toString(16).padStart(2, '0')}${avgG.toString(16).padStart(2, '0')}${avgB.toString(16).padStart(2, '0')}`;
  }

  private extractDominantColors(colors: string[], maxColors: number = 5): string[] {
    // Simple dominant color extraction - count frequency
    const colorCounts = new Map<string, number>();
    
    colors.forEach(color => {
      colorCounts.set(color, (colorCounts.get(color) || 0) + 1);
    });

    return Array.from(colorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxColors)
      .map(([color]) => color);
  }

  private analyzeColorHarmony(colors: string[]): string {
    if (colors.length < 2) return 'monochromatic';
    
    // Simple harmony analysis based on hue relationships
    const hues = colors.map(color => {
      const rgb = optimizedHexToRgb(color);
      if (!rgb) return 0;
      const hsl = optimizedRgbToHsl(rgb.r, rgb.g, rgb.b);
      return hsl.h;
    });

    const hueSpread = Math.max(...hues) - Math.min(...hues);
    
    if (hueSpread < 30) return 'monochromatic';
    if (hueSpread > 150) return 'complementary';
    return 'analogous';
  }

  private updateColorMemory(color: string, context: string): void {
    const existing = this.colorMemory.get(color);
    
    if (existing) {
      existing.frequency++;
      existing.lastUsed = new Date();
      if (!existing.contexts.includes(context)) {
        existing.contexts.push(context);
      }
    } else {
      this.colorMemory.set(color, {
        color,
        frequency: 1,
        contexts: [context],
        associations: [],
        lastUsed: new Date(),
        userRating: 3,
        aiSuggestions: [],
        harmonicPartners: [],
      });
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Placeholder methods for palette generation
  private generateMonochromaticPalette(hsl: any, count: number, options: any): string[] {
    const colors = [];
    for (let i = 1; i <= count; i++) {
      const newL = Math.max(10, Math.min(90, hsl.l + (i * 15) - (count * 7.5)));
      colors.push(optimizedHslToHex(hsl.h, hsl.s, newL));
    }
    return colors;
  }

  private generateAnalogousPalette(hsl: any, count: number, options: any): string[] {
    const colors = [];
    for (let i = 1; i <= count; i++) {
      const newH = (hsl.h + (i * 30)) % 360;
      colors.push(optimizedHslToHex(newH, hsl.s, hsl.l));
    }
    return colors;
  }

  private generateComplementaryPalette(hsl: any, count: number): string[] {
    const complementaryH = (hsl.h + 180) % 360;
    const colors = [optimizedHslToHex(complementaryH, hsl.s, hsl.l)];
    
    // Add variations
    for (let i = 1; i < count; i++) {
      const variation = i % 2 === 0 ? hsl.h : complementaryH;
      const newL = Math.max(10, Math.min(90, hsl.l + (i * 20) - 30));
      colors.push(optimizedHslToHex(variation, hsl.s, newL));
    }
    
    return colors;
  }

  private generateTriadicPalette(hsl: any, count: number): string[] {
    const colors = [];
    const angles = [120, 240];
    
    angles.forEach(angle => {
      const newH = (hsl.h + angle) % 360;
      colors.push(optimizedHslToHex(newH, hsl.s, hsl.l));
    });
    
    // Add variations if more colors needed
    for (let i = colors.length; i < count; i++) {
      const baseH = i % 2 === 0 ? (hsl.h + 120) % 360 : (hsl.h + 240) % 360;
      const newL = Math.max(10, Math.min(90, hsl.l + (i * 15) - 15));
      colors.push(optimizedHslToHex(baseH, hsl.s, newL));
    }
    
    return colors.slice(0, count);
  }

  private generateTetradicPalette(hsl: any, count: number): string[] {
    const colors: string[] = [];
    const angles = [90, 180, 270];
    
    angles.forEach(angle => {
      const newH = (hsl.h + angle) % 360;
      colors.push(optimizedHslToHex(newH, hsl.s, hsl.l));
    });
    
    return colors.slice(0, count);
  }

  private generateCompoundPalette(hsl: any, count: number): string[] {
    // Combination of complementary and analogous
    const complementaryH = (hsl.h + 180) % 360;
    const colors = [
      optimizedHslToHex(complementaryH, hsl.s, hsl.l),
      optimizedHslToHex((hsl.h + 30) % 360, hsl.s, hsl.l),
      optimizedHslToHex((complementaryH + 30) % 360, hsl.s, hsl.l),
    ];
    
    return colors.slice(0, count);
  }

  private adjustPaletteForAccessibility(palette: string[]): string[] {
    // Ensure sufficient contrast ratios
    return palette.map(color => {
      const contrastRatio = this.calculateContrastRatio(color, '#ffffff');
      if (contrastRatio < 4.5) {
        // Darken the color to improve contrast
        const rgb = optimizedHexToRgb(color);
        if (rgb) {
          const hsl = optimizedRgbToHsl(rgb.r, rgb.g, rgb.b);
          const newL = Math.max(0, hsl.l - 20);
          return optimizedHslToHex(hsl.h, hsl.s, newL);
        }
      }
      return color;
    });
  }

  private calculateContrastRatio(color1: string, color2: string): number {
    // Simplified contrast ratio calculation
    const rgb1 = optimizedHexToRgb(color1);
    const rgb2 = optimizedHexToRgb(color2);
    
    if (!rgb1 || !rgb2) return 1;
    
    const lum1 = this.getLuminance(rgb1);
    const lum2 = this.getLuminance(rgb2);
    
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  private getLuminance(rgb: { r: number; g: number; b: number }): number {
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  // Additional helper methods would be implemented here...
  private getMaterialProperties(materialType: MaterialColorMatch['materialType']) {
    const properties = {
      skin: { roughness: 30, metallic: 0, subsurface: 80 },
      wood: { roughness: 70, metallic: 0, subsurface: 20 },
      metal: { roughness: 10, metallic: 90, subsurface: 0 },
      fabric: { roughness: 80, metallic: 0, subsurface: 40 },
      stone: { roughness: 90, metallic: 0, subsurface: 10 },
      nature: { roughness: 60, metallic: 0, subsurface: 30 },
      food: { roughness: 40, metallic: 0, subsurface: 60 },
    };
    
    return properties[materialType] || { roughness: 50, metallic: 0, subsurface: 30 };
  }

  private generateHighlight(hsl: any, properties: any, lighting: string): string {
    const lightnessBump = properties.metallic > 50 ? 40 : 20;
    const newL = Math.min(95, hsl.l + lightnessBump);
    return optimizedHslToHex(hsl.h, Math.max(0, hsl.s - 10), newL);
  }

  private generateShadow(hsl: any, properties: any, lighting: string): string {
    const lightnessDrop = 30;
    const newL = Math.max(5, hsl.l - lightnessDrop);
    return optimizedHslToHex(hsl.h, Math.min(100, hsl.s + 10), newL);
  }

  private generateReflectedLight(hsl: any, properties: any, lighting: string): string {
    // Add slight color shift for reflected light
    const hueShift = lighting === 'tungsten' ? 20 : lighting === 'fluorescent' ? -20 : 0;
    const newH = (hsl.h + hueShift + 360) % 360;
    return optimizedHslToHex(newH, hsl.s, Math.min(90, hsl.l + 10));
  }

  private analyzePaletteCharacteristics(colors: string[]): any {
    // Analyze the overall characteristics of the current palette
    return {
      averageHue: 0,
      averageSaturation: 0,
      averageLightness: 0,
      dominantTemperature: 'neutral',
      harmonyType: 'mixed',
    };
  }

  private getMemoryBasedSuggestions(context: string): string[] {
    return Array.from(this.colorMemory.values())
      .filter(entry => entry.contexts.includes(context))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5)
      .map(entry => entry.color);
  }

  private getTrendBasedSuggestions(style: string, mood: string, industry: string): string[] {
    // Return trending colors based on style, mood, and industry
    const trendColors = {
      modern: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
      classic: ['#2C3E50', '#E74C3C', '#F39C12'],
      bold: ['#E91E63', '#9C27B0', '#FF5722'],
      subtle: ['#95A5A6', '#BDC3C7', '#ECF0F1'],
    };
    
    return trendColors[style as keyof typeof trendColors] || trendColors.modern;
  }

  private getHarmonyBasedSuggestions(currentColors: string[]): string[] {
    if (currentColors.length === 0) return [];
    
    // Generate harmonious colors based on the current palette
    const baseColor = currentColors[0];
    return this.generateSmartPalette(baseColor, 'analogous', 3);
  }

  private rankSuggestionsByRelevance(suggestions: string[], analysis: any, preferences: any): string[] {
    // Rank suggestions based on relevance to current context
    return suggestions.slice(0, 10); // Simplified ranking
  }

  private exportTokensAsCSS(): string {
    let css = ':root {\n';
    this.designTokens.forEach(token => {
      css += `  --${token.name}: ${token.value};\n`;
      if (token.darkModeVariant) {
        css += `  --${token.name}-dark: ${token.darkModeVariant};\n`;
      }
    });
    css += '}';
    return css;
  }

  private exportTokensAsSCSS(): string {
    let scss = '';
    this.designTokens.forEach(token => {
      scss += `$${token.name}: ${token.value};\n`;
      if (token.darkModeVariant) {
        scss += `$${token.name}-dark: ${token.darkModeVariant};\n`;
      }
    });
    return scss;
  }

  private exportTokensAsFigma(): string {
    const figmaTokens = this.designTokens.map(token => ({
      name: token.name,
      value: token.value,
      type: 'color',
      description: `Used for: ${token.usage.join(', ')}`,
    }));
    
    return JSON.stringify({ tokens: figmaTokens }, null, 2);
  }
}

// Export singleton instance
export const modernArtToolFeatures = ModernArtToolFeatures.getInstance();
