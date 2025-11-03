import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

// Slider import with fallback
let Slider: any = null;
try {
  Slider = require('@react-native-community/slider').default;
} catch (error) {
  console.warn('[Perceptual Lab] @react-native-community/slider not available, using fallback');
  // Simple fallback slider component
  Slider = ({ value, onValueChange, minimumValue = 0, maximumValue = 100, style }: any) => (
    <View style={[{ height: 40, backgroundColor: '#ddd', borderRadius: 20, justifyContent: 'center' }, style]}>
      <View style={{
        width: `${((value - minimumValue) / (maximumValue - minimumValue)) * 100}%`,
        height: '100%',
        backgroundColor: '#3b82f6',
        borderRadius: 20
      }} />
      <Text style={{ position: 'absolute', alignSelf: 'center', fontSize: 12 }}>
        {Math.round(value)}
      </Text>
    </View>
  );
}
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { addRecentColor, setCurrentColor } from '../store/slices/paletteSlice';
import { 
  PerceptualColorEngine, 
  ViewingConditions, 
  VIEWING_CONDITIONS,
  ColorAppearance,
  ContrastContext,
  ColorMemory,
  CulturalColorMeaning 
} from '../utils/perceptualColorEngine';
import { optimizedHexToRgb, optimizedRgbToHsl, optimizedHslToHex } from '../utils/optimizedColorEngine';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../styles/designSystem';

