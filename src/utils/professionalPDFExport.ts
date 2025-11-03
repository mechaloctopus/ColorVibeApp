import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { hexToRgb, rgbToCmyk, rgbToLab, hslToRgb, rgbToHsl } from './colorEngine';

export interface PaletteExportData {
  name: string;
  colors: string[];
  paletteType: string;
  musicalMode?: string;
  createdAt: number;
  metadata?: {
    description?: string;
    tags?: string[];
    author?: string;
  };
}

export interface PDFExportOptions {
  layout: 'grid' | 'circular' | 'linear' | 'professional';
  includeColorCodes: boolean;
  includeMetadata: boolean;
  colorAccuracy: 'sRGB' | 'Adobe RGB' | 'CMYK';
  resolution: 150 | 300 | 600; // DPI
  paperSize: 'A4' | 'Letter' | 'A3' | 'Custom';
  customSize?: { width: number; height: number }; // in mm
}

export interface ColorAnalysis {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  cmyk: { c: number; m: number; y: number; k: number };
  lab: { l: number; a: number; b: number };
  temperature: number;
  luminance: number;
}

// Generate comprehensive color analysis
export function analyzeColor(hex: string, hsl: { h: number; s: number; l: number }): ColorAnalysis {
  const rgb = hexToRgb(hex) || { r: 0, g: 0, b: 0 };
  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
  const lab = rgbToLab(rgb.r, rgb.g, rgb.b);
  
  // Calculate color temperature (simplified)
  const temperature = calculateColorTemperature(rgb);
  
  // Calculate relative luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  
  return {
    hex,
    rgb,
    hsl: {
      h: Math.round(hsl.h),
      s: Math.round(hsl.s),
      l: Math.round(hsl.l),
    },
    cmyk,
    lab,
    temperature,
    luminance,
  };
}

// Calculate color temperature in Kelvin
function calculateColorTemperature(rgb: { r: number; g: number; b: number }): number {
  // Simplified color temperature calculation
  // This is a basic approximation - real calculation is more complex
  const { r, g, b } = rgb;
  
  // Convert to normalized values
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  
  // Simple temperature estimation based on RGB ratios
  const ratio = (rNorm - bNorm) / (rNorm + bNorm + 0.001);
  
  // Map ratio to temperature range (2000K - 10000K)
  const temperature = 6500 + (ratio * 2000);
  
  return Math.max(2000, Math.min(10000, Math.round(temperature)));
}

// Generate SVG content for professional PDF
export function generateProfessionalPaletteSVG(
  paletteData: PaletteExportData,
  options: PDFExportOptions
): string {
  const { width: pageWidth, height: pageHeight } = getPaperDimensions(options.paperSize, options.customSize);
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  const contentHeight = pageHeight - (margin * 2);
  
  // Analyze all colors
  const colorAnalyses = paletteData.colors.map((color, index) => {
    // Convert hex to HSL for analysis
    const rgb = hexToRgb(color) || { r: 0, g: 0, b: 0 };
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    return analyzeColor(color, hsl);
  });

  let svgContent = `
    <svg width="${pageWidth}mm" height="${pageHeight}mm" viewBox="0 0 ${pageWidth} ${pageHeight}" 
         xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .title { font-family: 'Helvetica', sans-serif; font-size: 8px; font-weight: bold; }
          .subtitle { font-family: 'Helvetica', sans-serif; font-size: 6px; fill: #666; }
          .color-code { font-family: 'Courier', monospace; font-size: 4px; }
          .metadata { font-family: 'Helvetica', sans-serif; font-size: 5px; fill: #888; }
          .section-title { font-family: 'Helvetica', sans-serif; font-size: 6px; font-weight: bold; }
        </style>
      </defs>
      
      <!-- Background -->
      <rect width="${pageWidth}" height="${pageHeight}" fill="white"/>
      
      <!-- Header -->
      <text x="${pageWidth / 2}" y="${margin + 10}" class="title" text-anchor="middle">
        ${paletteData.name}
      </text>
      <text x="${pageWidth / 2}" y="${margin + 18}" class="subtitle" text-anchor="middle">
        ${paletteData.paletteType.charAt(0).toUpperCase() + paletteData.paletteType.slice(1)} Palette
        ${paletteData.musicalMode ? ` • ${paletteData.musicalMode.charAt(0).toUpperCase() + paletteData.musicalMode.slice(1)} Mode` : ''}
      </text>
  `;

  // Render based on layout
  switch (options.layout) {
    case 'professional':
      svgContent += renderProfessionalLayout(colorAnalyses, margin, contentWidth, contentHeight, options);
      break;
    case 'grid':
      svgContent += renderGridLayout(colorAnalyses, margin, contentWidth, contentHeight, options);
      break;
    case 'circular':
      svgContent += renderCircularLayout(colorAnalyses, margin, contentWidth, contentHeight, options);
      break;
    case 'linear':
      svgContent += renderLinearLayout(colorAnalyses, margin, contentWidth, contentHeight, options);
      break;
  }

  // Add metadata if requested
  if (options.includeMetadata) {
    svgContent += renderMetadata(paletteData, margin, pageHeight, options);
  }

  svgContent += '</svg>';
  return svgContent;
}

