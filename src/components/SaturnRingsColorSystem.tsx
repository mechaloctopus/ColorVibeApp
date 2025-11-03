import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  interpolate,
} from 'react-native-reanimated';
import { generateMusicalPalette, MUSICAL_MODES } from '../utils/musicalColorTheory';
import { hslToHex } from '../utils/colorEngine';

interface ColorRing {
  id: string;
  name: string;
  colors: string[];
  radius: number;
  rotationSpeed: number;
  opacity: number;
  paletteType: string;
}

interface SaturnRingsColorSystemProps {
  centerColor: { hue: number; saturation: number; lightness: number };
  selectedPaletteTypes: string[];
  currentMusicalMode: string;
  onColorSelect: (color: string, paletteType: string, colorIndex: number) => void;
  onColorLongPress: (color: string) => void; // For paint recipe
  isDarkMode: boolean;
  centerX: number;
  centerY: number;
}

const SaturnRingsColorSystem: React.FC<SaturnRingsColorSystemProps> = ({
  centerColor,
  selectedPaletteTypes,
  currentMusicalMode,
  onColorSelect,
  onColorLongPress,
  isDarkMode,
  centerX,
  centerY,
}) => {
  const [colorRings, setColorRings] = useState<ColorRing[]>([]);
  const [selectedColorInfo, setSelectedColorInfo] = useState<{
    color: string;
    paletteType: string;
    index: number;
  } | null>(null);

  // Animation values for ring rotations
  const ring1Rotation = useSharedValue(0);
  const ring2Rotation = useSharedValue(0);
  const ring3Rotation = useSharedValue(0);
  const ring4Rotation = useSharedValue(0);
  const ring5Rotation = useSharedValue(0);

  // Start continuous rotations with optimized timing
  useEffect(() => {
    // Use linear timing for smoother performance
    ring1Rotation.value = withRepeat(withTiming(360, { duration: 20000 }), -1, false);
    ring2Rotation.value = withRepeat(withTiming(-360, { duration: 25000 }), -1, false);
    ring3Rotation.value = withRepeat(withTiming(360, { duration: 30000 }), -1, false);
    ring4Rotation.value = withRepeat(withTiming(-360, { duration: 35000 }), -1, false);
    ring5Rotation.value = withRepeat(withTiming(360, { duration: 40000 }), -1, false);
  }, []);

  // Memoized palette generation for performance
  const generateOptimizedRings = React.useCallback((centerColor: { hue: number; saturation: number; lightness: number }, selectedTypes: string[], musicalMode: string) => {
    const rings: ColorRing[] = [];
    const { hue, saturation, lightness } = centerColor;

    // Ring 1: Complementary (closest to center)
    if (selectedPaletteTypes.includes('complementary') || selectedPaletteTypes.length === 0) {
      rings.push({
        id: 'complementary',
        name: 'Complementary',
        colors: [
          hslToHex(hue, saturation, lightness),
          hslToHex((hue + 180) % 360, saturation, lightness),
        ],
        radius: 80,
        rotationSpeed: 20000,
        opacity: 0.9,
        paletteType: 'complementary',
      });
    }

    // Ring 2: Triadic
    if (selectedPaletteTypes.includes('triadic') || selectedPaletteTypes.length === 0) {
      rings.push({
        id: 'triadic',
        name: 'Triadic',
        colors: [
          hslToHex(hue, saturation, lightness),
          hslToHex((hue + 120) % 360, saturation, lightness),
          hslToHex((hue + 240) % 360, saturation, lightness),
        ],
        radius: 110,
        rotationSpeed: 25000,
        opacity: 0.8,
        paletteType: 'triadic',
      });
    }

    // Ring 3: Tetradic/Square
    if (selectedPaletteTypes.includes('tetradic') || selectedPaletteTypes.length === 0) {
      rings.push({
        id: 'tetradic',
        name: 'Tetradic',
        colors: [
          hslToHex(hue, saturation, lightness),
          hslToHex((hue + 90) % 360, saturation, lightness),
          hslToHex((hue + 180) % 360, saturation, lightness),
          hslToHex((hue + 270) % 360, saturation, lightness),
        ],
        radius: 140,
        rotationSpeed: 30000,
        opacity: 0.7,
        paletteType: 'tetradic',
      });
    }

    // Ring 4: Musical Mode Palette
    if (selectedPaletteTypes.includes('musical') || selectedPaletteTypes.length === 0) {
      try {
        const musicalColors = generateMusicalPalette(hue, currentMusicalMode, saturation, lightness);
        rings.push({
          id: 'musical',
          name: `${MUSICAL_MODES[currentMusicalMode]?.name || 'Musical'}`,
          colors: musicalColors,
          radius: 170,
          rotationSpeed: 35000,
          opacity: 0.6,
          paletteType: 'musical',
        });
      } catch (error) {
        console.warn('Musical palette generation failed:', error);
      }
    }

    // Ring 5: Extended Harmony (Hexadic)
    if (selectedPaletteTypes.includes('hexadic') || selectedPaletteTypes.length === 0) {
      const hexadicColors = [];
      for (let i = 0; i < 6; i++) {
        hexadicColors.push(hslToHex((hue + (i * 60)) % 360, saturation, lightness));
      }
      rings.push({
        id: 'hexadic',
        name: 'Hexadic',
        colors: hexadicColors,
        radius: 200,
        rotationSpeed: 40000,
        opacity: 0.5,
        paletteType: 'hexadic',
      });
    }

    return rings;
  }, []);

  // Generate all palette rings when center color or modes change
  useEffect(() => {
    const rings = generateOptimizedRings(centerColor, selectedPaletteTypes, currentMusicalMode);
    setColorRings(rings);
  }, [centerColor, selectedPaletteTypes, currentMusicalMode, generateOptimizedRings]);

  // Optimized color orb rendering with memoization
  const renderColorOrb = React.useCallback((color: string, ring: ColorRing, colorIndex: number, totalColors: number) => {
    const angle = (colorIndex * 360) / totalColors;
    const x = Math.cos((angle * Math.PI) / 180) * ring.radius;
    const y = Math.sin((angle * Math.PI) / 180) * ring.radius;

    const isSelected = selectedColorInfo?.color === color && 
                      selectedColorInfo?.paletteType === ring.paletteType &&
                      selectedColorInfo?.index === colorIndex;

    return (
      <Animated.View
        key={`${ring.id}-${colorIndex}`}
        style={[
          styles.colorOrb,
          {
            left: centerX + x - 15,
            top: centerY + y - 15,
            backgroundColor: color,
            opacity: ring.opacity,
            borderWidth: isSelected ? 3 : 2,
            borderColor: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
            shadowColor: color,
            shadowOpacity: isSelected ? 0.8 : 0.4,
            shadowRadius: isSelected ? 8 : 4,
            elevation: isSelected ? 12 : 6,
            transform: [{ scale: isSelected ? 1.2 : 1 }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.orbTouchArea}
          onPress={() => {
            setSelectedColorInfo({ color, paletteType: ring.paletteType, index: colorIndex });
            onColorSelect(color, ring.paletteType, colorIndex);
          }}
          onLongPress={() => onColorLongPress(color)}
          activeOpacity={0.8}
        >
          {/* Color number indicator */}
          {isSelected && (
            <View style={styles.colorNumberIndicator}>
              <Text style={styles.colorNumberText}>{colorIndex + 1}</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  }, [selectedColorInfo, onColorSelect, onColorLongPress]);

  // Render ring as a child component to respect Hook rules on web
  const RingView: React.FC<{
    ring: ColorRing;
    rotationValue: Animated.SharedValue<number>;
    isDarkMode: boolean;
    centerX: number;
    centerY: number;
    renderColorOrb: (color: string, ring: ColorRing, index: number, totalColors: number) => JSX.Element;
  }> = ({ ring, rotationValue, isDarkMode, centerX, centerY, renderColorOrb }) => {
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: `${rotationValue.value}deg` }],
    }));

    return (
      <Animated.View
        key={ring.id}
        style={[styles.ringContainer, animatedStyle]}
      >
        {ring.colors.map((color, index) =>
          renderColorOrb(color, ring, index, ring.colors.length)
        )}

        {/* Ring label */}
        <View
          style={[
            styles.ringLabel,
            {
              left: centerX + ring.radius + 20,
              top: centerY - 10,
              backgroundColor: isDarkMode ? 'rgba(42, 42, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            },
          ]}
       >
          <Text style={[styles.ringLabelText, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
            {ring.name}
          </Text>
        </View>
      </Animated.View>
    );
  };

  const rotationValues = [ring1Rotation, ring2Rotation, ring3Rotation, ring4Rotation, ring5Rotation];

  return (
    <View style={styles.container}>
      {/* Saturn's Rings - Multiple rotating color palettes */}
      {colorRings.map((ring, index) => (
        <RingView
          key={ring.id}
          ring={ring}
          rotationValue={rotationValues[index] || ring1Rotation}
          isDarkMode={isDarkMode}
          centerX={centerX}
          centerY={centerY}
          renderColorOrb={renderColorOrb}
        />
      ))}

      {/* Selected Color Info Panel */}
      {selectedColorInfo && (
        <View
          style={[
            styles.selectedColorInfo,
            {
              backgroundColor: isDarkMode ? 'rgba(42, 42, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              borderColor: isDarkMode ? '#555555' : '#cccccc',
            },
          ]}
        >
          <View style={[styles.selectedColorSwatch, { backgroundColor: selectedColorInfo.color }]} />
          <View style={styles.selectedColorDetails}>
            <Text style={[styles.selectedColorHex, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
              {selectedColorInfo.color.toUpperCase()}
            </Text>
            <Text style={[styles.selectedColorPalette, { color: isDarkMode ? '#cccccc' : '#666666' }]}>
              {selectedColorInfo.paletteType.charAt(0).toUpperCase() + selectedColorInfo.paletteType.slice(1)} • 
              Color {selectedColorInfo.index + 1}
            </Text>
            <Text style={[styles.selectedColorHint, { color: isDarkMode ? '#888888' : '#999999' }]}>
              Long press for paint recipe
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },
  ringContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },
  colorOrb: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    shadowOffset: { width: 0, height: 2 },
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbTouchArea: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -5,
    marginTop: -5,
  },
  colorNumberIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorNumberText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  ringLabel: {
    position: 'absolute',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  ringLabelText: {
    fontSize: 11,
    fontWeight: '600',
  },
  selectedColorInfo: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  selectedColorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  selectedColorDetails: {
    flex: 1,
  },
  selectedColorHex: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  selectedColorPalette: {
    fontSize: 12,
    marginTop: 2,
  },
  selectedColorHint: {
    fontSize: 10,
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default SaturnRingsColorSystem;
