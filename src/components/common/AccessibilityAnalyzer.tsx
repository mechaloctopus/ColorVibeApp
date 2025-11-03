import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { ColorBlindnessSimulator, ColorBlindnessType } from '../../utils/advancedColorTechnologies';
import { optimizedHexToRgb } from '../../utils/optimizedColorEngine';
import {
  calculateContrastRatio,
  colorDistance,
  getHue,
  generateHighContrastColor,
  getSeverityColor,
  getSeverityIcon,
  getLevelColor,
  ContrastResult
} from '../../utils/accessibilityUtils';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../styles/designSystem';

interface AccessibilityAnalyzerProps {
  foregroundColor: string;
  backgroundColor: string;
  onSuggestion?: (suggestion: AccessibilitySuggestion) => void;
  style?: any;
}

interface AccessibilitySuggestion {
  type: 'contrast' | 'colorblind' | 'cognitive';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  suggestedFix: string;
  fixedColor?: string;
}

// ContrastResult interface now imported from accessibilityUtils

const AccessibilityAnalyzer: React.FC<AccessibilityAnalyzerProps> = ({
  foregroundColor,
  backgroundColor,
  onSuggestion,
  style,
}) => {
  const { isDarkMode } = useSelector((state: RootState) => state.ui);
  
  const [contrastResult, setContrastResult] = useState<ContrastResult | null>(null);
  const [colorBlindResults, setColorBlindResults] = useState<Record<ColorBlindnessType, string>>({} as any);
  const [suggestions, setSuggestions] = useState<AccessibilitySuggestion[]>([]);
  const [activeTab, setActiveTab] = useState<'contrast' | 'colorblind' | 'cognitive' | 'suggestions'>('contrast');
  
  // Animation values
  const resultOpacity = useSharedValue(0);
  const suggestionScale = useSharedValue(0.9);
  
  useEffect(() => {
    analyzeAccessibility();
  }, [foregroundColor, backgroundColor]);
  
  useEffect(() => {
    // Animate results
    resultOpacity.value = withSpring(1, { damping: 15, stiffness: 200 });
    suggestionScale.value = withSpring(1, { damping: 20, stiffness: 150 });
  }, [contrastResult, suggestions]);
  
  const analyzeAccessibility = () => {
    // Analyze contrast
    const contrast = calculateContrastRatio(foregroundColor, backgroundColor);
    setContrastResult(contrast);
    
    // Analyze color blindness
    const colorBlindSims = ColorBlindnessSimulator.getAllSimulations(foregroundColor);
    setColorBlindResults(colorBlindSims);
    
    // Generate suggestions
    const newSuggestions = generateSuggestions(contrast, colorBlindSims);
    setSuggestions(newSuggestions);
  };
  
  // Using shared calculateContrastRatio from accessibilityUtils
  
  // Using shared getRelativeLuminance from accessibilityUtils
  
  const generateSuggestions = (
    contrast: ContrastResult,
    colorBlindSims: Record<ColorBlindnessType, string>
  ): AccessibilitySuggestion[] => {
    const suggestions: AccessibilitySuggestion[] = [];
    
    // Contrast suggestions
    if (contrast.ratio < 4.5) {
      suggestions.push({
        type: 'contrast',
        severity: contrast.ratio < 3 ? 'critical' : 'high',
        message: `Contrast ratio ${contrast.ratio.toFixed(2)}:1 fails WCAG AA standards`,
        suggestedFix: 'Increase contrast by darkening foreground or lightening background',
        fixedColor: generateHighContrastColor(foregroundColor, backgroundColor),
      });
    }
    
    // Color blindness suggestions
    const problematicTypes = checkColorBlindnessIssues(foregroundColor, backgroundColor, colorBlindSims);
    if (problematicTypes.length > 0) {
      suggestions.push({
        type: 'colorblind',
        severity: 'medium',
        message: `May be difficult to distinguish for ${problematicTypes.join(', ')} users`,
        suggestedFix: 'Consider adding patterns, icons, or adjusting hue difference',
      });
    }
    
    // Cognitive load suggestions
    const cognitiveIssues = checkCognitiveLoad(foregroundColor, backgroundColor);
    if (cognitiveIssues.length > 0) {
      suggestions.push({
        type: 'cognitive',
        severity: 'low',
        message: cognitiveIssues.join(', '),
        suggestedFix: 'Simplify color scheme or reduce saturation',
      });
    }
    
    return suggestions;
  };
  
  const checkColorBlindnessIssues = (
    fg: string,
    bg: string,
    sims: Record<ColorBlindnessType, string>
  ): string[] => {
    const issues: string[] = [];
    const fgRgb = optimizedHexToRgb(fg);
    const bgRgb = optimizedHexToRgb(bg);

    if (!fgRgb || !bgRgb) return [];
    
    // Check each type of color blindness
    Object.entries(sims).forEach(([type, simColor]) => {
      const simRgb = optimizedHexToRgb(simColor);
      if (!simRgb) return;
      const originalDistance = colorDistance(fgRgb, bgRgb);
      const simDistance = colorDistance(simRgb, bgRgb);
      
      // If simulated distance is significantly less, it's problematic
      if (simDistance < originalDistance * 0.6) {
        issues.push(type.replace(/anomaly|opia/, ''));
      }
    });
    
    return [...new Set(issues)]; // Remove duplicates
  };
  
  const checkCognitiveLoad = (fg: string, bg: string): string[] => {
    const issues: string[] = [];
    const fgRgb = optimizedHexToRgb(fg);
    const bgRgb = optimizedHexToRgb(bg);

    if (!fgRgb || !bgRgb) return [];
    
    // Check for high saturation combinations
    const fgSaturation = Math.max(fgRgb.r, fgRgb.g, fgRgb.b) - Math.min(fgRgb.r, fgRgb.g, fgRgb.b);
    const bgSaturation = Math.max(bgRgb.r, bgRgb.g, bgRgb.b) - Math.min(bgRgb.r, bgRgb.g, bgRgb.b);
    
    if (fgSaturation > 200 && bgSaturation > 200) {
      issues.push('High saturation combination may cause eye strain');
    }
    
    // Check for complementary colors (can be jarring)
    const hueDistance = Math.abs(getHue(fgRgb) - getHue(bgRgb));
    if (Math.abs(hueDistance - 180) < 30) {
      issues.push('Complementary colors may create visual vibration');
    }
    
    return issues;
  };
  
  // All helper functions now imported from accessibilityUtils
  
  const renderContrastTab = () => {
    if (!contrastResult) return null;
    
    const animatedStyle = useAnimatedStyle(() => ({
      opacity: resultOpacity.value,
      transform: [{ scale: suggestionScale.value }],
    }));
    
    return (
      <Animated.View style={[styles.tabContent, animatedStyle]}>
        <View style={[styles.contrastCard, { backgroundColor: isDarkMode ? COLORS.dark.card : COLORS.light.card }]}>
          <View style={styles.contrastHeader}>
            <Text style={[styles.contrastRatio, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
              {contrastResult.ratio.toFixed(2)}:1
            </Text>
            <View style={[styles.levelBadge, { backgroundColor: getLevelColor(contrastResult.level) }]}>
              <Text style={styles.levelText}>{contrastResult.level}</Text>
            </View>
          </View>
          
          <View style={styles.complianceChecks}>
            <View style={styles.complianceItem}>
              <Text style={styles.complianceIcon}>{contrastResult.passesNormal ? '✅' : '❌'}</Text>
              <Text style={[styles.complianceText, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
                Normal Text (AA)
              </Text>
            </View>
            <View style={styles.complianceItem}>
              <Text style={styles.complianceIcon}>{contrastResult.passesLarge ? '✅' : '❌'}</Text>
              <Text style={[styles.complianceText, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
                Large Text (AA)
              </Text>
            </View>
          </View>
          
          <View style={styles.colorPreview}>
            <View style={[styles.previewBackground, { backgroundColor: backgroundColor }]}>
              <Text style={[styles.previewText, { color: foregroundColor }]}>
                Sample Text
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };
  
  const renderColorBlindTab = () => {
    const animatedStyle = useAnimatedStyle(() => ({
      opacity: resultOpacity.value,
      transform: [{ scale: suggestionScale.value }],
    }));
    
    return (
      <Animated.View style={[styles.tabContent, animatedStyle]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {Object.entries(colorBlindResults).map(([type, simulatedColor]) => (
            <View key={type} style={[styles.simulationCard, { backgroundColor: isDarkMode ? COLORS.dark.card : COLORS.light.card }]}>
              <Text style={[styles.simulationType, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
              <View style={styles.simulationPreview}>
                <View style={[styles.originalPreview, { backgroundColor: backgroundColor }]}>
                  <Text style={[styles.previewText, { color: foregroundColor }]}>Original</Text>
                </View>
                <View style={[styles.simulatedPreview, { backgroundColor: backgroundColor }]}>
                  <Text style={[styles.previewText, { color: simulatedColor }]}>Simulated</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </Animated.View>
    );
  };
  
  const renderSuggestionsTab = () => {
    const animatedStyle = useAnimatedStyle(() => ({
      opacity: resultOpacity.value,
      transform: [{ scale: suggestionScale.value }],
    }));
    
    return (
      <Animated.View style={[styles.tabContent, animatedStyle]}>
        {suggestions.length === 0 ? (
          <View style={styles.noSuggestions}>
            <Text style={styles.noSuggestionsIcon}>✅</Text>
            <Text style={[styles.noSuggestionsText, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
              No accessibility issues detected!
            </Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {suggestions.map((suggestion, index) => (
              <View key={index} style={[styles.suggestionCard, { backgroundColor: isDarkMode ? COLORS.dark.card : COLORS.light.card }]}>
                <View style={styles.suggestionHeader}>
                  <Text style={styles.suggestionIcon}>{getSeverityIcon(suggestion.severity)}</Text>
                  <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(suggestion.severity) }]}>
                    <Text style={styles.severityText}>{suggestion.severity.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={[styles.suggestionMessage, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
                  {suggestion.message}
                </Text>
                <Text style={[styles.suggestionFix, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
                  💡 {suggestion.suggestedFix}
                </Text>
                {suggestion.fixedColor && (
                  <TouchableOpacity
                    style={[styles.fixButton, { backgroundColor: COLORS.primary[500] }]}
                    onPress={() => onSuggestion?.(suggestion)}
                  >
                    <Text style={styles.fixButtonText}>Apply Fix</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </ScrollView>
        )}
      </Animated.View>
    );
  };
  
  // Using shared getLevelColor from accessibilityUtils
  
  const tabs = [
    { id: 'contrast', title: 'Contrast', icon: '🔍' },
    { id: 'colorblind', title: 'Color Blind', icon: '👁️' },
    { id: 'suggestions', title: 'Suggestions', icon: '💡' },
  ];
  
  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
          ♿ Accessibility Analysis
        </Text>
      </View>
      
      <View style={styles.tabNavigation}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              {
                backgroundColor: activeTab === tab.id ? COLORS.primary[500] : 'transparent',
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
      
      <View style={styles.content}>
        {activeTab === 'contrast' && renderContrastTab()}
        {activeTab === 'colorblind' && renderColorBlindTab()}
        {activeTab === 'suggestions' && renderSuggestionsTab()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: SPACING[4], paddingVertical: SPACING[3], borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.1)' },
  headerTitle: { fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: 'bold' },
  tabNavigation: { flexDirection: 'row', paddingHorizontal: SPACING[2] },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING[3], gap: SPACING[1], borderRadius: BORDER_RADIUS.base, marginHorizontal: SPACING[1] },
  tabIcon: { fontSize: 16 },
  tabTitle: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: '600' },
  content: { flex: 1, padding: SPACING[4] },
  tabContent: { flex: 1 },
  contrastCard: { padding: SPACING[4], borderRadius: BORDER_RADIUS.xl, ...SHADOWS.base },
  contrastHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING[3] },
  contrastRatio: { fontSize: TYPOGRAPHY.fontSize.xxl, fontWeight: 'bold' },
  levelBadge: { paddingHorizontal: SPACING[3], paddingVertical: SPACING[1], borderRadius: BORDER_RADIUS.base },
  levelText: { color: '#ffffff', fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: 'bold' },
  complianceChecks: { marginBottom: SPACING[4] },
  complianceItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING[2], marginBottom: SPACING[2] },
  complianceIcon: { fontSize: 16 },
  complianceText: { fontSize: TYPOGRAPHY.fontSize.base },
  colorPreview: { alignItems: 'center' },
  previewBackground: { padding: SPACING[4], borderRadius: BORDER_RADIUS.lg, minWidth: 200 },
  previewText: { fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: 'bold', textAlign: 'center' },
  simulationCard: { padding: SPACING[3], borderRadius: BORDER_RADIUS.lg, marginBottom: SPACING[3], ...SHADOWS.sm },
  simulationType: { fontSize: TYPOGRAPHY.fontSize.base, fontWeight: 'bold', marginBottom: SPACING[2] },
  simulationPreview: { flexDirection: 'row', gap: SPACING[3] },
  originalPreview: { flex: 1, padding: SPACING[3], borderRadius: BORDER_RADIUS.base, alignItems: 'center' },
  simulatedPreview: { flex: 1, padding: SPACING[3], borderRadius: BORDER_RADIUS.base, alignItems: 'center' },
  noSuggestions: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  noSuggestionsIcon: { fontSize: 48, marginBottom: SPACING[3] },
  noSuggestionsText: { fontSize: TYPOGRAPHY.fontSize.lg, textAlign: 'center' },
  suggestionCard: { padding: SPACING[4], borderRadius: BORDER_RADIUS.lg, marginBottom: SPACING[3], ...SHADOWS.sm },
  suggestionHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING[2], marginBottom: SPACING[2] },
  suggestionIcon: { fontSize: 20 },
  severityBadge: { paddingHorizontal: SPACING[2], paddingVertical: SPACING[1], borderRadius: BORDER_RADIUS.base },
  severityText: { color: '#ffffff', fontSize: TYPOGRAPHY.fontSize.xs, fontWeight: 'bold' },
  suggestionMessage: { fontSize: TYPOGRAPHY.fontSize.base, marginBottom: SPACING[2], lineHeight: 22 },
  suggestionFix: { fontSize: TYPOGRAPHY.fontSize.sm, lineHeight: 20, marginBottom: SPACING[3] },
  fixButton: { paddingVertical: SPACING[2], paddingHorizontal: SPACING[4], borderRadius: BORDER_RADIUS.base, alignSelf: 'flex-start' },
  fixButtonText: { color: '#ffffff', fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: 'bold' },
});

export default AccessibilityAnalyzer;
