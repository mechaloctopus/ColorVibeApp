// Workstations Barrel Export
// Centralized workstation management for better maintainability

// Core Workstations
export { default as MainStudio } from '../MainStudio';
export { default as ColorScanner } from '../ColorScanner';
export { default as PaintRecipeWorkstation } from '../PaintRecipeWorkstation';
export { default as ColorTheoryLab } from '../ColorTheoryLab';
export { default as PerceptualColorLab } from '../PerceptualColorLab';
export { default as ColorHarmonyExplorer } from '../ColorHarmonyExplorer';
export { default as ColorTrendsInspiration } from '../ColorTrendsInspiration';
export { default as ImageColorExtractor } from '../ImageColorExtractor';
export { default as AccessibilityWorkstation } from '../AccessibilityWorkstation';

// Legacy components removed - using PaintRecipeWorkstation instead

// Workstation Configuration
export interface WorkstationConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  component: React.ComponentType<any> | (() => Promise<{ default: React.ComponentType<any> }>);
  features: string[];
  dependencies: string[];
  performance: {
    heavy: boolean;
    cacheSize: number;
    preload: boolean;
  };
}

// Workstation Registry for Dynamic Loading and AI Assistance
export const WORKSTATION_REGISTRY: Record<string, WorkstationConfig> = {
  'main': {
    id: 'main',
    name: 'Main Studio',
    icon: '🎨',
    description: 'Saturn\'s Rings color system with musical modes',
    color: '#3498db',
    component: () => import('../MainStudio'),
    features: ['saturn-rings', 'musical-modes', 'universal-actions', 'ouija-picker'],
    dependencies: ['optimizedColorEngine', 'musicalColorTheory', 'touchOptimization'],
    performance: { heavy: true, cacheSize: 500, preload: true },
  },
  'scanner': {
    id: 'scanner',
    name: 'Color Scanner',
    icon: '📷',
    description: 'Extract colors from camera and gallery images',
    color: '#e67e22',
    component: () => import('../ColorScanner'),
    features: ['camera-integration', 'gallery-import', 'color-clustering', 'smart-naming'],
    dependencies: ['expo-camera', 'expo-image-picker', 'optimizedColorEngine'],
    performance: { heavy: true, cacheSize: 200, preload: false },
  },
  'paint-recipes': {
    id: 'paint-recipes',
    name: 'Paint Recipes',
    icon: '🎭',
    description: 'Professional paint mixing formulas & calculator',
    color: '#f39c12',
    component: () => import('../PaintRecipeWorkstation'),
    features: ['multi-brand-support', 'cost-calculator', 'mixing-instructions', 'project-management'],
    dependencies: ['paintRecipes', 'optimizedColorEngine'],
    performance: { heavy: false, cacheSize: 300, preload: false },
  },
  'theory-lab': {
    id: 'theory-lab',
    name: 'Theory Lab',
    icon: '🔬',
    description: 'Advanced color analysis & accessibility testing',
    color: '#2ecc71',
    component: () => import('../ColorTheoryLab'),
    features: ['color-spaces', 'accessibility-testing', 'contrast-analysis', 'harmony-generation'],
    dependencies: ['optimizedColorEngine', 'perceptualColorEngine'],
    performance: { heavy: false, cacheSize: 400, preload: false },
  },
  'perceptual-lab': {
    id: 'perceptual-lab',
    name: 'Perceptual Lab',
    icon: '👁️',
    description: 'CIECAM02, contrast effects & color memory',
    color: '#8e44ad',
    component: () => import('../PerceptualColorLab'),
    features: ['ciecam02', 'simultaneous-contrast', 'color-memory', 'cultural-analysis'],
    dependencies: ['perceptualColorEngine', 'optimizedColorEngine'],
    performance: { heavy: true, cacheSize: 300, preload: false },
  },
  'harmony-explorer': {
    id: 'harmony-explorer',
    name: 'Harmony Explorer',
    icon: '⚖️',
    description: 'Interactive color wheel & harmony rules',
    color: '#9b59b6',
    component: () => import('../ColorHarmonyExplorer'),
    features: ['interactive-wheel', 'harmony-rules', 'color-theory', 'real-time-updates'],
    dependencies: ['optimizedColorEngine', 'react-native-reanimated'],
    performance: { heavy: true, cacheSize: 250, preload: false },
  },
  'trends-inspiration': {
    id: 'trends-inspiration',
    name: 'Trends & Inspiration',
    icon: '📈',
    description: '2024 color trends & mood-based palettes',
    color: '#1abc9c',
    component: () => import('../ColorTrendsInspiration'),
    features: ['trend-analysis', 'mood-palettes', 'industry-intelligence', 'favorites-system'],
    dependencies: ['optimizedColorEngine'],
    performance: { heavy: false, cacheSize: 200, preload: false },
  },
  'image-extractor': {
    id: 'image-extractor',
    name: 'Image Extractor',
    icon: '🖼️',
    description: 'Advanced image color analysis & extraction',
    color: '#e74c3c',
    component: () => import('../ImageColorExtractor'),
    features: ['advanced-extraction', 'palette-generation', 'export-options', 'batch-processing'],
    dependencies: ['imageColorExtractor', 'optimizedColorEngine'],
    performance: { heavy: true, cacheSize: 300, preload: false },
  },
  'accessibility-suite': {
    id: 'accessibility-suite',
    name: 'Accessibility Suite',
    icon: '♿',
    description: 'WCAG compliance testing & color blindness simulation',
    color: '#27ae60',
    component: () => import('../AccessibilityWorkstation'),
    features: ['wcag-testing', 'contrast-analysis', 'colorblind-simulation', 'batch-testing'],
    dependencies: ['advancedColorTechnologies', 'optimizedColorEngine'],
    performance: { heavy: false, cacheSize: 200, preload: false },
  },
};

