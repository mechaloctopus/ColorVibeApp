// Premium Micro-Interaction System
// Advanced haptic feedback and delightful animations

// Haptics import with fallback for when expo-haptics is not available
let Haptics: any = null;
try {
  Haptics = require('expo-haptics').Haptics;
} catch (error) {
  console.warn('[Premium Interactions] expo-haptics not available, using fallback');
  // Fallback haptics implementation
  Haptics = {
    ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
    NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
    impactAsync: async () => Promise.resolve(),
    notificationAsync: async () => Promise.resolve(),
    selectionAsync: async () => Promise.resolve(),
  };
}

import { runOnJS, withSpring, withTiming, withSequence, withDelay } from 'react-native-reanimated';
import { ConfigUtils, PERFORMANCE_CONFIG } from '../config';

// Haptic Feedback Types
export enum HapticType {
  LIGHT = 'light',
  MEDIUM = 'medium',
  HEAVY = 'heavy',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  SELECTION = 'selection',
  IMPACT_LIGHT = 'impact_light',
  IMPACT_MEDIUM = 'impact_medium',
  IMPACT_HEAVY = 'impact_heavy',
}

// Animation Presets
export enum AnimationPreset {
  GENTLE_BOUNCE = 'gentle_bounce',
  ELASTIC_SCALE = 'elastic_scale',
  SMOOTH_FADE = 'smooth_fade',
  SPRING_ENTRANCE = 'spring_entrance',
  WOBBLE = 'wobble',
  PULSE = 'pulse',
  SHAKE = 'shake',
  FLOAT = 'float',
  MAGNETIC_SNAP = 'magnetic_snap',
  LIQUID_MORPH = 'liquid_morph',
}

// Interaction Context
export interface InteractionContext {
  type: 'color_select' | 'palette_change' | 'workstation_switch' | 'export' | 'error' | 'success';
  importance: 'low' | 'medium' | 'high' | 'critical';
  element: 'button' | 'color_orb' | 'palette' | 'navigation' | 'modal' | 'input';
  feedback: {
    haptic: boolean;
    visual: boolean;
    audio: boolean;
  };
}

// Premium Haptic Feedback System
export class PremiumHaptics {
  private static isEnabled = ConfigUtils.isFeatureEnabled('HAPTIC_FEEDBACK');
  private static lastHapticTime = 0;
  private static hapticThrottle = 50; // ms
  
  static async trigger(type: HapticType, context?: Partial<InteractionContext>) {
    if (!this.isEnabled) return;
    
    // Throttle haptic feedback to prevent overwhelming
    const now = Date.now();
    if (now - this.lastHapticTime < this.hapticThrottle) return;
    this.lastHapticTime = now;
    
    try {
      switch (type) {
        case HapticType.LIGHT:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case HapticType.MEDIUM:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case HapticType.HEAVY:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case HapticType.SUCCESS:
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case HapticType.WARNING:
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case HapticType.ERROR:
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case HapticType.SELECTION:
          await Haptics.selectionAsync();
          break;
        default:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      // Log for analytics (in production)
      if (context && __DEV__) {
        console.log(`[Premium Haptics] ${type} for ${context.type} on ${context.element}`);
      }
    } catch (error) {
      console.warn('[Premium Haptics] Failed to trigger haptic:', error);
    }
  }
  
  // Contextual haptic feedback
  static async contextualFeedback(context: InteractionContext) {
    if (!context.feedback.haptic) return;
    
    let hapticType: HapticType;
    
    // Determine haptic type based on context
    switch (context.type) {
      case 'color_select':
        hapticType = context.element === 'color_orb' ? HapticType.MEDIUM : HapticType.LIGHT;
        break;
      case 'palette_change':
        hapticType = HapticType.SELECTION;
        break;
      case 'workstation_switch':
        hapticType = HapticType.MEDIUM;
        break;
      case 'export':
        hapticType = HapticType.SUCCESS;
        break;
      case 'error':
        hapticType = HapticType.ERROR;
        break;
      case 'success':
        hapticType = HapticType.SUCCESS;
        break;
      default:
        hapticType = HapticType.LIGHT;
    }
    
    // Adjust intensity based on importance
    if (context.importance === 'critical') {
      hapticType = HapticType.HEAVY;
    } else if (context.importance === 'low') {
      hapticType = HapticType.LIGHT;
    }
    
    await this.trigger(hapticType, context);
  }
  
  // Complex haptic patterns
  static async playPattern(pattern: 'double_tap' | 'triple_tap' | 'heartbeat' | 'morse_code') {
    if (!this.isEnabled) return;
    
    switch (pattern) {
      case 'double_tap':
        await this.trigger(HapticType.LIGHT);
        setTimeout(() => this.trigger(HapticType.LIGHT), 100);
        break;
      case 'triple_tap':
        await this.trigger(HapticType.LIGHT);
        setTimeout(() => this.trigger(HapticType.LIGHT), 100);
        setTimeout(() => this.trigger(HapticType.LIGHT), 200);
        break;
      case 'heartbeat':
        await this.trigger(HapticType.MEDIUM);
        setTimeout(() => this.trigger(HapticType.LIGHT), 150);
        break;
      case 'morse_code':
        // S.O.S pattern
        await this.trigger(HapticType.LIGHT); // S
        setTimeout(() => this.trigger(HapticType.LIGHT), 100);
        setTimeout(() => this.trigger(HapticType.LIGHT), 200);
        setTimeout(() => this.trigger(HapticType.MEDIUM), 400); // O
        setTimeout(() => this.trigger(HapticType.MEDIUM), 600);
        setTimeout(() => this.trigger(HapticType.MEDIUM), 800);
        setTimeout(() => this.trigger(HapticType.LIGHT), 1000); // S
        setTimeout(() => this.trigger(HapticType.LIGHT), 1100);
        setTimeout(() => this.trigger(HapticType.LIGHT), 1200);
        break;
    }
  }
}

// Premium Animation System
export class PremiumAnimations {
  private static isEnabled = ConfigUtils.isFeatureEnabled('PREMIUM_NAVIGATION');
  
