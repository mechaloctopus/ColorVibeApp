import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, TextInput } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { addRecentColor, setCurrentColor, savePalette } from '../store/slices/paletteSlice';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../styles/designSystem';
import { setCurrentWorkstation } from '../store/slices/uiSlice';
import { ALL_CURATED_PALETTES, SEASONAL_PALETTES, DESIGN_TREND_PALETTES, INDUSTRY_PALETTES, MOOD_PALETTES, CULTURAL_PALETTES, CuratedPalette } from '../data/curatedPalettes';
import type { Palette } from '../store/slices/paletteSlice';



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

  type ActiveTab = 'all' | 'trends' | 'moods' | 'seasonal' | 'industry' | 'cultural';
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [query, setQuery] = useState('');
  const [selectedTrend, setSelectedTrend] = useState<ColorTrend | null>(null);
  const [selectedMood, setSelectedMood] = useState<ColorMood | null>(null);
  const [favoriteColors, setFavoriteColors] = useState<string[]>([]);

  const selectColor = (color: string) => {
    dispatch(addRecentColor(color));
    dispatch(setCurrentColor(color));
    dispatch(setCurrentWorkstation('main'));
  };

  const toggleFavorite = (color: string) => {
    setFavoriteColors(prev =>
      prev.includes(color)
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };
  const getPalettesByTab = (tab: ActiveTab): CuratedPalette[] => {
    switch (tab) {
      case 'all':
        return ALL_CURATED_PALETTES;
      case 'trends':
        return DESIGN_TREND_PALETTES;
      case 'moods':
        return MOOD_PALETTES;
      case 'seasonal':
        return SEASONAL_PALETTES;
      case 'industry':
        return INDUSTRY_PALETTES;
      case 'cultural':
        return CULTURAL_PALETTES;
      default:
        return [];
    }
  };

  const filterPalettes = (list: CuratedPalette[]): CuratedPalette[] => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    const hexPart = q.replace('#', '');
    return list.filter(p => {
      const text = `${p.name} ${p.description} ${(p.tags || []).join(' ')}`.toLowerCase();
      const textMatch = text.includes(q);
      const colorMatch = p.colors.some(c => c.toLowerCase().includes(hexPart));
      return textMatch || colorMatch;
    });
  };

  const handleSavePalette = (p: CuratedPalette) => {
    const payload: Palette = { id: `curated-${p.id}`, name: p.name, colors: p.colors, type: 'custom', createdAt: Date.now() };
    dispatch(savePalette(payload));
  };

  const renderPaletteCard = (p: CuratedPalette) => (
    <View
      key={p.id}
      style={[
        styles.trendCard,
        {
          backgroundColor: isDarkMode ? COLORS.dark.card : COLORS.light.card,
          borderColor: 'transparent',
        },
      ]}
    >
      <View style={styles.paletteHeader}>
        <Text style={[styles.paletteName, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>{p.name}</Text>
        <TouchableOpacity
          onPress={() => handleSavePalette(p)}
          style={[styles.saveButton, { borderColor: isDarkMode ? COLORS.dark.border : COLORS.light.border, backgroundColor: 'transparent' }]}
        >
          <Text style={[styles.saveButtonText, { color: COLORS.primary[500] }]}>Save</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.paletteDescription, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>{p.description}</Text>
      <View style={styles.swatchRow}>
        {p.colors.map((c, idx) => (
          <TouchableOpacity key={idx} style={[styles.paletteSwatch, { backgroundColor: c }]} onPress={() => selectColor(c)} />
        ))}
      </View>
      {!!p.suggestedApplications?.length && (
        <View style={{ marginTop: SPACING[2] }}>
          <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, color: isDarkMode ? COLORS.dark.text.tertiary : COLORS.light.text.tertiary }}>
            Suggested: {p.suggestedApplications.join(', ')}
          </Text>
        </View>
      )}
    </View>
  );

  const getTitleForTab = (tab: ActiveTab) => {
    switch (tab) {
      case 'all': return 'All Curated Palettes';
      case 'trends': return 'Design Trends';
      case 'moods': return 'Mood-based Palettes';
      case 'seasonal': return 'Seasonal Palettes';
      case 'industry': return 'Industry-specific Palettes';
      case 'cultural': return 'Cultural & Regional Palettes';
      default: return '';
    }
  };

  const renderCategoryPalettes = (tab: ActiveTab) => {
    const data = filterPalettes(getPalettesByTab(tab));
    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
          {getTitleForTab(tab)}
        </Text>
        {data.map(renderPaletteCard)}
        {data.length === 0 && (
          <Text style={[styles.comingSoonText, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>No palettes match your search.</Text>
        )}
      </ScrollView>
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
    { id: 'all', title: 'All', icon: '✨' },
    { id: 'trends', title: 'Trends', icon: '📈' },
    { id: 'seasonal', title: 'Seasonal', icon: '🍃' },
    { id: 'moods', title: 'Mood', icon: '🎭' },
    { id: 'industry', title: 'Industry', icon: '🏢' },
    { id: 'cultural', title: 'Cultural', icon: '🌍' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? COLORS.dark.background : COLORS.light.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
          Color Trends & Inspiration
        </Text>
      </View>
        <View style={styles.searchRow}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search palettes by name, tag, or #hex"
            placeholderTextColor={isDarkMode ? COLORS.dark.text.tertiary : COLORS.light.text.tertiary}
            style={[
              styles.searchInput,
              {
                backgroundColor: isDarkMode ? COLORS.dark.surface : COLORS.light.surface,
                borderColor: isDarkMode ? COLORS.dark.border : COLORS.light.border,
                color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary,
              },
            ]}
          />
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
            onPress={() => setActiveTab(tab.id as ActiveTab)}
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
        {renderCategoryPalettes(activeTab)}
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
  searchRow: { paddingHorizontal: SPACING[5], paddingVertical: SPACING[2] },
  searchInput: { borderWidth: 1, borderRadius: BORDER_RADIUS.lg, paddingHorizontal: SPACING[3], paddingVertical: SPACING[2], fontSize: TYPOGRAPHY.fontSize.sm },
  paletteHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING[2] },
  paletteName: { fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: 'bold' },
  paletteDescription: { fontSize: TYPOGRAPHY.fontSize.base, marginBottom: SPACING[2] },
  swatchRow: { flexDirection: 'row', gap: SPACING[2], marginTop: SPACING[2], marginBottom: SPACING[2] },
  paletteSwatch: { flex: 1, height: 48, borderRadius: BORDER_RADIUS.lg, ...SHADOWS.sm },
  saveButton: { paddingHorizontal: SPACING[3], paddingVertical: SPACING[1], borderRadius: BORDER_RADIUS.base, borderWidth: 1 },
  saveButtonText: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: '700' },

  usageTitle: { fontSize: TYPOGRAPHY.fontSize.base, fontWeight: 'bold', marginBottom: SPACING[2] },
  usageItem: { fontSize: TYPOGRAPHY.fontSize.sm, lineHeight: 20, marginBottom: SPACING[1] },
  comingSoonText: { textAlign: 'center', fontSize: TYPOGRAPHY.fontSize.lg, marginTop: SPACING[8] },
});

export default ColorTrendsInspiration;
