import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, ScrollView } from 'react-native';
// Camera imports with fallback for when expo-camera is not available
interface CameraProps {
  children?: React.ReactNode;
  style?: any;
  type?: string;
  ref?: any;
}

let Camera: React.ComponentType<CameraProps> | null = null;
let CameraType: { back: string; front: string } | null = null;
let ImagePicker: any = null;
let MediaLibrary: any = null;

try {
  const cameraModule = require('expo-camera');
  Camera = cameraModule.Camera;
  CameraType = cameraModule.CameraType;
} catch (error) {
  console.warn('[Color Scanner] expo-camera not available, using fallback');
  // Fallback camera implementation
  Camera = ({ children, style, type, ref }: CameraProps) => (
    <View style={[style, { backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }]}>
      <Text style={{ color: 'white', textAlign: 'center' }}>
        📷{'\n'}Camera not available{'\n'}Install expo-camera for full functionality
      </Text>
      {children}
    </View>
  );
  CameraType = { back: 'back', front: 'front' };
}

try {
  ImagePicker = require('expo-image-picker');
} catch (error) {
  console.warn('[Color Scanner] expo-image-picker not available, using fallback');
  ImagePicker = {
    requestMediaLibraryPermissionsAsync: async () => ({ status: 'granted' }),
    launchImageLibraryAsync: async () => ({ cancelled: true }),
  };
}

try {
  MediaLibrary = require('expo-media-library');
} catch (error) {
  console.warn('[Color Scanner] expo-media-library not available, using fallback');
  MediaLibrary = {
    requestPermissionsAsync: async () => ({ status: 'granted' }),
    saveToLibraryAsync: async () => Promise.resolve(),
  };
}
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { addRecentColor } from '../store/slices/paletteSlice';
import { optimizedHexToRgb, optimizedRgbToHsl, analyzeColorOptimized } from '../utils/optimizedColorEngine';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../styles/designSystem';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ExtractedColor {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  percentage: number;
  position: { x: number; y: number };
  name: string;
}

interface ColorCluster {
  dominantColor: ExtractedColor;
  similarColors: ExtractedColor[];
  totalPercentage: number;
}

