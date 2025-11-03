// Advanced Color Technologies - Next-Generation Color Processing
import { optimizedHexToRgb, optimizedRgbToHsl } from './optimizedColorEngine';

// Quantum Color Processing - Theoretical advanced color calculations
export interface QuantumColorState {
  primary: string;
  entangled: string[];
  coherence: number;
  superposition: string[];
}

// Spectral Color Analysis - Full spectrum color measurement
export interface SpectralData {
  wavelengths: number[];
  intensities: number[];
  dominantWavelength: number;
  purity: number;
  colorimetricPurity: number;
}

// Material Color Simulation - How colors appear on different materials
export interface MaterialProperties {
  reflectance: number;
  roughness: number;
  metallic: number;
  transparency: number;
  subsurfaceScattering: number;
}

// Lighting Condition Analysis - Color appearance under various lighting
export interface LightingCondition {
  temperature: number; // Kelvin
  intensity: number; // Lux
  spectrum: 'daylight' | 'tungsten' | 'fluorescent' | 'led' | 'custom';
  cri: number; // Color Rendering Index
}

// Advanced Color Blindness Simulation
export type ColorBlindnessType = 'protanopia' | 'deuteranopia' | 'tritanopia' | 'protanomaly' | 'deuteranomaly' | 'tritanomaly' | 'achromatopsia' | 'achromatomaly';

// Metamerism Detection - Colors that match under one light but not another
export interface MetamerismAnalysis {
  color1: string;
  color2: string;
  matchUnder: LightingCondition[];
  differUnder: LightingCondition[];
  deltaE: number;
}

// Quantum Color Processing Functions
export class QuantumColorProcessor {
  private static entanglementMap = new Map<string, string[]>();
  
  static createQuantumColorState(primaryColor: string): QuantumColorState {
    const rgb = optimizedHexToRgb(primaryColor);
    if (!rgb) throw new Error('Invalid color');
    
    const hsl = optimizedRgbToHsl(rgb.r, rgb.g, rgb.b);
    
    // Generate entangled colors based on quantum color theory
    const entangled = this.generateEntangledColors(primaryColor, hsl);
    const superposition = this.generateSuperpositionStates(primaryColor, entangled);
    
    return {
      primary: primaryColor,
      entangled,
      coherence: this.calculateCoherence(primaryColor, entangled),
      superposition,
    };
  }
  
  private static generateEntangledColors(primary: string, hsl: { h: number; s: number; l: number }): string[] {
    const entangled: string[] = [];
    
    // Quantum entanglement creates complementary relationships
    const complementaryHue = (hsl.h + 180) % 360;
    entangled.push(this.hslToHex(complementaryHue, hsl.s, hsl.l));
    
    // Quantum superposition creates intermediate states
    for (let i = 1; i <= 3; i++) {
      const intermediateHue = (hsl.h + (i * 60)) % 360;
      entangled.push(this.hslToHex(intermediateHue, hsl.s * 0.8, hsl.l));
    }
    
    return entangled;
  }
  
  private static generateSuperpositionStates(primary: string, entangled: string[]): string[] {
    const superposition: string[] = [];
    
    // Create quantum superposition by blending primary with entangled colors
    entangled.forEach(color => {
      const blended = this.blendColors(primary, color, 0.5);
      superposition.push(blended);
    });
    
    return superposition;
  }
  
  private static calculateCoherence(primary: string, entangled: string[]): number {
    // Calculate quantum coherence based on color relationships
    const primaryRgb = optimizedHexToRgb(primary)!;
    let totalCoherence = 0;
    
    entangled.forEach(color => {
      const rgb = optimizedHexToRgb(color)!;
      const distance = Math.sqrt(
        Math.pow(primaryRgb.r - rgb.r, 2) +
        Math.pow(primaryRgb.g - rgb.g, 2) +
        Math.pow(primaryRgb.b - rgb.b, 2)
      );
      totalCoherence += 1 / (1 + distance / 255);
    });
    
    return totalCoherence / entangled.length;
  }
  