// Workstation Categories for Organization
export const WORKSTATION_CATEGORIES = {
  CORE: ['main', 'scanner', 'paint-recipes'],
  ANALYSIS: ['theory-lab', 'perceptual-lab', 'harmony-explorer', 'accessibility-suite'],
  INSPIRATION: ['trends-inspiration', 'image-extractor'],
} as const;

// Performance Optimization Helpers
export const WORKSTATION_PERFORMANCE = {
  PRELOAD_WORKSTATIONS: ['main'],
  HEAVY_WORKSTATIONS: ['main', 'scanner', 'perceptual-lab', 'harmony-explorer', 'image-extractor'],
  CACHE_PRIORITIES: {
    HIGH: ['main', 'theory-lab'],
    MEDIUM: ['paint-recipes', 'perceptual-lab'],
    LOW: ['trends-inspiration', 'image-extractor'],
  },
} as const;

// AI Assistant Helpers
export const WORKSTATION_AI_METADATA = {
  MODIFICATION_COMPLEXITY: {
    LOW: ['trends-inspiration', 'paint-recipes'],
    MEDIUM: ['theory-lab', 'perceptual-lab', 'image-extractor'],
    HIGH: ['main', 'scanner', 'harmony-explorer'],
  },
  COMMON_MODIFICATIONS: {
    ADD_FEATURE: 'Add to features array and implement in component',
    CHANGE_ICON: 'Update icon property in registry',
    MODIFY_DESCRIPTION: 'Update description property',
    ADJUST_PERFORMANCE: 'Modify performance object settings',
    ADD_DEPENDENCY: 'Add to dependencies array and import in component',
  },
  TESTING_REQUIREMENTS: {
    VISUAL: ['main', 'harmony-explorer', 'scanner'],
    FUNCTIONAL: ['paint-recipes', 'theory-lab', 'perceptual-lab'],
    PERFORMANCE: ['main', 'scanner', 'image-extractor'],
    ACCESSIBILITY: ['all workstations'],
  },
} as const;

// Workstation State Management Helpers
export interface WorkstationState {
  currentWorkstation: string;
  history: string[];
  preloadedWorkstations: Set<string>;
  performanceMetrics: Record<string, any>;
}

// Utility Functions for Workstation Management
export const WorkstationUtils = {
  getWorkstationById: (id: string) => WORKSTATION_REGISTRY[id],
  getWorkstationsByCategory: (category: keyof typeof WORKSTATION_CATEGORIES) => 
    WORKSTATION_CATEGORIES[category].map(id => WORKSTATION_REGISTRY[id]),
  isHeavyWorkstation: (id: string) => WORKSTATION_PERFORMANCE.HEAVY_WORKSTATIONS.includes(id as any),
  shouldPreload: (id: string) => WORKSTATION_PERFORMANCE.PRELOAD_WORKSTATIONS.includes(id as any),
  getCachePriority: (id: string) => {
    for (const [priority, workstations] of Object.entries(WORKSTATION_PERFORMANCE.CACHE_PRIORITIES)) {
      if ((workstations as unknown as string[]).includes(id)) return priority.toLowerCase();
    }
    return 'low';
  },
} as const;

// Export Types for TypeScript Support
export type WorkstationId = keyof typeof WORKSTATION_REGISTRY;
export type WorkstationCategory = keyof typeof WORKSTATION_CATEGORIES;
export type CachePriority = 'high' | 'medium' | 'low';
export type ModificationComplexity = 'low' | 'medium' | 'high';
