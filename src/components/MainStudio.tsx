import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler, PanGestureHandlerGestureEvent, State } from 'react-native-gesture-handler';
import { RootState } from '../store/store';
import { setCurrentColor, addRecentColor } from '../store/slices/colorSlice';
import { addGeneratedPalette } from '../store/slices/paletteSlice';
import { generatePalette, generateAdvancedPalette } from '../utils/paletteGenerator';
import { hslToHex, hexToRgb, rgbToHsl } from '../utils/colorEngine';
import { generateMusicalPalette, MUSICAL_MODES } from '../utils/musicalColorTheory';
import {
  generateOptimizedPalette,
  optimizedHslToHex,
  optimizedHexToRgb,
  optimizedRgbToHsl,
  PerformanceMonitor,
  debounce,
  throttle
} from '../utils/optimizedColorEngine';
import OuijaColorPicker from './OuijaColorPicker';
import GeometricPaletteDisplay from './GeometricPaletteDisplay';
import ColorInfoPanel from './ColorInfoPanel';
import MusicalModeSelector from './MusicalModeSelector';
import ColorOrb from './ColorOrb';
import SaturnRingsColorSystem from './SaturnRingsColorSystem';
import RingPaletteSelector from './RingPaletteSelector';
import QuickPaintRecipe from './QuickPaintRecipe';
import ColorActionMenu from './ColorActionMenu';
import { exportProfessionalPDF, shareProfessionalPDF, PaletteExportData, PDFExportOptions } from '../utils/professionalPDFExport';

const { width, height } = Dimensions.get('window');

// Layout constants for proper positioning
const HEADER_HEIGHT = 80;
const WHEEL_SIZE = Math.min(width, height - HEADER_HEIGHT - 100) * 0.65;
const WHEEL_CENTER_X = width / 2;
const WHEEL_CENTER_Y = HEADER_HEIGHT + 50 + (WHEEL_SIZE / 2); // Position below header with padding
const WHEEL_RADIUS = WHEEL_SIZE / 2;
const PALETTE_RING_RADIUS = WHEEL_RADIUS + 50;

