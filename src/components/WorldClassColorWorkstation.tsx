// World-Class Color Workstation
// Integration of all advanced features for ultimate color design experience

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';

// Advanced AI and Professional Systems
import { advancedAI, AIColorSuggestion } from '../utils/advancedAIColorIntelligence';
import { professionalExporter, PROFESSIONAL_FORMATS } from '../utils/professionalExportFormats';
import { worldClassAccessibility, AccessibilityTestResult, ColorBlindnessType, WCAGLevel } from '../utils/worldClassAccessibility';
import { ultraPremiumGestures, premiumAnimationOrchestrator, AnimationPresets } from '../utils/ultraPremiumUX';
import { PremiumHaptics, HapticType } from '../utils/premiumInteractions';

// Core utilities
import { optimizedHexToRgb, optimizedRgbToHsl } from '../utils/optimizedColorEngine';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../styles/designSystem';

// Redux
import { RootState } from '../store';
import { setCurrentColor, addRecentColor } from '../store/slices/paletteSlice';

interface WorldClassColorWorkstationProps {
  initialColor?: string;
  onColorChange?: (color: string) => void;
  showAdvancedFeatures?: boolean;
}

export const WorldClassColorWorkstation: React.FC<WorldClassColorWorkstationProps> = ({
  initialColor = '#3b82f6',
  onColorChange,
  showAdvancedFeatures = true,
}) => {
  const dispatch = useDispatch();
  const { currentColor } = useSelector((state: RootState) => state.ui);
  
  // State management
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [aiSuggestions, setAISuggestions] = useState<AIColorSuggestion[]>([]);
  const [accessibilityResults, setAccessibilityResults] = useState<AccessibilityTestResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeFeature, setActiveFeature] = useState<'ai' | 'accessibility' | 'export' | 'harmony'>('ai');

  // Animation values
  const colorScale = useSharedValue(1);
  const suggestionOpacity = useSharedValue(0);
  const accessibilityScale = useSharedValue(0);
  const exportButtonScale = useSharedValue(1);

  // Premium gesture handlers
  const colorTouchHandler = ultraPremiumGestures.createPremiumTouchFeedback(
    colorScale,
    suggestionOpacity,
    HapticType.MEDIUM
  );

  // Initialize advanced features
  useEffect(() => {
    initializeAdvancedFeatures();
  }, []);

  // React to color changes
  useEffect(() => {
    if (selectedColor !== currentColor) {
      setSelectedColor(currentColor);
      analyzeColorAdvanced(currentColor);
    }
  }, [currentColor]);

  const initializeAdvancedFeatures = useCallback(async () => {
    try {
      // Initialize AI system
      await analyzeColorAdvanced(selectedColor);
      
      // Animate feature reveal
      AnimationPresets.FADE_IN_UP(accessibilityScale, suggestionOpacity);
      
      PremiumHaptics.trigger(HapticType.SUCCESS);
    } catch (error) {
      console.error('Failed to initialize advanced features:', error);
      Alert.alert('Initialization Error', 'Some advanced features may not be available.');
    }
  }, [selectedColor]);

  const analyzeColorAdvanced = useCallback(async (color: string) => {
    if (!color || isAnalyzing) return;
    
    setIsAnalyzing(true);
    
    try {
      // AI Color Analysis
      const aiAnalysis = await advancedAI.analyzeColorAdvanced(color);
      const suggestions = await advancedAI.generateAISuggestions(color, 'web', 5);
      setAISuggestions(suggestions);

      // Accessibility Analysis
      const accessibilityAnalysis = await worldClassAccessibility.analyzeAccessibility(
        color,
        '#ffffff',
        { textSize: 'normal', usage: 'text', importance: 'high' }
      );
      setAccessibilityResults(accessibilityAnalysis);

      // Animate results reveal
      suggestionOpacity.value = withSpring(1, { damping: 15, stiffness: 200 });
      accessibilityScale.value = withSpring(1, { damping: 20, stiffness: 300 });

      // Orchestrate premium animations
      premiumAnimationOrchestrator.orchestrateAccessibilityFeedback(
        accessibilityAnalysis.contrast.ratio,
        accessibilityScale,
        suggestionOpacity,
        useSharedValue(accessibilityAnalysis.overall.passed ? 1 : 0)
      );

    } catch (error) {
      console.error('Advanced analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAnalyzing]);

  const handleColorSelect = useCallback(async (color: string) => {
    setSelectedColor(color);
    dispatch(setCurrentColor(color));
    dispatch(addRecentColor(color));
    
    // Premium haptic feedback
    PremiumHaptics.trigger(HapticType.SUCCESS);
    
    // Animate color change
    colorScale.value = withSpring(1.1, { damping: 15, stiffness: 300 });
    setTimeout(() => {
      colorScale.value = withSpring(1, { damping: 20, stiffness: 200 });
    }, 150);

    // Analyze new color
    await analyzeColorAdvanced(color);
    
    // Notify parent component
    onColorChange?.(color);
  }, [dispatch, onColorChange]);

  const handleAISuggestionSelect = useCallback((suggestion: AIColorSuggestion) => {
    handleColorSelect(suggestion.color);
    
    // Show reasoning
    Alert.alert(
      'AI Suggestion',
      `${suggestion.reasoning}\n\nConfidence: ${(suggestion.confidence * 100).toFixed(0)}%`,
      [{ text: 'Got it!', style: 'default' }]
    );
  }, [handleColorSelect]);

  const handleExportPalette = useCallback(async () => {
    if (!aiSuggestions.length) return;

    try {
      exportButtonScale.value = withSpring(0.95, { damping: 25, stiffness: 400 });
      
      const colors = [selectedColor, ...aiSuggestions.slice(0, 4).map(s => s.color)];
      const palette = professionalExporter.preparePaletteForExport(
        colors,
        'AI Generated Palette',
        'Created with World-Class Color Workstation'
      );

      // Export to multiple formats
      const formats = ['JSON', 'CSS', 'FIGMA', 'ASE'] as const;
      const exports = await Promise.all(
        formats.map(async format => {
          const content = await professionalExporter.exportPalette(palette, format);
          const formatInfo = professionalExporter.getFormatInfo(format);
          return { format, content, formatInfo };
        })
      );

      // Show export options
      Alert.alert(
        'Export Complete',
        `Palette exported in ${exports.length} professional formats:\n${exports.map(e => `• ${e.formatInfo.name}`).join('\n')}`,
        [
          { text: 'Download All', onPress: () => downloadExports(exports) },
          { text: 'OK', style: 'default' }
        ]
      );

      PremiumHaptics.trigger(HapticType.SUCCESS);
      
    } catch (error) {
      console.error('Export failed:', error);
      Alert.alert('Export Error', 'Failed to export palette. Please try again.');
    } finally {
      exportButtonScale.value = withSpring(1, { damping: 20, stiffness: 200 });
    }
  }, [selectedColor, aiSuggestions]);

  const downloadExports = useCallback((exports: any[]) => {
    // In a real app, this would trigger actual downloads
    console.log('Downloading exports:', exports);
    PremiumHaptics.trigger(HapticType.SUCCESS);
  }, []);

  const handleAccessibilityTest = useCallback(async () => {
    if (!accessibilityResults) return;

    const improvements = worldClassAccessibility.generateAccessibilityImprovements(
      selectedColor,
      '#ffffff',
      WCAGLevel.AA
    );

    Alert.alert(
      'Accessibility Analysis',
      `Score: ${accessibilityResults.overall.score}/100\nLevel: WCAG ${accessibilityResults.overall.level}\n\nSuggestions:\n${improvements.generalRecommendations.slice(0, 3).join('\n')}`,
      [{ text: 'Understood', style: 'default' }]
    );
  }, [selectedColor, accessibilityResults]);

  // Animated styles
  const colorPreviewStyle = useAnimatedStyle(() => ({
    transform: [{ scale: colorScale.value }],
  }));

  const suggestionContainerStyle = useAnimatedStyle(() => ({
    opacity: suggestionOpacity.value,
  }));

  const accessibilityContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: accessibilityScale.value }],
  }));

  const exportButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: exportButtonScale.value }],
  }));

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Color Vibe Workstation</Text>
        <Text style={styles.subtitle}>Smart Color Tools • Accessible • Professional</Text>
      </View>

      {/* Main Color Display */}
      <Animated.View style={[styles.colorPreview, colorPreviewStyle]}>
        <TouchableOpacity
          style={[styles.colorSwatch, { backgroundColor: selectedColor }]}
          {...colorTouchHandler}
          activeOpacity={0.9}
        >
          <Text style={styles.colorCode}>{selectedColor.toUpperCase()}</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Feature Tabs */}
      <View style={styles.featureTabs}>
        {(['ai', 'accessibility', 'export', 'harmony'] as const).map((feature) => (
          <TouchableOpacity
            key={feature}
            style={[
              styles.featureTab,
              activeFeature === feature && styles.activeFeatureTab
            ]}
            onPress={() => {
              setActiveFeature(feature);
              PremiumHaptics.trigger(HapticType.LIGHT);
            }}
          >
            <Text style={[
              styles.featureTabText,
              activeFeature === feature && styles.activeFeatureTabText
            ]}>
              {feature.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* AI Suggestions */}
      {activeFeature === 'ai' && (
        <Animated.View style={[styles.section, suggestionContainerStyle]}>
          <Text style={styles.sectionTitle}>AI Color Intelligence</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsScroll}>
            {aiSuggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.suggestionItem, { backgroundColor: suggestion.color }]}
                onPress={() => handleAISuggestionSelect(suggestion)}
                activeOpacity={0.8}
              >
                <View style={styles.suggestionOverlay}>
                  <Text style={styles.suggestionConfidence}>
                    {(suggestion.confidence * 100).toFixed(0)}%
                  </Text>
                  <Text style={styles.suggestionCategory}>
                    {suggestion.category.toUpperCase()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      )}

      {/* Accessibility Analysis */}
      {activeFeature === 'accessibility' && accessibilityResults && (
        <Animated.View style={[styles.section, accessibilityContainerStyle]}>
          <Text style={styles.sectionTitle}>Accessibility Analysis</Text>
          <TouchableOpacity style={styles.accessibilityCard} onPress={handleAccessibilityTest}>
            <View style={styles.accessibilityHeader}>
              <Text style={styles.accessibilityScore}>
                {accessibilityResults.overall.score}/100
              </Text>
              <Text style={styles.accessibilityLevel}>
                WCAG {accessibilityResults.overall.level}
              </Text>
            </View>
            <Text style={styles.accessibilityDetails}>
              Contrast: {accessibilityResults.contrast.ratio.toFixed(2)}:1
            </Text>
            <Text style={styles.accessibilityStatus}>
              {accessibilityResults.overall.passed ? '✅ Accessible' : '⚠️ Needs Improvement'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Professional Export */}
      {activeFeature === 'export' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Export</Text>
          <Animated.View style={exportButtonStyle}>
            <TouchableOpacity
              style={styles.exportButton}
              onPress={handleExportPalette}
              disabled={!aiSuggestions.length}
            >
              <Text style={styles.exportButtonText}>
                Export to Professional Formats
              </Text>
              <Text style={styles.exportButtonSubtext}>
                Adobe ASE • Sketch CLR • Figma JSON • CSS
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

      {/* Color Harmony */}
      {activeFeature === 'harmony' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Color Harmony Analysis</Text>
          <Text style={styles.comingSoon}>Advanced harmony visualization coming soon...</Text>
        </View>
      )}

      {/* Loading Indicator */}
      {isAnalyzing && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Analyzing with AI...</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  colorPreview: {
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  colorSwatch: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.large,
  },
  colorCode: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.inverse,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  featureTabs: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xs,
  },
  featureTab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
  },
  activeFeatureTab: {
    backgroundColor: COLORS.primary[500],
  },
  featureTabText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  activeFeatureTabText: {
    color: COLORS.text.inverse,
  },
  section: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  suggestionsScroll: {
    marginTop: SPACING.sm,
  },
  suggestionItem: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.sm,
    justifyContent: 'flex-end',
    ...SHADOWS.medium,
  },
  suggestionOverlay: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: SPACING.xs,
    borderBottomLeftRadius: BORDER_RADIUS.md,
    borderBottomRightRadius: BORDER_RADIUS.md,
  },
  suggestionConfidence: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.inverse,
    fontWeight: 'bold',
    fontSize: 10,
  },
  suggestionCategory: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.inverse,
    fontSize: 8,
  },
  accessibilityCard: {
    backgroundColor: COLORS.background.secondary,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.medium,
  },
  accessibilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  accessibilityScore: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary[500],
    fontWeight: 'bold',
  },
  accessibilityLevel: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  accessibilityDetails: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  accessibilityStatus: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },
  exportButton: {
    backgroundColor: COLORS.primary[500],
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  exportButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.inverse,
    fontWeight: 'bold',
  },
  exportButtonSubtext: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.inverse,
    marginTop: SPACING.xs,
    opacity: 0.8,
  },
  comingSoon: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: SPACING.xl,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.inverse,
    textAlign: 'center',
  },
});

export default WorldClassColorWorkstation;
