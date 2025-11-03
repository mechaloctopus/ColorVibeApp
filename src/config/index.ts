// Application Configuration
// Centralized configuration management for better maintainability

// Feature Flags - Easy toggling for AI assistance
export const FEATURE_FLAGS = {
  // Core Features
  SATURN_RINGS_SYSTEM: true,
  MUSICAL_COLOR_THEORY: true,
  UNIVERSAL_COLOR_ACTIONS: true,
  
  // Advanced Features
  PERCEPTUAL_COLOR_LAB: true,
  QUANTUM_COLOR_PROCESSING: false, // Future feature
  AI_COLOR_SUGGESTIONS: true, // ✅ NOW AVAILABLE!
  
  // UI Features
  PREMIUM_NAVIGATION: true,
  HAPTIC_FEEDBACK: true,
  DARK_MODE: true,
  ACCESSIBILITY_FEATURES: true,
  
  // Performance Features
  PERFORMANCE_MONITORING: true,
  ADVANCED_CACHING: true,
  LAZY_LOADING: false, // Future optimization
  
  // Export Features
  PDF_EXPORT: true,
  PROFESSIONAL_EXPORT: true,
  BATCH_EXPORT: false, // Future feature
  
  // Integration Features
  CAMERA_INTEGRATION: true,
  GALLERY_INTEGRATION: true,
  CLOUD_SYNC: false, // Future feature
} as const;

// Performance Configuration
export const PERFORMANCE_CONFIG = {
  // Animation Settings
  ANIMATION: {
    DURATION: {
      FAST: 150,
      NORMAL: 250,
      SLOW: 350,
      VERY_SLOW: 500,
    },
    EASING: {
      SPRING: { damping: 15, stiffness: 200 },
      SMOOTH: { damping: 20, stiffness: 150 },
      BOUNCY: { damping: 10, stiffness: 300 },
      QUICK: { damping: 25, stiffness: 400 },
    },
    FPS_TARGET: 60,
    FRAME_TIME_MS: 16.67, // 1000/60
  },
  
  // Caching Configuration
  CACHE: {
    SIZES: {
      COLOR_CONVERSIONS: 1000,
      PALETTE_GENERATION: 500,
      IMAGE_ANALYSIS: 200,
      PERCEPTUAL_ANALYSIS: 300,
      PAINT_RECIPES: 400,
      CULTURAL_ANALYSIS: 100,
    },
    TTL_SECONDS: {
      COLOR_DATA: 3600, // 1 hour
      PALETTE_DATA: 1800, // 30 minutes
      IMAGE_DATA: 600, // 10 minutes
      ANALYSIS_DATA: 1200, // 20 minutes
    },
    MAX_MEMORY_MB: 50,
  },
  
  // Throttling Configuration
  THROTTLE: {
    TOUCH_INTERACTIONS: 16, // ~60fps
    COLOR_UPDATES: 32, // ~30fps
    PALETTE_UPDATES: 50, // ~20fps
    IMAGE_PROCESSING: 100, // ~10fps
    EXPORT_OPERATIONS: 200, // ~5fps
    NETWORK_REQUESTS: 500, // ~2fps
  },
  
  // Memory Management
  MEMORY: {
    WARNING_THRESHOLD_MB: 40,
    CRITICAL_THRESHOLD_MB: 45,
    CLEANUP_INTERVAL_MS: 30000, // 30 seconds
    GC_TRIGGER_THRESHOLD: 0.8, // 80% of max memory
  },
} as const;

