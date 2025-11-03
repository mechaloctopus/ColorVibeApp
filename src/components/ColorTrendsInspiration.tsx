import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { addRecentColor, setCurrentColor } from '../store/slices/paletteSlice';
import { optimizedHexToRgb, optimizedRgbToHsl } from '../utils/optimizedColorEngine';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../styles/designSystem';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ColorTrend {
  id: string;
  name: string;
  description: string;
  year: number;
  season?: string;
  colors: string[];
  category: 'pantone' | 'fashion' | 'interior' | 'digital' | 'nature';
  inspiration: string;
}

interface ColorMood {
  id: string;
  name: string;
  description: string;
  colors: string[];
  emotion: string;
  usage: string[];
}

const COLOR_TRENDS: ColorTrend[] = [
  {
    id: 'pantone-2024',
    name: 'Peach Fuzz',
    description: 'Pantone Color of the Year 2024',
    year: 2024,
    colors: ['#FFBE98', '#FF9A76', '#E8856B', '#D4705A', '#C05B49'],
    category: 'pantone',
    inspiration: 'A velvety gentle peach tone that enriches mind, body, and soul',
  },
  {
    id: 'digital-renaissance',
    name: 'Digital Renaissance',
    description: 'Tech-inspired colors with artistic flair',
    year: 2024,
    colors: ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'],
    category: 'digital',
    inspiration: 'Where technology meets creativity in vibrant harmony',
  },
  {
    id: 'earth-awakening',
    name: 'Earth Awakening',
    description: 'Natural tones celebrating sustainability',
    year: 2024,
    colors: ['#8B7355', '#A0956B', '#6B8E23', '#8FBC8F', '#DEB887'],
    category: 'nature',
    inspiration: 'Grounded colors that connect us to nature and sustainability',
  },
  {
    id: 'maximalist-joy',
    name: 'Maximalist Joy',
    description: 'Bold, expressive colors for confident design',
    year: 2024,
    colors: ['#FF6B35', '#F7931E', '#FFD23F', '#06FFA5', '#4ECDC4'],
    category: 'fashion',
    inspiration: 'Unapologetically bold colors that celebrate individuality',
  },
  {
    id: 'serene-spaces',
    name: 'Serene Spaces',
    description: 'Calming interior color palette',
    year: 2024,
    colors: ['#E6E6FA', '#D8BFD8', '#B0C4DE', '#F0F8FF', '#F5F5DC'],
    category: 'interior',
    inspiration: 'Creating peaceful environments for modern living',
  },
];

const COLOR_MOODS: ColorMood[] = [
  {
    id: 'energetic',
    name: 'Energetic & Dynamic',
    description: 'Colors that inspire action and creativity',
    colors: ['#FF4757', '#FF6348', '#FF9F43', '#FFA502', '#FF3838'],
    emotion: 'Excitement, Energy, Passion',
    usage: ['Call-to-action buttons', 'Sports brands', 'Entertainment'],
  },
  {
    id: 'calm-focus',
    name: 'Calm & Focused',
    description: 'Colors that promote concentration and peace',
    colors: ['#3742FA', '#2F3542', '#57606F', '#A4B0BE', '#C8D6E5'],
    emotion: 'Tranquility, Focus, Stability',
    usage: ['Productivity apps', 'Healthcare', 'Education'],
  },
  {
    id: 'natural-organic',
    name: 'Natural & Organic',
    description: 'Earth-inspired colors for authentic brands',
    colors: ['#6AB04C', '#7ED321', '#F0CA4C', '#E17055', '#A0522D'],
    emotion: 'Growth, Health, Authenticity',
    usage: ['Organic products', 'Wellness brands', 'Sustainability'],
  },
  {
    id: 'luxury-premium',
    name: 'Luxury & Premium',
    description: 'Sophisticated colors for high-end experiences',
    colors: ['#2C2C54', '#40407A', '#706FD3', '#B33771', '#FD79A8'],
    emotion: 'Elegance, Sophistication, Exclusivity',
    usage: ['Luxury brands', 'Premium services', 'High-end products'],
  },
];

