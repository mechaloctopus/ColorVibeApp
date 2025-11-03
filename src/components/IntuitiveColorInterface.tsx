// Intuitive Color Interface Component
// Revolutionary UI with missing dimensions and natural interactions

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated
} from 'react-native';
import {
  PanGestureHandler,
  PinchGestureHandler,
  RotationGestureHandler,
  State
} from 'react-native-gesture-handler';
import { useSelector, useDispatch } from 'react-redux';
import { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
// Voice import - optional dependency
let Voice: any = null;
try {
  Voice = require('@react-native-voice/voice').default;
} catch (error) {
  console.warn('Voice recognition not available:', error);
}

// Intuitive UI Enhancements
import { 
  intuitiveUIEnhancements, 
  ColorDimensions, 
  IntuitiveUIPattern 
} from '../utils/intuitiveUIEnhancements';

// Core utilities
import { optimizedHexToRgb, optimizedRgbToHsl, optimizedHslToHex } from '../utils/optimizedColorEngine';
import { PremiumHaptics, HapticType } from '../utils/premiumInteractions';

// Redux
import { RootState } from '../store';
import { setCurrentColor, addRecentColor } from '../store/slices/paletteSlice';

interface IntuitiveColorInterfaceProps {
  onColorChange?: (color: string) => void;
  enableVoiceControl?: boolean;
  enableGestureControl?: boolean;
  showAllDimensions?: boolean;
}

export const IntuitiveColorInterface: React.FC<IntuitiveColorInterfaceProps> = ({
  onColorChange,
  enableVoiceControl = true,
  enableGestureControl = true,
  showAllDimensions = true,
}) => {
  const dispatch = useDispatch();
  const { currentColor } = useSelector((state: RootState) => state.ui);
  
  // State management
  const [activeInterface, setActiveInterface] = useState<'traditional' | 'emotional' | 'temporal' | 'sensory' | 'spatial'>('emotional');
  const [colorDimensions, setColorDimensions] = useState<ColorDimensions | null>(null);
  const [voiceQuery, setVoiceQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [contextualSuggestions, setContextualSuggestions] = useState<string[]>([]);
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [predictedActions, setPredictedActions] = useState<string[]>([]);

  // Animation values for gesture controls
  const gestureScale = useSharedValue(1);
  const gestureRotation = useSharedValue(0);
  const gestureTranslateX = useSharedValue(0);
  const gestureTranslateY = useSharedValue(0);

  // Color property values
  const hueValue = useSharedValue(0);
  const saturationValue = useSharedValue(50);
  const lightnessValue = useSharedValue(50);
  const energyValue = useSharedValue(50);
  const warmthValue = useSharedValue(50);

  // Initialize interface
  useEffect(() => {
    initializeIntuitiveInterface();
    if (enableVoiceControl) {
      initializeVoiceControl();
    }
  }, []);

  // Analyze current color dimensions
  useEffect(() => {
    if (currentColor) {
      analyzeCurrentColor(currentColor);
    }
  }, [currentColor]);

  const initializeIntuitiveInterface = useCallback(async () => {
    try {
      // Get contextual suggestions based on current time and context
      const context = {
        timeOfDay: getCurrentTimeOfDay(),
        weather: 'sunny', // Would be fetched from weather API
        mood: 'creative',
        activity: 'design',
        location: 'studio',
      };

      const suggestions = intuitiveUIEnhancements.generateContextualSuggestions(
        currentColor,
        context
      );
      
      setContextualSuggestions(suggestions.suggestions);

      // Get predictive actions
      const predictions = intuitiveUIEnhancements.predictNextColorAction(
        [currentColor],
        context,
        { experience: 'intermediate', primaryUse: 'design' }
      );
      
      setPredictedActions(predictions.nextActions);

    } catch (error) {
      console.error('Failed to initialize intuitive interface:', error);
    }
  }, [currentColor]);

  const analyzeCurrentColor = useCallback(async (color: string) => {
    try {
      const dimensions = intuitiveUIEnhancements.analyzeColorDimensions(color);
      setColorDimensions(dimensions);

      // Update gesture values based on color analysis
      const rgb = optimizedHexToRgb(color);
      if (rgb) {
        const hsl = optimizedRgbToHsl(rgb.r, rgb.g, rgb.b);
        hueValue.value = withSpring(hsl.h);
        saturationValue.value = withSpring(hsl.s);
        lightnessValue.value = withSpring(hsl.l);
        energyValue.value = withSpring(dimensions.emotional.energy);
        warmthValue.value = withSpring(dimensions.emotional.warmth);
      }

    } catch (error) {
      console.error('Failed to analyze color dimensions:', error);
    }
  }, []);

  const initializeVoiceControl = useCallback(async () => {
    if (!Voice) {
      console.warn('Voice control not available');
      return;
    }

    try {
      Voice.onSpeechStart = () => setIsListening(true);
      Voice.onSpeechEnd = () => setIsListening(false);
      Voice.onSpeechResults = (event: any) => {
        if (event.value && event.value[0]) {
          handleVoiceCommand(event.value[0]);
        }
      };
      Voice.onSpeechError = (error: any) => {
        console.error('Voice recognition error:', error);
        setIsListening(false);
      };
    } catch (error) {
      console.error('Failed to initialize voice control:', error);
    }
  }, []);

  // Voice command handling
  const startListening = useCallback(async () => {
    if (!Voice) {
      Alert.alert('Voice Control', 'Voice recognition is not available on this device');
      return;
    }

    try {
      await Voice.start('en-US');
      PremiumHaptics.trigger(HapticType.LIGHT);
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      Alert.alert('Voice Error', 'Could not start voice recognition');
    }
  }, []);

  const handleVoiceCommand = useCallback(async (command: string) => {
    try {
      const result = intuitiveUIEnhancements.processNaturalLanguageColorQuery(command);
      
      if (result.colors.length > 0) {
        const newColor = result.colors[0];
        dispatch(setCurrentColor(newColor));
        dispatch(addRecentColor(newColor));
        onColorChange?.(newColor);
        
        PremiumHaptics.trigger(HapticType.SUCCESS);
        
        Alert.alert(
          'Voice Command Processed',
          `${result.interpretation}\nConfidence: ${(result.confidence * 100).toFixed(0)}%`,
          [{ text: 'Great!', style: 'default' }]
        );
      }
      
      setVoiceQuery(command);
    } catch (error) {
      console.error('Failed to process voice command:', error);
      Alert.alert('Voice Error', 'Could not process voice command');
    }
  }, [dispatch, onColorChange]);

  // Natural language text input
  const handleNaturalLanguageInput = useCallback(async () => {
    if (!naturalLanguageInput.trim()) return;

    try {
      const result = intuitiveUIEnhancements.processNaturalLanguageColorQuery(naturalLanguageInput);
      
      if (result.colors.length > 0) {
        const newColor = result.colors[0];
        dispatch(setCurrentColor(newColor));
        dispatch(addRecentColor(newColor));
        onColorChange?.(newColor);
        
        Alert.alert(
          'Natural Language Processed',
          `Found colors for: "${naturalLanguageInput}"\n\n${result.interpretation}`,
          [
            { text: 'Use Color', onPress: () => setNaturalLanguageInput('') },
            { text: 'Try Another', style: 'cancel' }
          ]
        );
      } else {
        Alert.alert(
          'No Colors Found',
          `Couldn't find colors for: "${naturalLanguageInput}"\n\nTry descriptions like:\n• "warm sunset colors"\n• "calm ocean vibes"\n• "energetic morning mood"`
        );
      }
    } catch (error) {
      Alert.alert('Processing Error', 'Could not understand the color description');
    }
  }, [naturalLanguageInput, dispatch, onColorChange]);

  // Gesture handlers
  const onPanGestureEvent = useCallback((event: any) => {
    'worklet';
    const { translationX, translationY } = event.nativeEvent;
    
    // Horizontal movement controls hue
    const newHue = Math.max(0, Math.min(360, (translationX / 300) * 360));
    hueValue.value = withSpring(newHue);
    
    // Vertical movement controls lightness
    const newLightness = Math.max(0, Math.min(100, 50 - (translationY / 200) * 50));
    lightnessValue.value = withSpring(newLightness);
    
    // Update color in real-time
    const newColor = optimizedHslToHex(newHue, saturationValue.value, newLightness);
    runOnJS(updateColorFromGesture)(newColor);
  }, []);

  const onPinchGestureEvent = useCallback((event: any) => {
    'worklet';
    const { scale } = event.nativeEvent;
    
    // Pinch controls saturation
    const newSaturation = Math.max(0, Math.min(100, scale * 50));
    saturationValue.value = withSpring(newSaturation);
    
    const newColor = optimizedHslToHex(hueValue.value, newSaturation, lightnessValue.value);
    runOnJS(updateColorFromGesture)(newColor);
  }, []);

  const onRotationGestureEvent = useCallback((event: any) => {
    'worklet';
    const { rotation } = event.nativeEvent;
    
    // Rotation controls warmth/energy
    const newWarmth = Math.max(0, Math.min(100, 50 + (rotation * 180 / Math.PI)));
    warmthValue.value = withSpring(newWarmth);
    
    runOnJS(PremiumHaptics.trigger)(HapticType.LIGHT);
  }, []);

  const updateColorFromGesture = useCallback((color: string) => {
    dispatch(setCurrentColor(color));
    onColorChange?.(color);
    PremiumHaptics.trigger(HapticType.LIGHT);
  }, [dispatch, onColorChange]);

  // Interface switching
  const switchInterface = useCallback((interfaceType: typeof activeInterface) => {
    setActiveInterface(interfaceType);
    PremiumHaptics.trigger(HapticType.MEDIUM);
    
    // Generate interface-specific layout
    const mappedType = interfaceType === 'traditional' ? 'wheel' :
                      interfaceType === 'spatial' ? 'spectrum' :
                      interfaceType as 'wheel' | 'gradient' | 'spectrum' | 'emotional' | 'temporal' | 'sensory';

    const layout = intuitiveUIEnhancements.generateIntuitiveColorPicker(
      mappedType,
      { width: 300, height: 300 }
    );
    
    console.log('Generated layout:', layout);
  }, []);

  // Contextual suggestion selection
  const selectContextualSuggestion = useCallback((color: string) => {
    dispatch(setCurrentColor(color));
    dispatch(addRecentColor(color));
    onColorChange?.(color);
    PremiumHaptics.trigger(HapticType.SUCCESS);
  }, [dispatch, onColorChange]);

  // Helper functions
  const getCurrentTimeOfDay = (): string => {
    const hour = new Date().getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  const formatDimensionValue = (value: number): string => {
    return `${Math.round(value)}%`;
  };

  // Render functions
  const renderEmotionalInterface = () => (
    <View style={styles.dimensionInterface}>
      <Text style={styles.interfaceTitle}>Emotional Color Spectrum</Text>
      
      {colorDimensions && (
        <View style={styles.dimensionGrid}>
          <View style={styles.dimensionItem}>
            <Text style={styles.dimensionLabel}>Energy</Text>
            <View style={[styles.dimensionBar, { width: `${colorDimensions.emotional.energy}%` }]} />
            <Text style={styles.dimensionValue}>{formatDimensionValue(colorDimensions.emotional.energy)}</Text>
          </View>
          
          <View style={styles.dimensionItem}>
            <Text style={styles.dimensionLabel}>Warmth</Text>
            <View style={[styles.dimensionBar, { width: `${colorDimensions.emotional.warmth}%` }]} />
            <Text style={styles.dimensionValue}>{formatDimensionValue(colorDimensions.emotional.warmth)}</Text>
          </View>
          
          <View style={styles.dimensionItem}>
            <Text style={styles.dimensionLabel}>Sophistication</Text>
            <View style={[styles.dimensionBar, { width: `${colorDimensions.emotional.sophistication}%` }]} />
            <Text style={styles.dimensionValue}>{formatDimensionValue(colorDimensions.emotional.sophistication)}</Text>
          </View>
          
          <View style={styles.dimensionItem}>
            <Text style={styles.dimensionLabel}>Trustworthiness</Text>
            <View style={[styles.dimensionBar, { width: `${colorDimensions.emotional.trustworthiness}%` }]} />
            <Text style={styles.dimensionValue}>{formatDimensionValue(colorDimensions.emotional.trustworthiness)}</Text>
          </View>
          
          <View style={styles.dimensionItem}>
            <Text style={styles.dimensionLabel}>Creativity</Text>
            <View style={[styles.dimensionBar, { width: `${colorDimensions.emotional.creativity}%` }]} />
            <Text style={styles.dimensionValue}>{formatDimensionValue(colorDimensions.emotional.creativity)}</Text>
          </View>
          
          <View style={styles.dimensionItem}>
            <Text style={styles.dimensionLabel}>Approachability</Text>
            <View style={[styles.dimensionBar, { width: `${colorDimensions.emotional.approachability}%` }]} />
            <Text style={styles.dimensionValue}>{formatDimensionValue(colorDimensions.emotional.approachability)}</Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderTemporalInterface = () => (
    <View style={styles.dimensionInterface}>
      <Text style={styles.interfaceTitle}>Temporal Color Associations</Text>
      
      {colorDimensions && (
        <View style={styles.temporalGrid}>
          <View style={styles.temporalItem}>
            <Text style={styles.temporalLabel}>Time of Day</Text>
            <Text style={styles.temporalValue}>{colorDimensions.temporal.timeOfDay}</Text>
          </View>
          
          <View style={styles.temporalItem}>
            <Text style={styles.temporalLabel}>Season</Text>
            <Text style={styles.temporalValue}>{colorDimensions.temporal.season}</Text>
          </View>
          
          <View style={styles.temporalItem}>
            <Text style={styles.temporalLabel}>Era</Text>
            <Text style={styles.temporalValue}>{colorDimensions.temporal.era}</Text>
          </View>
          
          <View style={styles.temporalItem}>
            <Text style={styles.temporalLabel}>Life Stage</Text>
            <Text style={styles.temporalValue}>{colorDimensions.temporal.lifeStage}</Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderSensoryInterface = () => (
    <View style={styles.dimensionInterface}>
      <Text style={styles.interfaceTitle}>Sensory Color Associations</Text>
      
      {colorDimensions && (
        <View style={styles.sensoryGrid}>
          <View style={styles.sensoryItem}>
            <Text style={styles.sensoryLabel}>Temperature</Text>
            <Text style={styles.sensoryValue}>{colorDimensions.sensory.temperature}°</Text>
          </View>
          
          <View style={styles.sensoryItem}>
            <Text style={styles.sensoryLabel}>Texture</Text>
            <Text style={styles.sensoryValue}>{colorDimensions.sensory.texture}</Text>
          </View>
          
          <View style={styles.sensoryItem}>
            <Text style={styles.sensoryLabel}>Sound</Text>
            <Text style={styles.sensoryValue}>{colorDimensions.sensory.sound}</Text>
          </View>
          
          <View style={styles.sensoryItem}>
            <Text style={styles.sensoryLabel}>Taste</Text>
            <Text style={styles.sensoryValue}>{colorDimensions.sensory.taste}</Text>
          </View>
          
          <View style={styles.sensoryItem}>
            <Text style={styles.sensoryLabel}>Scent</Text>
            <Text style={styles.sensoryValue}>{colorDimensions.sensory.scent}</Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderSpatialInterface = () => (
    <View style={styles.dimensionInterface}>
      <Text style={styles.interfaceTitle}>Spatial Color Context</Text>
      
      {colorDimensions && (
        <View style={styles.spatialGrid}>
          <View style={styles.spatialItem}>
            <Text style={styles.spatialLabel}>Environment</Text>
            <Text style={styles.spatialValue}>{colorDimensions.spatial.environment}</Text>
          </View>
          
          <View style={styles.spatialItem}>
            <Text style={styles.spatialLabel}>Distance</Text>
            <Text style={styles.spatialValue}>{colorDimensions.spatial.distance}</Text>
          </View>
          
          <View style={styles.spatialItem}>
            <Text style={styles.spatialLabel}>Elevation</Text>
            <Text style={styles.spatialValue}>{colorDimensions.spatial.elevation}</Text>
          </View>
          
          <View style={styles.spatialItem}>
            <Text style={styles.spatialLabel}>Lighting</Text>
            <Text style={styles.spatialValue}>{colorDimensions.spatial.lighting}</Text>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Smart Color Interface</Text>
        <Text style={styles.subtitle}>Natural Language • Multi-Dimensional • Intelligent</Text>
      </View>

      {/* Current Color Display */}
      <View style={styles.colorDisplay}>
        <View style={[styles.colorSwatch, { backgroundColor: currentColor }]} />
        <Text style={styles.colorCode}>{currentColor.toUpperCase()}</Text>
      </View>

      {/* Natural Language Input */}
      <View style={styles.naturalLanguageSection}>
        <Text style={styles.sectionTitle}>Describe Your Color</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., 'warm sunset colors', 'calm ocean vibes', 'energetic morning'"
            value={naturalLanguageInput}
            onChangeText={setNaturalLanguageInput}
            onSubmitEditing={handleNaturalLanguageInput}
          />
          <TouchableOpacity style={styles.processButton} onPress={handleNaturalLanguageInput}>
            <Text style={styles.processButtonText}>Find</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Voice Control */}
      {enableVoiceControl && (
        <View style={styles.voiceSection}>
          <TouchableOpacity 
            style={[styles.voiceButton, isListening && styles.voiceButtonActive]}
            onPress={startListening}
          >
            <Text style={styles.voiceButtonText}>
              {isListening ? '🎤 Listening...' : '🎤 Voice Control'}
            </Text>
          </TouchableOpacity>
          {voiceQuery && (
            <Text style={styles.voiceQuery}>Last: "{voiceQuery}"</Text>
          )}
        </View>
      )}

      {/* Interface Selector */}
      <View style={styles.interfaceSelector}>
        {['emotional', 'temporal', 'sensory', 'spatial'].map((interfaceType) => (
          <TouchableOpacity
            key={interfaceType}
            style={[
              styles.interfaceTab,
              activeInterface === interfaceType && styles.activeInterfaceTab
            ]}
            onPress={() => switchInterface(interfaceType as any)}
          >
            <Text style={[
              styles.interfaceTabText,
              activeInterface === interfaceType && styles.activeInterfaceTabText
            ]}>
              {interfaceType.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Dynamic Interface Content */}
      <View style={styles.interfaceContent}>
        {activeInterface === 'emotional' && renderEmotionalInterface()}
        {activeInterface === 'temporal' && renderTemporalInterface()}
        {activeInterface === 'sensory' && renderSensoryInterface()}
        {activeInterface === 'spatial' && renderSpatialInterface()}
      </View>

      {/* Contextual Suggestions */}
      <View style={styles.suggestionsSection}>
        <Text style={styles.sectionTitle}>Smart Suggestions</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {contextualSuggestions.map((color, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.suggestionSwatch, { backgroundColor: color }]}
              onPress={() => selectContextualSuggestion(color)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Predicted Actions */}
      <View style={styles.predictionsSection}>
        <Text style={styles.sectionTitle}>Predicted Next Actions</Text>
        <View style={styles.predictionButtons}>
          {predictedActions.map((action, index) => (
            <TouchableOpacity key={index} style={styles.predictionButton}>
              <Text style={styles.predictionButtonText}>{action.replace('_', ' ').toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Gesture Control Area */}
      {enableGestureControl && (
        <View style={styles.gestureArea}>
          <Text style={styles.sectionTitle}>Gesture Control</Text>
          <Text style={styles.gestureInstructions}>
            • Swipe horizontally: Adjust hue{'\n'}
            • Swipe vertically: Adjust lightness{'\n'}
            • Pinch: Adjust saturation{'\n'}
            • Rotate: Adjust warmth
          </Text>
          <PanGestureHandler onGestureEvent={onPanGestureEvent}>
            <PinchGestureHandler onGestureEvent={onPinchGestureEvent}>
              <RotationGestureHandler onGestureEvent={onRotationGestureEvent}>
                <View style={styles.gestureCanvas}>
                  <Text style={styles.gestureCanvasText}>Touch & Gesture Here</Text>
                </View>
              </RotationGestureHandler>
            </PinchGestureHandler>
          </PanGestureHandler>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
  },
  colorDisplay: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  colorSwatch: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  colorCode: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
    fontFamily: 'monospace',
  },
  naturalLanguageSection: {
    padding: 16,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  processButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  processButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  voiceSection: {
    padding: 16,
    backgroundColor: '#ffffff',
    marginBottom: 16,
    alignItems: 'center',
  },
  voiceButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  voiceButtonActive: {
    backgroundColor: '#dc3545',
  },
  voiceButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  voiceQuery: {
    marginTop: 8,
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  interfaceSelector: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  interfaceTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeInterfaceTab: {
    borderBottomColor: '#007bff',
  },
  interfaceTabText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  activeInterfaceTabText: {
    color: '#007bff',
    fontWeight: '600',
  },
  interfaceContent: {
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  dimensionInterface: {
    padding: 16,
  },
  interfaceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
    textAlign: 'center',
  },
  dimensionGrid: {
    gap: 12,
  },
  dimensionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dimensionLabel: {
    width: 120,
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  dimensionBar: {
    height: 8,
    backgroundColor: '#007bff',
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 12,
  },
  dimensionValue: {
    width: 50,
    fontSize: 14,
    color: '#495057',
    textAlign: 'right',
    fontWeight: '600',
  },
  temporalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  temporalItem: {
    width: '45%',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    alignItems: 'center',
  },
  temporalLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  temporalValue: {
    fontSize: 16,
    color: '#212529',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  sensoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sensoryItem: {
    width: '30%',
    padding: 12,
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    alignItems: 'center',
  },
  sensoryLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  sensoryValue: {
    fontSize: 14,
    color: '#212529',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  spatialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  spatialItem: {
    width: '45%',
    padding: 12,
    backgroundColor: '#dee2e6',
    borderRadius: 8,
    alignItems: 'center',
  },
  spatialLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  spatialValue: {
    fontSize: 16,
    color: '#212529',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  suggestionsSection: {
    padding: 16,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  suggestionSwatch: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  predictionsSection: {
    padding: 16,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  predictionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  predictionButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  predictionButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  gestureArea: {
    padding: 16,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  gestureInstructions: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 16,
    lineHeight: 20,
  },
  gestureCanvas: {
    height: 200,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#dee2e6',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gestureCanvasText: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '500',
  },
});

export default IntuitiveColorInterface;