  private static blendColors(color1: string, color2: string, ratio: number): string {
    const rgb1 = optimizedHexToRgb(color1)!;
    const rgb2 = optimizedHexToRgb(color2)!;
    
    const r = Math.round(rgb1.r * (1 - ratio) + rgb2.r * ratio);
    const g = Math.round(rgb1.g * (1 - ratio) + rgb2.g * ratio);
    const b = Math.round(rgb1.b * (1 - ratio) + rgb2.b * ratio);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  
  private static hslToHex(h: number, s: number, l: number): string {
    const hNorm = h / 360;
    const sNorm = s / 100;
    const lNorm = l / 100;
    
    const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
    const x = c * (1 - Math.abs((hNorm * 6) % 2 - 1));
    const m = lNorm - c / 2;
    
    let r, g, b;
    if (hNorm < 1/6) { r = c; g = x; b = 0; }
    else if (hNorm < 2/6) { r = x; g = c; b = 0; }
    else if (hNorm < 3/6) { r = 0; g = c; b = x; }
    else if (hNorm < 4/6) { r = 0; g = x; b = c; }
    else if (hNorm < 5/6) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    
    const rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
    const gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
    const bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0');
    
    return `#${rHex}${gHex}${bHex}`;
  }
}

// Spectral Analysis Functions
export class SpectralAnalyzer {
  static analyzeSpectralData(color: string): SpectralData {
    const rgb = optimizedHexToRgb(color);
    if (!rgb) throw new Error('Invalid color');
    
    // Simulate spectral data based on RGB values
    const wavelengths: number[] = [];
    const intensities: number[] = [];
    
    // Generate wavelength data from 380nm to 780nm
    for (let wavelength = 380; wavelength <= 780; wavelength += 5) {
      wavelengths.push(wavelength);
      intensities.push(this.calculateIntensityAtWavelength(rgb, wavelength));
    }
    
    const dominantWavelength = this.findDominantWavelength(wavelengths, intensities);
    const purity = this.calculatePurity(intensities);
    const colorimetricPurity = this.calculateColorimetricPurity(rgb, dominantWavelength);
    
    return {
      wavelengths,
      intensities,
      dominantWavelength,
      purity,
      colorimetricPurity,
    };
  }
  
  private static calculateIntensityAtWavelength(rgb: { r: number; g: number; b: number }, wavelength: number): number {
    // Simplified spectral response calculation
    let intensity = 0;
    
    // Red component (600-700nm peak)
    if (wavelength >= 580 && wavelength <= 780) {
      const redResponse = Math.exp(-Math.pow((wavelength - 650) / 50, 2));
      intensity += (rgb.r / 255) * redResponse;
    }
    
    // Green component (500-600nm peak)
    if (wavelength >= 450 && wavelength <= 650) {
      const greenResponse = Math.exp(-Math.pow((wavelength - 550) / 40, 2));
      intensity += (rgb.g / 255) * greenResponse;
    }
    
    // Blue component (400-500nm peak)
    if (wavelength >= 380 && wavelength <= 550) {
      const blueResponse = Math.exp(-Math.pow((wavelength - 450) / 35, 2));
      intensity += (rgb.b / 255) * blueResponse;
    }
    
    return Math.max(0, Math.min(1, intensity));
  }
  
  private static findDominantWavelength(wavelengths: number[], intensities: number[]): number {
    let maxIntensity = 0;
    let dominantWavelength = 550; // Default to green
    
    for (let i = 0; i < wavelengths.length; i++) {
      if (intensities[i] > maxIntensity) {
        maxIntensity = intensities[i];
        dominantWavelength = wavelengths[i];
      }
    }
    
    return dominantWavelength;
  }
  
  private static calculatePurity(intensities: number[]): number {
    const maxIntensity = Math.max(...intensities);
    const avgIntensity = intensities.reduce((sum, val) => sum + val, 0) / intensities.length;
    return maxIntensity > 0 ? (maxIntensity - avgIntensity) / maxIntensity : 0;
  }
  
