import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS } from '../styles/designSystem';
import { RootState } from '../store/store';
import {
  MainStudio,
  ImageColorExtractor,
  ColorTheoryLab,
  PaintRecipeWorkstation,
  ColorScanner,
  ColorHarmonyExplorer,
  ColorTrendsInspiration,
  PerceptualColorLab,
  AccessibilityWorkstation,
} from './workstations';
import SimplifiedStudio from './SimplifiedStudio';
import WorkstationNavigator from './WorkstationNavigator';
import { setCurrentWorkstation } from '../store/slices/uiSlice';

const ColorVibeWorkstation: React.FC = () => {
  const { currentWorkstation, isDarkMode } = useSelector((state: RootState) => state.ui);
  const dispatch = useDispatch();

  const renderCurrentWorkstation = () => {
    switch (currentWorkstation) {
      case 'main':
        return <SimplifiedStudio />;
      case 'image-extractor':
        return <ImageColorExtractor />;
      case 'theory-lab':
        return <ColorTheoryLab />;
      case 'perceptual-lab':
        return <PerceptualColorLab />;
      case 'accessibility-suite':
        return <AccessibilityWorkstation />;
      case 'paint-recipes':
        return <PaintRecipeWorkstation />;
      case 'scanner':
        return <ColorScanner />;
      case 'harmony-explorer':
        return <ColorHarmonyExplorer />;
      case 'trends-inspiration':
        return <ColorTrendsInspiration />;
      default:
        return <SimplifiedStudio />;
    }
  };

  const containerStyle = [
    styles.container,
    { backgroundColor: isDarkMode ? COLORS.dark.background : COLORS.light.background }
  ];

  return (
    <SafeAreaView style={containerStyle}>
      {/* Persistent header */}
      <View style={[styles.topHeader, { backgroundColor: isDarkMode ? COLORS.dark.surface : COLORS.light.surface, borderBottomColor: isDarkMode ? COLORS.dark.border : COLORS.light.border }]}>
        <Text style={[styles.brand, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>Color Vibe Studio</Text>
        <View style={styles.navRow}>
          <Pressable onPress={() => dispatch(setCurrentWorkstation('main'))} style={[styles.navBtn, { borderColor: isDarkMode ? COLORS.dark.border : COLORS.light.border }]}>
            <Text style={[styles.navText, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>Studio</Text>
          </Pressable>
          <Pressable onPress={() => dispatch(setCurrentWorkstation('theory-lab'))} style={[styles.navBtn, { borderColor: isDarkMode ? COLORS.dark.border : COLORS.light.border }]}>
            <Text style={[styles.navText, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>Labs</Text>
          </Pressable>
          {currentWorkstation !== 'main' && (
            <Pressable onPress={() => dispatch(setCurrentWorkstation('main'))} style={[
              styles.navBtn,
              { backgroundColor: isDarkMode ? 'rgba(52,152,219,0.16)' : 'rgba(52,152,219,0.1)', borderColor: COLORS.primary[500] }
            ] }>
              <Text style={[styles.navText, { color: isDarkMode ? COLORS.primary[300] : COLORS.primary[700], fontWeight: '700' }]}>Back to Studio</Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.workstationContainer}>
        {renderCurrentWorkstation()}
      </View>

      {/* Bottom navigator (always accessible) */}
      <WorkstationNavigator />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  workstationContainer: {
    flex: 1,
    paddingBottom: 120,
  },
  topHeader: {
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { fontSize: 16, fontWeight: '700' },
  navRow: { flexDirection: 'row', gap: 8 },
  navBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: 'transparent' },
  navText: { fontSize: 12, fontWeight: '600' },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666666',
    marginBottom: 10,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: '#999999',
  },
});

export default ColorVibeWorkstation;
