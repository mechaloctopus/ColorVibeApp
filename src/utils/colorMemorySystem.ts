// Color Memory & Learning System
// Personalized color preferences and adaptive learning algorithms

// AsyncStorage import with fallback for when not available
let AsyncStorage: any = null;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (error) {
  console.warn('[Color Memory] AsyncStorage not available, using in-memory fallback');
  // In-memory fallback storage
  const memoryStorage = new Map<string, string>();
  AsyncStorage = {
    getItem: async (key: string) => memoryStorage.get(key) || null,
    setItem: async (key: string, value: string) => { memoryStorage.set(key, value); },
    removeItem: async (key: string) => { memoryStorage.delete(key); },
  };
}

import { optimizedHexToRgb, optimizedRgbToHsl } from './optimizedColorEngine';
import { ConfigUtils } from '../config';

// User Color Interaction Types
export interface ColorInteraction {
  id: string;
  color: string;
  action: 'selected' | 'rejected' | 'modified' | 'exported' | 'favorited';
  context: InteractionContext;
  timestamp: number;
  duration?: number; // How long user spent with this color
  satisfaction?: number; // 0-1 rating if provided
}

export interface InteractionContext {
  workstation: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  season: 'spring' | 'summer' | 'fall' | 'winter';
  mood?: 'creative' | 'focused' | 'relaxed' | 'energetic';
  project?: string;
  colorRole?: 'primary' | 'secondary' | 'accent' | 'background';
}

// User Color Profile
export interface UserColorProfile {
  userId: string;
  preferences: ColorPreferences;
  patterns: LearningPatterns;
  statistics: UsageStatistics;
  lastUpdated: number;
}

export interface ColorPreferences {
  favoriteHues: number[]; // Preferred hue ranges
  preferredSaturation: { min: number; max: number };
  preferredLightness: { min: number; max: number };
  avoidedColors: string[];
  culturalContext: string;
  professionalContext: string[];
}

export interface LearningPatterns {
  timeBasedPreferences: Record<string, ColorTrend>;
  contextualPreferences: Record<string, ColorTrend>;
  harmonyPreferences: string[];
  workflowPatterns: WorkflowPattern[];
  improvementAreas: string[];
}

export interface ColorTrend {
  colors: string[];
  frequency: number;
  satisfaction: number;
  confidence: number;
}

export interface WorkflowPattern {
  sequence: string[];
  frequency: number;
  efficiency: number;
  context: string;
}

export interface UsageStatistics {
  totalInteractions: number;
  sessionsCount: number;
  averageSessionDuration: number;
  mostUsedWorkstation: string;
  colorAccuracy: number; // How often user's first choice is final
  learningProgress: number; // 0-1 scale
}

// Personalized Color Recommendations
export interface ColorRecommendation {
  color: string;
  confidence: number;
  reasoning: string;
  category: 'personal' | 'trending' | 'contextual' | 'complementary';
  metadata: {
    basedOnInteractions: number;
    similarityScore: number;
    contextMatch: number;
    noveltyFactor: number;
  };
}

// Color Memory & Learning System
export class ColorMemorySystem {
  private static readonly STORAGE_KEY = 'color_memory_profile';
  private static readonly MAX_INTERACTIONS = 10000;
  private static userProfile: UserColorProfile | null = null;
  private static interactions: ColorInteraction[] = [];
  private static analysisInterval: NodeJS.Timeout | null = null;
  
  // Initialize the system
  static async initialize(userId: string = 'default'): Promise<void> {
    try {
      await this.loadUserProfile(userId);
      await this.loadInteractions();
      
      // Start periodic analysis
      this.startPeriodicAnalysis();
      
      console.log('[Color Memory] System initialized for user:', userId);
    } catch (error) {
      console.error('[Color Memory] Initialization error:', error);
      await this.createNewProfile(userId);
    }
  }
  
  // Record a color interaction
  static async recordInteraction(interaction: Omit<ColorInteraction, 'id' | 'timestamp'>): Promise<void> {
    const fullInteraction: ColorInteraction = {
      ...interaction,
      id: this.generateId(),
      timestamp: Date.now(),
    };
    
    this.interactions.push(fullInteraction);
    
    // Keep only recent interactions
    if (this.interactions.length > this.MAX_INTERACTIONS) {
      this.interactions = this.interactions.slice(-this.MAX_INTERACTIONS);
    }
    
    // Update user profile
    await this.updateUserProfile(fullInteraction);
    
    // Save to storage
    await this.saveInteractions();
  }
  
