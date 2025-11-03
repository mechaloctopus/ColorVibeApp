// Accessibility Utility Functions
// Shared utilities for accessibility calculations and analysis

import { optimizedHexToRgb } from './optimizedColorEngine';

// Contrast calculation result
export interface ContrastResult {
  ratio: number;
  level: 'AAA' | 'AA' | 'A' | 'FAIL';
  passesNormal: boolean;
  passesLarge: boolean;
}

// Calculate WCAG contrast ratio between two colors
export const calculateContrastRatio = (foreground: string, background: string): ContrastResult => {
  const fgRgb = optimizedHexToRgb(foreground);
  const bgRgb = optimizedHexToRgb(background);
  
  if (!fgRgb || !bgRgb) {
    return { ratio: 1, level: 'FAIL', passesNormal: false, passesLarge: false };
  }
  
  const fgLuminance = getRelativeLuminance(fgRgb);
  const bgLuminance = getRelativeLuminance(bgRgb);
  
  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);
  const ratio = (lighter + 0.05) / (darker + 0.05);
  
  let level: ContrastResult['level'];
  if (ratio >= 7) level = 'AAA';
  else if (ratio >= 4.5) level = 'AA';
  else if (ratio >= 3) level = 'A';
  else level = 'FAIL';
  
  return {
    ratio,
    level,
    passesNormal: ratio >= 4.5,
    passesLarge: ratio >= 3,
  };
};

// Calculate relative luminance for WCAG contrast calculations
export const getRelativeLuminance = (rgb: { r: number; g: number; b: number }): number => {
  const { r, g, b } = rgb;
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

// Get WCAG level from contrast ratio
export const getWCAGLevel = (ratio: number): string => {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'A';
  return 'FAIL';
};

// Calculate color distance in RGB space
export const colorDistance = (
  rgb1: { r: number; g: number; b: number }, 
  rgb2: { r: number; g: number; b: number }
): number => {
  return Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  );
};

// Get hue from RGB values
export const getHue = (rgb: { r: number; g: number; b: number }): number => {
  const { r, g, b } = rgb;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  
  if (delta === 0) return 0;
  
  let hue = 0;
  if (max === r) hue = ((g - b) / delta) % 6;
  else if (max === g) hue = (b - r) / delta + 2;
  else hue = (r - g) / delta + 4;
  
  return (hue * 60 + 360) % 360;
};

// Generate high contrast color
export const generateHighContrastColor = (foreground: string, background: string): string => {
  const bgRgb = optimizedHexToRgb(background);
  const fgRgb = optimizedHexToRgb(foreground);
  
  if (!bgRgb || !fgRgb) return foreground; // Return original if invalid
  
  const bgLuminance = getRelativeLuminance(bgRgb);
  
  // If background is light, make foreground darker; if dark, make lighter
  const factor = bgLuminance > 0.5 ? 0.3 : 2.5;
  
  const adjustedRgb = {
    r: Math.max(0, Math.min(255, Math.round(fgRgb.r * factor))),
    g: Math.max(0, Math.min(255, Math.round(fgRgb.g * factor))),
    b: Math.max(0, Math.min(255, Math.round(fgRgb.b * factor))),
  };
  
  return `#${adjustedRgb.r.toString(16).padStart(2, '0')}${adjustedRgb.g.toString(16).padStart(2, '0')}${adjustedRgb.b.toString(16).padStart(2, '0')}`;
};

// Accessibility severity levels
export type AccessibilitySeverity = 'low' | 'medium' | 'high' | 'critical';

// Get severity color for UI display
export const getSeverityColor = (severity: AccessibilitySeverity): string => {
  const colors = {
    low: '#27ae60',    // Green
    medium: '#f39c12', // Yellow
    high: '#e67e22',   // Orange
    critical: '#e74c3c', // Red
  };
  return colors[severity];
};

// Get severity icon for UI display
export const getSeverityIcon = (severity: AccessibilitySeverity): string => {
  const icons = {
    low: '💡',
    medium: '⚠️',
    high: '🚨',
    critical: '🔴',
  };
  return icons[severity];
};

// Get level color for WCAG compliance display
export const getLevelColor = (level: ContrastResult['level']): string => {
  const colors = {
    AAA: '#27ae60',  // Green
    AA: '#27ae60',   // Green
    A: '#f39c12',    // Yellow
    FAIL: '#e74c3c', // Red
  };
  return colors[level];
};

// Accessibility utility constants
export const ACCESSIBILITY_CONSTANTS = {
  MIN_CONTRAST_NORMAL: 4.5,
  MIN_CONTRAST_LARGE: 3.0,
  MIN_CONTRAST_AAA: 7.0,
  MIN_TOUCH_TARGET: 44, // iOS/Android accessibility standard
  COMFORTABLE_TOUCH_TARGET: 48,
  LARGE_TOUCH_TARGET: 56,
} as const;

// Export all utilities
export const AccessibilityUtils = {
  calculateContrastRatio,
  getRelativeLuminance,
  getWCAGLevel,
  colorDistance,
  getHue,
  generateHighContrastColor,
  getSeverityColor,
  getSeverityIcon,
  getLevelColor,
} as const;