const ColorScanner: React.FC = () => {
  const { isDarkMode } = useSelector((state: RootState) => state.ui);
  const dispatch = useDispatch();
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState(CameraType?.back || 'back');
  const [isScanning, setIsScanning] = useState(false);
  const [extractedColors, setExtractedColors] = useState<ExtractedColor[]>([]);
  const [colorClusters, setColorClusters] = useState<ColorCluster[]>([]);
  const [selectedColor, setSelectedColor] = useState<ExtractedColor | null>(null);
  const [scanMode, setScanMode] = useState<'camera' | 'gallery'>('camera');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      const { status } = (Camera as any)?.requestCameraPermissionsAsync ?
        await (Camera as any).requestCameraPermissionsAsync() :
        { status: 'granted' };
      setHasPermission(status === 'granted');
    })();
  }, []);

  const extractColorsFromImageData = async (imageUri: string): Promise<ExtractedColor[]> => {
    // Simulate color extraction - in production, use a proper image processing library
    const mockColors: ExtractedColor[] = [
      {
        hex: '#FF6B35',
        rgb: { r: 255, g: 107, b: 53 },
        hsl: { h: 20, s: 100, l: 60 },
        percentage: 25.5,
        position: { x: 120, y: 200 },
        name: 'Vibrant Orange',
      },
      {
        hex: '#3498DB',
        rgb: { r: 52, g: 152, b: 219 },
        hsl: { h: 204, s: 70, l: 53 },
        percentage: 18.3,
        position: { x: 200, y: 150 },
        name: 'Sky Blue',
      },
      {
        hex: '#2ECC71',
        rgb: { r: 46, g: 204, b: 113 },
        hsl: { h: 145, s: 63, l: 49 },
        percentage: 15.7,
        position: { x: 180, y: 300 },
        name: 'Emerald Green',
      },
      {
        hex: '#E74C3C',
        rgb: { r: 231, g: 76, b: 60 },
        hsl: { h: 6, s: 78, l: 57 },
        percentage: 12.1,
        position: { x: 250, y: 180 },
        name: 'Crimson Red',
      },
      {
        hex: '#9B59B6',
        rgb: { r: 155, g: 89, b: 182 },
        hsl: { h: 283, s: 39, l: 53 },
        percentage: 10.8,
        position: { x: 160, y: 250 },
        name: 'Amethyst Purple',
      },
      {
        hex: '#F39C12',
        rgb: { r: 243, g: 156, b: 18 },
        hsl: { h: 37, s: 90, l: 51 },
        percentage: 8.9,
        position: { x: 220, y: 220 },
        name: 'Golden Yellow',
      },
    ];

    // Sort by percentage (most dominant first)
    return mockColors.sort((a, b) => b.percentage - a.percentage);
  };

  const clusterSimilarColors = (colors: ExtractedColor[]): ColorCluster[] => {
    const clusters: ColorCluster[] = [];
    const processed = new Set<number>();

    colors.forEach((color, index) => {
      if (processed.has(index)) return;

      const cluster: ColorCluster = {
        dominantColor: color,
        similarColors: [],
        totalPercentage: color.percentage,
      };

      // Find similar colors
      colors.forEach((otherColor, otherIndex) => {
        if (index === otherIndex || processed.has(otherIndex)) return;

        const hueDiff = Math.abs(color.hsl.h - otherColor.hsl.h);
        const satDiff = Math.abs(color.hsl.s - otherColor.hsl.s);
        const lightDiff = Math.abs(color.hsl.l - otherColor.hsl.l);

        // Group colors with similar hue (within 30 degrees)
        if (hueDiff < 30 || hueDiff > 330) {
          cluster.similarColors.push(otherColor);
          cluster.totalPercentage += otherColor.percentage;
          processed.add(otherIndex);
        }
      });

      processed.add(index);
      clusters.push(cluster);
    });

    return clusters.sort((a, b) => b.totalPercentage - a.totalPercentage);
  };

  const generateColorName = (hsl: { h: number; s: number; l: number }): string => {
    const { h, s, l } = hsl;
    
    let hueName = '';
    if (h >= 0 && h < 15) hueName = 'Red';
    else if (h < 45) hueName = 'Orange';
    else if (h < 75) hueName = 'Yellow';
    else if (h < 105) hueName = 'Yellow-Green';
    else if (h < 135) hueName = 'Green';
    else if (h < 165) hueName = 'Blue-Green';
    else if (h < 195) hueName = 'Cyan';
    else if (h < 225) hueName = 'Blue';
    else if (h < 255) hueName = 'Blue-Purple';
    else if (h < 285) hueName = 'Purple';
    else if (h < 315) hueName = 'Red-Purple';
    else hueName = 'Red';

    let saturationDesc = '';
    if (s < 20) saturationDesc = 'Muted';
    else if (s < 60) saturationDesc = 'Soft';
    else if (s < 80) saturationDesc = 'Vibrant';
    else saturationDesc = 'Intense';

    let lightnessDesc = '';
    if (l < 20) lightnessDesc = 'Very Dark';
    else if (l < 40) lightnessDesc = 'Dark';
    else if (l < 60) lightnessDesc = '';
    else if (l < 80) lightnessDesc = 'Light';
    else lightnessDesc = 'Very Light';

    return `${lightnessDesc} ${saturationDesc} ${hueName}`.trim();
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      setIsScanning(true);
      setIsAnalyzing(true);
      
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });

        // Extract colors from the image
        const colors = await extractColorsFromImageData(photo.uri);
        const clusters = clusterSimilarColors(colors);
        
        setExtractedColors(colors);
        setColorClusters(clusters);
        
        // Save to media library
        await MediaLibrary.saveToLibraryAsync(photo.uri);
        
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture and analyze colors');
        console.error('Camera error:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const pickImageFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setIsAnalyzing(true);
      
      try {
        const colors = await extractColorsFromImageData(result.assets[0].uri);
        const clusters = clusterSimilarColors(colors);
        
        setExtractedColors(colors);
        setColorClusters(clusters);
        setScanMode('gallery');
      } catch (error) {
        Alert.alert('Error', 'Failed to analyze image colors');
        console.error('Image analysis error:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const selectColor = (color: ExtractedColor) => {
    setSelectedColor(color);
    dispatch(addRecentColor(color.hex));
  };

  const renderColorCluster = (cluster: ColorCluster, index: number) => (
    <View key={index} style={[styles.clusterCard, { backgroundColor: isDarkMode ? COLORS.dark.card : COLORS.light.card }]}>
      <View style={styles.clusterHeader}>
        <View style={[styles.dominantColorSwatch, { backgroundColor: cluster.dominantColor.hex }]} />
        <View style={styles.clusterInfo}>
          <Text style={[styles.clusterName, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
            {cluster.dominantColor.name}
          </Text>
          <Text style={[styles.clusterPercentage, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
            {cluster.totalPercentage.toFixed(1)}% of image
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.selectButton, { backgroundColor: COLORS.primary[500] }]}
          onPress={() => selectColor(cluster.dominantColor)}
        >
          <Text style={styles.selectButtonText}>Select</Text>
        </TouchableOpacity>
      </View>
      
      {cluster.similarColors.length > 0 && (
        <View style={styles.similarColors}>
          <Text style={[styles.similarColorsTitle, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
            Similar Colors:
          </Text>
          <View style={styles.similarColorsList}>
            {cluster.similarColors.map((color, colorIndex) => (
              <TouchableOpacity
                key={colorIndex}
                style={[styles.similarColorSwatch, { backgroundColor: color.hex }]}
                onPress={() => selectColor(color)}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );

  if (hasPermission === null) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={[styles.errorText, { color: COLORS.semantic.error }]}>
          Camera permission denied. Please enable camera access in settings.
        </Text>
        <TouchableOpacity style={[styles.button, { backgroundColor: COLORS.primary[500] }]} onPress={pickImageFromGallery}>
          <Text style={styles.buttonText}>Choose from Gallery Instead</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? COLORS.dark.background : COLORS.light.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
          Color Scanner
        </Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.modeButton, { backgroundColor: scanMode === 'camera' ? COLORS.primary[500] : 'transparent' }]}
            onPress={() => setScanMode('camera')}
          >
            <Text style={[styles.modeButtonText, { color: scanMode === 'camera' ? '#ffffff' : (isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary) }]}>
              📷 Camera
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, { backgroundColor: scanMode === 'gallery' ? COLORS.primary[500] : 'transparent' }]}
            onPress={() => setScanMode('gallery')}
          >
            <Text style={[styles.modeButtonText, { color: scanMode === 'gallery' ? '#ffffff' : (isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary) }]}>
              🖼️ Gallery
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Camera View */}
      {scanMode === 'camera' && (
        <View style={styles.cameraContainer}>
          {Camera && <Camera style={styles.camera} type={type} ref={cameraRef}>
            <View style={styles.cameraOverlay}>
              <View style={styles.scanningFrame} />
              <Text style={styles.scanningText}>
                Position colors within the frame and tap capture
              </Text>
            </View>
          </Camera>}
          
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}
              onPress={() => setType(type === CameraType?.back ? CameraType?.front || 'front' : CameraType?.back || 'back')}
            >
              <Text style={styles.controlButtonText}>🔄</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.captureButton, { backgroundColor: COLORS.primary[500] }]}
              onPress={takePicture}
              disabled={isAnalyzing}
            >
              <Text style={styles.captureButtonText}>
                {isAnalyzing ? '⏳' : '📸'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}
              onPress={pickImageFromGallery}
            >
              <Text style={styles.controlButtonText}>🖼️</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Gallery Mode */}
      {scanMode === 'gallery' && (
        <View style={styles.galleryContainer}>
          <TouchableOpacity
            style={[styles.galleryButton, { backgroundColor: COLORS.primary[500] }]}
            onPress={pickImageFromGallery}
            disabled={isAnalyzing}
          >
            <Text style={styles.galleryButtonText}>
              {isAnalyzing ? '⏳ Analyzing...' : '📁 Choose Image from Gallery'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Results */}
      {colorClusters.length > 0 && (
        <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
          <Text style={[styles.resultsTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
            Extracted Colors ({extractedColors.length} colors found)
          </Text>
          
          {colorClusters.map((cluster, index) => renderColorCluster(cluster, index))}
          
          {selectedColor && (
            <View style={[styles.selectedColorCard, { backgroundColor: isDarkMode ? COLORS.dark.card : COLORS.light.card }]}>
              <Text style={[styles.selectedColorTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
                Selected Color
              </Text>
              <View style={styles.selectedColorInfo}>
                <View style={[styles.selectedColorSwatch, { backgroundColor: selectedColor.hex }]} />
                <View style={styles.selectedColorDetails}>
                  <Text style={[styles.selectedColorHex, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
                    {selectedColor.hex.toUpperCase()}
                  </Text>
                  <Text style={[styles.selectedColorName, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
                    {selectedColor.name}
                  </Text>
                  <Text style={[styles.selectedColorRgb, { color: isDarkMode ? COLORS.dark.text.tertiary : COLORS.light.text.tertiary }]}>
                    RGB({selectedColor.rgb.r}, {selectedColor.rgb.g}, {selectedColor.rgb.b})
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center', padding: SPACING[6] },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING[5], paddingVertical: SPACING[4], borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.1)' },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  headerButtons: { flexDirection: 'row', gap: SPACING[2] },
  modeButton: { paddingHorizontal: SPACING[3], paddingVertical: SPACING[2], borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)' },
  modeButtonText: { fontSize: 12, fontWeight: '600' },
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  cameraOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.3)' },
  scanningFrame: { width: 250, height: 250, borderWidth: 3, borderColor: '#ffffff', borderRadius: BORDER_RADIUS.xl, backgroundColor: 'transparent' },
  scanningText: { color: '#ffffff', fontSize: 14, textAlign: 'center', marginTop: SPACING[4], paddingHorizontal: SPACING[6] },
  cameraControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: SPACING[6], backgroundColor: 'rgba(0, 0, 0, 0.8)' },
  controlButton: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  controlButtonText: { fontSize: 20 },
  captureButton: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', ...SHADOWS.lg },
  captureButtonText: { fontSize: 24 },
  galleryContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING[6] },
  galleryButton: { paddingHorizontal: SPACING[8], paddingVertical: SPACING[4], borderRadius: BORDER_RADIUS.xl, ...SHADOWS.base },
  galleryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  resultsContainer: { flex: 1, padding: SPACING[4] },
  resultsTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: SPACING[4] },
  clusterCard: { marginBottom: SPACING[4], padding: SPACING[4], borderRadius: BORDER_RADIUS.xl, ...SHADOWS.base },
  clusterHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING[3] },
  dominantColorSwatch: { width: 40, height: 40, borderRadius: 20, marginRight: SPACING[3], borderWidth: 2, borderColor: '#ffffff', ...SHADOWS.sm },
  clusterInfo: { flex: 1 },
  clusterName: { fontSize: 16, fontWeight: '600' },
  clusterPercentage: { fontSize: 12, marginTop: 2 },
  selectButton: { paddingHorizontal: SPACING[3], paddingVertical: SPACING[2], borderRadius: BORDER_RADIUS.lg },
  selectButtonText: { color: '#ffffff', fontSize: 12, fontWeight: '600' },
  similarColors: { marginTop: SPACING[2] },
  similarColorsTitle: { fontSize: 12, marginBottom: SPACING[2] },
  similarColorsList: { flexDirection: 'row', gap: SPACING[2] },
  similarColorSwatch: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)' },
  selectedColorCard: { marginTop: SPACING[4], padding: SPACING[4], borderRadius: BORDER_RADIUS.xl, ...SHADOWS.base },
  selectedColorTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: SPACING[3] },
  selectedColorInfo: { flexDirection: 'row', alignItems: 'center' },
  selectedColorSwatch: { width: 50, height: 50, borderRadius: 25, marginRight: SPACING[4], borderWidth: 2, borderColor: '#ffffff', ...SHADOWS.sm },
  selectedColorDetails: { flex: 1 },
  selectedColorHex: { fontSize: 18, fontWeight: 'bold', fontFamily: 'monospace' },
  selectedColorName: { fontSize: 14, marginTop: 2 },
  selectedColorRgb: { fontSize: 12, marginTop: 4, fontFamily: 'monospace' },
  errorText: { fontSize: 16, textAlign: 'center', marginBottom: SPACING[4] },
  button: { paddingHorizontal: SPACING[6], paddingVertical: SPACING[3], borderRadius: BORDER_RADIUS.lg, ...SHADOWS.base },
  buttonText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
});

export default ColorScanner;
