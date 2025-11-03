import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

interface PaletteRingOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  radius: number;
  colorCount: number;
}

interface RingPaletteSelectorProps {
  selectedTypes: string[];
  onSelectionChange: (selectedTypes: string[]) => void;
  isDarkMode: boolean;
  showAllRings: boolean;
  onShowAllToggle: () => void;
}

const PALETTE_RING_OPTIONS: PaletteRingOption[] = [
  {
    id: 'complementary',
    name: 'Complementary',
    description: 'Perfect opposites',
    icon: '⚖️',
    radius: 80,
    colorCount: 2,
  },
  {
    id: 'triadic',
    name: 'Triadic',
    description: 'Three-point harmony',
    icon: '🔺',
    radius: 110,
    colorCount: 3,
  },
  {
    id: 'tetradic',
    name: 'Tetradic',
    description: 'Four-corner balance',
    icon: '⬜',
    radius: 140,
    colorCount: 4,
  },
  {
    id: 'musical',
    name: 'Musical',
    description: 'Mode-based harmony',
    icon: '🎵',
    radius: 170,
    colorCount: 7,
  },
  {
    id: 'hexadic',
    name: 'Hexadic',
    description: 'Six-point spectrum',
    icon: '⬡',
    radius: 200,
    colorCount: 6,
  },
];

const RingPaletteSelector: React.FC<RingPaletteSelectorProps> = ({
  selectedTypes,
  onSelectionChange,
  isDarkMode,
  showAllRings,
  onShowAllToggle,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Animation values
  const expandHeight = useSharedValue(0);
  const toggleRotation = useSharedValue(0);

  const toggleExpanded = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    
    expandHeight.value = withSpring(newExpanded ? 1 : 0, {
      damping: 15,
      stiffness: 200,
    });
    
    toggleRotation.value = withSpring(newExpanded ? 180 : 0, {
      damping: 15,
      stiffness: 200,
    });
  };

  const toggleRingType = (typeId: string) => {
    if (selectedTypes.includes(typeId)) {
      onSelectionChange(selectedTypes.filter(id => id !== typeId));
    } else {
      onSelectionChange([...selectedTypes, typeId]);
    }
  };

  const selectAllRings = () => {
    onSelectionChange(PALETTE_RING_OPTIONS.map(option => option.id));
  };

  const clearAllRings = () => {
    onSelectionChange([]);
  };

  // Animated styles
  const expandedStyle = useAnimatedStyle(() => ({
    height: expandHeight.value * 200, // Max height when expanded
    opacity: expandHeight.value,
  }));

  const toggleIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${toggleRotation.value}deg` }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? 'rgba(42, 42, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)' }]}>
      {/* Header with toggle */}
      <TouchableOpacity style={styles.header} onPress={toggleExpanded}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
            Saturn's Rings
          </Text>
          <Text style={[styles.headerSubtitle, { color: isDarkMode ? '#cccccc' : '#666666' }]}>
            {selectedTypes.length === 0 ? 'All rings visible' : `${selectedTypes.length} ring${selectedTypes.length !== 1 ? 's' : ''} selected`}
          </Text>
        </View>
        <Animated.Text style={[styles.toggleIcon, toggleIconStyle]}>
          ⌄
        </Animated.Text>
      </TouchableOpacity>

      {/* Expanded content */}
      <Animated.View style={[styles.expandedContent, expandedStyle]}>
        {/* Quick actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: isDarkMode ? '#444444' : '#e0e0e0' }]}
            onPress={selectAllRings}
          >
            <Text style={[styles.quickActionText, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: isDarkMode ? '#444444' : '#e0e0e0' }]}
            onPress={clearAllRings}
          >
            <Text style={[styles.quickActionText, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
              None
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: showAllRings ? '#3498db' : (isDarkMode ? '#444444' : '#e0e0e0') }]}
            onPress={onShowAllToggle}
          >
            <Text style={[styles.quickActionText, { color: showAllRings ? '#ffffff' : (isDarkMode ? '#ffffff' : '#000000') }]}>
              Show All
            </Text>
          </TouchableOpacity>
        </View>

        {/* Ring options */}
        <ScrollView style={styles.ringOptions} showsVerticalScrollIndicator={false}>
          {PALETTE_RING_OPTIONS.map((option) => {
            const isSelected = selectedTypes.includes(option.id);
            
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.ringOption,
                  {
                    backgroundColor: isSelected ? '#3498db' : (isDarkMode ? '#333333' : '#f0f0f0'),
                    borderColor: isSelected ? '#2980b9' : (isDarkMode ? '#555555' : '#cccccc'),
                  },
                ]}
                onPress={() => toggleRingType(option.id)}
              >
                <View style={styles.ringOptionLeft}>
                  <Text style={styles.ringIcon}>{option.icon}</Text>
                  <View style={styles.ringInfo}>
                    <Text style={[
                      styles.ringName,
                      { color: isSelected ? '#ffffff' : (isDarkMode ? '#ffffff' : '#000000') }
                    ]}>
                      {option.name}
                    </Text>
                    <Text style={[
                      styles.ringDescription,
                      { color: isSelected ? 'rgba(255, 255, 255, 0.8)' : (isDarkMode ? '#cccccc' : '#666666') }
                    ]}>
                      {option.description}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.ringStats}>
                  <Text style={[
                    styles.ringRadius,
                    { color: isSelected ? 'rgba(255, 255, 255, 0.8)' : (isDarkMode ? '#888888' : '#999999') }
                  ]}>
                    R: {option.radius}px
                  </Text>
                  <Text style={[
                    styles.ringColorCount,
                    { color: isSelected ? 'rgba(255, 255, 255, 0.8)' : (isDarkMode ? '#888888' : '#999999') }
                  ]}>
                    {option.colorCount} colors
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  toggleIcon: {
    fontSize: 20,
    color: '#888888',
  },
  expandedContent: {
    overflow: 'hidden',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  quickActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ringOptions: {
    maxHeight: 140,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  ringOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  ringOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ringIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  ringInfo: {
    flex: 1,
  },
  ringName: {
    fontSize: 14,
    fontWeight: '600',
  },
  ringDescription: {
    fontSize: 11,
    marginTop: 2,
  },
  ringStats: {
    alignItems: 'flex-end',
  },
  ringRadius: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  ringColorCount: {
    fontSize: 10,
    marginTop: 2,
  },
});

export default RingPaletteSelector;
