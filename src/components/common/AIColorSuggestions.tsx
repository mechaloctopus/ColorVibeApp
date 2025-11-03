import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { addRecentColor } from '../../store/slices/paletteSlice';
import { AIColorIntelligence, AIColorSuggestion, ColorContext } from '../../utils/aiColorIntelligence';
import { ConfigUtils } from '../../config';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../styles/designSystem';
import { PremiumHaptics, HapticType } from '../../utils/premiumInteractions';

interface AIColorSuggestionsProps {
  baseColor: string;
  context?: Partial<ColorContext>;
  onColorSelect?: (color: string) => void;
  maxSuggestions?: number;
  style?: any;
}

const AIColorSuggestions: React.FC<AIColorSuggestionsProps> = ({
  baseColor,
  context = {},
  onColorSelect,
  maxSuggestions = 5,
  style,
}) => {
  const { isDarkMode } = useSelector((state: RootState) => state.ui);
  const dispatch = useDispatch();
  
  const [suggestions, setSuggestions] = useState<AIColorSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  
  // Animation values
  const containerOpacity = useSharedValue(0);
  const suggestionsScale = useSharedValue(0.8);
  
  // Check if AI suggestions are enabled
  const isAIEnabled = ConfigUtils.isFeatureEnabled('AI_COLOR_SUGGESTIONS');
  
  useEffect(() => {
    if (!isAIEnabled) return;
    generateSuggestions();
  }, [baseColor, context, isAIEnabled]);
  
  useEffect(() => {
    // Animate container appearance
    containerOpacity.value = withTiming(1, { duration: 300 });
    suggestionsScale.value = withSpring(1, { damping: 15, stiffness: 200 });
  }, [suggestions]);
  
  const generateSuggestions = async () => {
    if (!isAIEnabled) return;
    
    setIsLoading(true);
    try {
      const aiSuggestions = await AIColorIntelligence.generateSmartSuggestions(
        baseColor,
        context,
        maxSuggestions
      );
      setSuggestions(aiSuggestions);
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleColorSelect = (suggestion: AIColorSuggestion) => {
    setSelectedSuggestion(suggestion.color);
    
    // Add to recent colors
    dispatch(addRecentColor(suggestion.color));
    
    // Learn from interaction
    AIColorIntelligence.learnFromInteraction(
      suggestion.color,
      context,
      1.0, // High satisfaction for selection
      'selected'
    );
    
    // Haptic feedback
    PremiumHaptics.trigger(HapticType.MEDIUM);
    
    // Callback
    onColorSelect?.(suggestion.color);
    
    // Reset selection after animation
    setTimeout(() => setSelectedSuggestion(null), 300);
  };
  
  const handleColorReject = (suggestion: AIColorSuggestion) => {
    // Learn from rejection
    AIColorIntelligence.learnFromInteraction(
      suggestion.color,
      context,
      0.2, // Low satisfaction for rejection
      'rejected'
    );
    
    // Remove from current suggestions
    setSuggestions(prev => prev.filter(s => s.color !== suggestion.color));
    
    // Light haptic feedback
    PremiumHaptics.trigger(HapticType.LIGHT);
  };
  
  const getCategoryIcon = (category: AIColorSuggestion['category']): string => {
    const icons = {
      complementary: '⚖️',
      analogous: '🌈',
      trending: '📈',
      personal: '❤️',
      contextual: '🎯',
    };
    return icons[category] || '🎨';
  };
  
  const getCategoryColor = (category: AIColorSuggestion['category']): string => {
    const colors = {
      complementary: COLORS.accent.purple,
      analogous: COLORS.accent.green,
      trending: COLORS.accent.orange,
      personal: COLORS.accent.pink,
      contextual: COLORS.accent.cyan,
    };
    return colors[category] || COLORS.primary[500];
  };
  
  const renderSuggestion = (suggestion: AIColorSuggestion, index: number) => {
    const isSelected = selectedSuggestion === suggestion.color;
    
    const animatedStyle = useAnimatedStyle(() => ({
      opacity: containerOpacity.value,
      transform: [
        { scale: suggestionsScale.value * (isSelected ? 1.1 : 1) },
        { translateY: withSpring(isSelected ? -5 : 0) },
      ],
    }));
    
    return (
      <Animated.View
        key={suggestion.color}
        style={[
          styles.suggestionCard,
          {
            backgroundColor: isDarkMode ? COLORS.dark.card : COLORS.light.card,
            borderColor: isSelected ? COLORS.primary[500] : 'transparent',
          },
          animatedStyle,
        ]}
      >
        {/* Color Preview */}
        <TouchableOpacity
          style={[styles.colorPreview, { backgroundColor: suggestion.color }]}
          onPress={() => handleColorSelect(suggestion)}
          activeOpacity={0.8}
          accessibilityLabel={`Select color ${suggestion.color}`}
          accessibilityHint={`AI suggested color with ${(suggestion.confidence * 100).toFixed(0)}% confidence`}
        >
          <View style={styles.colorOverlay}>
            <Text style={styles.colorHex}>{suggestion.color.toUpperCase()}</Text>
          </View>
        </TouchableOpacity>
        
        {/* Suggestion Info */}
        <View style={styles.suggestionInfo}>
          <View style={styles.suggestionHeader}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryIcon}>{getCategoryIcon(suggestion.category)}</Text>
              <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(suggestion.category) }]} />
            </View>
            <View style={styles.confidenceContainer}>
              <Text style={[styles.confidenceText, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
                {(suggestion.confidence * 100).toFixed(0)}%
              </Text>
              <View style={[styles.confidenceBar, { backgroundColor: isDarkMode ? COLORS.dark.surface : COLORS.light.surface }]}>
                <View 
                  style={[
                    styles.confidenceProgress, 
                    { 
                      width: `${suggestion.confidence * 100}%`,
                      backgroundColor: getCategoryColor(suggestion.category),
                    }
                  ]} 
                />
              </View>
            </View>
          </View>
          
          <Text style={[styles.reasoningText, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
            {suggestion.reasoning}
          </Text>
          
          {/* Metadata */}
          <View style={styles.metadataContainer}>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataIcon}>🌍</Text>
              <View style={[styles.metadataBar, { backgroundColor: isDarkMode ? COLORS.dark.surface : COLORS.light.surface }]}>
                <View style={[styles.metadataProgress, { width: `${suggestion.metadata.culturalRelevance * 100}%`, backgroundColor: COLORS.accent.green }]} />
              </View>
            </View>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataIcon}>🎯</Text>
              <View style={[styles.metadataBar, { backgroundColor: isDarkMode ? COLORS.dark.surface : COLORS.light.surface }]}>
                <View style={[styles.metadataProgress, { width: `${suggestion.metadata.brandSuitability * 100}%`, backgroundColor: COLORS.accent.orange }]} />
              </View>
            </View>
          </View>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.selectButton]}
            onPress={() => handleColorSelect(suggestion)}
            accessibilityLabel="Select this color suggestion"
            accessibilityRole="button"
          >
            <Text style={styles.selectButtonText}>✓</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleColorReject(suggestion)}
            accessibilityLabel="Reject this color suggestion"
            accessibilityRole="button"
          >
            <Text style={styles.rejectButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };
  
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ scale: suggestionsScale.value }],
  }));
  
  if (!isAIEnabled) {
    return (
      <View style={[styles.container, style]}>
        <Text style={[styles.disabledText, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
          AI Color Suggestions are currently disabled
        </Text>
      </View>
    );
  }
  
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, style]}>
        <Text style={[styles.loadingText, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
          🧠 Generating smart suggestions...
        </Text>
      </View>
    );
  }
  
  if (suggestions.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <Text style={[styles.emptyText, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
          No AI suggestions available for this color
        </Text>
      </View>
    );
  }
  
  return (
    <Animated.View style={[styles.container, style, containerAnimatedStyle]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
          🧠 AI Color Suggestions
        </Text>
        <TouchableOpacity style={styles.refreshButton} onPress={generateSuggestions}>
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.suggestionsContainer}
      >
        {suggestions.map(renderSuggestion)}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: SPACING[3] },
  loadingContainer: { alignItems: 'center', paddingVertical: SPACING[4] },
  loadingText: { fontSize: TYPOGRAPHY.fontSize.base, fontStyle: 'italic' },
  disabledText: { fontSize: TYPOGRAPHY.fontSize.sm, textAlign: 'center', fontStyle: 'italic' },
  emptyText: { fontSize: TYPOGRAPHY.fontSize.sm, textAlign: 'center', fontStyle: 'italic' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING[3], paddingHorizontal: SPACING[2] },
  headerTitle: { fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: 'bold' },
  refreshButton: { padding: SPACING[2] },
  refreshIcon: { fontSize: 18 },
  suggestionsContainer: { paddingHorizontal: SPACING[2], gap: SPACING[3] },
  suggestionCard: { width: 200, borderRadius: BORDER_RADIUS.xl, borderWidth: 2, overflow: 'hidden', ...SHADOWS.base },
  colorPreview: { height: 80, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: SPACING[2] },
  colorOverlay: { backgroundColor: 'rgba(0, 0, 0, 0.3)', paddingHorizontal: SPACING[2], paddingVertical: SPACING[1], borderRadius: BORDER_RADIUS.base },
  colorHex: { color: '#ffffff', fontSize: TYPOGRAPHY.fontSize.xs, fontWeight: 'bold', fontFamily: 'monospace' },
  suggestionInfo: { padding: SPACING[3] },
  suggestionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING[2] },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', gap: SPACING[1] },
  categoryIcon: { fontSize: 16 },
  categoryDot: { width: 8, height: 8, borderRadius: 4 },
  confidenceContainer: { alignItems: 'flex-end' },
  confidenceText: { fontSize: TYPOGRAPHY.fontSize.xs, fontWeight: '600', marginBottom: 2 },
  confidenceBar: { width: 40, height: 4, borderRadius: 2, overflow: 'hidden' },
  confidenceProgress: { height: '100%', borderRadius: 2 },
  reasoningText: { fontSize: TYPOGRAPHY.fontSize.sm, lineHeight: 18, marginBottom: SPACING[2] },
  metadataContainer: { gap: SPACING[1] },
  metadataItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING[2] },
  metadataIcon: { fontSize: 12 },
  metadataBar: { flex: 1, height: 3, borderRadius: 1.5, overflow: 'hidden' },
  metadataProgress: { height: '100%', borderRadius: 1.5 },
  actionButtons: { flexDirection: 'row', padding: SPACING[2], gap: SPACING[2] },
  actionButton: { flex: 1, paddingVertical: SPACING[2], borderRadius: BORDER_RADIUS.base, alignItems: 'center' },
  selectButton: { backgroundColor: COLORS.accent.green },
  rejectButton: { backgroundColor: COLORS.accent.red },
  selectButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  rejectButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
});

export default AIColorSuggestions;
