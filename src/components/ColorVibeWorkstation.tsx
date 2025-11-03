import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useSelector } from 'react-redux';
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
// Navigation overlays removed for web clarity

// All workstations are now fully implemented - no more placeholders!

const ColorVibeWorkstation: React.FC = () => {
  const { currentWorkstation, isDarkMode } = useSelector((state: RootState) => state.ui);

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
    { backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' }
  ];

  return (
    <SafeAreaView style={containerStyle}>
      <View style={styles.workstationContainer}>
        {renderCurrentWorkstation()}
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  workstationContainer: {
    flex: 1,
  },
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