// Professional layout with detailed color information
function renderProfessionalLayout(
  colors: ColorAnalysis[],
  margin: number,
  contentWidth: number,
  contentHeight: number,
  options: PDFExportOptions
): string {
  let content = '';
  const startY = margin + 35;
  const colorHeight = (contentHeight - 50) / colors.length;
  
  colors.forEach((color, index) => {
    const y = startY + (index * colorHeight);
    const swatchSize = Math.min(colorHeight * 0.6, 25);
    
    // Color swatch
    content += `
      <rect x="${margin + 10}" y="${y}" width="${swatchSize}" height="${swatchSize}" 
            fill="${color.hex}" stroke="#333" stroke-width="0.5"/>
    `;
    
    if (options.includeColorCodes) {
      const textX = margin + 20 + swatchSize;
      
      // Color codes in columns
      content += `
        <text x="${textX}" y="${y + 8}" class="color-code">${color.hex.toUpperCase()}</text>
        <text x="${textX}" y="${y + 14}" class="color-code">RGB(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})</text>
        <text x="${textX}" y="${y + 20}" class="color-code">HSL(${color.hsl.h}°, ${color.hsl.s}%, ${color.hsl.l}%)</text>
        
        <text x="${textX + 80}" y="${y + 8}" class="color-code">CMYK(${color.cmyk.c}, ${color.cmyk.m}, ${color.cmyk.y}, ${color.cmyk.k})</text>
        <text x="${textX + 80}" y="${y + 14}" class="color-code">LAB(${color.lab.l}, ${color.lab.a}, ${color.lab.b})</text>
        <text x="${textX + 80}" y="${y + 20}" class="color-code">${color.temperature}K • ${Math.round(color.luminance * 100)}% Lum</text>
      `;
    }
  });
  
  return content;
}

// Grid layout for color swatches
function renderGridLayout(
  colors: ColorAnalysis[],
  margin: number,
  contentWidth: number,
  contentHeight: number,
  options: PDFExportOptions
): string {
  let content = '';
  const startY = margin + 35;
  const availableHeight = contentHeight - 50;
  
  const cols = Math.ceil(Math.sqrt(colors.length));
  const rows = Math.ceil(colors.length / cols);
  const swatchWidth = contentWidth / cols;
  const swatchHeight = availableHeight / rows;
  
  colors.forEach((color, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = margin + (col * swatchWidth);
    const y = startY + (row * swatchHeight);
    
    // Color swatch
    content += `
      <rect x="${x + 5}" y="${y + 5}" width="${swatchWidth - 10}" height="${swatchHeight - 25}" 
            fill="${color.hex}" stroke="#333" stroke-width="0.5"/>
    `;
    
    if (options.includeColorCodes) {
      content += `
        <text x="${x + swatchWidth/2}" y="${y + swatchHeight - 15}" class="color-code" text-anchor="middle">
          ${color.hex.toUpperCase()}
        </text>
        <text x="${x + swatchWidth/2}" y="${y + swatchHeight - 8}" class="color-code" text-anchor="middle">
          RGB(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})
        </text>
      `;
    }
  });
  
  return content;
}

