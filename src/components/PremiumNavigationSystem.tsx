import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, PanResponder } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { setCurrentWorkstation } from '../store/slices/uiSlice';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../styles/designSystem';
import { HapticFeedback, createOptimizedSpring } from '../utils/touchOptimization';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface NavigationNode {
  id: string;
  name: string;
  icon: string;
  color: string;
  position: { x: number; y: number };
  connections: string[];
  description: string;
}

const NAVIGATION_NODES: NavigationNode[] = [
  {
    id: 'main',
    name: 'Main Studio',
    icon: '🎨',
    color: '#3498db',
    position: { x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2 },
    connections: ['scanner', 'paint-recipes', 'theory-lab'],
    description: 'Saturn\'s Rings Color System',
  },
  {
    id: 'scanner',
    name: 'Color Scanner',
    icon: '📷',
    color: '#e67e22',
    position: { x: SCREEN_WIDTH / 2 - 120, y: SCREEN_HEIGHT / 2 - 100 },
    connections: ['main', 'image-extractor'],
    description: 'Camera & Gallery Analysis',
  },
  {
    id: 'paint-recipes',
    name: 'Paint Recipes',
    icon: '🎭',
    color: '#f39c12',
    position: { x: SCREEN_WIDTH / 2 + 120, y: SCREEN_HEIGHT / 2 - 100 },
    connections: ['main', 'theory-lab'],
    description: 'Professional Mixing Lab',
  },
  {
    id: 'theory-lab',
    name: 'Theory Lab',
    icon: '🔬',
    color: '#2ecc71',
    position: { x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2 + 120 },
    connections: ['main', 'harmony-explorer'],
    description: 'Advanced Color Analysis',
  },
  {
    id: 'harmony-explorer',
    name: 'Harmony Explorer',
    icon: '⚖️',
    color: '#9b59b6',
    position: { x: SCREEN_WIDTH / 2 - 120, y: SCREEN_HEIGHT / 2 + 100 },
    connections: ['theory-lab', 'trends-inspiration'],
    description: 'Interactive Color Relationships',
  },
  {
    id: 'trends-inspiration',
    name: 'Trends & Inspiration',
    icon: '📈',
    color: '#1abc9c',
    position: { x: SCREEN_WIDTH / 2 + 120, y: SCREEN_HEIGHT / 2 + 100 },
    connections: ['harmony-explorer', 'image-extractor'],
    description: '2024 Color Intelligence',
  },
  {
    id: 'image-extractor',
    name: 'Image Extractor',
    icon: '🖼️',
    color: '#e74c3c',
    position: { x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2 - 200 },
    connections: ['scanner', 'trends-inspiration'],
    description: 'Advanced Photo Analysis',
  },
];

