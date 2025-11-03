import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { optimizedHexToRgb, optimizedRgbToHsl } from '../utils/optimizedColorEngine';

interface ColorAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  workstation?: string;
}

interface ColorActionMenuProps {
  color: string;
  isVisible: boolean;
  onClose: () => void;
  onActionSelect: (actionId: string, color: string) => void;
  isDarkMode: boolean;
  position?: { x: number; y: number };
}

const COLOR_ACTIONS: ColorAction[] = [
  {
    id: 'paint_recipe',
    title: 'Paint Recipe',
    description: 'Get mixing instructions for this color',
    icon: '🎨',
    color: '#e74c3c',
    workstation: 'PaintRecipes',
  },
  {
    id: 'color_theory',
    title: 'Color Theory Lab',
    description: 'Analyze color properties and relationships',
    icon: '🔬',
    color: '#9b59b6',
    workstation: 'ColorTheoryLab',
  },
  {
    id: 'palette_generator',
    title: 'Generate Palette',
    description: 'Create palettes based on this color',
    icon: '🎭',
    color: '#3498db',
    workstation: 'MainStudio',
  },
  {
    id: 'color_scanner',
    title: 'Find Similar',
    description: 'Scan for similar colors in images',
    icon: '📷',
    color: '#2ecc71',
    workstation: 'ColorScanner',
  },
  {
    id: 'export_color',
    title: 'Export Color',
    description: 'Save or share this color',
    icon: '📤',
    color: '#f39c12',
  },
  {
    id: 'add_to_favorites',
    title: 'Add to Favorites',
    description: 'Save to your color collection',
    icon: '⭐',
    color: '#e67e22',
  },
  {
    id: 'color_blindness',
    title: 'Accessibility Check',
    description: 'Test color blindness compatibility',
    icon: '👁️',
    color: '#34495e',
    workstation: 'ColorTheoryLab',
  },
  {
    id: 'contrast_analyzer',
    title: 'Contrast Analysis',
    description: 'Check WCAG compliance and readability',
    icon: '📊',
    color: '#16a085',
    workstation: 'ColorTheoryLab',
  },
];

