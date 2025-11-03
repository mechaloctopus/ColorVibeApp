// Common Components Barrel Export
// Centralized exports for better maintainability and AI assistance

// Base UI Components
export { default as ColorOrb } from '../ColorOrb';
export { default as ColorInfoPanel } from '../ColorInfoPanel';
export { default as ColorActionMenu } from '../ColorActionMenu';

// Layout Components  
export { default as GeometricPaletteDisplay } from '../GeometricPaletteDisplay';
export { default as PaletteExportModal } from '../PaletteExportModal';

// Navigation Components
export { default as WorkstationNavigator } from '../WorkstationNavigator';
export { default as PremiumNavigationSystem } from '../PremiumNavigationSystem';

// Selector Components
export { default as MusicalModeSelector } from '../MusicalModeSelector';
export { default as RingPaletteSelector } from '../RingPaletteSelector';

// Complex Systems
export { default as SaturnRingsColorSystem } from '../SaturnRingsColorSystem';
export { default as OuijaColorPicker } from '../OuijaColorPicker';

// Quick Tools
export { default as QuickPaintRecipe } from '../QuickPaintRecipe';

// AI-Powered Components
export { default as AIColorSuggestions } from './AIColorSuggestions';
export { default as AccessibilityAnalyzer } from './AccessibilityAnalyzer';

// Type Definitions for AI Assistance
export interface CommonComponentProps {
  isDarkMode?: boolean;
  onColorSelect?: (color: string) => void;
  onClose?: () => void;
  style?: any;
}

export interface ColorComponentProps extends CommonComponentProps {
  color: string;
  size?: number;
  interactive?: boolean;
}

export interface PaletteComponentProps extends CommonComponentProps {
  colors: string[];
  selectedIndex?: number;
  onColorChange?: (colors: string[]) => void;
}

// Component Categories for AI Navigation
export const COMPONENT_CATEGORIES = {
  UI_PRIMITIVES: ['ColorOrb', 'ColorInfoPanel', 'ColorActionMenu'],
  LAYOUT: ['GeometricPaletteDisplay', 'PaletteExportModal'],
  NAVIGATION: ['WorkstationNavigator', 'PremiumNavigationSystem'],
  SELECTORS: ['MusicalModeSelector', 'RingPaletteSelector'],
  SYSTEMS: ['SaturnRingsColorSystem', 'OuijaColorPicker'],
  TOOLS: ['QuickPaintRecipe'],
} as const;

// Feature Flags for Easy Toggling
export const FEATURE_FLAGS = {
  PREMIUM_NAVIGATION: true,
  HAPTIC_FEEDBACK: true,
  PERFORMANCE_MONITORING: true,
  ADVANCED_ANIMATIONS: true,
  ACCESSIBILITY_FEATURES: true,
} as const;

// Component Registry for Dynamic Loading
export const COMPONENT_REGISTRY = {
  'color-orb': () => import('../ColorOrb'),
  'color-info-panel': () => import('../ColorInfoPanel'),
  'color-action-menu': () => import('../ColorActionMenu'),
  'geometric-palette': () => import('../GeometricPaletteDisplay'),
  'export-modal': () => import('../PaletteExportModal'),
  'workstation-nav': () => import('../WorkstationNavigator'),
  'premium-nav': () => import('../PremiumNavigationSystem'),
  'musical-selector': () => import('../MusicalModeSelector'),
  'ring-selector': () => import('../RingPaletteSelector'),
  'saturn-rings': () => import('../SaturnRingsColorSystem'),
  'ouija-picker': () => import('../OuijaColorPicker'),
  'quick-recipe': () => import('../QuickPaintRecipe'),
} as const;

// Performance Configuration (imported from central config)
export { PERFORMANCE_CONFIG } from '../../config';

// AI Assistant Metadata
export const AI_METADATA = {
  COMPONENT_PURPOSES: {
    ColorOrb: 'Individual color display with touch interactions',
    ColorInfoPanel: 'Detailed color information and analysis',
    ColorActionMenu: 'Context menu for color operations',
    GeometricPaletteDisplay: 'Visual palette layouts (triangle, square, etc.)',
    PaletteExportModal: 'Export functionality for palettes',
    WorkstationNavigator: 'Bottom tab navigation between workstations',
    PremiumNavigationSystem: 'Advanced node-based navigation overlay',
    MusicalModeSelector: 'Musical mode selection for color harmony',
    RingPaletteSelector: 'Palette type selection for Saturn rings',
    SaturnRingsColorSystem: 'Main rotating ring color selection system',
    OuijaColorPicker: 'Mystical color picker interface',
    QuickPaintRecipe: 'Quick paint mixing calculations',
  },
  MODIFICATION_GUIDELINES: {
    SAFE_TO_MODIFY: ['styles', 'animations', 'text content', 'colors'],
    REQUIRES_TESTING: ['touch handlers', 'state management', 'navigation'],
    BREAKING_CHANGES: ['prop interfaces', 'component structure', 'exports'],
  },
  COMMON_TASKS: {
    ADD_COLOR_FEATURE: 'Extend ColorComponentProps and implement in target component',
    MODIFY_ANIMATION: 'Update PERFORMANCE_CONFIG and component animation values',
    ADD_ACCESSIBILITY: 'Add accessibility props and ARIA labels',
    OPTIMIZE_PERFORMANCE: 'Check CACHE_SIZES and implement memoization',
  },
} as const;
