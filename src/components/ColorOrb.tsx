import React, { useState, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { optimizedHexToRgb, analyzeColorOptimized } from '../utils/optimizedColorEngine';
import { PremiumInteractions, InteractionUtils } from '../utils/premiumInteractions';

interface ColorOrbProps {
  color: string;
  hsl: { h: number; s: number; l: number };
  position: { x: number; y: number };
  size: number;
  type: 'primary' | 'secondary';
  index: number;
  isSelected: boolean;
  onPress: (index: number) => void;
  showColorCodes: boolean;
  isDarkMode: boolean;
}

interface ColorCodes {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  cmyk: { c: number; m: number; y: number; k: number };
  lab: { l: number; a: number; b: number };
}

const ColorOrb: React.FC<ColorOrbProps> = ({
  color,
  hsl,
  position,
  size,
  type,
  index,
  isSelected,
  onPress,
  showColorCodes,
  isDarkMode,
}) => {
  const [showCodes, setShowCodes] = useState(false);
  
  // Animation values with premium interactions
  const scale = useSharedValue(1);
  const codesOpacity = useSharedValue(0);
  const codesScale = useSharedValue(0.8);
  const interactionScale = InteractionUtils.createInteractionValue();

  // Optimized color codes calculation with memoization
  const colorCodes = React.useMemo((): ColorCodes => {
    const analysis = analyzeColorOptimized(color);
    if (!analysis) {
      return {
        hex: color,
        rgb: { r: 0, g: 0, b: 0 },
        hsl: { h: 0, s: 0, l: 0 },
        cmyk: { c: 0, m: 0, y: 0, k: 0 },
        lab: { l: 0, a: 0, b: 0 },
      };
    }

    return {
      hex: analysis.hex,
      rgb: analysis.rgb,
      hsl: {
        h: Math.round(hsl.h),
        s: Math.round(hsl.s),
        l: Math.round(hsl.l),
      },
      cmyk: analysis.cmyk,
      lab: analysis.lab,
    };
  }, [color, hsl]);

  // Handle orb press with premium interactions
  const handlePress = async () => {
    // Premium interaction feedback
    await PremiumInteractions.colorSelect(interactionScale);

    // Scale animation
    scale.value = withSpring(0.9, { damping: 15, stiffness: 300 }, () => {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    });

    // Toggle color codes display
    const newShowCodes = !showCodes;
    setShowCodes(newShowCodes);

    if (newShowCodes) {
      codesOpacity.value = withTiming(1, { duration: 200 });
      codesScale.value = withSpring(1, { damping: 15, stiffness: 200 });
    } else {
      codesOpacity.value = withTiming(0, { duration: 200 });
      codesScale.value = withSpring(0.8, { damping: 15, stiffness: 200 });
    }

    onPress(index);
  };

  // Animated styles with premium interactions
  const orbStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { scale: interactionScale.value },
    ],
  }));

  const codesStyle = useAnimatedStyle(() => ({
    opacity: codesOpacity.value,
    transform: [{ scale: codesScale.value }],
  }));

  // Determine color codes panel position
  const getCodesPosition = () => {
    const panelWidth = 140;
    const panelHeight = 120;
    
    // Position panel to avoid screen edges
    let left = position.x + size + 10;
    let top = position.y - panelHeight / 2;
    
    // Adjust if too close to right edge
    if (left + panelWidth > 400) {
      left = position.x - panelWidth - 10;
    }
    
    // Adjust if too close to top/bottom edges
    if (top < 20) top = 20;
    if (top + panelHeight > 800) top = 800 - panelHeight;
    
    return { left, top };
  };

  const codesPosition = getCodesPosition();

  return (
    <View style={[styles.container, { left: position.x - size/2, top: position.y - size/2 }]}>
      {/* Main Color Orb */}
      <Animated.View style={orbStyle}>
        <TouchableOpacity
          style={[
            styles.orb,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
              borderWidth: type === 'primary' ? 4 : 3,
              borderColor: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
              shadowColor: type === 'primary' ? color : '#000000',
              shadowOpacity: type === 'primary' ? 0.6 : 0.3,
              shadowRadius: type === 'primary' ? 8 : 4,
              elevation: type === 'primary' ? 12 : 6,
            },
          ]}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          {/* Orb Type Indicator */}
          {type === 'primary' && (
            <View style={styles.primaryIndicator}>
              <View style={styles.primaryDot} />
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Floating Color Codes Panel */}
      {(showCodes || (showColorCodes && isSelected)) && (
        <Animated.View
          style={[
            styles.colorCodesPanel,
            {
              left: codesPosition.left - position.x + size/2,
              top: codesPosition.top - position.y + size/2,
              backgroundColor: isDarkMode ? 'rgba(42, 42, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              borderColor: isDarkMode ? '#555555' : '#cccccc',
            },
            codesStyle,
          ]}
        >
          <Text style={[styles.codesTitle, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
            Color Codes
          </Text>
          
          <View style={styles.codeRow}>
            <Text style={[styles.codeLabel, { color: isDarkMode ? '#cccccc' : '#666666' }]}>HEX:</Text>
            <Text style={[styles.codeValue, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
              {colorCodes.hex.toUpperCase()}
            </Text>
          </View>
          
          <View style={styles.codeRow}>
            <Text style={[styles.codeLabel, { color: isDarkMode ? '#cccccc' : '#666666' }]}>RGB:</Text>
            <Text style={[styles.codeValue, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
              {colorCodes.rgb.r}, {colorCodes.rgb.g}, {colorCodes.rgb.b}
            </Text>
          </View>
          
          <View style={styles.codeRow}>
            <Text style={[styles.codeLabel, { color: isDarkMode ? '#cccccc' : '#666666' }]}>HSL:</Text>
            <Text style={[styles.codeValue, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
              {colorCodes.hsl.h}°, {colorCodes.hsl.s}%, {colorCodes.hsl.l}%
            </Text>
          </View>
          
          <View style={styles.codeRow}>
            <Text style={[styles.codeLabel, { color: isDarkMode ? '#cccccc' : '#666666' }]}>CMYK:</Text>
            <Text style={[styles.codeValue, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
              {colorCodes.cmyk.c}, {colorCodes.cmyk.m}, {colorCodes.cmyk.y}, {colorCodes.cmyk.k}
            </Text>
          </View>
          
          <View style={styles.codeRow}>
            <Text style={[styles.codeLabel, { color: isDarkMode ? '#cccccc' : '#666666' }]}>LAB:</Text>
            <Text style={[styles.codeValue, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
              {colorCodes.lab.l}, {colorCodes.lab.a}, {colorCodes.lab.b}
            </Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 10,
  },
  orb: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
  },
  primaryIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  colorCodesPanel: {
    position: 'absolute',
    minWidth: 140,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 100,
  },
  codesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  codeLabel: {
    fontSize: 10,
    fontWeight: '600',
    width: 35,
  },
  codeValue: {
    fontSize: 10,
    fontFamily: 'monospace',
    flex: 1,
    textAlign: 'right',
  },
});

// Memoize ColorOrb for better performance
export default memo(ColorOrb, (prevProps, nextProps) => {
  return (
    prevProps.color === nextProps.color &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.showColorCodes === nextProps.showColorCodes &&
    prevProps.isDarkMode === nextProps.isDarkMode &&
    prevProps.position.x === nextProps.position.x &&
    prevProps.position.y === nextProps.position.y &&
    prevProps.size === nextProps.size
  );
});