const MainStudio: React.FC = () => {
  const dispatch = useDispatch();
  const { currentColor } = useSelector((state: RootState) => state.color);
  const { currentMusicalMode, currentPaletteType } = useSelector((state: RootState) => state.palette);
  const { isDarkMode } = useSelector((state: RootState) => state.ui);

  const [isDragging, setIsDragging] = useState(false);
  const [previewColor, setPreviewColor] = useState<string>('#FF6B35');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedPaletteType, setSelectedPaletteType] = useState<'complementary' | 'triadic' | 'tetradic' | 'square' | 'pentadic' | 'hexadic' | 'heptadic' | 'octadic' | 'custom'>('triadic');
  const [paletteCount, setPaletteCount] = useState(3);
  const [showNavigation, setShowNavigation] = useState(false);
  const [currentPalette, setCurrentPalette] = useState<string[]>([]);
  const [selectedOrbIndex, setSelectedOrbIndex] = useState<number | null>(null);
  const [showColorCodes, setShowColorCodes] = useState(false);
  const [showPDFOptions, setShowPDFOptions] = useState(false);
  const [selectedRingTypes, setSelectedRingTypes] = useState<string[]>([]);
  const [showAllRings, setShowAllRings] = useState(true);
  const [selectedRingColor, setSelectedRingColor] = useState<string | null>(null);
  const [showPaintRecipe, setShowPaintRecipe] = useState(false);
  const [paintRecipeColor, setPaintRecipeColor] = useState<string>('#000000');
  const [showColorActionMenu, setShowColorActionMenu] = useState(false);
  const [actionMenuColor, setActionMenuColor] = useState<string>('#000000');

  // Animation values for the eye cursor - start at center of wheel
  const eyeX = useSharedValue(WHEEL_CENTER_X);
  const eyeY = useSharedValue(WHEEL_CENTER_Y);

  // Animation values for color preview popup
  const previewOpacity = useSharedValue(0);
  const previewScale = useSharedValue(0.8);

  // Optimized real-time palette generation with performance monitoring
  const generateRealtimePalette = React.useCallback((hue: number, saturation: number, lightness: number) => {
    const endMeasurement = PerformanceMonitor.startMeasurement('palette-generation');

    let palette: string[] = [];

    // Use optimized palette generation for standard types
    if (['complementary', 'triadic', 'tetradic', 'pentadic', 'hexadic', 'heptadic', 'octadic'].includes(selectedPaletteType)) {
      palette = generateOptimizedPalette(hue, selectedPaletteType, saturation, lightness);
    } else {
      // Handle special cases
      switch (selectedPaletteType) {
        case 'square':
          palette = generateOptimizedPalette(hue, 'tetradic', saturation, lightness);
          break;
        default:
          // Custom palette with musical mode integration
          try {
            palette = generateMusicalPalette(hue, currentMusicalMode, saturation, lightness);
          } catch (error) {
            // Fallback to optimized complementary
            palette = generateOptimizedPalette(hue, 'complementary', saturation, lightness);
          }
      }
    }

    endMeasurement();
    return palette;
  }, [selectedPaletteType, currentMusicalMode]);

  // Update palette when color or type changes
  useEffect(() => {
    const { hue, saturation, lightness } = currentColor;
    const newPalette = generateRealtimePalette(hue, saturation, lightness);
    setCurrentPalette(newPalette);

    // Add current color to recent colors
    const currentHex = hslToHex(hue, saturation, lightness);
    dispatch(addRecentColor(currentHex));
  }, [currentColor, selectedPaletteType, paletteCount, currentMusicalMode, dispatch]);

  // Handle color picker movement with proper boundaries and preview
  const updateColorFromPosition = (x: number, y: number, isPreview: boolean = false) => {
    // Calculate distance from wheel center
    const deltaX = x - WHEEL_CENTER_X;
    const deltaY = y - WHEEL_CENTER_Y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Only update if within wheel boundaries
    if (distance <= WHEEL_RADIUS) {
      const angle = Math.atan2(deltaY, deltaX);

      // Convert to HSL values
      const hue = ((angle * 180 / Math.PI) + 360) % 360;
      const saturation = Math.min(100, (distance / WHEEL_RADIUS) * 100);
      const lightness = 50; // Keep lightness constant for now

      const colorHex = hslToHex(hue, saturation, lightness);

      if (isPreview) {
        // Update preview color without committing to state
        setPreviewColor(colorHex);
      } else {
        // Commit color to state
        dispatch(setCurrentColor({ hue, saturation, lightness }));
      }

      return { valid: true, color: colorHex };
    }
    return { valid: false, color: null };
  };

  // Constrain eye position to wheel boundaries
  const constrainEyePosition = (x: number, y: number) => {
    const deltaX = x - WHEEL_CENTER_X;
    const deltaY = y - WHEEL_CENTER_Y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance <= WHEEL_RADIUS) {
      return { x, y };
    } else {
      // Constrain to wheel edge
      const angle = Math.atan2(deltaY, deltaX);
      return {
        x: WHEEL_CENTER_X + Math.cos(angle) * WHEEL_RADIUS,
        y: WHEEL_CENTER_Y + Math.sin(angle) * WHEEL_RADIUS,
      };
    }
  };

  // Handle direct tap on color wheel
  const handleWheelPress = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;

    // Convert local coordinates to absolute coordinates
    const absoluteX = (WHEEL_CENTER_X - WHEEL_RADIUS) + locationX;
    const absoluteY = (WHEEL_CENTER_Y - WHEEL_RADIUS) + locationY;

    const constrainedPos = constrainEyePosition(absoluteX, absoluteY);

    // Animate eye to new position with precise spring
    eyeX.value = withSpring(constrainedPos.x, {
      damping: 20,
      stiffness: 300,
      mass: 0.8
    });
    eyeY.value = withSpring(constrainedPos.y, {
      damping: 20,
      stiffness: 300,
      mass: 0.8
    });

    // Update color immediately
    updateColorFromPosition(constrainedPos.x, constrainedPos.y, false);
  };

  // State-of-the-art gesture handlers for precise dragging
  const onGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    const { absoluteX, absoluteY } = event.nativeEvent;
    const constrainedPos = constrainEyePosition(absoluteX, absoluteY);

    // Update eye position with NO spring - direct tracking
    eyeX.value = constrainedPos.x;
    eyeY.value = constrainedPos.y;

    // Show preview while dragging
    if (isDragging) {
      runOnJS(updateColorFromPosition)(constrainedPos.x, constrainedPos.y, true);
      runOnJS(setShowPreview)(true);

      // Animate preview popup
      previewOpacity.value = withSpring(1, { damping: 15, stiffness: 200 });
      previewScale.value = withSpring(1, { damping: 15, stiffness: 200 });
    }
  };

  const onHandlerStateChange = (event: any) => {
    const { state, absoluteX, absoluteY } = event.nativeEvent;

    if (state === State.BEGAN) {
      runOnJS(setIsDragging)(true);
      runOnJS(setShowPreview)(true);

      // Show preview immediately
      previewOpacity.value = withSpring(1, { damping: 15, stiffness: 200 });
      previewScale.value = withSpring(1, { damping: 15, stiffness: 200 });

      // Start with preview
      const constrainedPos = constrainEyePosition(absoluteX, absoluteY);
      runOnJS(updateColorFromPosition)(constrainedPos.x, constrainedPos.y, true);

    } else if (state === State.END || state === State.CANCELLED || state === State.FAILED) {
      runOnJS(setIsDragging)(false);

      // Commit the final color
      const constrainedPos = constrainEyePosition(absoluteX, absoluteY);
      runOnJS(updateColorFromPosition)(constrainedPos.x, constrainedPos.y, false);

      // Hide preview with animation
      previewOpacity.value = withSpring(0, { damping: 15, stiffness: 200 }, () => {
        runOnJS(setShowPreview)(false);
      });
      previewScale.value = withSpring(0.8, { damping: 15, stiffness: 200 });

      // Eye stays exactly where released - NO additional animation
    }
  };

  // Animated style for the eye cursor
  const eyeStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      left: eyeX.value - 15,
      top: eyeY.value - 15,
    };
  });

  // Animated style for color preview popup
  const previewStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      left: eyeX.value + 25, // Offset to the right of the eye
      top: eyeY.value - 40,  // Offset above the eye
      opacity: previewOpacity.value,
      transform: [{ scale: previewScale.value }],
    };
  });

  // Generate positions for palette colors around the wheel
  const getPalettePositions = (): { x: number; y: number }[] => {
    const positions: { x: number; y: number }[] = [];
    const angleStep = (2 * Math.PI) / Math.max(currentPalette.length, 1);

    currentPalette.forEach((_, index: number) => {
      const angle = index * angleStep - Math.PI / 2; // Start from top
      const x = WHEEL_CENTER_X + Math.cos(angle) * PALETTE_RING_RADIUS - 15; // Offset for dot size
      const y = WHEEL_CENTER_Y + Math.sin(angle) * PALETTE_RING_RADIUS - 15;
      positions.push({ x, y });
    });

    return positions;
  };

  const palettePositions = getPalettePositions();

  // Handle PDF export
  const handleExportPDF = async () => {
    const paletteData: PaletteExportData = {
      name: `${selectedPaletteType.charAt(0).toUpperCase() + selectedPaletteType.slice(1)} Palette`,
      colors: currentPalette,
      paletteType: selectedPaletteType,
      musicalMode: currentMusicalMode,
      createdAt: Date.now(),
    };

    const options: PDFExportOptions = {
      layout: 'professional',
      includeColorCodes: true,
      includeMetadata: true,
      colorAccuracy: 'sRGB',
      resolution: 300,
      paperSize: 'A4',
    };

    try {
      await shareProfessionalPDF(paletteData, options);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  // Optimized and throttled Saturn's Rings color selection
  const handleRingColorSelect = React.useCallback(
    throttle((color: string, paletteType: string, colorIndex: number) => {
      const endMeasurement = PerformanceMonitor.startMeasurement('color-selection');

      setSelectedRingColor(color);
      // Update current color to selected ring color using optimized functions
      const rgb = optimizedHexToRgb(color);
      if (rgb) {
        const hsl = optimizedRgbToHsl(rgb.r, rgb.g, rgb.b);
        dispatch(setCurrentColor({
          hue: hsl.h,
          saturation: hsl.s,
          lightness: hsl.l,
          alpha: 1,
        }));
      }

      endMeasurement();
    }, 16), // Throttle to ~60fps
    [dispatch]
  );

  // Handle long press for color action menu
  const handleColorLongPress = (color: string) => {
    setActionMenuColor(color);
    setShowColorActionMenu(true);
  };

  // Handle opening full paint recipe workstation
  const handleOpenFullRecipe = (color: string) => {
    setShowPaintRecipe(false);
    // TODO: Navigate to Paint Recipe workstation with selected color
    console.log('Opening full paint recipe workstation for color:', color);
  };

  // Handle color action selection
  const handleColorActionSelect = (actionId: string, color: string) => {
    switch (actionId) {
      case 'paint_recipe':
        setPaintRecipeColor(color);
        setShowPaintRecipe(true);
        break;
      case 'color_theory':
        // TODO: Navigate to Color Theory Lab with selected color
        console.log('Opening Color Theory Lab for color:', color);
        break;
      case 'palette_generator':
        // Update current color to selected color
        const rgb = hexToRgb(color);
        if (rgb) {
          const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
          dispatch(setCurrentColor({
            hue: hsl.h,
            saturation: hsl.s,
            lightness: hsl.l,
            alpha: 1,
          }));
        }
        break;
      case 'add_to_favorites':
        dispatch(addRecentColor(color));
        break;
      default:
        console.log(`Action ${actionId} not implemented yet for color:`, color);
    }
  };

  const containerStyle = [
    styles.container,
    { backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' }
  ];

  return (
    <SafeAreaView style={containerStyle}>
      {/* Compact Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.navToggle}
          onPress={() => setShowNavigation(!showNavigation)}
        >
          <Text style={[styles.navToggleText, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
            ☰
          </Text>
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
            Color Vibe
          </Text>
        </View>

        <MusicalModeSelector />
      </View>

      {/* Collapsible Navigation */}
      {showNavigation && (
        <View style={[styles.navigationPanel, { backgroundColor: isDarkMode ? '#2a2a2a' : '#f0f0f0' }]}>
          <Text style={[styles.navTitle, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
            Workstations
          </Text>
          {/* Navigation will be handled by parent component */}
        </View>
      )}

      {/* Saturn's Rings Palette Selector */}
      <RingPaletteSelector
        selectedTypes={selectedRingTypes}
        onSelectionChange={setSelectedRingTypes}
        isDarkMode={isDarkMode}
        showAllRings={showAllRings}
        onShowAllToggle={() => setShowAllRings(!showAllRings)}
      />

      {/* Main content area */}
      <View style={styles.mainContent}>
        {/* Central Color Wheel Area */}
        <View style={styles.wheelArea}>
          {/* Tappable Color Wheel */}
          <TouchableOpacity
            style={[styles.ouijaBoard, {
              width: WHEEL_SIZE,
              height: WHEEL_SIZE,
              left: WHEEL_CENTER_X - WHEEL_RADIUS,
              top: WHEEL_CENTER_Y - WHEEL_RADIUS,
            }]}
            onPress={handleWheelPress}
            activeOpacity={0.9}
          >
            <OuijaColorPicker size={WHEEL_SIZE} />
          </TouchableOpacity>

          {/* Draggable Eye Cursor */}
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
          >
            <Animated.View style={[styles.eyeCursor, eyeStyle]}>
              <View style={styles.eye}>
                <View style={styles.pupil} />
              </View>
            </Animated.View>
          </PanGestureHandler>

          {/* Color Preview Popup */}
          {showPreview && (
            <Animated.View style={[styles.colorPreview, previewStyle]}>
              <View style={[styles.previewSwatch, { backgroundColor: previewColor }]} />
              <Text style={[styles.previewText, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
                {previewColor.toUpperCase()}
              </Text>
            </Animated.View>
          )}

          {/* Saturn's Rings Color System - Multiple rotating palette layers */}
          <SaturnRingsColorSystem
            centerColor={currentColor}
            selectedPaletteTypes={showAllRings ? [] : selectedRingTypes}
            currentMusicalMode={currentMusicalMode}
            onColorSelect={handleRingColorSelect}
            onColorLongPress={handleColorLongPress}
            isDarkMode={isDarkMode}
            centerX={WHEEL_CENTER_X}
            centerY={WHEEL_CENTER_Y}
          />

          {/* Primary Orb - Central Color (like the sun in our solar system) */}
          <ColorOrb
            color={hslToHex(currentColor.hue, currentColor.saturation, currentColor.lightness)}
            hsl={{ h: currentColor.hue, s: currentColor.saturation, l: currentColor.lightness }}
            position={{ x: eyeX.value, y: eyeY.value }}
            size={50}
            type="primary"
            index={0}
            isSelected={selectedOrbIndex === 0}
            onPress={(index) => setSelectedOrbIndex(index)}
            showColorCodes={showColorCodes}
            isDarkMode={isDarkMode}
          />
        </View>

        {/* Bottom Panel with Palette Options and Color Info */}
        <View style={[styles.bottomPanel, { backgroundColor: isDarkMode ? 'rgba(42, 42, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)' }]}>
          {/* Palette Type Selector */}
          <View style={styles.paletteControls}>
            <Text style={[styles.controlLabel, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
              Palette Type:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.paletteTypeScroll}>
              {[
                { type: 'complementary', name: 'Complementary', count: 2 },
                { type: 'triadic', name: 'Triadic', count: 3 },
                { type: 'tetradic', name: 'Tetradic', count: 4 },
                { type: 'pentadic', name: 'Pentadic', count: 5 },
                { type: 'hexadic', name: 'Hexadic', count: 6 },
                { type: 'heptadic', name: 'Heptadic', count: 7 },
                { type: 'octadic', name: 'Octadic', count: 8 },
              ].map((option) => (
                <TouchableOpacity
                  key={option.type}
                  style={[
                    styles.paletteTypeButton,
                    {
                      backgroundColor: selectedPaletteType === option.type
                        ? '#3498db'
                        : (isDarkMode ? '#444444' : '#e0e0e0'),
                    },
                  ]}
                  onPress={() => {
                    setSelectedPaletteType(option.type as any);
                    setPaletteCount(option.count);
                  }}
                >
                  <Text style={[
                    styles.paletteTypeText,
                    {
                      color: selectedPaletteType === option.type
                        ? '#ffffff'
                        : (isDarkMode ? '#ffffff' : '#000000')
                    }
                  ]}>
                    {option.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Current Color Info */}
          <View style={styles.colorInfoRow}>
            <View style={[styles.currentColorSwatch, { backgroundColor: hslToHex(currentColor.hue, currentColor.saturation, currentColor.lightness) }]} />
            <View style={styles.colorCodes}>
              <Text style={[styles.colorCodeText, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
                {hslToHex(currentColor.hue, currentColor.saturation, currentColor.lightness).toUpperCase()}
              </Text>
              <Text style={[styles.colorCodeText, { color: isDarkMode ? '#cccccc' : '#666666' }]}>
                HSL({Math.round(currentColor.hue)}°, {Math.round(currentColor.saturation)}%, {Math.round(currentColor.lightness)}%)
              </Text>
            </View>

            {/* Control Buttons */}
            <View style={styles.controlButtons}>
              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: showColorCodes ? '#3498db' : (isDarkMode ? '#444444' : '#e0e0e0') }]}
                onPress={() => setShowColorCodes(!showColorCodes)}
              >
                <Text style={[styles.controlButtonText, { color: showColorCodes ? '#ffffff' : (isDarkMode ? '#ffffff' : '#000000') }]}>
                  Codes
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: '#2ecc71' }]}
                onPress={handleExportPDF}
              >
                <Text style={[styles.controlButtonText, { color: '#ffffff' }]}>
                  PDF
                </Text>
              </TouchableOpacity>
            </View>

            {/* Palette Colors */}
            <View style={styles.palettePreview}>
              {currentPalette.slice(0, 6).map((color, index) => (
                <View
                  key={index}
                  style={[styles.paletteColorDot, { backgroundColor: color }]}
                />
              ))}
              {currentPalette.length > 6 && (
                <Text style={[styles.moreColorsText, { color: isDarkMode ? '#888888' : '#666666' }]}>
                  +{currentPalette.length - 6}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Color Action Menu */}
      <ColorActionMenu
        color={actionMenuColor}
        isVisible={showColorActionMenu}
        onClose={() => setShowColorActionMenu(false)}
        onActionSelect={handleColorActionSelect}
        isDarkMode={isDarkMode}
      />

      {/* Quick Paint Recipe Modal */}
      <QuickPaintRecipe
        color={paintRecipeColor}
        isVisible={showPaintRecipe}
        onClose={() => setShowPaintRecipe(false)}
        onOpenFullRecipe={handleOpenFullRecipe}
        isDarkMode={isDarkMode}
      />
    </SafeAreaView>
  );
};

// Helper function to determine shape based on palette size
const getShapeForPalette = (colorCount: number): 'triangle' | 'square' | 'pentagon' | 'hexagon' | 'circle' => {
  switch (colorCount) {
    case 3: return 'triangle';
    case 4: return 'square';
    case 5: return 'pentagon';
    case 6: return 'hexagon';
    default: return 'circle';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 100,
    height: HEADER_HEIGHT,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 16,
  },
  mainContent: {
    flex: 1,
    position: 'relative',
  },
  wheelArea: {
    flex: 1,
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  ouijaBoard: {
    position: 'absolute',
    zIndex: 1,
  },
  eyeCursor: {
    width: 30,
    height: 30,
    zIndex: 10,
  },
  eye: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ffffff',
    borderWidth: 3,
    borderColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  pupil: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#333333',
  },
  instructionArea: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 40,
  },
  instructionText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
    fontStyle: 'italic',
  },
  controlArea: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 50,
  },
  infoToggle: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  infoToggleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  colorInfoContainer: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    maxHeight: height * 0.4,
    zIndex: 60,
  },
  colorPreview: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    minWidth: 80,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  previewSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 4,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  previewText: {
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  navToggle: {
    padding: 8,
    borderRadius: 8,
  },
  navToggleText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  navigationPanel: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  connectionLine: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    transformOrigin: '0 50%',
  },
  colorDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  paletteControls: {
    marginBottom: 15,
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  paletteTypeScroll: {
    flexDirection: 'row',
  },
  paletteTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
  },
  paletteTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  colorInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentColorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  colorCodes: {
    flex: 1,
  },
  colorCodeText: {
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  palettePreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paletteColorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: 4,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  moreColorsText: {
    fontSize: 10,
    marginLeft: 4,
    fontWeight: '600',
  },
  controlButtons: {
    flexDirection: 'row',
    marginHorizontal: 8,
  },
  controlButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginHorizontal: 2,
    minWidth: 50,
    alignItems: 'center',
  },
  controlButtonText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default MainStudio;