const PremiumNavigationSystem: React.FC = () => {
  const { isDarkMode, currentWorkstation } = useSelector((state: RootState) => state.ui);
  const dispatch = useDispatch();
  
  const [isVisible, setIsVisible] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  
  // Animation values
  const overlayOpacity = useSharedValue(0);
  const nodesScale = useSharedValue(0);
  const connectionsOpacity = useSharedValue(0);
  
  // Node animation values
  const nodeAnimations = NAVIGATION_NODES.reduce((acc, node) => {
    acc[node.id] = {
      scale: useSharedValue(1),
      glow: useSharedValue(0),
      pulse: useSharedValue(1),
    };
    return acc;
  }, {} as Record<string, { scale: Animated.SharedValue<number>; glow: Animated.SharedValue<number>; pulse: Animated.SharedValue<number> }>);

  useEffect(() => {
    if (isVisible) {
      overlayOpacity.value = withTiming(1, { duration: 300 });
      nodesScale.value = withSpring(1, createOptimizedSpring('smooth'));
      connectionsOpacity.value = withTiming(1, { duration: 500 });
      
      // Animate nodes in sequence
      NAVIGATION_NODES.forEach((node, index) => {
        setTimeout(() => {
          nodeAnimations[node.id].scale.value = withSpring(1, createOptimizedSpring('bouncy'));
        }, index * 100);
      });
    } else {
      overlayOpacity.value = withTiming(0, { duration: 200 });
      nodesScale.value = withSpring(0, createOptimizedSpring('quick'));
      connectionsOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isVisible]);

  const toggleNavigation = () => {
    setIsVisible(!isVisible);
    HapticFeedback.medium();
  };

  const selectWorkstation = (nodeId: string) => {
    setSelectedNode(nodeId);
    dispatch(setCurrentWorkstation(nodeId as any));
    
    // Animate selection
    nodeAnimations[nodeId].glow.value = withSpring(1, createOptimizedSpring('quick'));
    nodeAnimations[nodeId].scale.value = withSpring(1.2, createOptimizedSpring('bouncy'), () => {
      nodeAnimations[nodeId].scale.value = withSpring(1, createOptimizedSpring('smooth'));
      nodeAnimations[nodeId].glow.value = withSpring(0, createOptimizedSpring('smooth'));
    });
    
    HapticFeedback.impact();
    setTimeout(() => setIsVisible(false), 500);
  };

  const hoverNode = (nodeId: string | null) => {
    if (hoveredNode && hoveredNode !== nodeId) {
      nodeAnimations[hoveredNode].pulse.value = withSpring(1, createOptimizedSpring('quick'));
    }
    
    if (nodeId) {
      nodeAnimations[nodeId].pulse.value = withSpring(1.1, createOptimizedSpring('quick'));
      HapticFeedback.light();
    }
    
    setHoveredNode(nodeId);
  };

  const renderConnectionLine = (fromNode: NavigationNode, toNodeId: string) => {
    const toNode = NAVIGATION_NODES.find(n => n.id === toNodeId);
    if (!toNode) return null;

    const isActive = selectedNode === fromNode.id || selectedNode === toNodeId || 
                    hoveredNode === fromNode.id || hoveredNode === toNodeId;

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: connectionsOpacity.value * (isActive ? 0.8 : 0.3),
    }));

    return (
      <Animated.View
        key={`${fromNode.id}-${toNodeId}`}
        style={[
          styles.connectionLine,
          {
            position: 'absolute',
            left: Math.min(fromNode.position.x, toNode.position.x),
            top: Math.min(fromNode.position.y, toNode.position.y),
            width: Math.abs(toNode.position.x - fromNode.position.x),
            height: Math.abs(toNode.position.y - fromNode.position.y),
            backgroundColor: isActive ? COLORS.primary[400] : COLORS.secondary[400],
          },
          animatedStyle,
        ]}
      />
    );
  };

  const renderNavigationNode = (node: NavigationNode) => {
    const isSelected = selectedNode === node.id || currentWorkstation === node.id;
    const isHovered = hoveredNode === node.id;
    const isConnected = selectedNode && node.connections.includes(selectedNode);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { scale: nodeAnimations[node.id].scale.value * nodeAnimations[node.id].pulse.value },
      ],
      shadowOpacity: interpolate(nodeAnimations[node.id].glow.value, [0, 1], [0.2, 0.8]),
      shadowRadius: interpolate(nodeAnimations[node.id].glow.value, [0, 1], [4, 12]),
    }));

    return (
      <Animated.View
        key={node.id}
        style={[
          styles.navigationNode,
          {
            position: 'absolute',
            left: node.position.x - 35,
            top: node.position.y - 35,
            backgroundColor: node.color,
            borderWidth: isSelected ? 3 : isConnected ? 2 : 1,
            borderColor: isSelected ? '#ffffff' : isConnected ? COLORS.primary[300] : 'rgba(255, 255, 255, 0.3)',
          },
          animatedStyle,
        ]}
      >
        <TouchableOpacity
          style={styles.nodeButton}
          onPress={() => selectWorkstation(node.id)}
          onPressIn={() => hoverNode(node.id)}
          onPressOut={() => hoverNode(null)}
        >
          <Text style={styles.nodeIcon}>{node.icon}</Text>
          <Text style={styles.nodeName}>{node.name}</Text>
        </TouchableOpacity>
        
        {(isHovered || isSelected) && (
          <View style={[styles.nodeTooltip, { backgroundColor: isDarkMode ? COLORS.dark.card : COLORS.light.card }]}>
            <Text style={[styles.tooltipText, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
              {node.description}
            </Text>
          </View>
        )}
      </Animated.View>
    );
  };

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
    transform: [{ scale: nodesScale.value }],
  }));

  return (
    <>
      {/* Navigation Toggle Button */}
      <TouchableOpacity
        style={[
          styles.toggleButton,
          {
            backgroundColor: COLORS.primary[500],
            borderColor: isDarkMode ? COLORS.dark.border : COLORS.light.border,
          },
        ]}
        onPress={toggleNavigation}
      >
        <Text style={styles.toggleIcon}>{isVisible ? '✕' : '🧭'}</Text>
      </TouchableOpacity>

      {/* Navigation Overlay */}
      {isVisible && (
        <Animated.View style={[styles.navigationOverlay, overlayAnimatedStyle]}>
          <TouchableOpacity
            style={styles.overlayBackground}
            onPress={() => setIsVisible(false)}
            activeOpacity={1}
          />
          
          {/* Connection Lines */}
          {NAVIGATION_NODES.map(node =>
            node.connections.map(connectionId =>
              renderConnectionLine(node, connectionId)
            )
          )}
          
          {/* Navigation Nodes */}
          {NAVIGATION_NODES.map(renderNavigationNode)}
          
          {/* Center Hub */}
          <View style={[styles.centerHub, { backgroundColor: isDarkMode ? COLORS.dark.card : COLORS.light.card }]}>
            <Text style={[styles.hubTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
              Color Vibe
            </Text>
            <Text style={[styles.hubSubtitle, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
              Workstation
            </Text>
          </View>
        </Animated.View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  toggleButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    zIndex: 1000,
    ...SHADOWS.lg,
  },
  toggleIcon: {
    fontSize: 20,
    color: '#ffffff',
  },
  navigationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  overlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  connectionLine: {
    height: 2,
    borderRadius: 1,
  },
  navigationNode: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  nodeButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 35,
  },
  nodeIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  nodeName: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  nodeTooltip: {
    position: 'absolute',
    top: -40,
    left: -50,
    width: 170,
    padding: SPACING[2],
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.base,
  },
  tooltipText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  centerHub: {
    position: 'absolute',
    left: SCREEN_WIDTH / 2 - 40,
    top: SCREEN_HEIGHT / 2 - 40,
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary[500],
    ...SHADOWS.xl,
  },
  hubTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  hubSubtitle: {
    fontSize: 8,
    textAlign: 'center',
    marginTop: 2,
  },
});

export default PremiumNavigationSystem;
