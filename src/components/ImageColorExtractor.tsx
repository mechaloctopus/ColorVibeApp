import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { RootState } from '../store/store';
import { addGeneratedPalette } from '../store/slices/paletteSlice';
import { addRecentColor } from '../store/slices/colorSlice';
import {
  pickImageFromCamera,
  pickImageFromGallery,
  extractColorsFromImage,
  generatePaletteFromExtractedColors,
  analyzeColorHarmony,
  analyzeColorAccessibility,
  ColorExtractionResult,
} from '../utils/imageColorExtractor';

const ImageColorExtractor: React.FC = () => {
  const dispatch = useDispatch();
  const { isDarkMode } = useSelector((state: RootState) => state.ui);
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [extractionResult, setExtractionResult] = useState<ColorExtractionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const cameraScale = useSharedValue(1);
  const galleryScale = useSharedValue(1);

  const cameraAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cameraScale.value }],
  }));

  const galleryAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: galleryScale.value }],
  }));

  const handleCameraPress = async () => {
    cameraScale.value = withSpring(0.95, {}, () => {
      cameraScale.value = withSpring(1);
    });

    try {
      setIsLoading(true);
      const imageUri = await pickImageFromCamera();
      if (imageUri) {
        setSelectedImage(imageUri);
        const result = await extractColorsFromImage(imageUri);
        setExtractionResult(result);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture image from camera');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGalleryPress = async () => {
    galleryScale.value = withSpring(0.95, {}, () => {
      galleryScale.value = withSpring(1);
    });

    try {
      setIsLoading(true);
      const imageUri = await pickImageFromGallery();
      if (imageUri) {
        setSelectedImage(imageUri);
        const result = await extractColorsFromImage(imageUri);
        setExtractionResult(result);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image from gallery');
    } finally {
      setIsLoading(false);
    }
  };

  const handleColorPress = (color: string) => {
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter(c => c !== color));
    } else {
      setSelectedColors([...selectedColors, color]);
    }
    dispatch(addRecentColor(color));
  };

  const generatePalette = () => {
    if (!extractionResult) return;

    const colors = selectedColors.length > 0 
      ? selectedColors 
      : generatePaletteFromExtractedColors(extractionResult.dominantColors);

    const palette = {
      id: Date.now().toString(),
      name: `Extracted Palette ${new Date().toLocaleTimeString()}`,
      colors,
      type: 'custom' as const,
      createdAt: Date.now(),
    };

    dispatch(addGeneratedPalette(palette));
    Alert.alert('Success', 'Palette generated and saved!');
  };

  const textColor = isDarkMode ? '#ffffff' : '#000000';
  const backgroundColor = isDarkMode ? '#1a1a1a' : '#f5f5f5';
  const cardBackgroundColor = isDarkMode ? '#2a2a2a' : '#ffffff';
  const borderColor = isDarkMode ? '#333333' : '#cccccc';

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>
          Image Color Extractor
        </Text>
        <Text style={[styles.subtitle, { color: textColor }]}>
          Extract beautiful color palettes from your photos
        </Text>
      </View>

      {/* Image Selection Buttons */}
      <View style={styles.buttonContainer}>
        <Animated.View style={cameraAnimatedStyle}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: cardBackgroundColor, borderColor }]}
            onPress={handleCameraPress}
            disabled={isLoading}
          >
            <Text style={[styles.buttonIcon, { color: textColor }]}>📷</Text>
            <Text style={[styles.buttonText, { color: textColor }]}>Camera</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={galleryAnimatedStyle}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: cardBackgroundColor, borderColor }]}
            onPress={handleGalleryPress}
            disabled={isLoading}
          >
            <Text style={[styles.buttonIcon, { color: textColor }]}>🖼️</Text>
            <Text style={[styles.buttonText, { color: textColor }]}>Gallery</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={[styles.loadingText, { color: textColor }]}>
            Extracting colors...
          </Text>
        </View>
      )}

      {/* Selected Image */}
      {selectedImage && (
        <View style={[styles.imageContainer, { backgroundColor: cardBackgroundColor, borderColor }]}>
          <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
        </View>
      )}

      {/* Extraction Results */}
      {extractionResult && (
        <View style={styles.resultsContainer}>
          {/* Dominant Colors */}
          <View style={[styles.section, { backgroundColor: cardBackgroundColor, borderColor }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Dominant Colors
            </Text>
            <View style={styles.colorGrid}>
              {extractionResult.dominantColors.map((colorInfo, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: colorInfo.hex },
                    selectedColors.includes(colorInfo.hex) && styles.selectedSwatch,
                  ]}
                  onPress={() => handleColorPress(colorInfo.hex)}
                >
                  <View style={styles.colorInfo}>
                    <Text style={styles.colorHex}>{colorInfo.hex}</Text>
                    <Text style={styles.colorFrequency}>
                      {Math.round(colorInfo.frequency * 100)}%
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Average Color */}
          <View style={[styles.section, { backgroundColor: cardBackgroundColor, borderColor }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Average Color
            </Text>
            <TouchableOpacity
              style={[
                styles.averageColorSwatch,
                { backgroundColor: extractionResult.averageColor.hex },
              ]}
              onPress={() => handleColorPress(extractionResult.averageColor.hex)}
            >
              <Text style={styles.averageColorText}>
                {extractionResult.averageColor.hex}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Color Harmony Analysis */}
          <View style={[styles.section, { backgroundColor: cardBackgroundColor, borderColor }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Harmony Analysis
            </Text>
            {(() => {
              const harmony = analyzeColorHarmony(extractionResult.dominantColors);
              return (
                <View>
                  <Text style={[styles.harmonyType, { color: textColor }]}>
                    {harmony.harmonyType.charAt(0).toUpperCase() + harmony.harmonyType.slice(1)} Harmony
                  </Text>
                  <Text style={[styles.harmonyStatus, { 
                    color: harmony.isHarmonious ? '#2ecc71' : '#e74c3c' 
                  }]}>
                    {harmony.isHarmonious ? '✓ Harmonious' : '⚠ Needs Adjustment'}
                  </Text>
                  {harmony.suggestions.map((suggestion, index) => (
                    <Text key={index} style={[styles.suggestion, { color: textColor }]}>
                      • {suggestion}
                    </Text>
                  ))}
                </View>
              );
            })()}
          </View>

          {/* Generate Palette Button */}
          <TouchableOpacity
            style={[styles.generateButton, { backgroundColor: '#3498db' }]}
            onPress={generatePalette}
          >
            <Text style={styles.generateButtonText}>
              Generate Palette ({selectedColors.length > 0 ? selectedColors.length : extractionResult.dominantColors.length} colors)
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    width: 120,
    height: 100,
    borderRadius: 15,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  imageContainer: {
    margin: 20,
    borderRadius: 15,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  resultsContainer: {
    padding: 20,
  },
  section: {
    borderRadius: 15,
    borderWidth: 1,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorSwatch: {
    width: '30%',
    height: 80,
    borderRadius: 10,
    marginBottom: 10,
    justifyContent: 'flex-end',
    padding: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedSwatch: {
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  colorInfo: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 5,
    padding: 4,
  },
  colorHex: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  colorFrequency: {
    color: '#ffffff',
    fontSize: 8,
    textAlign: 'center',
  },
  averageColorSwatch: {
    height: 60,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  averageColorText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  harmonyType: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  harmonyStatus: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  suggestion: {
    fontSize: 12,
    marginBottom: 3,
    opacity: 0.8,
  },
  generateButton: {
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ImageColorExtractor;
