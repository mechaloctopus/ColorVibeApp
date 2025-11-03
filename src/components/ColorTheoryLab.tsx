import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { analyzeColorOptimized, optimizedHexToRgb, optimizedRgbToHsl, PerformanceMonitor } from '../utils/optimizedColorEngine';
import { PerceptualColorEngine, VIEWING_CONDITIONS } from '../utils/perceptualColorEngine';

interface ColorAnalysis {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  cmyk: { c: number; m: number; y: number; k: number };
  lab: { l: number; a: number; b: number };
  temperature: number;
  luminance: number;
  contrast: { white: number; black: number; wcagAA: boolean; wcagAAA: boolean };
}

interface ColorTheoryLabProps {
  selectedColor?: string;
}

const ColorTheoryLab: React.FC<ColorTheoryLabProps> = ({ selectedColor }) => {
  const { isDarkMode } = useSelector((state: RootState) => state.ui);
  const [currentColor, setCurrentColor] = useState(selectedColor || '#3498db');
  const [analysis, setAnalysis] = useState<ColorAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<'analysis' | 'harmony' | 'accessibility'>('analysis');

  useEffect(() => {
    if (currentColor) analyzeColor(currentColor);
  }, [currentColor]);

  useEffect(() => {
    if (selectedColor && selectedColor !== currentColor) {
      setCurrentColor(selectedColor);
    }
  }, [selectedColor]);

  const analyzeColor = React.useCallback((hex: string) => {
    const endMeasurement = PerformanceMonitor.startMeasurement('color-analysis');

    const analysis = analyzeColorOptimized(hex);
    if (analysis) {
      setAnalysis(analysis);
    }

    endMeasurement();
  }, []);

  // Calculation functions moved to optimizedColorEngine for better performance

  const generateHarmonyColors = React.useCallback((baseHex: string) => {
    const rgb = optimizedHexToRgb(baseHex);
    if (!rgb) return {};
    const hsl = optimizedRgbToHsl(rgb.r, rgb.g, rgb.b);
    const { h, s, l } = hsl;

    return {
      complementary: hslToHex((h + 180) % 360, s, l),
      triadic: [hslToHex(h, s, l), hslToHex((h + 120) % 360, s, l), hslToHex((h + 240) % 360, s, l)],
      analogous: [hslToHex((h - 30 + 360) % 360, s, l), hslToHex(h, s, l), hslToHex((h + 30) % 360, s, l)],
    };
  }, []);

  const hslToHex = (h: number, s: number, l: number): string => {
    const hNorm = h / 360, sNorm = s / 100, lNorm = l / 100;
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

  const renderAnalysisTab = () => {
    if (!analysis) return null;
    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? '#ffffff' : '#000000' }]}>Color Spaces</Text>
          <View style={styles.colorSpaceGrid}>
            {[
              { label: 'HEX', value: analysis.hex.toUpperCase() },
              { label: 'RGB', value: `${analysis.rgb.r}, ${analysis.rgb.g}, ${analysis.rgb.b}` },
              { label: 'HSL', value: `${Math.round(analysis.hsl.h)}°, ${Math.round(analysis.hsl.s)}%, ${Math.round(analysis.hsl.l)}%` },
              { label: 'CMYK', value: `${analysis.cmyk.c}%, ${analysis.cmyk.m}%, ${analysis.cmyk.y}%, ${analysis.cmyk.k}%` },
              { label: 'LAB', value: `${analysis.lab.l}, ${analysis.lab.a}, ${analysis.lab.b}` },
            ].map((item, index) => (
              <View key={index} style={[styles.colorSpaceCard, { backgroundColor: isDarkMode ? '#333333' : '#f8f9fa' }]}>
                <Text style={[styles.colorSpaceLabel, { color: isDarkMode ? '#cccccc' : '#666666' }]}>{item.label}</Text>
                <Text style={[styles.colorSpaceValue, { color: isDarkMode ? '#ffffff' : '#000000' }]}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? '#ffffff' : '#000000' }]}>Properties</Text>
          <View style={styles.propertyRow}>
            <Text style={[styles.propertyLabel, { color: isDarkMode ? '#cccccc' : '#666666' }]}>Temperature:</Text>
            <Text style={[styles.propertyValue, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
              {analysis.temperature}K {analysis.temperature > 5500 ? '(Cool)' : '(Warm)'}
            </Text>
          </View>
          <View style={styles.propertyRow}>
            <Text style={[styles.propertyLabel, { color: isDarkMode ? '#cccccc' : '#666666' }]}>Luminance:</Text>
            <Text style={[styles.propertyValue, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
              {(analysis.luminance * 100).toFixed(1)}%
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderHarmonyTab = () => {
    const harmonies = generateHarmonyColors(currentColor);
    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? '#ffffff' : '#000000' }]}>Color Harmonies</Text>
          {[
            { name: 'Complementary', colors: [currentColor, harmonies.complementary] },
            { name: 'Triadic', colors: harmonies.triadic },
            { name: 'Analogous', colors: harmonies.analogous },
          ].map((harmony, index) => (
            <View key={index} style={styles.harmonySection}>
              <Text style={[styles.harmonyTitle, { color: isDarkMode ? '#ffffff' : '#000000' }]}>{harmony.name}</Text>
              <View style={styles.harmonyColors}>
                {harmony.colors?.map((color, colorIndex) => (
                  <View key={colorIndex} style={[styles.harmonyColor, { backgroundColor: color }]} />
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderAccessibilityTab = () => {
    if (!analysis) return null;
    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? '#ffffff' : '#000000' }]}>WCAG Compliance</Text>
          <View style={styles.contrastSection}>
            {[
              { label: 'Against White', ratio: analysis.contrast.white, bg: '#ffffff' },
              { label: 'Against Black', ratio: analysis.contrast.black, bg: '#000000' },
            ].map((test, index) => (
              <View key={index} style={styles.contrastTest}>
                <View style={styles.contrastTestHeader}>
                  <Text style={[styles.contrastLabel, { color: isDarkMode ? '#ffffff' : '#000000' }]}>{test.label}</Text>
                  <Text style={[styles.contrastRatio, { color: isDarkMode ? '#ffffff' : '#000000' }]}>{test.ratio.toFixed(2)}:1</Text>
                </View>
                <View style={[styles.contrastPreview, { backgroundColor: test.bg }]}>
                  <Text style={[styles.contrastText, { color: currentColor }]}>Sample Text</Text>
                </View>
              </View>
            ))}
          </View>
          <View style={styles.wcagResults}>
            <View style={[styles.wcagBadge, { backgroundColor: analysis.contrast.wcagAA ? '#2ecc71' : '#e74c3c' }]}>
              <Text style={styles.wcagBadgeText}>WCAG AA {analysis.contrast.wcagAA ? '✓' : '✗'}</Text>
            </View>
            <View style={[styles.wcagBadge, { backgroundColor: analysis.contrast.wcagAAA ? '#2ecc71' : '#e74c3c' }]}>
              <Text style={styles.wcagBadgeText}>WCAG AAA {analysis.contrast.wcagAAA ? '✓' : '✗'}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  const tabs = [
    { id: 'analysis', title: 'Analysis', icon: '🔬' },
    { id: 'harmony', title: 'Harmony', icon: '🎨' },
    { id: 'accessibility', title: 'Accessibility', icon: '👁️' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.currentColorSwatch, { backgroundColor: currentColor }]} />
          <View>
            <Text style={[styles.headerTitle, { color: isDarkMode ? '#ffffff' : '#000000' }]}>Color Theory Lab</Text>
            <Text style={[styles.headerSubtitle, { color: isDarkMode ? '#cccccc' : '#666666' }]}>{currentColor.toUpperCase()}</Text>
          </View>
        </View>
      </View>
      <View style={styles.tabNavigation}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, { backgroundColor: activeTab === tab.id ? '#3498db' : (isDarkMode ? '#333333' : '#e9ecef') }]}
            onPress={() => setActiveTab(tab.id as any)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabTitle, { color: activeTab === tab.id ? '#ffffff' : (isDarkMode ? '#cccccc' : '#666666') }]}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.content}>
        {activeTab === 'analysis' && renderAnalysisTab()}
        {activeTab === 'harmony' && renderHarmonyTab()}
        {activeTab === 'accessibility' && renderAccessibilityTab()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.1)' },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  currentColorSwatch: { width: 40, height: 40, borderRadius: 20, marginRight: 12, borderWidth: 2, borderColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 12, fontFamily: 'monospace', marginTop: 2 },
  tabNavigation: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, gap: 6 },
  tabIcon: { fontSize: 16 },
  tabTitle: { fontSize: 12, fontWeight: '600' },
  content: { flex: 1 },
  tabContent: { flex: 1, paddingHorizontal: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  colorSpaceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  colorSpaceCard: { flex: 1, minWidth: '45%', padding: 12, borderRadius: 12, alignItems: 'center' },
  colorSpaceLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  colorSpaceValue: { fontSize: 11, fontFamily: 'monospace', textAlign: 'center' },
  propertyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.05)' },
  propertyLabel: { fontSize: 14, fontWeight: '600' },
  propertyValue: { fontSize: 14, fontFamily: 'monospace' },
  harmonySection: { marginBottom: 20 },
  harmonyTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  harmonyColors: { flexDirection: 'row', gap: 8 },
  harmonyColor: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
  contrastSection: { gap: 16 },
  contrastTest: { marginBottom: 16 },
  contrastTestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  contrastLabel: { fontSize: 14, fontWeight: '600' },
  contrastRatio: { fontSize: 14, fontFamily: 'monospace', fontWeight: 'bold' },
  contrastPreview: { padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.1)' },
  contrastText: { fontSize: 16, fontWeight: '600' },
  wcagResults: { flexDirection: 'row', gap: 12, marginTop: 16 },
  wcagBadge: { flex: 1, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, alignItems: 'center' },
  wcagBadgeText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
});

export default ColorTheoryLab;
