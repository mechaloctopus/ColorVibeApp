import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
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
    { backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff' }
  ];

  return (
    <SafeAreaView style={containerStyle}>
      {/* Persistent header */}
      <View style={styles.topHeader}>
        <Text style={styles.brand}>Color Vibe Studio</Text>
        <View style={styles.navRow}>
          <Pressable onPress={() => dispatch(setCurrentWorkstation('main'))} style={styles.navBtn}>
            <Text style={styles.navText}>Studio</Text>
          </Pressable>
          <Pressable onPress={() => dispatch(setCurrentWorkstation('theory-lab'))} style={styles.navBtn}>
            <Text style={styles.navText}>Labs</Text>
          </Pressable>
          {currentWorkstation !== 'main' && (
            <Pressable onPress={() => dispatch(setCurrentWorkstation('main'))} style={[styles.navBtn, styles.backBtn]}>
              <Text style={[styles.navText, styles.backText]}>Back to Studio</Text>
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
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { fontSize: 16, fontWeight: '700' },
  navRow: { flexDirection: 'row', gap: 8 },
  navBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  navText: { fontSize: 12, fontWeight: '600' },
  backBtn: { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' },
  backText: { color: '#1d4ed8' },
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
