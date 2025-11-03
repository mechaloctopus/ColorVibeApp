// AI-Powered Color Intelligence System
// Advanced algorithms for smart color suggestions and learning

import { optimizedHexToRgb, optimizedRgbToHsl } from './optimizedColorEngine';
import { PerceptualColorEngine } from './perceptualColorEngine';
import { ConfigUtils } from '../config';

// AI Color Intelligence Types
export interface ColorContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  season: 'spring' | 'summer' | 'fall' | 'winter';
  mood: 'energetic' | 'calm' | 'creative' | 'focused' | 'romantic';
  purpose: 'branding' | 'interior' | 'fashion' | 'digital' | 'art';
  userPreferences: ColorPreference[];
}

export interface ColorPreference {
  color: string;
  frequency: number;
  context: string[];
  timestamp: number;
  satisfaction: number; // 0-1 rating
}

export interface AIColorSuggestion {
  color: string;
  confidence: number; // 0-1
  reasoning: string;
  category: 'complementary' | 'analogous' | 'trending' | 'personal' | 'contextual';
  metadata: {
    culturalRelevance: number;
    seasonalAppropriate: number;
    moodAlignment: number;
    brandSuitability: number;
  };
}

export interface LearningPattern {
  colorFamily: string;
  timePattern: number[];
  contextPattern: string[];
  satisfactionTrend: number;
  frequency: number;
}

// AI Color Intelligence Engine
export class AIColorIntelligence {
  private static userPreferences: Map<string, ColorPreference[]> = new Map();
  private static learningPatterns: Map<string, LearningPattern[]> = new Map();
  private static contextHistory: ColorContext[] = [];
  
  // Initialize AI system
  static initialize() {
    if (!ConfigUtils.isFeatureEnabled('AI_COLOR_SUGGESTIONS')) return;
    
    // Load user preferences from storage
    this.loadUserPreferences();
    
    // Initialize learning patterns
    this.initializeLearningPatterns();
    
    if (__DEV__) {
      console.log('[AI Color Intelligence] System initialized');
    }
  }
  