const ColorActionMenu: React.FC<ColorActionMenuProps> = ({
  color,
  isVisible,
  onClose,
  onActionSelect,
  isDarkMode,
  position,
}) => {
  // Animation values
  const modalOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.8);
  const actionsOpacity = useSharedValue(0);

  // Optimized modal animations with better timing
  useEffect(() => {
    if (isVisible) {
      modalOpacity.value = withTiming(1, { duration: 250 });
      modalScale.value = withSpring(1, { damping: 20, stiffness: 300 });
      // Stagger actions animation for smoother appearance
      setTimeout(() => {
        actionsOpacity.value = withTiming(1, { duration: 200 });
      }, 100);
    } else {
      actionsOpacity.value = withTiming(0, { duration: 150 });
      modalOpacity.value = withTiming(0, { duration: 200 });
      modalScale.value = withSpring(0.9, { damping: 20, stiffness: 300 });
    }
  }, [isVisible]);

  const modalStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
    transform: [{ scale: modalScale.value }],
  }));

  const actionsStyle = useAnimatedStyle(() => ({
    opacity: actionsOpacity.value,
  }));

  // Optimized color information with memoization
  const colorInfo = React.useMemo(() => {
    const rgb = optimizedHexToRgb(color);
    if (!rgb) return { hue: 0, saturation: 0, lightness: 0 };
    return optimizedRgbToHsl(rgb.r, rgb.g, rgb.b);
  }, [color]);

  // Handle action selection
  const handleActionSelect = (actionId: string) => {
    runOnJS(onActionSelect)(actionId, color);
    runOnJS(onClose)();
  };

  // Get color name/description
  const getColorDescription = () => {
    const hue = 'hue' in colorInfo ? colorInfo.hue : colorInfo.h;
    const saturation = 'saturation' in colorInfo ? colorInfo.saturation : colorInfo.s;
    const lightness = 'lightness' in colorInfo ? colorInfo.lightness : colorInfo.l;
    
    let hueName = '';
    if (hue >= 0 && hue < 30) hueName = 'Red';
    else if (hue < 60) hueName = 'Orange';
    else if (hue < 90) hueName = 'Yellow';
    else if (hue < 150) hueName = 'Green';
    else if (hue < 210) hueName = 'Cyan';
    else if (hue < 270) hueName = 'Blue';
    else if (hue < 330) hueName = 'Purple';
    else hueName = 'Red';

    let saturationDesc = '';
    if (saturation < 20) saturationDesc = 'Muted';
    else if (saturation < 60) saturationDesc = 'Soft';
    else if (saturation < 80) saturationDesc = 'Vibrant';
    else saturationDesc = 'Intense';

    let lightnessDesc = '';
    if (lightness < 20) lightnessDesc = 'Dark';
    else if (lightness < 40) lightnessDesc = 'Deep';
    else if (lightness < 60) lightnessDesc = 'Medium';
    else if (lightness < 80) lightnessDesc = 'Light';
    else lightnessDesc = 'Pale';

    return `${lightnessDesc} ${saturationDesc} ${hueName}`;
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackground} onPress={onClose} />
        
        <Animated.View
          style={[
            styles.modalContent,
            {
              backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
              borderColor: isDarkMode ? '#555555' : '#cccccc',
            },
            modalStyle,
          ]}
        >
          {/* Header with selected color */}
          <View style={styles.header}>
            <View style={styles.colorInfo}>
              <View style={[styles.colorSwatch, { backgroundColor: color }]} />
              <View style={styles.colorDetails}>
                <Text style={[styles.colorHex, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
                  {color.toUpperCase()}
                </Text>
                <Text style={[styles.colorDescription, { color: isDarkMode ? '#cccccc' : '#666666' }]}>
                  {getColorDescription()}
                </Text>
                <Text style={[styles.colorHsl, { color: isDarkMode ? '#888888' : '#999999' }]}>
                  HSL({Math.round('hue' in colorInfo ? colorInfo.hue : colorInfo.h)}°, {Math.round('saturation' in colorInfo ? colorInfo.saturation : colorInfo.s)}%, {Math.round('lightness' in colorInfo ? colorInfo.lightness : colorInfo.l)}%)
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Action Grid */}
          <Animated.View style={[styles.actionsContainer, actionsStyle]}>
            <Text style={[styles.actionsTitle, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
              What would you like to do with this color?
            </Text>
            
            <View style={styles.actionsGrid}>
              {COLOR_ACTIONS.map((action, index) => (
                <TouchableOpacity
                  key={action.id}
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: isDarkMode ? '#333333' : '#f8f9fa',
                      borderColor: isDarkMode ? '#555555' : '#e9ecef',
                    },
                  ]}
                  onPress={() => handleActionSelect(action.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                    <Text style={styles.actionIconText}>{action.icon}</Text>
                  </View>
                  <View style={styles.actionContent}>
                    <Text style={[styles.actionTitle, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
                      {action.title}
                    </Text>
                    <Text style={[styles.actionDescription, { color: isDarkMode ? '#cccccc' : '#666666' }]}>
                      {action.description}
                    </Text>
                  </View>
                  <View style={styles.actionArrow}>
                    <Text style={[styles.actionArrowText, { color: isDarkMode ? '#666666' : '#999999' }]}>
                      →
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    width: '92%',
    maxWidth: 420,
    maxHeight: '85%',
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  colorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorSwatch: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  colorDetails: {
    flex: 1,
  },
  colorHex: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  colorDescription: {
    fontSize: 14,
    marginTop: 2,
    fontWeight: '600',
  },
  colorHsl: {
    fontSize: 11,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#888888',
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionsContainer: {
    padding: 24,
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  actionsGrid: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionIconText: {
    fontSize: 18,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  actionArrow: {
    marginLeft: 12,
  },
  actionArrowText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ColorActionMenu;
