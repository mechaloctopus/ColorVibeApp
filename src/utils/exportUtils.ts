import { Platform } from 'react-native';

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
// View shot import with fallback
let captureRef: any = null;

try {
  const viewShotModule = require('react-native-view-shot');
  captureRef = viewShotModule.captureRef;
} catch (error) {
  console.warn('[Export Utils] react-native-view-shot not available, using fallback');
  captureRef = async () => {
    console.warn('Screenshot capture not available - install react-native-view-shot');
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  };
}
import { Palette } from '../store/slices/paletteSlice';
import { hslToRgb, rgbToHex, hexToRgb, rgbToCmyk, rgbToLab } from './colorEngine';

export interface PaletteExportOptions {
  includeColorCodes: boolean;
  includeHarmonyInfo: boolean;
  format: 'png' | 'jpg';
  quality: number; // 0-1
  width: number;
  height: number;
}

// Generate SVG content for palette sheet
export function generatePaletteSheetSVG(
  palette: Palette,
  options: PaletteExportOptions
): string {
  const { width, height } = options;
  const colorCount = palette.colors.length;
  const swatchSize = Math.min(width / colorCount, height * 0.6);
  const startX = (width - (swatchSize * colorCount)) / 2;
  const swatchY = height * 0.2;

  let svgContent = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .title { font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; text-anchor: middle; }
          .subtitle { font-family: Arial, sans-serif; font-size: 14px; text-anchor: middle; fill: #666; }
          .color-code { font-family: 'Courier New', monospace; font-size: 10px; text-anchor: middle; }
          .color-name { font-family: Arial, sans-serif; font-size: 12px; text-anchor: middle; font-weight: bold; }
        </style>
      </defs>

      <!-- Background -->
      <rect width="${width}" height="${height}" fill="white"/>

      <!-- Title -->
      <text x="${width / 2}" y="30" class="title">${palette.name}</text>
      <text x="${width / 2}" y="50" class="subtitle">
        ${palette.type.charAt(0).toUpperCase() + palette.type.slice(1)} Palette
        ${palette.musicalMode ? ` • ${palette.musicalMode.charAt(0).toUpperCase() + palette.musicalMode.slice(1)} Mode` : ''}
      </text>
  `;

  // Draw color swatches
  palette.colors.forEach((color, index) => {
    const x = startX + (index * swatchSize);
    const rgb = hexToRgb(color);

    if (rgb) {
      // Color swatch
      svgContent += `
        <rect x="${x}" y="${swatchY}" width="${swatchSize}" height="${swatchSize}"
              fill="${color}" stroke="#333" stroke-width="1"/>
      `;

      if (options.includeColorCodes) {
        const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
        const lab = rgbToLab(rgb.r, rgb.g, rgb.b);

        // Color codes
        const textY = swatchY + swatchSize + 20;
        svgContent += `
          <text x="${x + swatchSize / 2}" y="${textY}" class="color-code">${color.toUpperCase()}</text>
          <text x="${x + swatchSize / 2}" y="${textY + 15}" class="color-code">RGB(${rgb.r},${rgb.g},${rgb.b})</text>
          <text x="${x + swatchSize / 2}" y="${textY + 30}" class="color-code">CMYK(${cmyk.c},${cmyk.m},${cmyk.y},${cmyk.k})</text>
          <text x="${x + swatchSize / 2}" y="${textY + 45}" class="color-code">LAB(${lab.l},${lab.a},${lab.b})</text>
        `;
      }
    }
  });

  // Add harmony information if requested
  if (options.includeHarmonyInfo && palette.colors.length > 0) {
    const baseColor = palette.colors[0];
    const rgb = hexToRgb(baseColor);

    if (rgb) {
      const harmonyY = height - 100;
      svgContent += `
        <text x="20" y="${harmonyY}" class="subtitle">Color Harmony Information:</text>
        <text x="20" y="${harmonyY + 20}" class="color-code">Base Color: ${baseColor.toUpperCase()}</text>
        <text x="20" y="${harmonyY + 35}" class="color-code">Palette Type: ${palette.type}</text>
        <text x="20" y="${harmonyY + 50}" class="color-code">Musical Mode: ${palette.musicalMode || 'None'}</text>
        <text x="20" y="${harmonyY + 65}" class="color-code">Created: ${new Date(palette.createdAt).toLocaleDateString()}</text>
      `;
    }
  }

  svgContent += '</svg>';
  return svgContent;
}

// Export palette as PNG
export async function exportPaletteAsPNG(
  palette: Palette,
  options: PaletteExportOptions = {
    includeColorCodes: true,
    includeHarmonyInfo: true,
    format: 'png',
    quality: 1.0,
    width: 800,
    height: 600,
  }
): Promise<string | null> {
  try {
    // Generate SVG content
    const svgContent = generatePaletteSheetSVG(palette, options);

    // On web, return a data URI (no FileSystem)
    if (Platform.OS === 'web') {
      const dataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
      return dataUri;
    }

    // On native, write to FileSystem
    const baseDir = FileSystem.documentDirectory || FileSystem.cacheDirectory || '';
    const svgUri = baseDir + `palette_${palette.id}.svg`;
    await FileSystem.writeAsStringAsync(svgUri, svgContent);

    return svgUri;
  } catch (error) {
    console.error('Error exporting palette:', error);
    return null;
  }
}

// Share palette
export async function sharePalette(palette: Palette, options?: PaletteExportOptions): Promise<void> {
  try {
    const uri = await exportPaletteAsPNG(palette, options);
    if (uri && await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: `Share ${palette.name} Palette`,
      });
    }
  } catch (error) {
    console.error('Error sharing palette:', error);
  }
}

// Save palette to device
export async function savePaletteToDevice(palette: Palette, options?: PaletteExportOptions): Promise<string | null> {
  try {
    const uri = await exportPaletteAsPNG(palette, options);
    if (!uri) return null;

    // On web, trigger a download using an anchor element
    if (Platform.OS === 'web') {
      try {
        if (typeof document !== 'undefined') {
          const link = document.createElement('a');
          link.href = uri;
          link.download = `palette_${palette.name}_${Date.now()}.svg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (e) {
        console.warn('Web download fallback failed:', e);
      }
      return uri;
    }

    // On native, move to a permanent location
    const baseDir = FileSystem.documentDirectory || FileSystem.cacheDirectory || '';
    const permanentUri = baseDir + `ColorVibePalettes/palette_${palette.name}_${Date.now()}.png`;

    // Ensure directory exists
    const dirUri = baseDir + 'ColorVibePalettes/';
    const dirInfo = await FileSystem.getInfoAsync(dirUri);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dirUri, { intermediates: true });
    }

    await FileSystem.copyAsync({
      from: uri,
      to: permanentUri,
    });

    return permanentUri;
  } catch (error) {
    console.error('Error saving palette to device:', error);
    return null;
  }
}

