import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { addRecentColor, setCurrentColor } from '../store/slices/paletteSlice';
import AccessibilityAnalyzer from './common/AccessibilityAnalyzer';
import { ColorBlindnessSimulator, ColorBlindnessType } from '../utils/advancedColorTechnologies';
import { optimizedHexToRgb, optimizedRgbToHsl } from '../utils/optimizedColorEngine';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../styles/designSystem';
import { PremiumHaptics, HapticType } from '../utils/premiumInteractions';

interface AccessibilityTest {
  id: string;
  name: string;
  foreground: string;
  background: string;
  context: string;
  timestamp: number;
  results: {
    contrastRatio: number;
    wcagLevel: string;
    colorBlindIssues: string[];
    suggestions: number;
  };
}

const AccessibilityWorkstation: React.FC = () => {
  const { isDarkMode } = useSelector((state: RootState) => state.ui);
  const dispatch = useDispatch();

  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [testContext, setTestContext] = useState('');
  const [savedTests, setSavedTests] = useState<AccessibilityTest[]>([]);
  const [activeMode, setActiveMode] = useState<'analyzer' | 'simulator' | 'batch'>('analyzer');
  const [selectedColorBlindType, setSelectedColorBlindType] = useState<ColorBlindnessType>('protanopia');

  // Animation values
  const modeTransition = useSharedValue(0);
  const resultScale = useSharedValue(1);

  const modeAnimatedStyle = useAnimatedStyle(() => ({
    opacity: modeTransition.value,
    transform: [{ scale: modeTransition.value }],
  }));
  useEffect(() => {
    // Animate mode transitions
    modeTransition.value = withSpring(1, { damping: 15, stiffness: 200 });
  }, [activeMode]);

  const handleColorChange = (color: string, type: 'foreground' | 'background') => {
    if (type === 'foreground') {
      setForegroundColor(color);
    } else {
      setBackgroundColor(color);
    }

    // Add to recent colors
    dispatch(addRecentColor(color));
    dispatch(setCurrentColor(color));

    // Haptic feedback
    PremiumHaptics.trigger(HapticType.LIGHT);
  };

  const saveAccessibilityTest = () => {
    const test: AccessibilityTest = {
      id: Date.now().toString(),
      name: testContext || `Test ${savedTests.length + 1}`,
      foreground: foregroundColor,
      background: backgroundColor,
      context: testContext,
      timestamp: Date.now(),
      results: {
        contrastRatio: calculateContrastRatio(foregroundColor, backgroundColor),
        wcagLevel: getWCAGLevel(calculateContrastRatio(foregroundColor, backgroundColor)),
        colorBlindIssues: getColorBlindIssues(foregroundColor, backgroundColor),
        suggestions: 0, // Would be calculated by analyzer
      },
    };

    setSavedTests(prev => [test, ...prev.slice(0, 19)]); // Keep last 20 tests
    setTestContext('');

    // Haptic feedback
    PremiumHaptics.trigger(HapticType.SUCCESS);
  };

  const loadSavedTest = (test: AccessibilityTest) => {
    setForegroundColor(test.foreground);
    setBackgroundColor(test.background);
    setTestContext(test.name);

    // Haptic feedback
    PremiumHaptics.trigger(HapticType.LIGHT);
  };

  const calculateContrastRatio = (fg: string, bg: string): number => {
    const fgRgb = optimizedHexToRgb(fg);
    const bgRgb = optimizedHexToRgb(bg);

    if (!fgRgb || !bgRgb) return 1;

    const fgLuminance = getRelativeLuminance(fgRgb);
    const bgLuminance = getRelativeLuminance(bgRgb);

    const lighter = Math.max(fgLuminance, bgLuminance);
    const darker = Math.min(fgLuminance, bgLuminance);

    return (lighter + 0.05) / (darker + 0.05);
  };

  const getRelativeLuminance = (rgb: { r: number; g: number; b: number }): number => {
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const getWCAGLevel = (ratio: number): string => {
    if (ratio >= 7) return 'AAA';
    if (ratio >= 4.5) return 'AA';
    if (ratio >= 3) return 'A';
    return 'FAIL';
  };

  const getColorBlindIssues = (fg: string, bg: string): string[] => {
    const issues: string[] = [];
    const simulations = ColorBlindnessSimulator.getAllSimulations(fg);

    Object.entries(simulations).forEach(([type, simColor]) => {
      const originalContrast = calculateContrastRatio(fg, bg);
      const simContrast = calculateContrastRatio(simColor, bg);

      if (simContrast < originalContrast * 0.7) {
        issues.push(type);
      }
    });

    return issues;
  };

  const renderColorPicker = (color: string, type: 'foreground' | 'background', label: string) => {
    return (
      <View style={styles.colorPickerSection}>
        <Text style={[styles.colorPickerLabel, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
          {label}
        </Text>
        <View style={styles.colorPickerRow}>
          <TouchableOpacity
            style={[styles.colorSwatch, { backgroundColor: color }]}
            onPress={() => {
              // In a real implementation, this would open a color picker
              PremiumHaptics.trigger(HapticType.LIGHT);
            }}
          />
          <TextInput
            style={[
              styles.colorInput,
              {
                backgroundColor: isDarkMode ? COLORS.dark.surface : COLORS.light.surface,
                color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary,
                borderColor: isDarkMode ? COLORS.dark.border : COLORS.light.border,
              }
            ]}
            value={color.toUpperCase()}
            onChangeText={(text) => {
              if (/^#[0-9A-Fa-f]{6}$/.test(text)) {
                handleColorChange(text.toLowerCase(), type);
              }
            }}
            placeholder="#000000"
            placeholderTextColor={isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary}
            maxLength={7}
          />
        </View>
      </View>
    );
  };

  const renderAnalyzerMode = () => {

    return (
      <Animated.View style={[styles.modeContent, modeAnimatedStyle]}>
        <View style={styles.colorControls}>
          {renderColorPicker(foregroundColor, 'foreground', 'Foreground Color')}
          {renderColorPicker(backgroundColor, 'background', 'Background Color')}

          <View style={styles.contextSection}>
            <Text style={[styles.contextLabel, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
              Test Context (Optional)
            </Text>
            <TextInput
              style={[
                styles.contextInput,
                {
                  backgroundColor: isDarkMode ? COLORS.dark.surface : COLORS.light.surface,
                  color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary,
                  borderColor: isDarkMode ? COLORS.dark.border : COLORS.light.border,
                }
              ]}
              value={testContext}
              onChangeText={setTestContext}
              placeholder="e.g., Button text, Navigation menu..."
              placeholderTextColor={isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary}
              multiline
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: COLORS.primary[500] }]}
            onPress={saveAccessibilityTest}
          >
            <Text style={styles.saveButtonText}>💾 Save Test</Text>
          </TouchableOpacity>
        </View>

        <AccessibilityAnalyzer
          foregroundColor={foregroundColor}
          backgroundColor={backgroundColor}
          onSuggestion={(suggestion) => {
            if (suggestion.fixedColor) {
              setForegroundColor(suggestion.fixedColor);
              PremiumHaptics.trigger(HapticType.SUCCESS);
            }
          }}
          style={styles.analyzer}
        />
      </Animated.View>
    );
  };

  const renderSimulatorMode = () => {


    const colorBlindTypes: ColorBlindnessType[] = [
      'protanopia', 'protanomaly', 'deuteranopia', 'deuteranomaly',
      'tritanopia', 'tritanomaly', 'achromatopsia', 'achromatomaly'
    ];

    return (
      <Animated.View style={[styles.modeContent, modeAnimatedStyle]}>
        <View style={styles.simulatorControls}>
          <Text style={[styles.simulatorTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
            Color Blindness Simulator
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
            {colorBlindTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: selectedColorBlindType === type ? COLORS.primary[500] : 'transparent',
                    borderColor: COLORS.primary[500],
                  }
                ]}
                onPress={() => {
                  setSelectedColorBlindType(type);
                  PremiumHaptics.trigger(HapticType.LIGHT);
                }}
              >
                <Text style={[
                  styles.typeButtonText,
                  { color: selectedColorBlindType === type ? '#ffffff' : COLORS.primary[500] }
                ]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.simulationPreview}>
            <View style={styles.previewSection}>
              <Text style={[styles.previewLabel, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
                Original
              </Text>
              <View style={[styles.previewCard, { backgroundColor: backgroundColor }]}>
                <Text style={[styles.previewText, { color: foregroundColor }]}>
                  Sample Text Content
                </Text>
              </View>
            </View>

            <View style={styles.previewSection}>
              <Text style={[styles.previewLabel, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
                {selectedColorBlindType.charAt(0).toUpperCase() + selectedColorBlindType.slice(1)} View
              </Text>
              <View style={[styles.previewCard, { backgroundColor: backgroundColor }]}>
                <Text style={[
                  styles.previewText,
                  { color: ColorBlindnessSimulator.simulateColorBlindness(foregroundColor, selectedColorBlindType) }
                ]}>
                  Sample Text Content
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderBatchMode = () => {


    return (
      <Animated.View style={[styles.modeContent, modeAnimatedStyle]}>
        <View style={styles.batchHeader}>
          <Text style={[styles.batchTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
            Saved Accessibility Tests
          </Text>
          <Text style={[styles.batchCount, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
            {savedTests.length} tests saved
          </Text>
        </View>

        <ScrollView style={styles.testsList} showsVerticalScrollIndicator={false}>
          {savedTests.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={[styles.emptyText, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
                No saved tests yet. Create some tests in the Analyzer mode!
              </Text>
            </View>
          ) : (
            savedTests.map((test) => (
              <TouchableOpacity
                key={test.id}
                style={[styles.testCard, { backgroundColor: isDarkMode ? COLORS.dark.card : COLORS.light.card }]}
                onPress={() => loadSavedTest(test)}
              >
                <View style={styles.testHeader}>
                  <Text style={[styles.testName, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
                    {test.name}
                  </Text>
                  <Text style={[styles.testDate, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
                    {new Date(test.timestamp).toLocaleDateString()}
                  </Text>
                </View>

                <View style={styles.testColors}>
                  <View style={[styles.testColorSwatch, { backgroundColor: test.foreground }]} />
                  <Text style={[styles.testColorText, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
                    on
                  </Text>
                  <View style={[styles.testColorSwatch, { backgroundColor: test.background }]} />
                </View>

                <View style={styles.testResults}>
                  <View style={styles.testResult}>
                    <Text style={styles.testResultLabel}>Contrast:</Text>
                    <Text style={[styles.testResultValue, { color: getWCAGLevelColor(test.results.wcagLevel) }]}>
                      {test.results.contrastRatio.toFixed(2)}:1 ({test.results.wcagLevel})
                    </Text>
                  </View>
                  {test.results.colorBlindIssues.length > 0 && (
                    <View style={styles.testResult}>
                      <Text style={styles.testResultLabel}>Issues:</Text>
                      <Text style={[styles.testResultValue, { color: COLORS.accent.orange }]}>
                        {test.results.colorBlindIssues.length} color blind issues
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </Animated.View>
    );
  };

  const getWCAGLevelColor = (level: string): string => {
    const colors = {
      AAA: COLORS.accent.green,
      AA: COLORS.accent.green,
      A: COLORS.accent.yellow,
      FAIL: COLORS.accent.red,
    };
    return colors[level as keyof typeof colors] || COLORS.accent.red;
  };

  const modes = [
    { id: 'analyzer', title: 'Analyzer', icon: '🔍' },
    { id: 'simulator', title: 'Simulator', icon: '👁️' },
    { id: 'batch', title: 'Saved Tests', icon: '📋' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? COLORS.dark.background : COLORS.light.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
          ♿ Accessibility Workstation
        </Text>
      </View>

      <View style={styles.modeNavigation}>
        {modes.map((mode) => (
          <TouchableOpacity
            key={mode.id}
            style={[
              styles.modeTab,
              {
                backgroundColor: activeMode === mode.id ? COLORS.primary[500] : 'transparent',
              },
            ]}
            onPress={() => {
              setActiveMode(mode.id as any);
              PremiumHaptics.trigger(HapticType.LIGHT);
            }}
          >
            <Text style={styles.modeIcon}>{mode.icon}</Text>
            <Text style={[
              styles.modeTitle,
              {
                color: activeMode === mode.id ? '#ffffff' : (isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary),
              },
            ]}>
              {mode.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {activeMode === 'analyzer' && renderAnalyzerMode()}
        {activeMode === 'simulator' && renderSimulatorMode()}
        {activeMode === 'batch' && renderBatchMode()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: SPACING[4], paddingVertical: SPACING[3], borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.1)' },
  headerTitle: { fontSize: TYPOGRAPHY.fontSize.xl, fontWeight: 'bold' },
  modeNavigation: { flexDirection: 'row', paddingHorizontal: SPACING[2], paddingVertical: SPACING[2] },
  modeTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING[3], gap: SPACING[1], borderRadius: BORDER_RADIUS.lg, marginHorizontal: SPACING[1] },
  modeIcon: { fontSize: 16 },
  modeTitle: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: '600' },
  content: { flex: 1 },
  modeContent: { flex: 1, padding: SPACING[4] },
  colorControls: { marginBottom: SPACING[4] },
  colorPickerSection: { marginBottom: SPACING[4] },
  colorPickerLabel: { fontSize: TYPOGRAPHY.fontSize.base, fontWeight: '600', marginBottom: SPACING[2] },
  colorPickerRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING[3] },
  colorSwatch: { width: 50, height: 50, borderRadius: BORDER_RADIUS.lg, borderWidth: 2, borderColor: '#ffffff', ...SHADOWS.sm },
  colorInput: { flex: 1, paddingHorizontal: SPACING[3], paddingVertical: SPACING[3], borderRadius: BORDER_RADIUS.lg, borderWidth: 1, fontSize: TYPOGRAPHY.fontSize.base, fontFamily: 'monospace' },
  contextSection: { marginBottom: SPACING[4] },
  contextLabel: { fontSize: TYPOGRAPHY.fontSize.base, fontWeight: '600', marginBottom: SPACING[2] },
  contextInput: { paddingHorizontal: SPACING[3], paddingVertical: SPACING[3], borderRadius: BORDER_RADIUS.lg, borderWidth: 1, fontSize: TYPOGRAPHY.fontSize.base, minHeight: 80, textAlignVertical: 'top' },
  saveButton: { paddingVertical: SPACING[3], paddingHorizontal: SPACING[4], borderRadius: BORDER_RADIUS.lg, alignItems: 'center' },
  saveButtonText: { color: '#ffffff', fontSize: TYPOGRAPHY.fontSize.base, fontWeight: 'bold' },
  analyzer: { flex: 1 },
  simulatorControls: { flex: 1 },
  simulatorTitle: { fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: 'bold', marginBottom: SPACING[4] },
  typeSelector: { marginBottom: SPACING[4] },
  typeButton: { paddingHorizontal: SPACING[3], paddingVertical: SPACING[2], borderRadius: BORDER_RADIUS.lg, borderWidth: 1, marginRight: SPACING[2] },
  typeButtonText: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: '600' },
  simulationPreview: { flex: 1, gap: SPACING[4] },
  previewSection: { flex: 1 },
  previewLabel: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: '600', marginBottom: SPACING[2] },
  previewCard: { padding: SPACING[4], borderRadius: BORDER_RADIUS.lg, alignItems: 'center', ...SHADOWS.base },
  previewText: { fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: 'bold' },
  batchHeader: { marginBottom: SPACING[4] },
  batchTitle: { fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: 'bold' },
  batchCount: { fontSize: TYPOGRAPHY.fontSize.sm, marginTop: SPACING[1] },
  testsList: { flex: 1 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: SPACING[3] },
  emptyText: { fontSize: TYPOGRAPHY.fontSize.base, textAlign: 'center' },
  testCard: { padding: SPACING[4], borderRadius: BORDER_RADIUS.lg, marginBottom: SPACING[3], ...SHADOWS.sm },
  testHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING[3] },
  testName: { fontSize: TYPOGRAPHY.fontSize.base, fontWeight: 'bold', flex: 1 },
  testDate: { fontSize: TYPOGRAPHY.fontSize.sm },
  testColors: { flexDirection: 'row', alignItems: 'center', gap: SPACING[2], marginBottom: SPACING[3] },
  testColorSwatch: { width: 30, height: 30, borderRadius: BORDER_RADIUS.base, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)' },
  testColorText: { fontSize: TYPOGRAPHY.fontSize.sm },
  testResults: { gap: SPACING[1] },
  testResult: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  testResultLabel: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.neutral[600] },
  testResultValue: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: '600' },
});

export default AccessibilityWorkstation;