const ColorTrendsInspiration: React.FC = () => {
  const { isDarkMode } = useSelector((state: RootState) => state.ui);
  const dispatch = useDispatch();
  
  const [activeTab, setActiveTab] = useState<'trends' | 'moods' | 'seasonal' | 'custom'>('trends');
  const [selectedTrend, setSelectedTrend] = useState<ColorTrend | null>(null);
  const [selectedMood, setSelectedMood] = useState<ColorMood | null>(null);
  const [favoriteColors, setFavoriteColors] = useState<string[]>([]);

  const selectColor = (color: string) => {
    dispatch(addRecentColor(color));
    
    const rgb = optimizedHexToRgb(color);
    if (rgb) {
      const hsl = optimizedRgbToHsl(rgb.r, rgb.g, rgb.b);
      dispatch(setCurrentColor(color));
    }
  };

  const toggleFavorite = (color: string) => {
    setFavoriteColors(prev => 
      prev.includes(color) 
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  const renderTrendCard = (trend: ColorTrend) => (
    <TouchableOpacity
      key={trend.id}
      style={[
        styles.trendCard,
        {
          backgroundColor: isDarkMode ? COLORS.dark.card : COLORS.light.card,
          borderColor: selectedTrend?.id === trend.id ? COLORS.primary[500] : 'transparent',
        },
      ]}
      onPress={() => setSelectedTrend(selectedTrend?.id === trend.id ? null : trend)}
    >
      <View style={styles.trendHeader}>
        <View style={styles.trendInfo}>
          <Text style={[styles.trendName, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
            {trend.name}
          </Text>
          <Text style={[styles.trendDescription, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
            {trend.description}
          </Text>
          <View style={styles.trendMeta}>
            <Text style={[styles.trendYear, { color: isDarkMode ? COLORS.dark.text.tertiary : COLORS.light.text.tertiary }]}>
              {trend.year}
            </Text>
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(trend.category) }]}>
              <Text style={styles.categoryText}>{trend.category.toUpperCase()}</Text>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.colorPreview}>
        {trend.colors.map((color, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.previewColor, { backgroundColor: color }]}
            onPress={() => selectColor(color)}
          />
        ))}
      </View>
      
      {selectedTrend?.id === trend.id && (
        <View style={styles.trendDetails}>
          <Text style={[styles.inspirationTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
            Inspiration
          </Text>
          <Text style={[styles.inspirationText, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
            {trend.inspiration}
          </Text>
          
          <View style={styles.colorGrid}>
            {trend.colors.map((color, index) => (
              <View key={index} style={styles.colorItem}>
                <TouchableOpacity
                  style={[styles.colorSwatch, { backgroundColor: color }]}
                  onPress={() => selectColor(color)}
                />
                <Text style={[styles.colorHex, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
                  {color.toUpperCase()}
                </Text>
                <TouchableOpacity
                  style={styles.favoriteButton}
                  onPress={() => toggleFavorite(color)}
                >
                  <Text style={styles.favoriteIcon}>
                    {favoriteColors.includes(color) ? '❤️' : '🤍'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderMoodCard = (mood: ColorMood) => (
    <TouchableOpacity
      key={mood.id}
      style={[
        styles.moodCard,
        {
          backgroundColor: isDarkMode ? COLORS.dark.card : COLORS.light.card,
          borderColor: selectedMood?.id === mood.id ? COLORS.primary[500] : 'transparent',
        },
      ]}
      onPress={() => setSelectedMood(selectedMood?.id === mood.id ? null : mood)}
    >
      <View style={styles.moodHeader}>
        <Text style={[styles.moodName, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
          {mood.name}
        </Text>
        <Text style={[styles.moodDescription, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
          {mood.description}
        </Text>
        <Text style={[styles.moodEmotion, { color: COLORS.primary[500] }]}>
          {mood.emotion}
        </Text>
      </View>
      
      <View style={styles.moodColors}>
        {mood.colors.map((color, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.moodColor, { backgroundColor: color }]}
            onPress={() => selectColor(color)}
          />
        ))}
      </View>
      
      {selectedMood?.id === mood.id && (
        <View style={styles.moodDetails}>
          <Text style={[styles.usageTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
            Best Used For:
          </Text>
          {mood.usage.map((use, index) => (
            <Text key={index} style={[styles.usageItem, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
              • {use}
            </Text>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'pantone': return COLORS.accent.purple;
      case 'fashion': return COLORS.accent.pink;
      case 'interior': return COLORS.accent.green;
      case 'digital': return COLORS.accent.cyan;
      case 'nature': return COLORS.accent.green;
      default: return COLORS.primary[500];
    }
  };

  const renderTrendsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={[styles.sectionTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
        2024 Color Trends
      </Text>
      {COLOR_TRENDS.map(renderTrendCard)}
    </ScrollView>
  );

  const renderMoodsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={[styles.sectionTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
        Color Psychology & Moods
      </Text>
      {COLOR_MOODS.map(renderMoodCard)}
    </ScrollView>
  );

  const tabs = [
    { id: 'trends', title: 'Trends', icon: '📈' },
    { id: 'moods', title: 'Moods', icon: '🎭' },
    { id: 'seasonal', title: 'Seasonal', icon: '🍂' },
    { id: 'custom', title: 'Custom', icon: '⭐' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? COLORS.dark.background : COLORS.light.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
          Color Trends & Inspiration
        </Text>
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
      <View style={styles.content}>
        {activeTab === 'trends' && renderTrendsTab()}
        {activeTab === 'moods' && renderMoodsTab()}
        {activeTab === 'seasonal' && (
          <View style={styles.tabContent}>
            <Text style={[styles.comingSoonText, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
              Seasonal Color Palettes - Coming Soon
            </Text>
          </View>
        )}
        {activeTab === 'custom' && (
          <View style={styles.tabContent}>
            <Text style={[styles.comingSoonText, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
              Custom Inspiration Boards - Coming Soon
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: SPACING[5], paddingVertical: SPACING[4], borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.1)' },
  headerTitle: { fontSize: TYPOGRAPHY.fontSize.xl, fontWeight: 'bold' },
  tabNavigation: { flexDirection: 'row', paddingHorizontal: SPACING[2] },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING[3], gap: SPACING[1] },
  tabIcon: { fontSize: 16 },
  tabTitle: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: '600' },
  content: { flex: 1 },
  tabContent: { flex: 1, padding: SPACING[4] },
  sectionTitle: { fontSize: TYPOGRAPHY.fontSize.xl, fontWeight: 'bold', marginBottom: SPACING[4] },
  trendCard: { marginBottom: SPACING[4], padding: SPACING[4], borderRadius: BORDER_RADIUS.xl, borderWidth: 2, ...SHADOWS.base },
  trendHeader: { marginBottom: SPACING[3] },
  trendInfo: { flex: 1 },
  trendName: { fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: 'bold' },
  trendDescription: { fontSize: TYPOGRAPHY.fontSize.base, marginTop: 2 },
  trendMeta: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING[2], gap: SPACING[2] },
  trendYear: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: '600' },
  categoryBadge: { paddingHorizontal: SPACING[2], paddingVertical: SPACING[1], borderRadius: BORDER_RADIUS.base },
  categoryText: { color: '#ffffff', fontSize: TYPOGRAPHY.fontSize.xs, fontWeight: 'bold' },
  colorPreview: { flexDirection: 'row', gap: SPACING[1], marginBottom: SPACING[3] },
  previewColor: { flex: 1, height: 40, borderRadius: BORDER_RADIUS.base, ...SHADOWS.sm },
  trendDetails: { marginTop: SPACING[3], paddingTop: SPACING[3], borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.1)' },
  inspirationTitle: { fontSize: TYPOGRAPHY.fontSize.base, fontWeight: 'bold', marginBottom: SPACING[2] },
  inspirationText: { fontSize: TYPOGRAPHY.fontSize.sm, lineHeight: 20, marginBottom: SPACING[3] },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING[3] },
  colorItem: { alignItems: 'center', width: (SCREEN_WIDTH - 120) / 3 },
  colorSwatch: { width: 50, height: 50, borderRadius: BORDER_RADIUS.lg, marginBottom: SPACING[2], ...SHADOWS.sm },
  colorHex: { fontSize: TYPOGRAPHY.fontSize.xs, fontFamily: 'monospace', marginBottom: SPACING[1] },
  favoriteButton: { padding: SPACING[1] },
  favoriteIcon: { fontSize: 16 },
  moodCard: { marginBottom: SPACING[4], padding: SPACING[4], borderRadius: BORDER_RADIUS.xl, borderWidth: 2, ...SHADOWS.base },
  moodHeader: { marginBottom: SPACING[3] },
  moodName: { fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: 'bold' },
  moodDescription: { fontSize: TYPOGRAPHY.fontSize.base, marginTop: 2 },
  moodEmotion: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: '600', marginTop: SPACING[1] },
  moodColors: { flexDirection: 'row', gap: SPACING[2], marginBottom: SPACING[3] },
  moodColor: { flex: 1, height: 50, borderRadius: BORDER_RADIUS.lg, ...SHADOWS.sm },
  moodDetails: { marginTop: SPACING[3], paddingTop: SPACING[3], borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.1)' },
  usageTitle: { fontSize: TYPOGRAPHY.fontSize.base, fontWeight: 'bold', marginBottom: SPACING[2] },
  usageItem: { fontSize: TYPOGRAPHY.fontSize.sm, lineHeight: 20, marginBottom: SPACING[1] },
  comingSoonText: { textAlign: 'center', fontSize: TYPOGRAPHY.fontSize.lg, marginTop: SPACING[8] },
});

export default ColorTrendsInspiration;
