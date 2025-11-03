import { HSL, hslToHex } from './colorEngine';
import { MusicalMode, PaletteType } from '../store/slices/paletteSlice';

// Musical mode intervals (in semitones, translated to hue degrees)
const MUSICAL_INTERVALS = {
  major: [0, 60, 120, 180, 240, 300], // Major scale intervals
  minor: [0, 54, 108, 180, 234, 288], // Natural minor scale
  dorian: [0, 51, 102, 180, 231, 282], // Dorian mode
  phrygian: [0, 48, 96, 180, 228, 276], // Phrygian mode
  lydian: [0, 63, 126, 180, 243, 306], // Lydian mode
  mixolydian: [0, 57, 114, 180, 237, 294], // Mixolydian mode
  locrian: [0, 45, 90, 180, 225, 270], // Locrian mode
};

// Generate complementary palette
export function generateComplementary(baseHue: number, saturation: number, lightness: number): string[] {
  const complementHue = (baseHue + 180) % 360;
  return [
    hslToHex(baseHue, saturation, lightness),
    hslToHex(complementHue, saturation, lightness),
  ];
}

// Generate triadic palette
export function generateTriadic(baseHue: number, saturation: number, lightness: number): string[] {
  return [
    hslToHex(baseHue, saturation, lightness),
    hslToHex((baseHue + 120) % 360, saturation, lightness),
    hslToHex((baseHue + 240) % 360, saturation, lightness),
  ];
}

// Generate tetradic (rectangle) palette
export function generateTetradic(baseHue: number, saturation: number, lightness: number): string[] {
  return [
    hslToHex(baseHue, saturation, lightness),
    hslToHex((baseHue + 90) % 360, saturation, lightness),
    hslToHex((baseHue + 180) % 360, saturation, lightness),
    hslToHex((baseHue + 270) % 360, saturation, lightness),
  ];
}

// Generate analogous palette
export function generateAnalogous(baseHue: number, saturation: number, lightness: number): string[] {
  return [
    hslToHex((baseHue - 30) % 360, saturation, lightness),
    hslToHex(baseHue, saturation, lightness),
    hslToHex((baseHue + 30) % 360, saturation, lightness),
  ];
}

// Generate split-complementary palette
export function generateSplitComplementary(baseHue: number, saturation: number, lightness: number): string[] {
  const complement = (baseHue + 180) % 360;
  return [
    hslToHex(baseHue, saturation, lightness),
    hslToHex((complement - 30) % 360, saturation, lightness),
    hslToHex((complement + 30) % 360, saturation, lightness),
  ];
}

// Generate square palette
export function generateSquare(baseHue: number, saturation: number, lightness: number): string[] {
  return [
    hslToHex(baseHue, saturation, lightness),
    hslToHex((baseHue + 90) % 360, saturation, lightness),
    hslToHex((baseHue + 180) % 360, saturation, lightness),
    hslToHex((baseHue + 270) % 360, saturation, lightness),
  ];
}

// Generate musical mode-based palette
export function generateAdvancedMusicalPalette(
  baseHue: number, 
  saturation: number, 
  lightness: number, 
  mode: MusicalMode,
  count: number = 6
): string[] {
  const intervals = MUSICAL_INTERVALS[mode];
  const colors: string[] = [];
  
  for (let i = 0; i < Math.min(count, intervals.length); i++) {
    const hue = (baseHue + intervals[i]) % 360;
    // Add slight variations in saturation and lightness for richness
    const variedSaturation = Math.max(20, Math.min(100, saturation + (Math.random() - 0.5) * 20));
    const variedLightness = Math.max(20, Math.min(80, lightness + (Math.random() - 0.5) * 20));
    colors.push(hslToHex(hue, variedSaturation, variedLightness));
  }
  
  return colors;
}

// Generate golden ratio palette
export function generateGoldenRatio(baseHue: number, saturation: number, lightness: number, count: number = 5): string[] {
  const goldenAngle = 137.508; // Golden angle in degrees
  const colors: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const hue = (baseHue + (goldenAngle * i)) % 360;
    colors.push(hslToHex(hue, saturation, lightness));
  }
  
  return colors;
}

// Generate Fibonacci sequence palette
export function generateFibonacci(baseHue: number, saturation: number, lightness: number, count: number = 8): string[] {
  const fibonacci = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55];
  const colors: string[] = [];
  
  for (let i = 0; i < Math.min(count, fibonacci.length); i++) {
    const hue = (baseHue + (fibonacci[i] * 15)) % 360; // Scale fibonacci numbers
    colors.push(hslToHex(hue, saturation, lightness));
  }
  
  return colors;
}

// Generate monochromatic palette with tints, shades, and tones
export function generateMonochromatic(baseHue: number, saturation: number, lightness: number, count: number = 5): string[] {
  const colors: string[] = [];
  const step = 80 / (count - 1); // Distribute across lightness range
  
  for (let i = 0; i < count; i++) {
    const l = Math.max(10, Math.min(90, 20 + (step * i)));
    colors.push(hslToHex(baseHue, saturation, l));
  }
  
  return colors;
}

// Generate palette based on type
export function generatePalette(
  type: PaletteType,
  baseHue: number,
  saturation: number,
  lightness: number,
  musicalMode?: MusicalMode,
  count?: number
): string[] {
  switch (type) {
    case 'complementary':
      return generateComplementary(baseHue, saturation, lightness);
    case 'triadic':
      return generateTriadic(baseHue, saturation, lightness);
    case 'tetradic':
      return generateTetradic(baseHue, saturation, lightness);
    case 'analogous':
      return generateAnalogous(baseHue, saturation, lightness);
    case 'split-complementary':
      return generateSplitComplementary(baseHue, saturation, lightness);
    case 'square':
      return generateSquare(baseHue, saturation, lightness);
    default:
      return [hslToHex(baseHue, saturation, lightness)];
  }
}

// Generate advanced palette with musical mode
export function generateAdvancedPalette(
  baseHue: number,
  saturation: number,
  lightness: number,
  mode: MusicalMode,
  algorithm: 'musical' | 'golden' | 'fibonacci' | 'monochromatic' = 'musical',
  count: number = 6
): string[] {
  switch (algorithm) {
    case 'musical':
      return generateAdvancedMusicalPalette(baseHue, saturation, lightness, mode, count);
    case 'golden':
      return generateGoldenRatio(baseHue, saturation, lightness, count);
    case 'fibonacci':
      return generateFibonacci(baseHue, saturation, lightness, count);
    case 'monochromatic':
      return generateMonochromatic(baseHue, saturation, lightness, count);
    default:
      return generateAdvancedMusicalPalette(baseHue, saturation, lightness, mode, count);
  }
}

// Generate frequency-based complementary colors
export function generateFrequencyComplements(baseHue: number, saturation: number, lightness: number): string[] {
  // Based on color wavelength relationships
  const wavelengthHue = (baseHue * 2.78) % 360; // Convert hue to approximate wavelength position
  const complement1 = (wavelengthHue + 180) % 360;
  const complement2 = (wavelengthHue + 120) % 360;
  const complement3 = (wavelengthHue + 240) % 360;
  
  return [
    hslToHex(baseHue, saturation, lightness),
    hslToHex(complement1 / 2.78, saturation, lightness),
    hslToHex(complement2 / 2.78, saturation, lightness),
    hslToHex(complement3 / 2.78, saturation, lightness),
  ];
}
