import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { setCurrentColor, addRecentColor } from '../store/slices/paletteSlice';
import { generateOptimizedPalette, optimizedHexToRgb, optimizedRgbToHsl } from '../utils/optimizedColorEngine';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../styles/designSystem';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HarmonyRule {
  id: string;
  name: string;
  description: string;
  icon: string;
  angles: number[];
  colorCount: number;
  theory: string;
  examples: string[];
}

const HARMONY_RULES: HarmonyRule[] = [
  {
    id: 'complementary',
    name: 'Complementary',
    description: 'Colors directly opposite on the color wheel',
    icon: '⚖️',
    angles: [0, 180],
    colorCount: 2,
    theory: 'Creates maximum contrast and vibrant energy. Perfect for making elements stand out.',
    examples: ['Red & Green', 'Blue & Orange', 'Yellow & Purple'],
  },
  {
    id: 'triadic',
    name: 'Triadic',
    description: 'Three colors evenly spaced around the wheel',
    icon: '🔺',
    angles: [0, 120, 240],
    colorCount: 3,
    theory: 'Offers strong visual contrast while retaining harmony. Creates vibrant yet balanced palettes.',
    examples: ['Red, Yellow, Blue', 'Orange, Green, Purple'],
  },
  {
    id: 'analogous',
    name: 'Analogous',
    description: 'Colors next to each other on the wheel',
    icon: '🌊',
    angles: [0, 30, 60],
    colorCount: 3,
    theory: 'Creates serene and comfortable designs. Often found in nature and very pleasing to the eye.',
    examples: ['Blue, Blue-Green, Green', 'Red, Red-Orange, Orange'],
  },
  {
    id: 'split-complementary',
    name: 'Split Complementary',
    description: 'Base color plus two adjacent to its complement',
    icon: '🎪',
    angles: [0, 150, 210],
    colorCount: 3,
    theory: 'Provides high contrast without the tension of complementary. Offers more nuance and sophistication.',
    examples: ['Blue, Yellow-Orange, Red-Orange'],
  },
  {
    id: 'tetradic',
    name: 'Tetradic (Rectangle)',
    description: 'Two pairs of complementary colors',
    icon: '⬜',
    angles: [0, 60, 180, 240],
    colorCount: 4,
    theory: 'Offers the richest color combinations but hardest to harmonize. Best when one color dominates.',
    examples: ['Red, Orange, Cyan, Blue'],
  },
  {
    id: 'square',
    name: 'Square',
    description: 'Four colors evenly spaced around the wheel',
    icon: '⏹️',
    angles: [0, 90, 180, 270],
    colorCount: 4,
    theory: 'Similar to tetradic but with equal spacing. Creates dynamic and energetic combinations.',
    examples: ['Red, Yellow, Cyan, Blue'],
  },
  {
    id: 'monochromatic',
    name: 'Monochromatic',
    description: 'Different shades, tints, and tones of one hue',
    icon: '🎨',
    angles: [0],
    colorCount: 5,
    theory: 'Easy to manage and always looks balanced. Creates cohesive and sophisticated designs.',
    examples: ['Light Blue, Blue, Dark Blue, Navy'],
  },
];

