// Touch Optimization Utilities for Enhanced Mobile Experience
import { Dimensions, Platform } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Touch target size constants for accessibility
export const TOUCH_TARGETS = {
  MINIMUM: 44, // iOS Human Interface Guidelines minimum
  COMFORTABLE: 48, // Comfortable touch target
  LARGE: 56, // Large touch target for primary actions
} as const;

// Haptic feedback utilities
export const HapticFeedback = {
  light: () => {
    if (Platform.OS === 'ios') {
      // iOS haptic feedback would go here
      // For now, we'll use a placeholder
      console.log('Light haptic feedback');
    }
  },
  medium: () => {
    if (Platform.OS === 'ios') {
      console.log('Medium haptic feedback');
    }
  },
  heavy: () => {
    if (Platform.OS === 'ios') {
      console.log('Heavy haptic feedback');
    }
  },
  selection: () => {
    if (Platform.OS === 'ios') {
      console.log('Selection haptic feedback');
    }
  },
  impact: () => {
    if (Platform.OS === 'ios') {
      console.log('Impact haptic feedback');
    }
  },
};

// Enhanced touch gesture for color selection
export function createOptimizedColorTouchGesture(
  onColorSelect: (x: number, y: number) => void,
  onTouchStart?: () => void,
  onTouchEnd?: () => void
) {
  const isPressed = useSharedValue(false);
  const scale = useSharedValue(1);

  const gesture = Gesture.Pan()
    .onBegin(() => {
      isPressed.value = true;
      scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
      runOnJS(HapticFeedback.light)();
      if (onTouchStart) runOnJS(onTouchStart)();
    })
    .onUpdate((event) => {
      runOnJS(onColorSelect)(event.x, event.y);
    })
    .onEnd(() => {
      isPressed.value = false;
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      runOnJS(HapticFeedback.selection)();
      if (onTouchEnd) runOnJS(onTouchEnd)();
    })
    .onFinalize(() => {
      isPressed.value = false;
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { gesture, animatedStyle, isPressed };
}

// Enhanced long press gesture for color actions
export function createOptimizedLongPressGesture(
  onLongPress: () => void,
  onPress?: () => void,
  minimumPressDuration: number = 500
) {
  const isPressed = useSharedValue(false);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const gesture = Gesture.LongPress()
    .minDuration(minimumPressDuration)
    .onBegin(() => {
      isPressed.value = true;
      scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(0.8, { duration: 150 });
      runOnJS(HapticFeedback.light)();
    })
    .onStart(() => {
      runOnJS(HapticFeedback.heavy)();
      runOnJS(onLongPress)();
    })
    .onEnd(() => {
      isPressed.value = false;
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(1, { duration: 150 });
    })
    .onFinalize(() => {
      isPressed.value = false;
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(1, { duration: 150 });
    });

  // Add tap gesture for regular press
  const tapGesture = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.98, { damping: 20, stiffness: 400 });
      runOnJS(HapticFeedback.light)();
    })
    .onStart(() => {
      if (onPress) runOnJS(onPress)();
    })
    .onEnd(() => {
      scale.value = withSpring(1, { damping: 20, stiffness: 400 });
    });

  const combinedGesture = Gesture.Race(gesture, tapGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return { gesture: combinedGesture, animatedStyle, isPressed };
}

// Optimized scroll gesture for smooth performance
export function createOptimizedScrollGesture(
  onScroll: (deltaY: number) => void,
  sensitivity: number = 1
) {
  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      const deltaY = event.translationY * sensitivity;
      runOnJS(onScroll)(deltaY);
    });

  return gesture;
}

// Touch area calculation utilities
export function calculateOptimalTouchArea(
  elementSize: number,
  minimumTouchSize: number = TOUCH_TARGETS.MINIMUM
): { size: number; padding: number } {
  if (elementSize >= minimumTouchSize) {
    return { size: elementSize, padding: 0 };
  }

  const padding = (minimumTouchSize - elementSize) / 2;
  return { size: minimumTouchSize, padding };
}

// Screen edge detection for better UX
export function isNearScreenEdge(
  x: number,
  y: number,
  threshold: number = 50
): {
  nearLeft: boolean;
  nearRight: boolean;
  nearTop: boolean;
  nearBottom: boolean;
} {
  return {
    nearLeft: x < threshold,
    nearRight: x > SCREEN_WIDTH - threshold,
    nearTop: y < threshold,
    nearBottom: y > SCREEN_HEIGHT - threshold,
  };
}