  // Get personalized color recommendations
  static async getPersonalizedRecommendations(
    context: Partial<InteractionContext> = {},
    count: number = 5
  ): Promise<ColorRecommendation[]> {
    if (!this.userProfile) {
      return this.getFallbackRecommendations(count);
    }
    
    const recommendations: ColorRecommendation[] = [];
    
    // Personal preference-based recommendations
    const personalRecs = await this.generatePersonalRecommendations(context, count);
    recommendations.push(...personalRecs);
    
    // Contextual recommendations
    const contextualRecs = await this.generateContextualRecommendations(context, count);
    recommendations.push(...contextualRecs);
    
    // Learning-based recommendations
    const learningRecs = await this.generateLearningRecommendations(context, count);
    recommendations.push(...learningRecs);
    
    // Sort by confidence and remove duplicates
    const uniqueRecs = this.removeDuplicateRecommendations(recommendations);
    return uniqueRecs
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, count);
  }
  
  // Analyze user's color learning progress
  static analyzeProgress(): {
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    strengths: string[];
    improvements: string[];
    nextSteps: string[];
  } {
    if (!this.userProfile) {
      return {
        level: 'beginner',
        strengths: [],
        improvements: ['Start using the app more to build your profile'],
        nextSteps: ['Explore different workstations', 'Try various color combinations'],
      };
    }
    
    const stats = this.userProfile.statistics;
    const patterns = this.userProfile.patterns;
    
    // Determine skill level
    let level: 'beginner' | 'intermediate' | 'advanced' | 'expert' = 'beginner';
    if (stats.totalInteractions > 1000 && stats.colorAccuracy > 0.8) level = 'expert';
    else if (stats.totalInteractions > 500 && stats.colorAccuracy > 0.7) level = 'advanced';
    else if (stats.totalInteractions > 100 && stats.colorAccuracy > 0.6) level = 'intermediate';
    
    // Identify strengths
    const strengths: string[] = [];
    if (stats.colorAccuracy > 0.8) strengths.push('High color accuracy');
    if (patterns.harmonyPreferences.length > 3) strengths.push('Diverse harmony knowledge');
    if (stats.averageSessionDuration > 300) strengths.push('Deep color exploration');
    
    // Identify improvement areas
    const improvements: string[] = [];
    if (stats.colorAccuracy < 0.6) improvements.push('Color selection accuracy');
    if (patterns.harmonyPreferences.length < 2) improvements.push('Color harmony understanding');
    if (patterns.workflowPatterns.length < 3) improvements.push('Workflow efficiency');
    
    // Suggest next steps
    const nextSteps: string[] = [];
    if (level === 'beginner') {
      nextSteps.push('Explore the Theory Lab', 'Try different color harmonies');
    } else if (level === 'intermediate') {
      nextSteps.push('Use the Perceptual Lab', 'Experiment with accessibility testing');
    } else {
      nextSteps.push('Create complex palettes', 'Share your work with others');
    }
    
    return { level, strengths, improvements, nextSteps };
  }
  
  // Get user's color personality insights
  static getColorPersonality(): {
    type: string;
    description: string;
    traits: string[];
    recommendations: string[];
  } {
    if (!this.userProfile) {
      return {
        type: 'Explorer',
        description: 'Just starting your color journey',
        traits: ['Curious', 'Open to learning'],
        recommendations: ['Try different workstations', 'Experiment with various colors'],
      };
    }
    
    const prefs = this.userProfile.preferences;
    const patterns = this.userProfile.patterns;
    
    // Analyze color preferences to determine personality type
    const avgSaturation = (prefs.preferredSaturation.min + prefs.preferredSaturation.max) / 2;
    const avgLightness = (prefs.preferredLightness.min + prefs.preferredLightness.max) / 2;
    const harmonyDiversity = patterns.harmonyPreferences.length;
    
    let type = 'Balanced Creator';
    let description = 'You have a well-rounded approach to color';
    let traits = ['Versatile', 'Thoughtful'];
    let recommendations = ['Continue exploring', 'Share your knowledge'];
    
    if (avgSaturation > 70 && avgLightness > 60) {
      type = 'Vibrant Optimist';
      description = 'You love bright, energetic colors that inspire joy';
      traits = ['Energetic', 'Positive', 'Bold'];
      recommendations = ['Try complementary schemes', 'Explore warm palettes'];
    } else if (avgSaturation < 40 && avgLightness < 40) {
      type = 'Sophisticated Minimalist';
      description = 'You prefer subtle, refined color combinations';
      traits = ['Elegant', 'Refined', 'Professional'];
      recommendations = ['Explore monochromatic schemes', 'Try neutral palettes'];
    } else if (harmonyDiversity > 5) {
      type = 'Color Theorist';
      description = 'You understand and apply complex color relationships';
      traits = ['Analytical', 'Knowledgeable', 'Precise'];
      recommendations = ['Teach others', 'Create advanced palettes'];
    }
    
    return { type, description, traits, recommendations };
  }
  
  // Private helper methods
  private static async loadUserProfile(userId: string): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(`${this.STORAGE_KEY}_${userId}`);
      if (stored) {
        this.userProfile = JSON.parse(stored);
      } else {
        await this.createNewProfile(userId);
      }
    } catch (error) {
      console.error('[Color Memory] Failed to load profile:', error);
      await this.createNewProfile(userId);
    }
  }
  
  private static async createNewProfile(userId: string): Promise<void> {
    this.userProfile = {
      userId,
      preferences: {
        favoriteHues: [],
        preferredSaturation: { min: 0, max: 100 },
        preferredLightness: { min: 0, max: 100 },
        avoidedColors: [],
        culturalContext: 'western',
        professionalContext: [],
      },
      patterns: {
        timeBasedPreferences: {},
        contextualPreferences: {},
        harmonyPreferences: [],
        workflowPatterns: [],
        improvementAreas: [],
      },
      statistics: {
        totalInteractions: 0,
        sessionsCount: 0,
        averageSessionDuration: 0,
        mostUsedWorkstation: '',
        colorAccuracy: 0.5,
        learningProgress: 0,
      },
      lastUpdated: Date.now(),
    };
    
    await this.saveUserProfile();
  }
  
  private static async saveUserProfile(): Promise<void> {
    if (!this.userProfile) return;
    
    try {
      await AsyncStorage.setItem(
        `${this.STORAGE_KEY}_${this.userProfile.userId}`,
        JSON.stringify(this.userProfile)
      );
    } catch (error) {
      console.error('[Color Memory] Failed to save profile:', error);
    }
  }
  
  private static async loadInteractions(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(`${this.STORAGE_KEY}_interactions`);
      if (stored) {
        this.interactions = JSON.parse(stored);
      }
    } catch (error) {
      console.error('[Color Memory] Failed to load interactions:', error);
      this.interactions = [];
    }
  }
  
  private static async saveInteractions(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `${this.STORAGE_KEY}_interactions`,
        JSON.stringify(this.interactions)
      );
    } catch (error) {
      console.error('[Color Memory] Failed to save interactions:', error);
    }
  }
  
  private static async updateUserProfile(interaction: ColorInteraction): Promise<void> {
    if (!this.userProfile) return;
    
    // Update statistics
    this.userProfile.statistics.totalInteractions++;
    this.userProfile.lastUpdated = Date.now();
    
    // Update preferences based on interaction
    if (interaction.action === 'selected' || interaction.action === 'favorited') {
      const rgb = optimizedHexToRgb(interaction.color);
      if (rgb) {
        const hsl = optimizedRgbToHsl(rgb.r, rgb.g, rgb.b);
        
        // Update hue preferences
        if (!this.userProfile.preferences.favoriteHues.includes(Math.round(hsl.h / 30) * 30)) {
          this.userProfile.preferences.favoriteHues.push(Math.round(hsl.h / 30) * 30);
        }
        
        // Update saturation and lightness ranges
        this.updateRange(this.userProfile.preferences.preferredSaturation, hsl.s);
        this.updateRange(this.userProfile.preferences.preferredLightness, hsl.l);
      }
    }
    
    await this.saveUserProfile();
  }
  
  private static updateRange(range: { min: number; max: number }, value: number): void {
    range.min = Math.min(range.min, value);
    range.max = Math.max(range.max, value);
  }
  
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  private static startPeriodicAnalysis(): void {
    // Clear existing interval if any
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
    }

    // Run analysis every 5 minutes
    this.analysisInterval = setInterval(() => {
      this.analyzePatterns();
    }, 5 * 60 * 1000);
  }

  // Cleanup method for proper resource management
  static cleanup(): void {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }
  }
  
  private static analyzePatterns(): void {
    if (!this.userProfile || this.interactions.length < 10) return;
    
    // Analyze recent interactions for patterns
    const recentInteractions = this.interactions.slice(-100);
    
    // Update workflow patterns
    this.updateWorkflowPatterns(recentInteractions);
    
    // Update contextual preferences
    this.updateContextualPreferences(recentInteractions);
  }
  
  private static updateWorkflowPatterns(interactions: ColorInteraction[]): void {
    // Implementation for workflow pattern analysis
  }
  
  private static updateContextualPreferences(interactions: ColorInteraction[]): void {
    // Implementation for contextual preference analysis
  }
  
  private static async generatePersonalRecommendations(
    context: Partial<InteractionContext>,
    count: number
  ): Promise<ColorRecommendation[]> {
    // Implementation for personal recommendations
    return [];
  }
  
  private static async generateContextualRecommendations(
    context: Partial<InteractionContext>,
    count: number
  ): Promise<ColorRecommendation[]> {
    // Implementation for contextual recommendations
    return [];
  }
  
  private static async generateLearningRecommendations(
    context: Partial<InteractionContext>,
    count: number
  ): Promise<ColorRecommendation[]> {
    // Implementation for learning-based recommendations
    return [];
  }
  
  private static removeDuplicateRecommendations(recommendations: ColorRecommendation[]): ColorRecommendation[] {
    const seen = new Set<string>();
    return recommendations.filter(rec => {
      if (seen.has(rec.color)) return false;
      seen.add(rec.color);
      return true;
    });
  }
  
  private static getFallbackRecommendations(count: number): ColorRecommendation[] {
    // Fallback recommendations when no profile exists
    const fallbackColors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6'];
    return fallbackColors.slice(0, count).map((color, index) => ({
      color,
      confidence: 0.5,
      reasoning: 'Popular color choice',
      category: 'trending' as const,
      metadata: {
        basedOnInteractions: 0,
        similarityScore: 0,
        contextMatch: 0,
        noveltyFactor: 0.5,
      },
    }));
  }
}

// ColorMemorySystem is already exported above
