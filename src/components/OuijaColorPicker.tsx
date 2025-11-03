import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle, Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface OuijaColorPickerProps {
  size?: number;
}

const OuijaColorPicker: React.FC<OuijaColorPickerProps> = ({ size = width * 0.6 }) => {
  const radius = size / 2;
  const centerX = radius;
  const centerY = radius;

  // Generate color wheel segments
  const generateColorWheel = () => {
    const segments = [];
    const segmentCount = 360; // One segment per degree for smooth gradients
    
    for (let i = 0; i < segmentCount; i++) {
      const angle = (i * 360) / segmentCount;
      const nextAngle = ((i + 1) * 360) / segmentCount;
      
      // Convert angle to radians
      const startAngle = (angle - 90) * (Math.PI / 180);
      const endAngle = (nextAngle - 90) * (Math.PI / 180);
      
      // Calculate path points
      const innerRadius = radius * 0.3;
      const outerRadius = radius * 0.9;
      
      const x1 = centerX + Math.cos(startAngle) * innerRadius;
      const y1 = centerY + Math.sin(startAngle) * innerRadius;
      const x2 = centerX + Math.cos(startAngle) * outerRadius;
      const y2 = centerY + Math.sin(startAngle) * outerRadius;
      const x3 = centerX + Math.cos(endAngle) * outerRadius;
      const y3 = centerY + Math.sin(endAngle) * outerRadius;
      const x4 = centerX + Math.cos(endAngle) * innerRadius;
      const y4 = centerY + Math.sin(endAngle) * innerRadius;
      
      const pathData = `M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1} Z`;
      
      // Calculate HSL color for this segment
      const hue = angle;
      const color = `hsl(${hue}, 100%, 50%)`;
      
      segments.push(
        <Path
          key={i}
          d={pathData}
          fill={color}
          opacity={0.9}
        />
      );
    }
    
    return segments;
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          {/* Radial gradient for saturation */}
          <RadialGradient
            id="saturationGradient"
            cx="50%"
            cy="50%"
            r="50%"
          >
            <Stop offset="0%" stopColor="white" stopOpacity="1" />
            <Stop offset="30%" stopColor="white" stopOpacity="0.7" />
            <Stop offset="70%" stopColor="white" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="white" stopOpacity="0" />
          </RadialGradient>
          
          {/* Radial gradient for lightness */}
          <RadialGradient
            id="lightnessGradient"
            cx="50%"
            cy="50%"
            r="50%"
          >
            <Stop offset="0%" stopColor="transparent" stopOpacity="0" />
            <Stop offset="60%" stopColor="transparent" stopOpacity="0" />
            <Stop offset="100%" stopColor="black" stopOpacity="0.3" />
          </RadialGradient>
        </Defs>
        
        {/* Color wheel segments */}
        {generateColorWheel()}
        
        {/* Saturation overlay */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={radius * 0.9}
          fill="url(#saturationGradient)"
        />
        
        {/* Lightness overlay */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={radius * 0.9}
          fill="url(#lightnessGradient)"
        />
        
        {/* Center circle (white point) */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={radius * 0.15}
          fill="white"
          stroke="#cccccc"
          strokeWidth="2"
        />
        
        {/* Outer ring */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={radius * 0.9}
          fill="none"
          stroke="#333333"
          strokeWidth="3"
          opacity={0.5}
        />
        
        {/* Inner ring */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={radius * 0.3}
          fill="none"
          stroke="#333333"
          strokeWidth="2"
          opacity={0.3}
        />
      </Svg>
      

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
  },

});

export default OuijaColorPicker;
