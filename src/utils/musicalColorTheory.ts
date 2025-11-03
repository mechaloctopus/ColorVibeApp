// Musical Color Theory - Complete Implementation of 7 Musical Modes
// Each semitone = 30° hue shift (360° / 12 semitones)

export interface MusicalMode {
  name: string;
  intervals: number[]; // Semitone intervals from root
  emotion: string;
  energy: 'low' | 'medium' | 'high' | 'intense' | 'expansive';
  description: string;
  colorCharacteristics: string;
  examples: string[];
}

export const MUSICAL_MODES: Record<string, MusicalMode> = {
  ionian: {
    name: 'Ionian (Major)',
    intervals: [0, 2, 4, 5, 7, 9, 11], // W-W-H-W-W-W-H
    emotion: 'bright, happy, optimistic',
    energy: 'high',
    description: 'The classic major scale - bright, stable, and uplifting',
    colorCharacteristics: 'Vibrant, saturated colors with high luminance',
    examples: ['Sunrise palettes', 'Spring colors', 'Celebration themes'],
  },
  dorian: {
    name: 'Dorian',
    intervals: [0, 2, 3, 5, 7, 9, 10], // W-H-W-W-W-H-W
    emotion: 'sophisticated, contemplative, bittersweet',
    energy: 'medium',
    description: 'Minor with a raised 6th - sophisticated and jazzy',
    colorCharacteristics: 'Rich, complex colors with subtle warmth',
    examples: ['Autumn leaves', 'Jazz club ambiance', 'Vintage aesthetics'],
  },
  phrygian: {
    name: 'Phrygian',
    intervals: [0, 1, 3, 5, 7, 8, 10], // H-W-W-W-H-W-W
    emotion: 'exotic, mysterious, intense',
    energy: 'intense',
    description: 'Minor with a lowered 2nd - dark and exotic',
    colorCharacteristics: 'Deep, mysterious colors with low saturation',
    examples: ['Desert landscapes', 'Ancient civilizations', 'Mystical themes'],
  },
  lydian: {
    name: 'Lydian',
    intervals: [0, 2, 4, 6, 7, 9, 11], // W-W-W-H-W-W-H
    emotion: 'ethereal, dreamy, floating',
    energy: 'expansive',
    description: 'Major with a raised 4th - dreamy and ethereal',
    colorCharacteristics: 'Light, airy colors with high luminance and soft saturation',
    examples: ['Cloud formations', 'Celestial themes', 'Fantasy landscapes'],
  },
  mixolydian: {
    name: 'Mixolydian',
    intervals: [0, 2, 4, 5, 7, 9, 10], // W-W-H-W-W-H-W
    emotion: 'warm, grounded, bluesy',
    energy: 'medium',
    description: 'Major with a lowered 7th - bluesy and grounded',
    colorCharacteristics: 'Warm, earthy colors with medium saturation',
    examples: ['Earth tones', 'Folk art', 'Rustic themes'],
  },
  aeolian: {
    name: 'Aeolian (Natural Minor)',
    intervals: [0, 2, 3, 5, 7, 8, 10], // W-H-W-W-H-W-W
    emotion: 'melancholic, introspective, deep',
    energy: 'low',
    description: 'The natural minor scale - sad, introspective, and emotional',
    colorCharacteristics: 'Muted, desaturated colors with lower luminance',
    examples: ['Rainy days', 'Melancholic art', 'Introspective themes'],
  },
  locrian: {
    name: 'Locrian',
    intervals: [0, 1, 3, 5, 6, 8, 10], // H-W-W-H-W-W-W
    emotion: 'dissonant, unstable, experimental',
    energy: 'intense',
    description: 'Diminished and unstable - rarely used but highly expressive',
    colorCharacteristics: 'Unusual, clashing colors with experimental combinations',
    examples: ['Abstract art', 'Avant-garde design', 'Experimental themes'],
  },
};

// Generate color palette based on musical mode
export function generateMusicalPalette(
  rootHue: number,
  mode: string,
  saturation: number = 70,
  lightness: number = 50
): string[] {
  const modeData = MUSICAL_MODES[mode.toLowerCase()];
  if (!modeData) {
    throw new Error(`Unknown musical mode: ${mode}`);
  }

  const palette: string[] = [];
  
  // Apply mode characteristics to color properties
  const adjustedSaturation = adjustSaturationForMode(saturation, modeData);
  const adjustedLightness = adjustLightnessForMode(lightness, modeData);

  // Generate colors for each interval in the mode
  modeData.intervals.forEach((interval, index) => {
    // Each semitone = 30° hue shift
    const hue = (rootHue + (interval * 30)) % 360;
    
    // Apply subtle variations based on interval position
    const intervalSaturation = adjustedSaturation + getIntervalSaturationAdjustment(interval, modeData);
    const intervalLightness = adjustedLightness + getIntervalLightnessAdjustment(interval, modeData);
    
    // Ensure values stay within valid ranges
    const finalSaturation = Math.max(0, Math.min(100, intervalSaturation));
    const finalLightness = Math.max(0, Math.min(100, intervalLightness));
    
    const color = hslToHex(hue, finalSaturation, finalLightness);
    palette.push(color);
  });

  return palette;
}