  private static calculateColorimetricPurity(rgb: { r: number; g: number; b: number }, dominantWavelength: number): number {
    // Calculate colorimetric purity based on distance from white point
    const whitePoint = { r: 255, g: 255, b: 255 };
    const distance = Math.sqrt(
      Math.pow(rgb.r - whitePoint.r, 2) +
      Math.pow(rgb.g - whitePoint.g, 2) +
      Math.pow(rgb.b - whitePoint.b, 2)
    );
    const maxDistance = Math.sqrt(3 * Math.pow(255, 2));
    return distance / maxDistance;
  }
}

// Material Simulation Functions
export class MaterialSimulator {
  static simulateColorOnMaterial(color: string, material: MaterialProperties, lighting: LightingCondition): string {
    const rgb = optimizedHexToRgb(color);
    if (!rgb) throw new Error('Invalid color');
    
    // Apply material properties to color appearance
    let modifiedRgb = { ...rgb };
    
    // Reflectance affects overall brightness
    const reflectanceFactor = material.reflectance;
    modifiedRgb.r *= reflectanceFactor;
    modifiedRgb.g *= reflectanceFactor;
    modifiedRgb.b *= reflectanceFactor;
    
    // Roughness affects specular highlights
    const roughnessFactor = 1 - material.roughness * 0.3;
    modifiedRgb.r *= roughnessFactor;
    modifiedRgb.g *= roughnessFactor;
    modifiedRgb.b *= roughnessFactor;
    
    // Metallic property affects color saturation
    if (material.metallic > 0.5) {
      const hsl = optimizedRgbToHsl(modifiedRgb.r, modifiedRgb.g, modifiedRgb.b);
      const enhancedSaturation = Math.min(100, hsl.s * (1 + material.metallic * 0.5));
      // Convert back to RGB with enhanced saturation
      // (Simplified - would need full HSL to RGB conversion)
    }
    
    // Apply lighting conditions
    modifiedRgb = this.applyLighting(modifiedRgb, lighting);
    
    // Ensure values are within valid range
    modifiedRgb.r = Math.max(0, Math.min(255, Math.round(modifiedRgb.r)));
    modifiedRgb.g = Math.max(0, Math.min(255, Math.round(modifiedRgb.g)));
    modifiedRgb.b = Math.max(0, Math.min(255, Math.round(modifiedRgb.b)));
    
    return `#${modifiedRgb.r.toString(16).padStart(2, '0')}${modifiedRgb.g.toString(16).padStart(2, '0')}${modifiedRgb.b.toString(16).padStart(2, '0')}`;
  }
  
  private static applyLighting(rgb: { r: number; g: number; b: number }, lighting: LightingCondition): { r: number; g: number; b: number } {
    // Apply color temperature
    const temperatureFactor = this.getTemperatureFactor(lighting.temperature);
    
    // Apply intensity
    const intensityFactor = Math.min(1, lighting.intensity / 1000); // Normalize to typical indoor lighting
    
    // Apply CRI (Color Rendering Index)
    const criFactor = lighting.cri / 100;
    
    return {
      r: rgb.r * temperatureFactor.r * intensityFactor * criFactor,
      g: rgb.g * temperatureFactor.g * intensityFactor * criFactor,
      b: rgb.b * temperatureFactor.b * intensityFactor * criFactor,
    };
  }
  