// Circular layout mimicking the app interface
function renderCircularLayout(
  colors: ColorAnalysis[],
  margin: number,
  contentWidth: number,
  contentHeight: number,
  options: PDFExportOptions
): string {
  let content = '';
  const centerX = margin + contentWidth / 2;
  const centerY = margin + 35 + (contentHeight - 50) / 2;
  const radius = Math.min(contentWidth, contentHeight - 50) * 0.3;
  
  colors.forEach((color, index) => {
    const angle = (index * 2 * Math.PI) / colors.length - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    const swatchSize = 15;
    
    // Color swatch
    content += `
      <circle cx="${x}" cy="${y}" r="${swatchSize}" 
              fill="${color.hex}" stroke="#333" stroke-width="0.5"/>
    `;
    
    if (options.includeColorCodes) {
      const textX = x + (Math.cos(angle) * (swatchSize + 15));
      const textY = y + (Math.sin(angle) * (swatchSize + 15));
      
      content += `
        <text x="${textX}" y="${textY}" class="color-code" text-anchor="middle">
          ${color.hex.toUpperCase()}
        </text>
      `;
    }
  });
  
  return content;
}

// Linear layout for simple color strips
function renderLinearLayout(
  colors: ColorAnalysis[],
  margin: number,
  contentWidth: number,
  contentHeight: number,
  options: PDFExportOptions
): string {
  let content = '';
  const startY = margin + 35;
  const swatchWidth = contentWidth / colors.length;
  const swatchHeight = Math.min(contentHeight - 80, 60);
  
  colors.forEach((color, index) => {
    const x = margin + (index * swatchWidth);
    
    // Color swatch
    content += `
      <rect x="${x}" y="${startY}" width="${swatchWidth}" height="${swatchHeight}" 
            fill="${color.hex}" stroke="#333" stroke-width="0.5"/>
    `;
    
    if (options.includeColorCodes) {
      content += `
        <text x="${x + swatchWidth/2}" y="${startY + swatchHeight + 15}" class="color-code" text-anchor="middle">
          ${color.hex.toUpperCase()}
        </text>
        <text x="${x + swatchWidth/2}" y="${startY + swatchHeight + 25}" class="color-code" text-anchor="middle">
          RGB(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})
        </text>
      `;
    }
  });
  
  return content;
}

// Render metadata section
function renderMetadata(
  paletteData: PaletteExportData,
  margin: number,
  pageHeight: number,
  options: PDFExportOptions
): string {
  const y = pageHeight - margin - 20;
  
  return `
    <text x="${margin}" y="${y}" class="metadata">
      Created: ${new Date(paletteData.createdAt).toLocaleDateString()}
    </text>
    <text x="${margin}" y="${y + 8}" class="metadata">
      Colors: ${paletteData.colors.length} • Type: ${paletteData.paletteType}
      ${paletteData.musicalMode ? ` • Mode: ${paletteData.musicalMode}` : ''}
    </text>
    <text x="${margin}" y="${y + 16}" class="metadata">
      Generated by Color Vibe Workstation
    </text>
  `;
}

// Get paper dimensions in mm
function getPaperDimensions(paperSize: string, customSize?: { width: number; height: number }) {
  switch (paperSize) {
    case 'A4':
      return { width: 210, height: 297 };
    case 'Letter':
      return { width: 216, height: 279 };
    case 'A3':
      return { width: 297, height: 420 };
    case 'Custom':
      return customSize || { width: 210, height: 297 };
    default:
      return { width: 210, height: 297 };
  }
}

// Export palette as professional PDF
export async function exportProfessionalPDF(
  paletteData: PaletteExportData,
  options: PDFExportOptions = {
    layout: 'professional',
    includeColorCodes: true,
    includeMetadata: true,
    colorAccuracy: 'sRGB',
    resolution: 300,
    paperSize: 'A4',
  }
): Promise<string | null> {
  try {
    // Generate SVG content
    const svgContent = generateProfessionalPaletteSVG(paletteData, options);
    
    // Create temporary SVG file
    const svgUri = FileSystem.documentDirectory + `palette_${paletteData.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.svg`;
    await FileSystem.writeAsStringAsync(svgUri, svgContent);
    
    // In a production app, you would convert SVG to PDF here
    // For now, return the SVG URI
    return svgUri;
  } catch (error) {
    console.error('Error exporting professional PDF:', error);
    return null;
  }
}

// Share professional PDF
export async function shareProfessionalPDF(
  paletteData: PaletteExportData,
  options?: PDFExportOptions
): Promise<void> {
  try {
    const uri = await exportProfessionalPDF(paletteData, options);
    if (uri && await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'image/svg+xml',
        dialogTitle: `Share ${paletteData.name} Professional Palette`,
      });
    }
  } catch (error) {
    console.error('Error sharing professional PDF:', error);
  }
}