const PerceptualColorLab: React.FC = () => {
  const { isDarkMode, currentColor } = useSelector((state: RootState) => state.ui);
  const dispatch = useDispatch();
  
  const [targetColor, setTargetColor] = useState('#3498db');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [viewingCondition, setViewingCondition] = useState<keyof typeof VIEWING_CONDITIONS>('sRGB');
  const [activeTab, setActiveTab] = useState<'appearance' | 'contrast' | 'memory' | 'culture' | 'harmony'>('appearance');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [selectedCulture, setSelectedCulture] = useState('western');
  
  // Analysis results
  const [colorAppearance, setColorAppearance] = useState<ColorAppearance | null>(null);
  const [contrastAnalysis, setContrastAnalysis] = useState<ContrastContext | null>(null);
  const [memorySimulation, setMemorySimulation] = useState<ColorMemory | null>(null);
  const [culturalAnalysis, setCulturalAnalysis] = useState<CulturalColorMeaning | null>(null);
  const [perceptualHarmony, setPerceptualHarmony] = useState<string[]>([]);
  
  // Animation values
  const analysisOpacity = useSharedValue(0);
  const resultScale = useSharedValue(0.8);

  useEffect(() => {
    analyzeColor();
  }, [targetColor, backgroundColor, viewingCondition, timeElapsed, selectedCulture]);

  useEffect(() => {
    // Animate results appearance
    analysisOpacity.value = withTiming(1, { duration: 300 });
    resultScale.value = withSpring(1, { damping: 15, stiffness: 200 });
  }, [colorAppearance, contrastAnalysis, memorySimulation, culturalAnalysis]);

  const analyzeColor = () => {
    try {
      // Color Appearance Analysis
      const appearance = PerceptualColorEngine.calculateColorAppearance(
        targetColor, 
        VIEWING_CONDITIONS[viewingCondition]
      );
      setColorAppearance(appearance);

      // Simultaneous Contrast Analysis
      const contrast = PerceptualColorEngine.analyzeSimultaneousContrast(
        targetColor,
        backgroundColor
      );
      setContrastAnalysis(contrast);

      // Memory Simulation
      const memory = PerceptualColorEngine.simulateColorMemory(targetColor, timeElapsed);
      setMemorySimulation(memory);

      // Cultural Analysis
      const cultural = PerceptualColorEngine.analyzeCulturalMeaning(targetColor, selectedCulture);
      setCulturalAnalysis(cultural);

      // Perceptual Harmony
      const harmony = PerceptualColorEngine.generatePerceptualHarmony(
        targetColor,
        'perceptual-complementary',
        VIEWING_CONDITIONS[viewingCondition]
      );
      setPerceptualHarmony(harmony);

    } catch (error) {
      console.error('Perceptual analysis error:', error);
    }
  };

  const selectColor = (color: string) => {
    setTargetColor(color);
    dispatch(addRecentColor(color));
    
    const rgb = optimizedHexToRgb(color);
    if (rgb) {
      const hsl = optimizedRgbToHsl(rgb.r, rgb.g, rgb.b);
      dispatch(setCurrentColor(optimizedHslToHex(hsl.h, hsl.s, hsl.l)));
    }
  };

  const renderAppearanceTab = () => {
    if (!colorAppearance) return null;

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: analysisOpacity.value,
      transform: [{ scale: resultScale.value }],
    }));

    return (
      <Animated.View style={[styles.analysisSection, animatedStyle]}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
          CIECAM02 Color Appearance
        </Text>
        
        <View style={styles.appearanceGrid}>
          <View style={[styles.appearanceCard, { backgroundColor: isDarkMode ? COLORS.dark.card : COLORS.light.card }]}>
            <Text style={[styles.appearanceLabel, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
              Lightness (J)
            </Text>
            <Text style={[styles.appearanceValue, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
              {colorAppearance.lightness.toFixed(1)}
            </Text>
            <View style={[styles.appearanceBar, { backgroundColor: isDarkMode ? COLORS.dark.surface : COLORS.light.surface }]}>
              <View style={[styles.appearanceProgress, { width: `${colorAppearance.lightness}%`, backgroundColor: COLORS.primary[500] }]} />
            </View>
          </View>

          <View style={[styles.appearanceCard, { backgroundColor: isDarkMode ? COLORS.dark.card : COLORS.light.card }]}>
            <Text style={[styles.appearanceLabel, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
              Chroma (C)
            </Text>
            <Text style={[styles.appearanceValue, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
              {colorAppearance.chroma.toFixed(1)}
            </Text>
            <View style={[styles.appearanceBar, { backgroundColor: isDarkMode ? COLORS.dark.surface : COLORS.light.surface }]}>
              <View style={[styles.appearanceProgress, { width: `${Math.min(100, colorAppearance.chroma)}%`, backgroundColor: COLORS.accent.orange }]} />
            </View>
          </View>

          <View style={[styles.appearanceCard, { backgroundColor: isDarkMode ? COLORS.dark.card : COLORS.light.card }]}>
            <Text style={[styles.appearanceLabel, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
              Hue (h)
            </Text>
            <Text style={[styles.appearanceValue, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
              {colorAppearance.hue.toFixed(1)}°
            </Text>
            <View style={[styles.hueWheel, { borderColor: isDarkMode ? COLORS.dark.border : COLORS.light.border }]}>
              <View 
                style={[
                  styles.hueIndicator, 
                  { 
                    backgroundColor: targetColor,
                    transform: [{ rotate: `${colorAppearance.hue}deg` }]
                  }
                ]} 
              />
            </View>
          </View>

          <View style={[styles.appearanceCard, { backgroundColor: isDarkMode ? COLORS.dark.card : COLORS.light.card }]}>
            <Text style={[styles.appearanceLabel, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
              Brightness (Q)
            </Text>
            <Text style={[styles.appearanceValue, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
              {colorAppearance.brightness.toFixed(1)}
            </Text>
            <View style={[styles.appearanceBar, { backgroundColor: isDarkMode ? COLORS.dark.surface : COLORS.light.surface }]}>
              <View style={[styles.appearanceProgress, { width: `${Math.min(100, colorAppearance.brightness)}%`, backgroundColor: COLORS.accent.yellow }]} />
            </View>
          </View>
        </View>

        <View style={styles.viewingConditions}>
          <Text style={[styles.conditionsTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
            Viewing Conditions
          </Text>
          <View style={styles.conditionsButtons}>
            {Object.keys(VIEWING_CONDITIONS).map((condition) => (
              <TouchableOpacity
                key={condition}
                style={[
                  styles.conditionButton,
                  {
                    backgroundColor: viewingCondition === condition ? COLORS.primary[500] : 'transparent',
                    borderColor: COLORS.primary[500],
                  }
                ]}
                onPress={() => setViewingCondition(condition as keyof typeof VIEWING_CONDITIONS)}
              >
                <Text style={[
                  styles.conditionButtonText,
                  { color: viewingCondition === condition ? '#ffffff' : COLORS.primary[500] }
                ]}>
                  {condition}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderContrastTab = () => {
    if (!contrastAnalysis) return null;

    const correctedColor = PerceptualColorEngine.applyContrastCorrection(targetColor, contrastAnalysis);

    return (
      <View style={styles.analysisSection}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
          Simultaneous Contrast Analysis
        </Text>
        
        <View style={styles.contrastDemo}>
          <View style={[styles.contrastBackground, { backgroundColor: backgroundColor }]}>
            <View style={[styles.colorSample, { backgroundColor: targetColor }]}>
              <Text style={styles.sampleLabel}>Original</Text>
            </View>
            <View style={[styles.colorSample, { backgroundColor: correctedColor }]}>
              <Text style={styles.sampleLabel}>Corrected</Text>
            </View>
          </View>
        </View>

        <View style={styles.contrastControls}>
          <Text style={[styles.controlLabel, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
            Background Color
          </Text>
          <View style={styles.backgroundPicker}>
            {['#ffffff', '#808080', '#000000', '#ff0000', '#00ff00', '#0000ff'].map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.backgroundOption,
                  { 
                    backgroundColor: color,
                    borderWidth: backgroundColor === color ? 3 : 1,
                    borderColor: backgroundColor === color ? COLORS.primary[500] : 'rgba(255, 255, 255, 0.3)',
                  }
                ]}
                onPress={() => setBackgroundColor(color)}
              />
            ))}
          </View>
        </View>

        <View style={styles.contrastEffects}>
          <Text style={[styles.effectsTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
            Perceptual Effects
          </Text>
          <View style={styles.effectItem}>
            <Text style={[styles.effectLabel, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
              Hue Drift: {contrastAnalysis.contrastEffect.hueDrift.toFixed(1)}°
            </Text>
          </View>
          <View style={styles.effectItem}>
            <Text style={[styles.effectLabel, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
              Saturation Boost: {(contrastAnalysis.contrastEffect.saturationBoost * 100).toFixed(1)}%
            </Text>
          </View>
          <View style={styles.effectItem}>
            <Text style={[styles.effectLabel, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
              Lightness Shift: {contrastAnalysis.contrastEffect.lightnessShift.toFixed(1)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderMemoryTab = () => {
    if (!memorySimulation) return null;

    return (
      <View style={styles.analysisSection}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
          Color Memory Simulation
        </Text>
        
        <View style={styles.memoryDemo}>
          <View style={[styles.memoryComparison, { backgroundColor: isDarkMode ? COLORS.dark.card : COLORS.light.card }]}>
            <View style={styles.memoryItem}>
              <View style={[styles.memorySwatch, { backgroundColor: memorySimulation.originalColor }]} />
              <Text style={[styles.memoryLabel, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
                Original
              </Text>
            </View>
            <View style={styles.memoryItem}>
              <View style={[styles.memorySwatch, { backgroundColor: memorySimulation.perceivedColor }]} />
              <Text style={[styles.memoryLabel, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
                Remembered
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.memoryControls}>
          <Text style={[styles.controlLabel, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
            Time Elapsed: {timeElapsed}s
          </Text>
          <Slider
            style={styles.timeSlider}
            minimumValue={0}
            maximumValue={120}
            value={timeElapsed}
            onValueChange={setTimeElapsed}
            minimumTrackTintColor={COLORS.primary[500]}
            maximumTrackTintColor={isDarkMode ? COLORS.dark.border : COLORS.light.border}
            thumbTintColor={COLORS.primary[500]}
          />
        </View>

        <View style={styles.memoryStats}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
              Memory Strength
            </Text>
            <Text style={[styles.statValue, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
              {(memorySimulation.memoryStrength * 100).toFixed(1)}%
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
              Confidence Level
            </Text>
            <Text style={[styles.statValue, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
              {(memorySimulation.confidenceLevel * 100).toFixed(1)}%
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderCultureTab = () => {
    if (!culturalAnalysis) return null;

    return (
      <View style={styles.analysisSection}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
          Cultural Color Semantics
        </Text>
        
        <View style={styles.cultureSelector}>
          {['western', 'eastern'].map((culture) => (
            <TouchableOpacity
              key={culture}
              style={[
                styles.cultureButton,
                {
                  backgroundColor: selectedCulture === culture ? COLORS.primary[500] : 'transparent',
                  borderColor: COLORS.primary[500],
                }
              ]}
              onPress={() => setSelectedCulture(culture)}
            >
              <Text style={[
                styles.cultureButtonText,
                { color: selectedCulture === culture ? '#ffffff' : COLORS.primary[500] }
              ]}>
                {culture.charAt(0).toUpperCase() + culture.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.culturalMeanings, { backgroundColor: isDarkMode ? COLORS.dark.card : COLORS.light.card }]}>
          <Text style={[styles.meaningsTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
            Cultural Meanings
          </Text>
          <View style={styles.meaningsList}>
            {culturalAnalysis.meanings.map((meaning, index) => (
              <View key={index} style={[styles.meaningTag, { backgroundColor: COLORS.primary[100] }]}>
                <Text style={[styles.meaningText, { color: COLORS.primary[700] }]}>
                  {meaning}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.contextualUsage, { backgroundColor: isDarkMode ? COLORS.dark.card : COLORS.light.card }]}>
          <Text style={[styles.usageTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
            Contextual Usage
          </Text>
          <View style={styles.usageList}>
            {culturalAnalysis.contextualUsage.map((usage, index) => (
              <Text key={index} style={[styles.usageItem, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
                • {usage}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.emotionalWeight}>
          <Text style={[styles.weightLabel, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
            Emotional Weight
          </Text>
          <View style={[styles.weightBar, { backgroundColor: isDarkMode ? COLORS.dark.surface : COLORS.light.surface }]}>
            <View style={[
              styles.weightProgress, 
              { 
                width: `${culturalAnalysis.emotionalWeight * 100}%`, 
                backgroundColor: COLORS.accent.orange 
              }
            ]} />
          </View>
          <Text style={[styles.weightValue, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
            {(culturalAnalysis.emotionalWeight * 100).toFixed(1)}%
          </Text>
        </View>
      </View>
    );
  };

  const renderHarmonyTab = () => {
    return (
      <View style={styles.analysisSection}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
          Perceptual Color Harmony
        </Text>
        
        <View style={styles.harmonyPalette}>
          {perceptualHarmony.map((color, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.harmonyColor, { backgroundColor: color }]}
              onPress={() => selectColor(color)}
            >
              <Text style={styles.harmonyHex}>{color.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.harmonyTypes}>
          <Text style={[styles.harmonyTypesTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
            Harmony Types
          </Text>
          {['perceptual-complementary', 'perceptual-triadic', 'lightness-series', 'chroma-series'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.harmonyTypeButton, { backgroundColor: isDarkMode ? COLORS.dark.card : COLORS.light.card }]}
              onPress={() => {
                const harmony = PerceptualColorEngine.generatePerceptualHarmony(
                  targetColor,
                  type,
                  VIEWING_CONDITIONS[viewingCondition]
                );
                setPerceptualHarmony(harmony);
              }}
            >
              <Text style={[styles.harmonyTypeText, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
                {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const tabs = [
    { id: 'appearance', title: 'Appearance', icon: '👁️' },
    { id: 'contrast', title: 'Contrast', icon: '🎭' },
    { id: 'memory', title: 'Memory', icon: '🧠' },
    { id: 'culture', title: 'Culture', icon: '🌍' },
    { id: 'harmony', title: 'Harmony', icon: '🎨' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? COLORS.dark.background : COLORS.light.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
          Perceptual Color Lab
        </Text>
        <View style={[styles.targetColorSwatch, { backgroundColor: targetColor }]} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              {
                backgroundColor: activeTab === tab.id ? COLORS.primary[500] : 'transparent',
                borderBottomWidth: activeTab === tab.id ? 2 : 0,
                borderBottomColor: COLORS.primary[500],
              },
            ]}
            onPress={() => setActiveTab(tab.id as any)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[
              styles.tabTitle,
              {
                color: activeTab === tab.id ? '#ffffff' : (isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary),
              },
            ]}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'appearance' && renderAppearanceTab()}
        {activeTab === 'contrast' && renderContrastTab()}
        {activeTab === 'memory' && renderMemoryTab()}
        {activeTab === 'culture' && renderCultureTab()}
        {activeTab === 'harmony' && renderHarmonyTab()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING[5], paddingVertical: SPACING[4], borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.1)' },
  headerTitle: { fontSize: TYPOGRAPHY.fontSize.xl, fontWeight: 'bold' },
  targetColorSwatch: { width: 40, height: 40, borderRadius: BORDER_RADIUS.lg, borderWidth: 2, borderColor: '#ffffff', ...SHADOWS.base },
  tabNavigation: { flexDirection: 'row', paddingHorizontal: SPACING[2] },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING[3], gap: SPACING[1] },
  tabIcon: { fontSize: 16 },
  tabTitle: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: '600' },
  content: { flex: 1, padding: SPACING[4] },
  analysisSection: { marginBottom: SPACING[6] },
  sectionTitle: { fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: 'bold', marginBottom: SPACING[4] },
  appearanceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING[3], marginBottom: SPACING[4] },
  appearanceCard: { flex: 1, minWidth: 150, padding: SPACING[3], borderRadius: BORDER_RADIUS.lg, ...SHADOWS.base },
  appearanceLabel: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: '600', marginBottom: SPACING[1] },
  appearanceValue: { fontSize: TYPOGRAPHY.fontSize.xl, fontWeight: 'bold', marginBottom: SPACING[2] },
  appearanceBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  appearanceProgress: { height: '100%', borderRadius: 3 },
  hueWheel: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, position: 'relative', alignSelf: 'center' },
  hueIndicator: { position: 'absolute', width: 8, height: 8, borderRadius: 4, top: -4, left: 16 },
  viewingConditions: { marginTop: SPACING[4] },
  conditionsTitle: { fontSize: TYPOGRAPHY.fontSize.base, fontWeight: 'bold', marginBottom: SPACING[2] },
  conditionsButtons: { flexDirection: 'row', gap: SPACING[2] },
  conditionButton: { paddingHorizontal: SPACING[3], paddingVertical: SPACING[2], borderRadius: BORDER_RADIUS.lg, borderWidth: 1 },
  conditionButtonText: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: '600' },
  contrastDemo: { marginBottom: SPACING[4] },
  contrastBackground: { padding: SPACING[6], borderRadius: BORDER_RADIUS.xl, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  colorSample: { width: 80, height: 80, borderRadius: BORDER_RADIUS.lg, justifyContent: 'center', alignItems: 'center', ...SHADOWS.base },
  sampleLabel: { color: '#ffffff', fontSize: TYPOGRAPHY.fontSize.xs, fontWeight: 'bold', textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  contrastControls: { marginBottom: SPACING[4] },
  controlLabel: { fontSize: TYPOGRAPHY.fontSize.base, fontWeight: '600', marginBottom: SPACING[2] },
  backgroundPicker: { flexDirection: 'row', gap: SPACING[2] },
  backgroundOption: { width: 40, height: 40, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, ...SHADOWS.sm },
  contrastEffects: {},
  effectsTitle: { fontSize: TYPOGRAPHY.fontSize.base, fontWeight: 'bold', marginBottom: SPACING[2] },
  effectItem: { marginBottom: SPACING[1] },
  effectLabel: { fontSize: TYPOGRAPHY.fontSize.sm },
  memoryDemo: { marginBottom: SPACING[4] },
  memoryComparison: { padding: SPACING[4], borderRadius: BORDER_RADIUS.xl, flexDirection: 'row', justifyContent: 'space-around', ...SHADOWS.base },
  memoryItem: { alignItems: 'center' },
  memorySwatch: { width: 60, height: 60, borderRadius: BORDER_RADIUS.lg, marginBottom: SPACING[2], ...SHADOWS.sm },
  memoryLabel: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: '600' },
  memoryControls: { marginBottom: SPACING[4] },
  timeSlider: { width: '100%', height: 40 },
  memoryStats: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statLabel: { fontSize: TYPOGRAPHY.fontSize.sm, marginBottom: SPACING[1] },
  statValue: { fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: 'bold' },
  cultureSelector: { flexDirection: 'row', gap: SPACING[2], marginBottom: SPACING[4] },
  cultureButton: { paddingHorizontal: SPACING[4], paddingVertical: SPACING[2], borderRadius: BORDER_RADIUS.lg, borderWidth: 1 },
  cultureButtonText: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: '600' },
  culturalMeanings: { padding: SPACING[4], borderRadius: BORDER_RADIUS.xl, marginBottom: SPACING[3], ...SHADOWS.base },
  meaningsTitle: { fontSize: TYPOGRAPHY.fontSize.base, fontWeight: 'bold', marginBottom: SPACING[2] },
  meaningsList: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING[2] },
  meaningTag: { paddingHorizontal: SPACING[2], paddingVertical: SPACING[1], borderRadius: BORDER_RADIUS.base },
  meaningText: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: '600' },
  contextualUsage: { padding: SPACING[4], borderRadius: BORDER_RADIUS.xl, marginBottom: SPACING[3], ...SHADOWS.base },
  usageTitle: { fontSize: TYPOGRAPHY.fontSize.base, fontWeight: 'bold', marginBottom: SPACING[2] },
  usageList: {},
  usageItem: { fontSize: TYPOGRAPHY.fontSize.sm, marginBottom: SPACING[1] },
  emotionalWeight: { alignItems: 'center' },
  weightLabel: { fontSize: TYPOGRAPHY.fontSize.sm, marginBottom: SPACING[2] },
  weightBar: { width: '100%', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: SPACING[1] },
  weightProgress: { height: '100%', borderRadius: 4 },
  weightValue: { fontSize: TYPOGRAPHY.fontSize.base, fontWeight: 'bold' },
  harmonyPalette: { flexDirection: 'row', gap: SPACING[2], marginBottom: SPACING[4] },
  harmonyColor: { flex: 1, height: 80, borderRadius: BORDER_RADIUS.lg, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: SPACING[2], ...SHADOWS.sm },
  harmonyHex: { color: '#ffffff', fontSize: TYPOGRAPHY.fontSize.xs, fontWeight: 'bold', fontFamily: 'monospace', textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  harmonyTypes: {},
  harmonyTypesTitle: { fontSize: TYPOGRAPHY.fontSize.base, fontWeight: 'bold', marginBottom: SPACING[2] },
  harmonyTypeButton: { padding: SPACING[3], borderRadius: BORDER_RADIUS.lg, marginBottom: SPACING[2], ...SHADOWS.base },
  harmonyTypeText: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: '600' },
});

export default PerceptualColorLab;