// Adaptive positioning for UI elements
export function calculateAdaptivePosition(
  targetX: number,
  targetY: number,
  elementWidth: number,
  elementHeight: number,
  margin: number = 20
): { x: number; y: number; adjustedX: boolean; adjustedY: boolean } {
  let adjustedX = false;
  let adjustedY = false;
  let finalX = targetX;
  let finalY = targetY;

  // Adjust horizontal position
  if (targetX + elementWidth + margin > SCREEN_WIDTH) {
    finalX = targetX - elementWidth - margin;
    adjustedX = true;
  } else if (targetX - margin < 0) {
    finalX = margin;
    adjustedX = true;
  }

  // Adjust vertical position
  if (targetY + elementHeight + margin > SCREEN_HEIGHT) {
    finalY = targetY - elementHeight - margin;
    adjustedY = true;
  } else if (targetY - margin < 0) {
    finalY = margin;
    adjustedY = true;
  }

  return { x: finalX, y: finalY, adjustedX, adjustedY };
}

// Performance-optimized animation presets
export const ANIMATION_PRESETS = {
  // Quick and snappy for immediate feedback
  quick: {
    damping: 25,
    stiffness: 400,
    duration: 150,
  },
  // Smooth and natural for general UI
  smooth: {
    damping: 20,
    stiffness: 300,
    duration: 250,
  },
  // Gentle and elegant for large movements
  gentle: {
    damping: 15,
    stiffness: 200,
    duration: 350,
  },
  // Bouncy and playful for success states
  bouncy: {
    damping: 10,
    stiffness: 300,
    duration: 400,
  },
} as const;

// Create optimized spring animation
export function createOptimizedSpring(
  preset: keyof typeof ANIMATION_PRESETS = 'smooth'
) {
  const config = ANIMATION_PRESETS[preset];
  return {
    damping: config.damping,
    stiffness: config.stiffness,
  };
}

// Create optimized timing animation
export function createOptimizedTiming(
  preset: keyof typeof ANIMATION_PRESETS = 'smooth'
) {
  const config = ANIMATION_PRESETS[preset];
  return {
    duration: config.duration,
  };
}

// Gesture conflict resolution
export function createGestureComposition(...gestures: any[]) {
  if (gestures.length === 1) return gestures[0];
  if (gestures.length === 2) return Gesture.Race(...gestures);
  
  // For multiple gestures, create a hierarchy
  return Gesture.Exclusive(...gestures);
}

// Touch feedback visual effects
export function createTouchFeedbackStyle(
  isPressed: Animated.SharedValue<boolean>,
  pressedScale: number = 0.95,
  pressedOpacity: number = 0.8
) {
  return useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(
          isPressed.value ? pressedScale : 1,
          createOptimizedSpring('quick')
        ),
      },
    ],
    opacity: withTiming(
      isPressed.value ? pressedOpacity : 1,
      createOptimizedTiming('quick')
    ),
  }));
}

// Accessibility helpers
export function createAccessibilityProps(
  label: string,
  hint?: string,
  role: string = 'button'
) {
  return {
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: role as any,
    accessibilityState: {},
  };
}

// Performance monitoring for touch interactions
export class TouchPerformanceMonitor {
  private static touchStartTimes = new Map<string, number>();
  private static touchDurations: number[] = [];

  static startTouch(touchId: string): void {
    this.touchStartTimes.set(touchId, performance.now());
  }

  static endTouch(touchId: string): number {
    const startTime = this.touchStartTimes.get(touchId);
    if (!startTime) return 0;

    const duration = performance.now() - startTime;
    this.touchDurations.push(duration);
    this.touchStartTimes.delete(touchId);

    // Keep only last 100 measurements
    if (this.touchDurations.length > 100) {
      this.touchDurations.shift();
    }

    return duration;
  }

  static getAverageTouchDuration(): number {
    if (this.touchDurations.length === 0) return 0;
    const sum = this.touchDurations.reduce((a, b) => a + b, 0);
    return sum / this.touchDurations.length;
  }

  static getTouchPerformanceReport(): {
    averageDuration: number;
    totalTouches: number;
    activeTouches: number;
  } {
    return {
      averageDuration: this.getAverageTouchDuration(),
      totalTouches: this.touchDurations.length,
      activeTouches: this.touchStartTimes.size,
    };
  }
}
