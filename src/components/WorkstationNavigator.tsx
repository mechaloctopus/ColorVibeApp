import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { RootState } from '../store/store';
import { setCurrentWorkstation, WorkstationMode } from '../store/slices/uiSlice';

interface WorkstationInfo {
  mode: WorkstationMode;
  name: string;
  icon: string;
  description: string;
  color: string;
}

const WORKSTATIONS: WorkstationInfo[] = [
  {
    mode: 'main',
    name: 'Main Studio',
    icon: '🎨',
    description: 'Saturn\'s Rings color system with musical modes',
    color: '#3498db',
  },
  {
    mode: 'scanner',
    name: 'Color Scanner',
    icon: '📷',
    description: 'Extract colors from camera and gallery images',
    color: '#e67e22',
  },
  {
    mode: 'paint-recipes',
    name: 'Paint Recipes',
    icon: '🎭',
    description: 'Professional paint mixing formulas & calculator',
    color: '#f39c12',
  },
  {
    mode: 'theory-lab',
    name: 'Theory Lab',
    icon: '🔬',
    description: 'Advanced color analysis & accessibility testing',
    color: '#2ecc71',
  },
  {
    mode: 'perceptual-lab',
    name: 'Perceptual Lab',
    icon: '👁️',
    description: 'CIECAM02, contrast effects & color memory',
    color: '#8e44ad',
  },
  {
    mode: 'accessibility-suite',
    name: 'Accessibility',
    icon: '♿',
    description: 'WCAG testing & color blindness simulation',
    color: '#27ae60',
  },
  {
    mode: 'harmony-explorer',
    name: 'Harmony Explorer',
    icon: '⚖️',
    description: 'Interactive color wheel & harmony rules',
    color: '#9b59b6',
  },
  {
    mode: 'trends-inspiration',
    name: 'Trends & Inspiration',
    icon: '📈',
    description: '2024 color trends & mood-based palettes',
    color: '#1abc9c',
  },
  {
    mode: 'image-extractor',
    name: 'Image Extractor',
    icon: '🖼️',
    description: 'Advanced image color analysis & extraction',
    color: '#e74c3c',
  },
];

const WorkstationNavigator: React.FC = () => {
  const dispatch = useDispatch();
  const { currentWorkstation, isDarkMode } = useSelector((state: RootState) => state.ui);

  const scales = WORKSTATIONS.reduce((acc, workstation) => {
    acc[workstation.mode] = useSharedValue(1);
    return acc;
  }, {} as Record<WorkstationMode, Animated.SharedValue<number>>);

  const handleWorkstationPress = (mode: WorkstationMode) => {
    scales[mode].value = withSpring(0.95, {}, () => {
      scales[mode].value = withSpring(1);
    });
    dispatch(setCurrentWorkstation(mode));
  };

  const textColor = isDarkMode ? '#ffffff' : '#000000';
  const backgroundColor = isDarkMode ? '#2a2a2a' : '#ffffff';
  const borderColor = isDarkMode ? '#333333' : '#e0e0e0';

  return (
    <View style={[styles.container, { backgroundColor, borderTopColor: borderColor }]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {WORKSTATIONS.map((workstation) => {
          const isActive = currentWorkstation === workstation.mode;
          
          const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: scales[workstation.mode].value }],
          }));

          return (
            <Animated.View key={workstation.mode} style={animatedStyle}>
              <TouchableOpacity
                style={[
                  styles.workstationButton,
                  {
                    backgroundColor: isActive ? workstation.color : backgroundColor,
                    borderColor: isActive ? workstation.color : borderColor,
                  }
                ]}
                onPress={() => handleWorkstationPress(workstation.mode)}
              >
                <Text style={[
                  styles.workstationIcon,
                  { opacity: isActive ? 1 : 0.7 }
                ]}>
                  {workstation.icon}
                </Text>
                <Text style={[
                  styles.workstationName,
                  { 
                    color: isActive ? '#ffffff' : textColor,
                    fontWeight: isActive ? 'bold' : '600'
                  }
                ]}>
                  {workstation.name}
                </Text>
                <Text style={[
                  styles.workstationDescription,
                  { 
                    color: isActive ? 'rgba(255, 255, 255, 0.8)' : textColor,
                    opacity: isActive ? 0.8 : 0.6
                  }
                ]}>
                  {workstation.description}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingVertical: 10,
  },
  scrollContent: {
    paddingHorizontal: 15,
  },
  workstationButton: {
    width: 140,
    height: 100,
    borderRadius: 15,
    borderWidth: 2,
    marginHorizontal: 5,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workstationIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  workstationName: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 2,
  },
  workstationDescription: {
    fontSize: 8,
    textAlign: 'center',
    lineHeight: 10,
  },
});

export default WorkstationNavigator;
