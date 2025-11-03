import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Polygon, Circle, Path } from 'react-native-svg';

interface GeometricPaletteDisplayProps {
  colors: string[];
  shape: 'triangle' | 'square' | 'pentagon' | 'hexagon' | 'circle';
  size: number;
  position: { x: number; y: number };
  onColorPress?: (color: string, index: number) => void;
}

const GeometricPaletteDisplay: React.FC<GeometricPaletteDisplayProps> = ({
  colors,
  shape,
  size,
  position,
  onColorPress,
}) => {
  const handlePress = () => {
    // Simple press feedback without animation for now
  };

  const generateShapePoints = (): string => {
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.4;
    
    switch (shape) {
      case 'triangle':
        return generatePolygonPoints(3, centerX, centerY, radius);
      case 'square':
        return generatePolygonPoints(4, centerX, centerY, radius);
      case 'pentagon':
        return generatePolygonPoints(5, centerX, centerY, radius);
      case 'hexagon':
        return generatePolygonPoints(6, centerX, centerY, radius);
      default:
        return '';
    }
  };

  const generatePolygonPoints = (sides: number, centerX: number, centerY: number, radius: number): string => {
    const points: string[] = [];
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides - Math.PI / 2; // Start from top
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  };

  const renderShape = () => {
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.4;

    if (shape === 'circle') {
      // For circles, create segments
      const segmentAngle = (2 * Math.PI) / colors.length;
      return colors.map((color, index) => {
        const startAngle = index * segmentAngle - Math.PI / 2;
        const endAngle = (index + 1) * segmentAngle - Math.PI / 2;
        
        const x1 = centerX + radius * Math.cos(startAngle);
        const y1 = centerY + radius * Math.sin(startAngle);
        const x2 = centerX + radius * Math.cos(endAngle);
        const y2 = centerY + radius * Math.sin(endAngle);
        
        const largeArcFlag = segmentAngle > Math.PI ? 1 : 0;
        const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
        
        return (
          <Path
            key={index}
            d={pathData}
            fill={color}
            stroke="#ffffff"
            strokeWidth="1"
          />
        );
      });
    } else {
      // For polygons, divide into segments
      const points = generateShapePoints();
      const sides = shape === 'triangle' ? 3 : shape === 'square' ? 4 : shape === 'pentagon' ? 5 : 6;
      
      return colors.slice(0, sides).map((color, index) => {
        const angle1 = (index * 2 * Math.PI) / sides - Math.PI / 2;
        const angle2 = ((index + 1) * 2 * Math.PI) / sides - Math.PI / 2;
        
        const x1 = centerX + radius * Math.cos(angle1);
        const y1 = centerY + radius * Math.sin(angle1);
        const x2 = centerX + radius * Math.cos(angle2);
        const y2 = centerY + radius * Math.sin(angle2);
        
        const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} L ${x2} ${y2} Z`;
        
        return (
          <TouchableOpacity
            key={index}
            onPress={() => onColorPress?.(color, index)}
            style={StyleSheet.absoluteFill}
          >
            <Path
              d={pathData}
              fill={color}
              stroke="#ffffff"
              strokeWidth="2"
            />
          </TouchableOpacity>
        );
      });
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          left: position.x,
          top: position.y,
        },
      ]}
    >
      <TouchableOpacity onPress={handlePress} style={styles.touchable}>
        <Svg width={size} height={size} style={styles.svg}>
          {renderShape()}
          
          {/* Outer border */}
          {shape === 'circle' ? (
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={size * 0.4}
              fill="none"
              stroke="#333333"
              strokeWidth="2"
              opacity={0.7}
            />
          ) : (
            <Polygon
              points={generateShapePoints()}
              fill="none"
              stroke="#333333"
              strokeWidth="2"
              opacity={0.7}
            />
          )}
        </Svg>
        
        {/* Glow effect */}
        <View style={[styles.glow, { width: size + 10, height: size + 10 }]} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
  },
  glow: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
});

export default GeometricPaletteDisplay;