// UI Configuration
export const UI_CONFIG = {
  // Touch Targets (Accessibility)
  TOUCH: {
    MIN_TARGET_SIZE: 44, // iOS/Android accessibility standard
    COMFORTABLE_TARGET_SIZE: 48,
    LARGE_TARGET_SIZE: 56,
    TOUCH_SLOP: 8, // Additional touch area
  },
  
  // Color System
  COLORS: {
    BRAND_PRIMARY: '#3498db',
    BRAND_SECONDARY: '#2ecc71',
    ACCENT_COLORS: ['#e74c3c', '#f39c12', '#9b59b6', '#1abc9c'],
    SEMANTIC: {
      SUCCESS: '#27ae60',
      WARNING: '#f39c12',
      ERROR: '#e74c3c',
      INFO: '#3498db',
    },
  },
  
  // Typography
  TYPOGRAPHY: {
    FONT_FAMILY: {
      PRIMARY: 'System',
      MONOSPACE: 'Courier New',
    },
    FONT_SIZES: {
      XS: 12,
      SM: 14,
      BASE: 16,
      LG: 18,
      XL: 20,
      XXL: 24,
      XXXL: 32,
    },
    LINE_HEIGHTS: {
      TIGHT: 1.25,
      NORMAL: 1.5,
      RELAXED: 1.75,
      LOOSE: 2.0,
    },
  },
  
  // Spacing System (4px grid)
  SPACING: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128],
  
  // Border Radius
  BORDER_RADIUS: {
    NONE: 0,
    SM: 4,
    BASE: 8,
    LG: 12,
    XL: 16,
    XXL: 24,
    FULL: 9999,
  },
  
  // Shadows
  SHADOWS: {
    NONE: { shadowOpacity: 0 },
    SM: { shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
    BASE: { shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    LG: { shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 },
    XL: { shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16 },
  },
} as const;

// Color Science Configuration
export const COLOR_SCIENCE_CONFIG = {
  // Color Spaces
  COLOR_SPACES: {
    DEFAULT: 'sRGB',
    SUPPORTED: ['sRGB', 'Adobe RGB', 'P3', 'Rec2020', 'LAB', 'XYZ'],
  },
  
  // Accuracy Settings
  ACCURACY: {
    DECIMAL_PLACES: {
      RGB: 0,
      HSL: 1,
      LAB: 2,
      XYZ: 3,
    },
    DELTA_E_THRESHOLD: {
      JND: 2.3, // Just Noticeable Difference
      ACCEPTABLE: 5.0,
      POOR: 10.0,
    },
  },
  
  // Perceptual Settings
  PERCEPTUAL: {
    VIEWING_CONDITIONS: {
      DEFAULT: 'sRGB',
      AVAILABLE: ['sRGB', 'print', 'darkRoom'],
    },
    MEMORY_DECAY_HALF_LIFE: 30, // seconds
    CONTRAST_ADAPTATION_FACTOR: 0.5,
  },
  
  // Cultural Settings
  CULTURAL: {
    DEFAULT_CULTURE: 'western',
    SUPPORTED_CULTURES: ['western', 'eastern', 'african', 'latin'],
  },
} as const;

// Development Configuration
export const DEV_CONFIG = {
  // Debug Settings
  DEBUG: {
    ENABLED: __DEV__,
    LOG_PERFORMANCE: __DEV__,
    LOG_COLOR_CALCULATIONS: false,
    LOG_CACHE_OPERATIONS: false,
    LOG_TOUCH_EVENTS: false,
  },
  
  // Testing Settings
  TESTING: {
    MOCK_CAMERA: __DEV__,
    MOCK_HAPTICS: false,
    SKIP_ANIMATIONS: false,
    FAST_MODE: false,
  },
  
  // Development Tools
  DEV_TOOLS: {
    PERFORMANCE_OVERLAY: false,
    COLOR_DEBUG_PANEL: false,
    CACHE_INSPECTOR: false,
    TOUCH_VISUALIZER: false,
  },
} as const;

// AI Assistant Configuration
export const AI_CONFIG = {
  // Modification Guidelines
  MODIFICATION_SAFETY: {
    SAFE: [
      'FEATURE_FLAGS',
      'UI_CONFIG.COLORS',
      'UI_CONFIG.TYPOGRAPHY',
      'UI_CONFIG.SPACING',
      'PERFORMANCE_CONFIG.ANIMATION.DURATION',
      'PERFORMANCE_CONFIG.CACHE.SIZES',
    ],
    REQUIRES_TESTING: [
      'PERFORMANCE_CONFIG.THROTTLE',
      'PERFORMANCE_CONFIG.MEMORY',
      'COLOR_SCIENCE_CONFIG',
      'UI_CONFIG.TOUCH',
    ],
    DANGEROUS: [
      'Core algorithm parameters',
      'Memory management thresholds',
      'Critical performance settings',
    ],
  },
  
  // Common Modification Patterns
  COMMON_TASKS: {
    ENABLE_FEATURE: 'Set feature flag to true in FEATURE_FLAGS',
    ADJUST_PERFORMANCE: 'Modify values in PERFORMANCE_CONFIG',
    CHANGE_COLORS: 'Update UI_CONFIG.COLORS',
    MODIFY_ANIMATIONS: 'Adjust PERFORMANCE_CONFIG.ANIMATION',
    UPDATE_CACHE_SIZE: 'Change PERFORMANCE_CONFIG.CACHE.SIZES',
    ADD_NEW_FEATURE_FLAG: 'Add to FEATURE_FLAGS with default value',
  },
  
  // Configuration Validation
  VALIDATION_RULES: {
    CACHE_SIZES: 'Must be positive integers',
    ANIMATION_DURATIONS: 'Must be between 50-1000ms',
    THROTTLE_DELAYS: 'Must be between 1-1000ms',
    MEMORY_THRESHOLDS: 'Must be between 1-100MB',
    TOUCH_TARGETS: 'Must be at least 44px for accessibility',
  },
} as const;

// Configuration Utilities
export const ConfigUtils = {
  isFeatureEnabled: (feature: keyof typeof FEATURE_FLAGS) => FEATURE_FLAGS[feature],
  getAnimationDuration: (speed: keyof typeof PERFORMANCE_CONFIG.ANIMATION.DURATION) => 
    PERFORMANCE_CONFIG.ANIMATION.DURATION[speed],
  getCacheSize: (cache: keyof typeof PERFORMANCE_CONFIG.CACHE.SIZES) => 
    PERFORMANCE_CONFIG.CACHE.SIZES[cache],
  getThrottleDelay: (operation: keyof typeof PERFORMANCE_CONFIG.THROTTLE) => 
    PERFORMANCE_CONFIG.THROTTLE[operation],
  validateConfig: () => {
    // Implementation would validate all configuration values
    return { valid: true, errors: [] };
  },
} as const;

// Export configuration types for TypeScript support
export type FeatureFlag = keyof typeof FEATURE_FLAGS;
export type AnimationSpeed = keyof typeof PERFORMANCE_CONFIG.ANIMATION.DURATION;
export type CacheType = keyof typeof PERFORMANCE_CONFIG.CACHE.SIZES;
export type ThrottleOperation = keyof typeof PERFORMANCE_CONFIG.THROTTLE;
export type ColorSpace = typeof COLOR_SCIENCE_CONFIG.COLOR_SPACES.SUPPORTED[number];
export type Culture = typeof COLOR_SCIENCE_CONFIG.CULTURAL.SUPPORTED_CULTURES[number];