const ColorHarmonyExplorer: React.FC = () => {
  const isDarkMode = useSelector((state: RootState) => state.ui.isDarkMode);
  const currentColor = useSelector((state: RootState) => state.palette.currentColor);
  const dispatch = useDispatch();
  
  const [selectedRule, setSelectedRule] = useState<HarmonyRule>(HARMONY_RULES[0]);
  const [harmonyColors, setHarmonyColors] = useState<string[]>([]);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [showTheory, setShowTheory] = useState(false);
  // Convert currentColor string to HSL
  const currentColorRgb = optimizedHexToRgb(currentColor);
  const currentColorHsl = currentColorRgb ? optimizedRgbToHsl(currentColorRgb.r, currentColorRgb.g, currentColorRgb.b) : { h: 0, s: 50, l: 50 };

  const [interactiveHue, setInteractiveHue] = useState(currentColorHsl.h);
  


  useEffect(() => {
    generateHarmonyColors();
  }, [selectedRule, interactiveHue, currentColorHsl.s, currentColorHsl.l]);

  const generateHarmonyColors = () => {
    const colors: string[] = [];
    const baseHue = interactiveHue;
    const saturation = currentColorHsl.s;
    const lightness = currentColorHsl.l;

    if (selectedRule.id === 'monochromatic') {
      // Generate monochromatic variations
      const lightnessValues = [20, 35, 50, 65, 80];
      lightnessValues.forEach(l => {
        colors.push(hslToHex(baseHue, saturation, l));
      });
    } else {
      // Generate colors based on harmony angles
      selectedRule.angles.forEach(angle => {
        const hue = (baseHue + angle) % 360;
        colors.push(hslToHex(hue, saturation, lightness));
      });
    }

    setHarmonyColors(colors);
  };

  const hslToHex = (h: number, s: number, l: number): string => {
    const hNorm = h / 360;
    const sNorm = s / 100;
    const lNorm = l / 100;

    const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
    const x = c * (1 - Math.abs((hNorm * 6) % 2 - 1));
    const m = lNorm - c / 2;

    let r, g, b;
    if (hNorm < 1/6) { r = c; g = x; b = 0; }
    else if (hNorm < 2/6) { r = x; g = c; b = 0; }
    else if (hNorm < 3/6) { r = 0; g = c; b = x; }
    else if (hNorm < 4/6) { r = 0; g = x; b = c; }
    else if (hNorm < 5/6) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    const rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
    const gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
    const bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0');

    return `#${rHex}${gHex}${bHex}`;
  };

  const selectColor = (color: string, index: number) => {
    setSelectedColorIndex(index);
    dispatch(addRecentColor(color));
    
    // Update current color
    dispatch(setCurrentColor(color));


  };

  const renderColorWheel = () => {
    const wheelSize = SCREEN_WIDTH - 80;
    const centerX = wheelSize / 2;
    const centerY = wheelSize / 2;
    const radius = wheelSize / 2 - 40;

    return (
      <View style={[styles.colorWheel, { width: wheelSize, height: wheelSize }]}>
        {/* Color wheel background */}
        <View style={[styles.wheelBackground, { width: wheelSize, height: wheelSize, borderRadius: wheelSize / 2 }]} />
        
        {/* Harmony colors */}
        {harmonyColors.map((color, index) => {
          const angle = selectedRule.angles[index] || 0;
          const radian = (angle - 90) * (Math.PI / 180); // -90 to start from top
          const x = centerX + Math.cos(radian) * radius - 20;
          const y = centerY + Math.sin(radian) * radius - 20;



          return (
            <View
              key={index}
              style={[
                styles.harmonyColorDot,
                {
                  position: 'absolute',
                  left: x,
                  top: y,
                  backgroundColor: color,
                  borderWidth: selectedColorIndex === index ? 3 : 2,
                  borderColor: selectedColorIndex === index ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                  transform: [{ scale: selectedColorIndex === index ? 1.1 : 1 }],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.colorDotTouchArea}
                onPress={() => selectColor(color, index)}
              />
            </View>
          );
        })}

        {/* Center color (base) */}
        <View
          style={[
            styles.centerColor,
            {
              position: 'absolute',
              left: centerX - 25,
              top: centerY - 25,
              backgroundColor: harmonyColors[0] || '#3498db',
            },
          ]}
        />

        {/* Connection lines */}
        {selectedRule.angles.length > 1 && (
          <View style={styles.connectionLines}>
            {/* Lines would be drawn here using SVG in production */}
          </View>
        )}
      </View>
    );
  };

  const renderHarmonyRule = (rule: HarmonyRule) => (
    <TouchableOpacity
      key={rule.id}
      style={[
        styles.harmonyRuleCard,
        {
          backgroundColor: selectedRule.id === rule.id ? COLORS.primary[500] : (isDarkMode ? COLORS.dark.card : COLORS.light.card),
          borderColor: selectedRule.id === rule.id ? COLORS.primary[600] : 'transparent',
        },
      ]}
      onPress={() => setSelectedRule(rule)}
    >
      <View style={styles.ruleHeader}>
        <Text style={styles.ruleIcon}>{rule.icon}</Text>
        <View style={styles.ruleInfo}>
          <Text style={[
            styles.ruleName,
            { color: selectedRule.id === rule.id ? '#ffffff' : (isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary) }
          ]}>
            {rule.name}
          </Text>
          <Text style={[
            styles.ruleDescription,
            { color: selectedRule.id === rule.id ? 'rgba(255, 255, 255, 0.8)' : (isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary) }
          ]}>
            {rule.description}
          </Text>
        </View>
        <View style={styles.ruleStats}>
          <Text style={[
            styles.colorCount,
            { color: selectedRule.id === rule.id ? 'rgba(255, 255, 255, 0.8)' : (isDarkMode ? COLORS.dark.text.tertiary : COLORS.light.text.tertiary) }
          ]}>
            {rule.colorCount} colors
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? COLORS.dark.background : COLORS.light.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
          Color Harmony Explorer
        </Text>
        <TouchableOpacity
          style={[styles.theoryButton, { backgroundColor: showTheory ? COLORS.primary[500] : 'transparent' }]}
          onPress={() => setShowTheory(!showTheory)}
        >
          <Text style={[styles.theoryButtonText, { color: showTheory ? '#ffffff' : (isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary) }]}>
            📚 Theory
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Color Wheel */}
        <View style={styles.wheelSection}>
          {renderColorWheel()}
        </View>

        {/* Selected Colors Palette */}
        <View style={[styles.paletteSection, { backgroundColor: isDarkMode ? COLORS.dark.card : COLORS.light.card }]}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
            {selectedRule.name} Harmony
          </Text>
          <View style={styles.colorPalette}>
            {harmonyColors.map((color, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.paletteColor,
                  {
                    backgroundColor: color,
                    borderWidth: selectedColorIndex === index ? 3 : 2,
                    borderColor: selectedColorIndex === index ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                  },
                ]}
                onPress={() => selectColor(color, index)}
              >
                <Text style={styles.colorHex}>{color.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Theory Section */}
        {showTheory && (
          <View style={[styles.theorySection, { backgroundColor: isDarkMode ? COLORS.dark.card : COLORS.light.card }]}>
            <Text style={[styles.theoryTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
              Color Theory: {selectedRule.name}
            </Text>
            <Text style={[styles.theoryText, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
              {selectedRule.theory}
            </Text>
            
            <Text style={[styles.examplesTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
              Examples:
            </Text>
            {selectedRule.examples.map((example, index) => (
              <Text key={index} style={[styles.exampleText, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
                • {example}
              </Text>
            ))}
          </View>
        )}

        {/* Harmony Rules */}
        <View style={styles.rulesSection}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
            Harmony Rules
          </Text>
          {HARMONY_RULES.map(renderHarmonyRule)}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING[5], paddingVertical: SPACING[4], borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.1)' },
  headerTitle: { fontSize: TYPOGRAPHY.fontSize.xl, fontWeight: 'bold' },
  theoryButton: { paddingHorizontal: SPACING[3], paddingVertical: SPACING[2], borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)' },
  theoryButtonText: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: '600' },
  content: { flex: 1 },
  wheelSection: { alignItems: 'center', paddingVertical: SPACING[6] },
  colorWheel: { position: 'relative' },
  wheelBackground: { backgroundColor: 'conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)', opacity: 0.3 },
  harmonyColorDot: { width: 40, height: 40, borderRadius: 20, ...SHADOWS.base },
  colorDotTouchArea: { width: 50, height: 50, borderRadius: 25, marginLeft: -5, marginTop: -5 },
  centerColor: { width: 50, height: 50, borderRadius: 25, borderWidth: 3, borderColor: '#ffffff', ...SHADOWS.lg },
  connectionLines: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  paletteSection: { marginHorizontal: SPACING[4], marginBottom: SPACING[4], padding: SPACING[4], borderRadius: BORDER_RADIUS.xl, ...SHADOWS.base },
  sectionTitle: { fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: 'bold', marginBottom: SPACING[3] },
  colorPalette: { flexDirection: 'row', gap: SPACING[2] },
  paletteColor: { flex: 1, height: 80, borderRadius: BORDER_RADIUS.lg, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: SPACING[2], ...SHADOWS.sm },
  colorHex: { color: '#ffffff', fontSize: TYPOGRAPHY.fontSize.xs, fontWeight: 'bold', fontFamily: 'monospace', textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  theorySection: { marginHorizontal: SPACING[4], marginBottom: SPACING[4], padding: SPACING[4], borderRadius: BORDER_RADIUS.xl, ...SHADOWS.base },
  theoryTitle: { fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: 'bold', marginBottom: SPACING[3] },
  theoryText: { fontSize: TYPOGRAPHY.fontSize.base, lineHeight: 24, marginBottom: SPACING[3] },
  examplesTitle: { fontSize: TYPOGRAPHY.fontSize.base, fontWeight: 'bold', marginBottom: SPACING[2] },
  exampleText: { fontSize: TYPOGRAPHY.fontSize.sm, lineHeight: 20, marginBottom: SPACING[1] },
  rulesSection: { paddingHorizontal: SPACING[4], paddingBottom: SPACING[6] },
  harmonyRuleCard: { marginBottom: SPACING[3], padding: SPACING[4], borderRadius: BORDER_RADIUS.xl, borderWidth: 2, ...SHADOWS.base },
  ruleHeader: { flexDirection: 'row', alignItems: 'center' },
  ruleIcon: { fontSize: 24, marginRight: SPACING[3] },
  ruleInfo: { flex: 1 },
  ruleName: { fontSize: TYPOGRAPHY.fontSize.base, fontWeight: 'bold' },
  ruleDescription: { fontSize: TYPOGRAPHY.fontSize.sm, marginTop: 2 },
  ruleStats: { alignItems: 'flex-end' },
  colorCount: { fontSize: TYPOGRAPHY.fontSize.xs, fontWeight: '600' },
});

export default ColorHarmonyExplorer;