  // Get animation configuration
  static getConfig(preset: AnimationPreset) {
    if (!this.isEnabled) {
      return { duration: 0, easing: { damping: 1, stiffness: 1 } };
    }
    
    const baseConfig = PERFORMANCE_CONFIG.ANIMATION;
    
    switch (preset) {
      case AnimationPreset.GENTLE_BOUNCE:
        return {
          duration: baseConfig.DURATION.NORMAL,
          easing: { damping: 18, stiffness: 180 },
        };
      case AnimationPreset.ELASTIC_SCALE:
        return {
          duration: baseConfig.DURATION.SLOW,
          easing: { damping: 12, stiffness: 250 },
        };
      case AnimationPreset.SMOOTH_FADE:
        return {
          duration: baseConfig.DURATION.FAST,
          easing: { damping: 25, stiffness: 400 },
        };
      case AnimationPreset.SPRING_ENTRANCE:
        return {
          duration: baseConfig.DURATION.NORMAL,
          easing: { damping: 15, stiffness: 200 },
        };
      case AnimationPreset.WOBBLE:
        return {
          duration: baseConfig.DURATION.SLOW,
          easing: { damping: 8, stiffness: 300 },
        };
      case AnimationPreset.PULSE:
        return {
          duration: baseConfig.DURATION.FAST,
          easing: { damping: 20, stiffness: 300 },
        };
      case AnimationPreset.SHAKE:
        return {
          duration: baseConfig.DURATION.FAST,
          easing: { damping: 30, stiffness: 500 },
        };
      case AnimationPreset.FLOAT:
        return {
          duration: baseConfig.DURATION.VERY_SLOW,
          easing: { damping: 25, stiffness: 100 },
        };
      case AnimationPreset.MAGNETIC_SNAP:
        return {
          duration: baseConfig.DURATION.FAST,
          easing: { damping: 20, stiffness: 400 },
        };
      case AnimationPreset.LIQUID_MORPH:
        return {
          duration: baseConfig.DURATION.SLOW,
          easing: { damping: 22, stiffness: 150 },
        };
      default:
        return {
          duration: baseConfig.DURATION.NORMAL,
          easing: baseConfig.EASING.SPRING,
        };
    }
  }
  
  // Create animation value
  static createAnimation(preset: AnimationPreset, toValue: number, fromValue: number = 0) {
    const config = this.getConfig(preset);
    
    switch (preset) {
      case AnimationPreset.WOBBLE:
        return withSequence(
          withSpring(toValue * 1.1, config.easing),
          withSpring(toValue * 0.9, config.easing),
          withSpring(toValue, config.easing)
        );
      case AnimationPreset.PULSE:
        return withSequence(
          withSpring(toValue * 1.2, config.easing),
          withSpring(toValue, config.easing)
        );
      case AnimationPreset.SHAKE:
        return withSequence(
          withTiming(fromValue + 10, { duration: 50 }),
          withTiming(fromValue - 10, { duration: 50 }),
          withTiming(fromValue + 10, { duration: 50 }),
          withTiming(fromValue - 10, { duration: 50 }),
          withTiming(toValue, { duration: 50 })
        );
      case AnimationPreset.FLOAT:
        return withSequence(
          withTiming(toValue, { duration: config.duration }),
          withTiming(toValue + 5, { duration: config.duration }),
          withTiming(toValue, { duration: config.duration })
        );
      case AnimationPreset.SMOOTH_FADE:
        return withTiming(toValue, { duration: config.duration });
      default:
        return withSpring(toValue, config.easing);
    }
  }
  
