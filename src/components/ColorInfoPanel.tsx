import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { hslToRgb, hslToHex, rgbToCmyk, rgbToLab, getColorTemperature } from '../utils/colorEngine';

const ColorInfoPanel: React.FC = () => {
  const { currentColor } = useSelector((state: RootState) => state.color);
  const { isDarkMode } = useSelector((state: RootState) => state.ui);

  const { hue, saturation, lightness } = currentColor;
  const rgb = hslToRgb(hue, saturation, lightness);
  const hex = hslToHex(hue, saturation, lightness);
  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
  const lab = rgbToLab(rgb.r, rgb.g, rgb.b);
  const temperature = getColorTemperature(rgb.r, rgb.g, rgb.b);

  const textColor = isDarkMode ? '#ffffff' : '#000000';
  const backgroundColor = isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)';
  const borderColor = isDarkMode ? '#333333' : '#cccccc';

  return (
    <View style={[styles.container, { backgroundColor, borderColor }]}>
      <Text style={[styles.title, { color: textColor }]}>Color Information</Text>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Color Preview */}
        <View style={styles.colorPreview}>
          <View style={[styles.colorSwatch, { backgroundColor: hex }]} />
          <Text style={[styles.colorName, { color: textColor }]}>Current Color</Text>
        </View>

        {/* Color Codes */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Color Codes</Text>
          
          <View style={styles.codeRow}>
            <Text style={[styles.codeLabel, { color: textColor }]}>HEX:</Text>
            <Text style={[styles.codeValue, { color: textColor }]}>{hex.toUpperCase()}</Text>
          </View>
          
          <View style={styles.codeRow}>
            <Text style={[styles.codeLabel, { color: textColor }]}>RGB:</Text>
            <Text style={[styles.codeValue, { color: textColor }]}>
              rgb({rgb.r}, {rgb.g}, {rgb.b})
            </Text>
          </View>
          
          <View style={styles.codeRow}>
            <Text style={[styles.codeLabel, { color: textColor }]}>HSL:</Text>
            <Text style={[styles.codeValue, { color: textColor }]}>
              hsl({Math.round(hue)}°, {Math.round(saturation)}%, {Math.round(lightness)}%)
            </Text>
          </View>
          
          <View style={styles.codeRow}>
            <Text style={[styles.codeLabel, { color: textColor }]}>CMYK:</Text>
            <Text style={[styles.codeValue, { color: textColor }]}>
              cmyk({cmyk.c}%, {cmyk.m}%, {cmyk.y}%, {cmyk.k}%)
            </Text>
          </View>
          
          <View style={styles.codeRow}>
            <Text style={[styles.codeLabel, { color: textColor }]}>LAB:</Text>
            <Text style={[styles.codeValue, { color: textColor }]}>
              lab({lab.l}, {lab.a}, {lab.b})
            </Text>
          </View>
        </View>

        {/* Color Properties */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Properties</Text>
          
          <View style={styles.propertyRow}>
            <Text style={[styles.propertyLabel, { color: textColor }]}>Temperature:</Text>
            <Text style={[styles.propertyValue, { color: textColor }]}>
              {Math.round(temperature)}K {temperature > 5500 ? '(Cool)' : '(Warm)'}
            </Text>
          </View>
          
          <View style={styles.propertyRow}>
            <Text style={[styles.propertyLabel, { color: textColor }]}>Brightness:</Text>
            <Text style={[styles.propertyValue, { color: textColor }]}>
              {lightness > 50 ? 'Light' : 'Dark'} ({Math.round(lightness)}%)
            </Text>
          </View>
          
          <View style={styles.propertyRow}>
            <Text style={[styles.propertyLabel, { color: textColor }]}>Saturation:</Text>
            <Text style={[styles.propertyValue, { color: textColor }]}>
              {saturation > 75 ? 'Vivid' : saturation > 50 ? 'Moderate' : saturation > 25 ? 'Muted' : 'Desaturated'} ({Math.round(saturation)}%)
            </Text>
          </View>
        </View>

        {/* Color Harmony */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Harmony</Text>
          
          <View style={styles.harmonyRow}>
            <Text style={[styles.harmonyLabel, { color: textColor }]}>Complement:</Text>
            <View style={[styles.harmonySwatch, { backgroundColor: hslToHex((hue + 180) % 360, saturation, lightness) }]} />
            <Text style={[styles.harmonyValue, { color: textColor }]}>
              {hslToHex((hue + 180) % 360, saturation, lightness).toUpperCase()}
            </Text>
          </View>
          
          <View style={styles.harmonyRow}>
            <Text style={[styles.harmonyLabel, { color: textColor }]}>Triadic 1:</Text>
            <View style={[styles.harmonySwatch, { backgroundColor: hslToHex((hue + 120) % 360, saturation, lightness) }]} />
            <Text style={[styles.harmonyValue, { color: textColor }]}>
              {hslToHex((hue + 120) % 360, saturation, lightness).toUpperCase()}
            </Text>
          </View>
          
          <View style={styles.harmonyRow}>
            <Text style={[styles.harmonyLabel, { color: textColor }]}>Triadic 2:</Text>
            <View style={[styles.harmonySwatch, { backgroundColor: hslToHex((hue + 240) % 360, saturation, lightness) }]} />
            <Text style={[styles.harmonyValue, { color: textColor }]}>
              {hslToHex((hue + 240) % 360, saturation, lightness).toUpperCase()}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxHeight: 300,
    borderRadius: 15,
    borderWidth: 1,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  colorPreview: {
    alignItems: 'center',
    marginBottom: 15,
  },
  colorSwatch: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  colorName: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  codeLabel: {
    fontSize: 12,
    fontWeight: '600',
    width: 50,
  },
  codeValue: {
    fontSize: 12,
    fontFamily: 'monospace',
    flex: 1,
    textAlign: 'right',
  },
  propertyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  propertyLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  propertyValue: {
    fontSize: 12,
  },
  harmonyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  harmonyLabel: {
    fontSize: 12,
    fontWeight: '600',
    width: 80,
  },
  harmonySwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  harmonyValue: {
    fontSize: 11,
    fontFamily: 'monospace',
    flex: 1,
  },
});

export default ColorInfoPanel;