  // Generate smart color suggestions
  static async generateSmartSuggestions(
    baseColor: string,
    context: Partial<ColorContext> = {},
    count: number = 5
  ): Promise<AIColorSuggestion[]> {
    if (!ConfigUtils.isFeatureEnabled('AI_COLOR_SUGGESTIONS')) {
      return this.getFallbackSuggestions(baseColor, count);
    }
    
    const fullContext = this.enrichContext(context);
    const suggestions: AIColorSuggestion[] = [];
    
    // 1. Personal preference-based suggestions
    const personalSuggestions = await this.generatePersonalSuggestions(baseColor, fullContext);
    suggestions.push(...personalSuggestions);
    
    // 2. Contextual suggestions
    const contextualSuggestions = await this.generateContextualSuggestions(baseColor, fullContext);
    suggestions.push(...contextualSuggestions);
    
    // 3. Trending color suggestions
    const trendingSuggestions = await this.generateTrendingSuggestions(baseColor, fullContext);
    suggestions.push(...trendingSuggestions);
    
    // 4. Perceptual harmony suggestions
    const harmonySuggestions = await this.generateHarmonySuggestions(baseColor, fullContext);
    suggestions.push(...harmonySuggestions);
    
    // Sort by confidence and return top suggestions
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, count);
  }
  
  // Learn from user interactions
  static learnFromInteraction(
    color: string,
    context: Partial<ColorContext>,
    satisfaction: number,
    action: 'selected' | 'rejected' | 'modified'
  ) {
    if (!ConfigUtils.isFeatureEnabled('AI_COLOR_SUGGESTIONS')) return;
    
    const userId = 'default'; // In production, would use actual user ID
    const preferences = this.userPreferences.get(userId) || [];
    
    // Update or create preference
    const existingIndex = preferences.findIndex(p => p.color === color);
    if (existingIndex >= 0) {
      preferences[existingIndex].frequency++;
      preferences[existingIndex].satisfaction = (preferences[existingIndex].satisfaction + satisfaction) / 2;
      preferences[existingIndex].timestamp = Date.now();
    } else {
      preferences.push({
        color,
        frequency: 1,
        context: Object.values(context).filter(Boolean) as string[],
        timestamp: Date.now(),
        satisfaction,
      });
    }
    
    this.userPreferences.set(userId, preferences);
    
    // Update learning patterns
    this.updateLearningPatterns(color, context, satisfaction, action);
    
    // Save to storage
    this.saveUserPreferences();
  }
  
  // Generate personal preference-based suggestions
  private static async generatePersonalSuggestions(
    baseColor: string,
    context: ColorContext
  ): Promise<AIColorSuggestion[]> {
    const userId = 'default';
    const preferences = this.userPreferences.get(userId) || [];
    
    if (preferences.length === 0) return [];
    
    const baseRgb = optimizedHexToRgb(baseColor)!;
    const baseHsl = optimizedRgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);
    const suggestions: AIColorSuggestion[] = [];
    
    // Find similar colors in user preferences
    for (const pref of preferences.slice(0, 3)) {
      if (pref.satisfaction < 0.6) continue;
      
      const prefRgb = optimizedHexToRgb(pref.color)!;
      const prefHsl = optimizedRgbToHsl(prefRgb.r, prefRgb.g, prefRgb.b);
      const hueDistance = Math.abs(baseHsl.h - prefHsl.h);
      const similarity = 1 - (hueDistance / 180);
      
      if (similarity > 0.3) {
        suggestions.push({
          color: pref.color,
          confidence: similarity * pref.satisfaction,
          reasoning: `Based on your preference for similar colors (${pref.frequency} uses, ${(pref.satisfaction * 100).toFixed(0)}% satisfaction)`,
          category: 'personal',
          metadata: {
            culturalRelevance: 0.8,
            seasonalAppropriate: this.calculateSeasonalRelevance(pref.color, context.season),
            moodAlignment: this.calculateMoodAlignment(pref.color, context.mood),
            brandSuitability: this.calculateBrandSuitability(pref.color, context.purpose),
          },
        });
      }
    }
    
    return suggestions;
  }
  
  // Generate contextual suggestions
  private static async generateContextualSuggestions(
    baseColor: string,
    context: ColorContext
  ): Promise<AIColorSuggestion[]> {
    const suggestions: AIColorSuggestion[] = [];
    
    // Time-based suggestions
    const timeColors = this.getTimeBasedColors(context.timeOfDay);
    const timeColor = this.selectBestMatch(baseColor, timeColors);
    if (timeColor) {
      suggestions.push({
        color: timeColor,
        confidence: 0.75,
        reasoning: `Optimized for ${context.timeOfDay} viewing conditions`,
        category: 'contextual',
        metadata: {
          culturalRelevance: 0.7,
          seasonalAppropriate: 0.8,
          moodAlignment: 0.9,
          brandSuitability: 0.6,
        },
      });
    }
    
    // Seasonal suggestions
    const seasonalColors = this.getSeasonalColors(context.season);
    const seasonalColor = this.selectBestMatch(baseColor, seasonalColors);
    if (seasonalColor) {
      suggestions.push({
        color: seasonalColor,
        confidence: 0.7,
        reasoning: `Perfect for ${context.season} color palettes`,
        category: 'contextual',
        metadata: {
          culturalRelevance: 0.8,
          seasonalAppropriate: 0.95,
          moodAlignment: 0.7,
          brandSuitability: 0.7,
        },
      });
    }
    
    // Purpose-based suggestions
    const purposeColors = this.getPurposeBasedColors(context.purpose);
    const purposeColor = this.selectBestMatch(baseColor, purposeColors);
    if (purposeColor) {
      suggestions.push({
        color: purposeColor,
        confidence: 0.8,
        reasoning: `Ideal for ${context.purpose} applications`,
        category: 'contextual',
        metadata: {
          culturalRelevance: 0.7,
          seasonalAppropriate: 0.6,
          moodAlignment: 0.7,
          brandSuitability: 0.95,
        },
      });
    }
    
    return suggestions;
  }
  
  // Generate trending color suggestions
  private static async generateTrendingSuggestions(
    baseColor: string,
    context: ColorContext
  ): Promise<AIColorSuggestion[]> {
    // Simulated trending colors (in production, would fetch from trend API)
    const trendingColors = [
      '#FF6B35', // Energetic Orange
      '#4ECDC4', // Digital Teal
      '#45B7D1', // Sky Blue
      '#96CEB4', // Sage Green
      '#FFEAA7', // Warm Yellow
    ];
    
    const bestMatch = this.selectBestMatch(baseColor, trendingColors);
    if (!bestMatch) return [];
    
    return [{
      color: bestMatch,
      confidence: 0.65,
      reasoning: 'Currently trending in design communities',
      category: 'trending',
      metadata: {
        culturalRelevance: 0.9,
        seasonalAppropriate: 0.8,
        moodAlignment: 0.7,
        brandSuitability: 0.8,
      },
    }];
  }
  
  // Generate perceptual harmony suggestions
  private static async generateHarmonySuggestions(
    baseColor: string,
    context: ColorContext
  ): Promise<AIColorSuggestion[]> {
    const harmonies = PerceptualColorEngine.generatePerceptualHarmony(
      baseColor,
      'perceptual-complementary'
    );
    
    if (harmonies.length < 2) return [];
    
    const complementaryColor = harmonies[1]; // First harmony color
    
    return [{
      color: complementaryColor,
      confidence: 0.85,
      reasoning: 'Perceptually optimized complementary color',
      category: 'complementary',
      metadata: {
        culturalRelevance: 0.8,
        seasonalAppropriate: 0.7,
        moodAlignment: 0.8,
        brandSuitability: 0.9,
      },
    }];
  }
  
  // Helper methods
  private static enrichContext(context: Partial<ColorContext>): ColorContext {
    const now = new Date();
    const hour = now.getHours();
    const month = now.getMonth();
    
    return {
      timeOfDay: context.timeOfDay || this.getTimeOfDay(hour),
      season: context.season || this.getSeason(month),
      mood: context.mood || 'focused',
      purpose: context.purpose || 'digital',
      userPreferences: context.userPreferences || [],
    };
  }
  
  private static getTimeOfDay(hour: number): ColorContext['timeOfDay'] {
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    if (hour < 22) return 'evening';
    return 'night';
  }
  
  private static getSeason(month: number): ColorContext['season'] {
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }
  
  private static getTimeBasedColors(timeOfDay: ColorContext['timeOfDay']): string[] {
    const timeColors = {
      morning: ['#FFE4B5', '#87CEEB', '#98FB98', '#F0E68C'],
      afternoon: ['#FFA500', '#4169E1', '#32CD32', '#FF6347'],
      evening: ['#FF8C00', '#8A2BE2', '#DC143C', '#B22222'],
      night: ['#191970', '#2F4F4F', '#483D8B', '#8B008B'],
    };
    return timeColors[timeOfDay];
  }
  
  private static getSeasonalColors(season: ColorContext['season']): string[] {
    const seasonalColors = {
      spring: ['#98FB98', '#FFB6C1', '#87CEEB', '#F0E68C'],
      summer: ['#FF6347', '#4169E1', '#32CD32', '#FFD700'],
      fall: ['#FF8C00', '#8B4513', '#DC143C', '#DAA520'],
      winter: ['#4682B4', '#2F4F4F', '#8B008B', '#708090'],
    };
    return seasonalColors[season];
  }
  
  private static getPurposeBasedColors(purpose: ColorContext['purpose']): string[] {
    const purposeColors = {
      branding: ['#FF6B35', '#4ECDC4', '#45B7D1', '#96CEB4'],
      interior: ['#F5F5DC', '#DEB887', '#8FBC8F', '#D2B48C'],
      fashion: ['#FF1493', '#8A2BE2', '#FF8C00', '#DC143C'],
      digital: ['#4169E1', '#32CD32', '#FF6347', '#8A2BE2'],
      art: ['#FF69B4', '#9370DB', '#20B2AA', '#FF4500'],
    };
    return purposeColors[purpose];
  }
  
  private static selectBestMatch(baseColor: string, candidates: string[]): string | null {
    if (candidates.length === 0) return null;
    
    const baseRgb = optimizedHexToRgb(baseColor)!;
    const baseHsl = optimizedRgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);
    let bestMatch = candidates[0];
    let bestScore = 0;
    
    for (const candidate of candidates) {
      const candidateRgb = optimizedHexToRgb(candidate)!;
      const candidateHsl = optimizedRgbToHsl(candidateRgb.r, candidateRgb.g, candidateRgb.b);
      
      // Score based on complementary relationship and saturation similarity
      const hueDistance = Math.abs(baseHsl.h - candidateHsl.h);
      const complementaryScore = Math.abs(hueDistance - 180) / 180;
      const saturationScore = 1 - Math.abs(baseHsl.s - candidateHsl.s) / 100;
      
      const totalScore = (complementaryScore + saturationScore) / 2;
      
      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestMatch = candidate;
      }
    }
    
    return bestMatch;
  }
  
  private static calculateSeasonalRelevance(color: string, season: ColorContext['season']): number {
    const seasonalColors = this.getSeasonalColors(season);
    const colorRgb = optimizedHexToRgb(color)!;
    const colorHsl = optimizedRgbToHsl(colorRgb.r, colorRgb.g, colorRgb.b);
    
    let maxRelevance = 0;
    for (const seasonalColor of seasonalColors) {
      const seasonalRgb = optimizedHexToRgb(seasonalColor)!;
      const seasonalHsl = optimizedRgbToHsl(seasonalRgb.r, seasonalRgb.g, seasonalRgb.b);
      const hueDistance = Math.abs(colorHsl.h - seasonalHsl.h);
      const relevance = 1 - (hueDistance / 180);
      maxRelevance = Math.max(maxRelevance, relevance);
    }
    
    return maxRelevance;
  }
  
  private static calculateMoodAlignment(color: string, mood: ColorContext['mood']): number {
    const colorRgb = optimizedHexToRgb(color)!;
    const colorHsl = optimizedRgbToHsl(colorRgb.r, colorRgb.g, colorRgb.b);
    
    const moodScores = {
      energetic: colorHsl.s > 70 && colorHsl.l > 40 ? 0.9 : 0.4,
      calm: colorHsl.s < 50 && colorHsl.l > 60 ? 0.9 : 0.5,
      creative: colorHsl.s > 60 ? 0.8 : 0.6,
      focused: colorHsl.s < 60 && colorHsl.l < 70 ? 0.8 : 0.5,
      romantic: (colorHsl.h > 300 || colorHsl.h < 60) && colorHsl.s > 50 ? 0.9 : 0.4,
    };
    
    return moodScores[mood];
  }
  
  private static calculateBrandSuitability(color: string, purpose: ColorContext['purpose']): number {
    const colorRgb = optimizedHexToRgb(color)!;
    const colorHsl = optimizedRgbToHsl(colorRgb.r, colorRgb.g, colorRgb.b);
    
    const purposeScores = {
      branding: colorHsl.s > 50 && colorHsl.l > 30 && colorHsl.l < 80 ? 0.9 : 0.6,
      interior: colorHsl.s < 70 && colorHsl.l > 40 ? 0.8 : 0.5,
      fashion: colorHsl.s > 40 ? 0.8 : 0.6,
      digital: colorHsl.s > 60 && colorHsl.l > 30 && colorHsl.l < 90 ? 0.9 : 0.7,
      art: 0.8, // Art is flexible
    };
    
    return purposeScores[purpose];
  }
  
  private static getFallbackSuggestions(baseColor: string, count: number): AIColorSuggestion[] {
    // Simple fallback when AI is disabled
    const harmonies = PerceptualColorEngine.generatePerceptualHarmony(baseColor, 'perceptual-complementary');
    
    return harmonies.slice(1, count + 1).map((color, index) => ({
      color,
      confidence: 0.7 - (index * 0.1),
      reasoning: 'Color harmony suggestion',
      category: 'complementary' as const,
      metadata: {
        culturalRelevance: 0.7,
        seasonalAppropriate: 0.7,
        moodAlignment: 0.7,
        brandSuitability: 0.7,
      },
    }));
  }
  
  private static updateLearningPatterns(
    color: string,
    context: Partial<ColorContext>,
    satisfaction: number,
    action: string
  ) {
    // Implementation for updating learning patterns
    // This would analyze user behavior over time
  }
  
  private static loadUserPreferences() {
    // Implementation for loading from AsyncStorage
  }
  
  private static saveUserPreferences() {
    // Implementation for saving to AsyncStorage
  }
  
  private static initializeLearningPatterns() {
    // Implementation for initializing learning patterns
  }
}

// AIColorIntelligence is already exported above