  // Staggered animations for multiple elements
  static createStaggeredAnimation(
    preset: AnimationPreset,
    toValue: number,
    count: number,
    staggerDelay: number = 50
  ) {
    const animations = [];
    
    for (let i = 0; i < count; i++) {
      const delay = i * staggerDelay;
      animations.push(
        withDelay(delay, this.createAnimation(preset, toValue))
      );
    }
    
    return animations;
  }
  
  // Contextual animations
  static getContextualAnimation(context: InteractionContext, toValue: number) {
    let preset: AnimationPreset;
    
    switch (context.type) {
      case 'color_select':
        preset = context.element === 'color_orb' ? AnimationPreset.ELASTIC_SCALE : AnimationPreset.GENTLE_BOUNCE;
        break;
      case 'palette_change':
        preset = AnimationPreset.LIQUID_MORPH;
        break;
      case 'workstation_switch':
        preset = AnimationPreset.SPRING_ENTRANCE;
        break;
      case 'export':
        preset = AnimationPreset.PULSE;
        break;
      case 'error':
        preset = AnimationPreset.SHAKE;
        break;
      case 'success':
        preset = AnimationPreset.WOBBLE;
        break;
      default:
        preset = AnimationPreset.GENTLE_BOUNCE;
    }
    
    return this.createAnimation(preset, toValue);
  }
}

// Combined Interaction System
export class PremiumInteractions {
  // Trigger complete interaction feedback
  static async trigger(context: InteractionContext, animationValue?: any, toValue?: number) {
    // Haptic feedback
    if (context.feedback.haptic) {
      await PremiumHaptics.contextualFeedback(context);
    }
    
    // Visual animation
    if (context.feedback.visual && animationValue && toValue !== undefined) {
      animationValue.value = PremiumAnimations.getContextualAnimation(context, toValue);
    }
    
    // Audio feedback (future implementation)
    if (context.feedback.audio) {
      // Would implement audio feedback here
    }
  }
  
  // Quick interaction presets
  static async colorSelect(animationValue?: any) {
    await this.trigger({
      type: 'color_select',
      importance: 'medium',
      element: 'color_orb',
      feedback: { haptic: true, visual: true, audio: false },
    }, animationValue, 1.1);
  }
  
  static async paletteChange(animationValue?: any) {
    await this.trigger({
      type: 'palette_change',
      importance: 'medium',
      element: 'palette',
      feedback: { haptic: true, visual: true, audio: false },
    }, animationValue, 1);
  }
  
  static async workstationSwitch(animationValue?: any) {
    await this.trigger({
      type: 'workstation_switch',
      importance: 'high',
      element: 'navigation',
      feedback: { haptic: true, visual: true, audio: false },
    }, animationValue, 1);
  }
  
  static async exportSuccess(animationValue?: any) {
    await this.trigger({
      type: 'export',
      importance: 'high',
      element: 'button',
      feedback: { haptic: true, visual: true, audio: false },
    }, animationValue, 1.2);
  }
  
  static async error(animationValue?: any) {
    await this.trigger({
      type: 'error',
      importance: 'critical',
      element: 'modal',
      feedback: { haptic: true, visual: true, audio: false },
    }, animationValue, 1);
  }
  
  static async success(animationValue?: any) {
    await this.trigger({
      type: 'success',
      importance: 'high',
      element: 'modal',
      feedback: { haptic: true, visual: true, audio: false },
    }, animationValue, 1);
  }
}

// Utility functions for common patterns
export const InteractionUtils = {
  // Create a standard interaction hook
  createInteractionValue: () => {
    const { useSharedValue } = require('react-native-reanimated');
    return useSharedValue(1);
  },
  
  // Create animated style for interactions
  createInteractionStyle: (animationValue: any) => {
    const { useAnimatedStyle } = require('react-native-reanimated');
    return useAnimatedStyle(() => ({
      transform: [{ scale: animationValue.value }],
    }));
  },
  
  // Debounce interactions to prevent spam
  debounce: (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  },
  
  // Throttle interactions for performance
  throttle: (func: Function, delay: number) => {
    let lastCall = 0;
    return (...args: any[]) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func.apply(null, args);
      }
    };
  },
};

// All classes and utilities are already exported individually above