// Generate palette data as JSON
export function exportPaletteAsJSON(palette: Palette): string {
  const exportData = {
    ...palette,
    exportedAt: new Date().toISOString(),
    colorDetails: palette.colors.map(color => {
      const rgb = hexToRgb(color);
      if (rgb) {
        return {
          hex: color,
          rgb: rgb,
          cmyk: rgbToCmyk(rgb.r, rgb.g, rgb.b),
          lab: rgbToLab(rgb.r, rgb.g, rgb.b),
        };
      }
      return { hex: color };
    }),
  };

  return JSON.stringify(exportData, null, 2);
}

// Generate CSS variables from palette
export function exportPaletteAsCSS(palette: Palette): string {
  let css = `/* ${palette.name} - ${palette.type} palette */\n:root {\n`;

  palette.colors.forEach((color, index) => {
    const colorName = `color-${index + 1}`;
    css += `  --${colorName}: ${color};\n`;

    const rgb = hexToRgb(color);
    if (rgb) {
      css += `  --${colorName}-rgb: ${rgb.r}, ${rgb.g}, ${rgb.b};\n`;
    }
  });

  css += '}\n\n';

  // Add utility classes
  palette.colors.forEach((color, index) => {
    const colorName = `color-${index + 1}`;
    css += `.bg-${colorName} { background-color: var(--${colorName}); }\n`;
    css += `.text-${colorName} { color: var(--${colorName}); }\n`;
    css += `.border-${colorName} { border-color: var(--${colorName}); }\n\n`;
  });

  return css;
}

// Generate SCSS variables from palette
export function exportPaletteAsSCSS(palette: Palette): string {
  let scss = `// ${palette.name} - ${palette.type} palette\n`;

  palette.colors.forEach((color, index) => {
    const colorName = `color-${index + 1}`;
    scss += `$${colorName}: ${color};\n`;

    const rgb = hexToRgb(color);
    if (rgb) {
      scss += `$${colorName}-rgb: ${rgb.r}, ${rgb.g}, ${rgb.b};\n`;
    }
  });

  return scss;
}