  private static getTemperatureFactor(temperature: number): { r: number; g: number; b: number } {
    // Simplified color temperature to RGB conversion
    if (temperature < 3000) {
      // Warm light (more red/yellow)
      return { r: 1.0, g: 0.9, b: 0.7 };
    } else if (temperature < 5000) {
      // Neutral light
      return { r: 1.0, g: 1.0, b: 0.9 };
    } else {
      // Cool light (more blue)
      return { r: 0.9, g: 0.95, b: 1.0 };
    }
  }
}

// Advanced Color Blindness Simulation
export class ColorBlindnessSimulator {
  static simulateColorBlindness(color: string, type: ColorBlindnessType): string {
    const rgb = optimizedHexToRgb(color);
    if (!rgb) throw new Error('Invalid color');
    
    let modifiedRgb: { r: number; g: number; b: number };
    
    switch (type) {
      case 'protanopia': // Red-blind
        modifiedRgb = {
          r: 0.567 * rgb.r + 0.433 * rgb.g,
          g: 0.558 * rgb.r + 0.442 * rgb.g,
          b: 0.242 * rgb.g + 0.758 * rgb.b,
        };
        break;
      case 'deuteranopia': // Green-blind
        modifiedRgb = {
          r: 0.625 * rgb.r + 0.375 * rgb.g,
          g: 0.7 * rgb.r + 0.3 * rgb.g,
          b: 0.3 * rgb.g + 0.7 * rgb.b,
        };
        break;
      case 'tritanopia': // Blue-blind
        modifiedRgb = {
          r: 0.95 * rgb.r + 0.05 * rgb.g,
          g: 0.433 * rgb.g + 0.567 * rgb.b,
          b: 0.475 * rgb.g + 0.525 * rgb.b,
        };
        break;
      case 'achromatopsia': // Complete color blindness
        const gray = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
        modifiedRgb = { r: gray, g: gray, b: gray };
        break;
      default:
        // For anomalous trichromacy, apply partial effect
        const normalRgb = rgb;
        const blindRgb = this.simulateColorBlindness(color, type.replace('anomaly', 'opia') as ColorBlindnessType);
        const blindRgbValues = optimizedHexToRgb(blindRgb)!;
        
        // Blend normal and blind vision (50% effect for anomalous)
        modifiedRgb = {
          r: (normalRgb.r + blindRgbValues.r) / 2,
          g: (normalRgb.g + blindRgbValues.g) / 2,
          b: (normalRgb.b + blindRgbValues.b) / 2,
        };
    }
    
    // Ensure values are within valid range
    modifiedRgb.r = Math.max(0, Math.min(255, Math.round(modifiedRgb.r)));
    modifiedRgb.g = Math.max(0, Math.min(255, Math.round(modifiedRgb.g)));
    modifiedRgb.b = Math.max(0, Math.min(255, Math.round(modifiedRgb.b)));
    
    return `#${modifiedRgb.r.toString(16).padStart(2, '0')}${modifiedRgb.g.toString(16).padStart(2, '0')}${modifiedRgb.b.toString(16).padStart(2, '0')}`;
  }
  
  static getAllSimulations(color: string): Record<ColorBlindnessType, string> {
    const types: ColorBlindnessType[] = [
      'protanopia', 'deuteranopia', 'tritanopia',
      'protanomaly', 'deuteranomaly', 'tritanomaly',
      'achromatopsia', 'achromatomaly'
    ];
    
    const simulations: Record<ColorBlindnessType, string> = {} as any;
    
    types.forEach(type => {
      simulations[type] = this.simulateColorBlindness(color, type);
    });
    
    return simulations;
  }
}

// Metamerism Analysis
export class MetamerismAnalyzer {
  static analyzeMetamerism(color1: string, color2: string, lightingConditions: LightingCondition[]): MetamerismAnalysis {
    const matchUnder: LightingCondition[] = [];
    const differUnder: LightingCondition[] = [];
    
    lightingConditions.forEach(lighting => {
      const color1UnderLight = MaterialSimulator.simulateColorOnMaterial(
        color1,
        { reflectance: 1, roughness: 0, metallic: 0, transparency: 0, subsurfaceScattering: 0 },
        lighting
      );
      const color2UnderLight = MaterialSimulator.simulateColorOnMaterial(
        color2,
        { reflectance: 1, roughness: 0, metallic: 0, transparency: 0, subsurfaceScattering: 0 },
        lighting
      );
      
      const deltaE = this.calculateDeltaE(color1UnderLight, color2UnderLight);
      
      if (deltaE < 2.3) { // JND threshold
        matchUnder.push(lighting);
      } else {
        differUnder.push(lighting);
      }
    });
    
    const overallDeltaE = this.calculateDeltaE(color1, color2);
    
    return {
      color1,
      color2,
      matchUnder,
      differUnder,
      deltaE: overallDeltaE,
    };
  }
  
  private static calculateDeltaE(color1: string, color2: string): number {
    // Simplified Delta E calculation (would use LAB color space in production)
    const rgb1 = optimizedHexToRgb(color1)!;
    const rgb2 = optimizedHexToRgb(color2)!;
    
    const deltaR = rgb1.r - rgb2.r;
    const deltaG = rgb1.g - rgb2.g;
    const deltaB = rgb1.b - rgb2.b;
    
    return Math.sqrt(deltaR * deltaR + deltaG * deltaG + deltaB * deltaB) / 255 * 100;
  }
}

// All classes are already exported individually above
