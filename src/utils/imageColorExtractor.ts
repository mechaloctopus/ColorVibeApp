// Lazy import with fallback to avoid bundling issues on web
let ImagePicker: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ImagePicker = require('expo-image-picker');
} catch (e) {
  ImagePicker = {
    requestCameraPermissionsAsync: async () => ({ status: 'denied' }),
    requestMediaLibraryPermissionsAsync: async () => ({ status: 'denied' }),
    launchCameraAsync: async () => ({ canceled: true, assets: [] }),
    launchImageLibraryAsync: async () => ({ canceled: true, assets: [] }),
    MediaTypeOptions: { Images: 'Images' },
  };
}
import { rgbToHex, rgbToHsl, getRelativeLuminance } from './colorEngine';

export interface ExtractedColor {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  frequency: number; // How often this color appears
  luminance: number;
}

export interface ColorExtractionResult {
  dominantColors: ExtractedColor[];
  averageColor: ExtractedColor;
  imageUri: string;
  totalPixels: number;
}

// Request camera permissions
export async function requestCameraPermissions(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
}

// Request media library permissions
export async function requestMediaLibraryPermissions(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
}

// Pick image from camera
export async function pickImageFromCamera(): Promise<string | null> {
  const hasPermission = await requestCameraPermissions();
  if (!hasPermission) {
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (!result.canceled && result.assets[0]) {
    return result.assets[0].uri;
  }
  return null;
}

// Pick image from gallery
export async function pickImageFromGallery(): Promise<string | null> {
  const hasPermission = await requestMediaLibraryPermissions();
  if (!hasPermission) {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (!result.canceled && result.assets[0]) {
    return result.assets[0].uri;
  }
  return null;
}

// Simplified color extraction (since we can't access pixel data directly in React Native)
// This is a mock implementation - in a real app, you'd need a native module or server-side processing
export async function extractColorsFromImage(imageUri: string): Promise<ColorExtractionResult> {
  // This is a simplified mock implementation
  // In a production app, you would:
  // 1. Use a native module to access pixel data
  // 2. Send the image to a server for processing
  // 3. Use a library like react-native-image-colors

  // For now, we'll generate some realistic-looking extracted colors
  const mockColors: ExtractedColor[] = [
    {
      hex: '#3498db',
      rgb: { r: 52, g: 152, b: 219 },
      hsl: rgbToHsl(52, 152, 219),
      frequency: 0.25,
      luminance: getRelativeLuminance(52, 152, 219),
    },
    {
      hex: '#e74c3c',
      rgb: { r: 231, g: 76, b: 60 },
      hsl: rgbToHsl(231, 76, 60),
      frequency: 0.20,
      luminance: getRelativeLuminance(231, 76, 60),
    },
    {
      hex: '#2ecc71',
      rgb: { r: 46, g: 204, b: 113 },
      hsl: rgbToHsl(46, 204, 113),
      frequency: 0.18,
      luminance: getRelativeLuminance(46, 204, 113),
    },
    {
      hex: '#f39c12',
      rgb: { r: 243, g: 156, b: 18 },
      hsl: rgbToHsl(243, 156, 18),
      frequency: 0.15,
      luminance: getRelativeLuminance(243, 156, 18),
    },
    {
      hex: '#9b59b6',
      rgb: { r: 155, g: 89, b: 182 },
      hsl: rgbToHsl(155, 89, 182),
      frequency: 0.12,
      luminance: getRelativeLuminance(155, 89, 182),
    },
    {
      hex: '#34495e',
      rgb: { r: 52, g: 73, b: 94 },
      hsl: rgbToHsl(52, 73, 94),
      frequency: 0.10,
      luminance: getRelativeLuminance(52, 73, 94),
    },
  ];

  // Calculate average color
  const totalR = mockColors.reduce((sum, color) => sum + color.rgb.r * color.frequency, 0);
  const totalG = mockColors.reduce((sum, color) => sum + color.rgb.g * color.frequency, 0);
  const totalB = mockColors.reduce((sum, color) => sum + color.rgb.b * color.frequency, 0);

  const avgR = Math.round(totalR);
  const avgG = Math.round(totalG);
  const avgB = Math.round(totalB);

  const averageColor: ExtractedColor = {
    hex: rgbToHex(avgR, avgG, avgB),
    rgb: { r: avgR, g: avgG, b: avgB },
    hsl: rgbToHsl(avgR, avgG, avgB),
    frequency: 1.0,
    luminance: getRelativeLuminance(avgR, avgG, avgB),
  };

  return {
    dominantColors: mockColors,
    averageColor,
    imageUri,
    totalPixels: 1000000, // Mock value
  };
}

// Generate palette from extracted colors
export function generatePaletteFromExtractedColors(
  extractedColors: ExtractedColor[],
  maxColors: number = 6
): string[] {
  // Sort by frequency and take the most dominant colors
  const sortedColors = extractedColors
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, maxColors);

  return sortedColors.map(color => color.hex);
}

// Analyze color harmony in extracted colors
export function analyzeColorHarmony(colors: ExtractedColor[]): {
  isHarmonious: boolean;
  harmonyType: string;
  suggestions: string[];
} {
  if (colors.length < 2) {
    return {
      isHarmonious: false,
      harmonyType: 'insufficient',
      suggestions: ['Add more colors to analyze harmony'],
    };
  }

  // Simple harmony analysis based on hue relationships
  const hues = colors.map(color => color.hsl.h);
  const hueRanges = Math.max(...hues) - Math.min(...hues);

  let harmonyType = 'custom';
  let isHarmonious = false;
  const suggestions: string[] = [];

  if (hueRanges < 30) {
    harmonyType = 'monochromatic';
    isHarmonious = true;
  } else if (hueRanges < 60) {
    harmonyType = 'analogous';
    isHarmonious = true;
  } else if (hueRanges > 150 && hueRanges < 210) {
    harmonyType = 'complementary';
    isHarmonious = true;
  } else if (colors.length >= 3) {
    // Check for triadic (roughly 120° apart)
    const sortedHues = [...hues].sort((a, b) => a - b);
    const gaps = [];
    for (let i = 1; i < sortedHues.length; i++) {
      gaps.push(sortedHues[i] - sortedHues[i - 1]);
    }
    gaps.push(360 - sortedHues[sortedHues.length - 1] + sortedHues[0]);

    const avgGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
    if (Math.abs(avgGap - 120) < 30) {
      harmonyType = 'triadic';
      isHarmonious = true;
    }
  }

  if (!isHarmonious) {
    suggestions.push('Consider adjusting colors to create better harmony');
    suggestions.push('Try using complementary or analogous color relationships');
  } else {
    suggestions.push(`Great ${harmonyType} color harmony detected!`);
  }

  return {
    isHarmonious,
    harmonyType,
    suggestions,
  };
}

// Get color accessibility information
export function analyzeColorAccessibility(colors: ExtractedColor[]): {
  contrastRatios: { color1: string; color2: string; ratio: number; wcagLevel: string }[];
  recommendations: string[];
} {
  const contrastRatios: { color1: string; color2: string; ratio: number; wcagLevel: string }[] = [];
  const recommendations: string[] = [];

  // Calculate contrast ratios between all color pairs
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      const color1 = colors[i];
      const color2 = colors[j];
      
      const lum1 = color1.luminance;
      const lum2 = color2.luminance;
      
      const brightest = Math.max(lum1, lum2);
      const darkest = Math.min(lum1, lum2);
      const ratio = (brightest + 0.05) / (darkest + 0.05);

      let wcagLevel = 'Fail';
      if (ratio >= 7) {
        wcagLevel = 'AAA';
      } else if (ratio >= 4.5) {
        wcagLevel = 'AA';
      } else if (ratio >= 3) {
        wcagLevel = 'AA Large';
      }

      contrastRatios.push({
        color1: color1.hex,
        color2: color2.hex,
        ratio: Math.round(ratio * 100) / 100,
        wcagLevel,
      });
    }
  }

  // Generate recommendations
  const goodContrasts = contrastRatios.filter(cr => cr.ratio >= 4.5).length;
  const totalContrasts = contrastRatios.length;

  if (goodContrasts === 0) {
    recommendations.push('Consider adding colors with higher contrast for better accessibility');
  } else if (goodContrasts < totalContrasts / 2) {
    recommendations.push('Some color combinations have good contrast, but consider improving others');
  } else {
    recommendations.push('Good contrast ratios detected for accessibility');
  }

  return {
    contrastRatios,
    recommendations,
  };
}