// Adjust saturation based on mode characteristics
function adjustSaturationForMode(baseSaturation: number, mode: MusicalMode): number {
  switch (mode.energy) {
    case 'high':
      return Math.min(100, baseSaturation + 15); // More vibrant
    case 'intense':
      return Math.min(100, baseSaturation + 10); // Slightly more intense
    case 'expansive':
      return Math.max(20, baseSaturation - 10); // Softer, more ethereal
    case 'low':
      return Math.max(20, baseSaturation - 20); // More muted
    case 'medium':
    default:
      return baseSaturation; // Keep original
  }
}

// Adjust lightness based on mode characteristics
function adjustLightnessForMode(baseLightness: number, mode: MusicalMode): number {
  switch (mode.name) {
    case 'Ionian (Major)':
      return Math.min(80, baseLightness + 10); // Brighter
    case 'Lydian':
      return Math.min(85, baseLightness + 15); // Very light and airy
    case 'Aeolian (Natural Minor)':
      return Math.max(25, baseLightness - 15); // Darker, more somber
    case 'Phrygian':
      return Math.max(20, baseLightness - 20); // Very dark and mysterious
    case 'Locrian':
      return Math.max(15, baseLightness - 25); // Darkest, most unstable
    case 'Dorian':
      return Math.max(30, baseLightness - 5); // Slightly darker than major
    case 'Mixolydian':
      return baseLightness; // Keep original warmth
    default:
      return baseLightness;
  }
}

// Get saturation adjustment for specific intervals
function getIntervalSaturationAdjustment(interval: number, mode: MusicalMode): number {
  // Tonic (root) and dominant (7 semitones) get full saturation
  if (interval === 0 || interval === 7) return 0;
  
  // Third and fifth get slight boost for stability
  if (interval === 4 || interval === 5) return 5;
  
  // Other intervals get slight reduction for subtlety
  return -3;
}

// Get lightness adjustment for specific intervals
function getIntervalLightnessAdjustment(interval: number, mode: MusicalMode): number {
  // Tonic (root) stays at base lightness
  if (interval === 0) return 0;
  
  // Dominant (7 semitones) gets slight boost
  if (interval === 7) return 3;
  
  // Leading tone (11 semitones) gets reduction for tension
  if (interval === 11) return -5;
  
  // Subtle variations for other intervals
  return Math.sin(interval * Math.PI / 6) * 2;
}

// Convert HSL to Hex (utility function)
function hslToHex(h: number, s: number, l: number): string {
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

// Analyze musical relationships between colors
export function analyzeMusicalHarmony(colors: string[]): {
  mode: string | null;
  confidence: number;
  intervals: number[];
  analysis: string;
} {
  if (colors.length < 3) {
    return {
      mode: null,
      confidence: 0,
      intervals: [],
      analysis: 'Need at least 3 colors to analyze musical harmony',
    };
  }

  // Convert colors to hue values
  const hues = colors.map(color => hexToHue(color));
  
  // Calculate intervals between hues (in semitones)
  const rootHue = hues[0];
  const intervals = hues.map(hue => {
    const diff = (hue - rootHue + 360) % 360;
    return Math.round(diff / 30); // Convert degrees to semitones
  }).sort((a, b) => a - b);

  // Find best matching mode
  let bestMatch = { mode: '', confidence: 0 };
  
  Object.entries(MUSICAL_MODES).forEach(([modeName, modeData]) => {
    const confidence = calculateModeConfidence(intervals, modeData.intervals);
    if (confidence > bestMatch.confidence) {
      bestMatch = { mode: modeName, confidence };
    }
  });

  const analysis = bestMatch.confidence > 70 
    ? `Strong ${MUSICAL_MODES[bestMatch.mode].name} characteristics detected`
    : bestMatch.confidence > 40
    ? `Moderate ${MUSICAL_MODES[bestMatch.mode].name} influence`
    : 'No clear musical mode pattern detected';

  return {
    mode: bestMatch.confidence > 40 ? bestMatch.mode : null,
    confidence: bestMatch.confidence,
    intervals,
    analysis,
  };
}

// Calculate how well intervals match a mode
function calculateModeConfidence(actualIntervals: number[], modeIntervals: number[]): number {
  const matches = actualIntervals.filter(interval => modeIntervals.includes(interval));
  const confidence = (matches.length / Math.max(actualIntervals.length, modeIntervals.length)) * 100;
  return Math.round(confidence);
}

// Convert hex color to hue value
function hexToHue(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  if (delta === 0) return 0;

  let hue;
  if (max === r) hue = ((g - b) / delta) % 6;
  else if (max === g) hue = (b - r) / delta + 2;
  else hue = (r - g) / delta + 4;

  return Math.round(hue * 60);
}

// Get mode recommendations based on color context
export function getMusicalModeRecommendations(context: 'bright' | 'dark' | 'warm' | 'cool' | 'neutral'): string[] {
  switch (context) {
    case 'bright':
      return ['ionian', 'lydian', 'mixolydian'];
    case 'dark':
      return ['aeolian', 'phrygian', 'locrian'];
    case 'warm':
      return ['mixolydian', 'dorian', 'ionian'];
    case 'cool':
      return ['aeolian', 'phrygian', 'lydian'];
    case 'neutral':
    default:
      return ['dorian', 'mixolydian', 'ionian'];
  }
}
