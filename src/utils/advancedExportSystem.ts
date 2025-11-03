// Advanced Professional Export System
// Multiple formats, templates, and professional-grade outputs

import { optimizedHexToRgb, optimizedRgbToHsl } from './optimizedColorEngine';
import { PerceptualColorEngine } from './perceptualColorEngine';

// Export Format Types
export type ExportFormat = 
  | 'json' | 'css' | 'scss' | 'less' | 'stylus'
  | 'swift' | 'kotlin' | 'xml' | 'yaml'
  | 'adobe-ase' | 'sketch-clr' | 'figma-json'
  | 'pdf-swatch' | 'pdf-guide' | 'png-palette'
  | 'svg-palette' | 'procreate-swatches';

// Export Template Types
export type ExportTemplate = 
  | 'minimal' | 'detailed' | 'brand-guide' | 'developer'
  | 'designer' | 'print-ready' | 'web-optimized'
  | 'mobile-app' | 'presentation' | 'documentation';

// Export Configuration
export interface ExportConfig {
  format: ExportFormat;
  template: ExportTemplate;
  includeMetadata: boolean;
  includeAnalysis: boolean;
  includeAccessibility: boolean;
  includePerceptual: boolean;
  compression: 'none' | 'light' | 'medium' | 'heavy';
  quality: 'draft' | 'standard' | 'high' | 'print';
  customFields?: Record<string, any>;
}

// Palette Export Data
export interface PaletteExportData {
  name: string;
  description?: string;
  colors: ColorExportData[];
  metadata: {
    createdAt: string;
    version: string;
    source: 'color-vibe-workstation';
    generator: string;
    tags?: string[];
  };
  analysis?: {
    harmony: string;
    temperature: 'warm' | 'cool' | 'neutral';
    accessibility: AccessibilityData[];
    perceptual: PerceptualData[];
  };
}

export interface ColorExportData {
  name?: string;
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  cmyk?: { c: number; m: number; y: number; k: number };
  lab?: { l: number; a: number; b: number };
  pantone?: string;
  accessibility?: {
    contrastRatio?: number;
    wcagLevel?: string;
    colorBlindSafe?: boolean;
  };
  perceptual?: {
    lightness: number;
    chroma: number;
    hue: number;
  };
  usage?: string[];
  notes?: string;
}

interface AccessibilityData {
  foreground: string;
  background: string;
  contrastRatio: number;
  wcagLevel: string;
  passes: {
    normalText: boolean;
    largeText: boolean;
  };
}

interface PerceptualData {
  color: string;
  appearance: {
    lightness: number;
    chroma: number;
    hue: number;
  };
  culturalMeaning?: string[];
}

// Advanced Export System
export class AdvancedExportSystem {
  // Main export function
  static async exportPalette(
    colors: string[],
    config: ExportConfig,
    paletteInfo: Partial<PaletteExportData> = {}
  ): Promise<{ content: string; filename: string; mimeType: string }> {
    
    // Prepare export data
    const exportData = await this.prepareExportData(colors, config, paletteInfo);
    
    // Generate content based on format
    const content = await this.generateContent(exportData, config);
    
    // Generate filename
    const filename = this.generateFilename(exportData.name, config.format);
    
    // Get MIME type
    const mimeType = this.getMimeType(config.format);
    
    return { content, filename, mimeType };
  }
  
  // Prepare comprehensive export data
  private static async prepareExportData(
    colors: string[],
    config: ExportConfig,
    paletteInfo: Partial<PaletteExportData>
  ): Promise<PaletteExportData> {
    
    const colorData: ColorExportData[] = await Promise.all(
      colors.map(async (color, index) => {
        const rgb = optimizedHexToRgb(color)!;
        const hsl = optimizedRgbToHsl(rgb.r, rgb.g, rgb.b);
        
        const colorExport: ColorExportData = {
          name: paletteInfo.colors?.[index]?.name || `Color ${index + 1}`,
          hex: color,
          rgb,
          hsl,
        };
        
        // Add extended color spaces if requested
        if (config.includeMetadata) {
          colorExport.cmyk = this.rgbToCmyk(rgb);
          colorExport.lab = this.rgbToLab(rgb);
          colorExport.pantone = this.findClosestPantone(color);
        }
        
        // Add accessibility analysis
        if (config.includeAccessibility) {
          colorExport.accessibility = await this.analyzeAccessibility(color);
        }
        
        // Add perceptual analysis
        if (config.includePerceptual) {
          colorExport.perceptual = await this.analyzePerceptual(color);
        }
        
        return colorExport;
      })
    );
    
    const exportData: PaletteExportData = {
      name: paletteInfo.name || 'Color Palette',
      description: paletteInfo.description,
      colors: colorData,
      metadata: {
        createdAt: new Date().toISOString(),
        version: '1.0.0',
        source: 'color-vibe-workstation',
        generator: `Advanced Export System v${this.getVersion()}`,
        tags: paletteInfo.metadata?.tags,
      },
    };
    
    // Add comprehensive analysis
    if (config.includeAnalysis) {
      exportData.analysis = {
        harmony: this.analyzeHarmony(colors),
        temperature: this.analyzeTemperature(colors),
        accessibility: await this.analyzeAllAccessibility(colors),
        perceptual: await this.analyzeAllPerceptual(colors),
      };
    }
    
    return exportData;
  }
  
  // Generate content for different formats
  private static async generateContent(data: PaletteExportData, config: ExportConfig): Promise<string> {
    switch (config.format) {
      case 'json':
        return this.generateJSON(data, config);
      case 'css':
        return this.generateCSS(data, config);
      case 'scss':
        return this.generateSCSS(data, config);
      case 'less':
        return this.generateLESS(data, config);
      case 'swift':
        return this.generateSwift(data, config);
      case 'kotlin':
        return this.generateKotlin(data, config);
      case 'xml':
        return this.generateXML(data, config);
      case 'yaml':
        return this.generateYAML(data, config);
      case 'adobe-ase':
        return this.generateAdobeASE(data, config);
      case 'sketch-clr':
        return this.generateSketchCLR(data, config);
      case 'figma-json':
        return this.generateFigmaJSON(data, config);
      case 'pdf-swatch':
        return this.generatePDFSwatch(data, config);
      case 'svg-palette':
        return this.generateSVGPalette(data, config);
      case 'procreate-swatches':
        return this.generateProcreateSwatches(data, config);
      default:
        return this.generateJSON(data, config);
    }
  }
  
  // Format-specific generators
  private static generateJSON(data: PaletteExportData, config: ExportConfig): string {
    const output = config.template === 'minimal' 
      ? { colors: data.colors.map(c => c.hex) }
      : data;
    
    return JSON.stringify(output, null, config.quality === 'draft' ? 0 : 2);
  }
  
  private static generateCSS(data: PaletteExportData, config: ExportConfig): string {
    let css = `/* ${data.name} - Generated by Color Vibe Workstation */\n`;
    css += `/* Created: ${data.metadata.createdAt} */\n\n`;
    
    if (config.template === 'minimal') {
      css += ':root {\n';
      data.colors.forEach((color, index) => {
        css += `  --color-${index + 1}: ${color.hex};\n`;
      });
      css += '}\n';
    } else {
      css += ':root {\n';
      data.colors.forEach((color) => {
        const name = this.sanitizeName(color.name || 'color');
        css += `  /* ${color.name} */\n`;
        css += `  --${name}: ${color.hex};\n`;
        css += `  --${name}-rgb: ${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b};\n`;
        css += `  --${name}-hsl: ${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%;\n`;
        if (color.usage) {
          css += `  /* Usage: ${color.usage.join(', ')} */\n`;
        }
        css += '\n';
      });
      css += '}\n';
    }
    
    return css;
  }
  
  private static generateSCSS(data: PaletteExportData, config: ExportConfig): string {
    let scss = `// ${data.name} - Generated by Color Vibe Workstation\n`;
    scss += `// Created: ${data.metadata.createdAt}\n\n`;
    
    // SCSS variables
    data.colors.forEach((color) => {
      const name = this.sanitizeName(color.name || 'color');
      scss += `$${name}: ${color.hex};\n`;
      if (config.template !== 'minimal') {
        scss += `$${name}-rgb: (${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b});\n`;
        scss += `$${name}-hsl: (${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%);\n`;
      }
    });
    
    // SCSS map
    if (config.template !== 'minimal') {
      scss += '\n$colors: (\n';
      data.colors.forEach((color, index) => {
        const name = this.sanitizeName(color.name || 'color');
        scss += `  '${name}': ${color.hex}`;
        scss += index < data.colors.length - 1 ? ',\n' : '\n';
      });
      scss += ');\n';
      
      // Helper function
      scss += '\n@function color($name) {\n';
      scss += '  @return map-get($colors, $name);\n';
      scss += '}\n';
    }
    
    return scss;
  }
  
  private static generateSwift(data: PaletteExportData, config: ExportConfig): string {
    let swift = `// ${data.name} - Generated by Color Vibe Workstation\n`;
    swift += `// Created: ${data.metadata.createdAt}\n\n`;
    swift += 'import UIKit\n\n';
    swift += `extension UIColor {\n`;
    swift += `    // MARK: - ${data.name}\n\n`;
    
    data.colors.forEach((color) => {
      const name = this.sanitizeName(color.name || 'color');
      const rgb = color.rgb;
      swift += `    static let ${name} = UIColor(red: ${(rgb.r / 255).toFixed(3)}, green: ${(rgb.g / 255).toFixed(3)}, blue: ${(rgb.b / 255).toFixed(3)}, alpha: 1.0)\n`;
    });
    
    swift += '}\n';
    return swift;
  }
  
  private static generateKotlin(data: PaletteExportData, config: ExportConfig): string {
    let kotlin = `// ${data.name} - Generated by Color Vibe Workstation\n`;
    kotlin += `// Created: ${data.metadata.createdAt}\n\n`;
    kotlin += 'import androidx.compose.ui.graphics.Color\n\n';
    kotlin += `object ${this.sanitizeName(data.name)}Colors {\n`;
    
    data.colors.forEach((color) => {
      const name = this.sanitizeName(color.name || 'color');
      kotlin += `    val ${name} = Color(0xFF${color.hex.substring(1)})\n`;
    });
    
    kotlin += '}\n';
    return kotlin;
  }
  
  private static generateSVGPalette(data: PaletteExportData, config: ExportConfig): string {
    const swatchSize = 60;
    const padding = 10;
    const width = data.colors.length * (swatchSize + padding) - padding;
    const height = swatchSize + 40; // Extra space for labels
    
    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">\n`;
    svg += `  <title>${data.name}</title>\n`;
    svg += `  <desc>Generated by Color Vibe Workstation on ${data.metadata.createdAt}</desc>\n\n`;
    
    data.colors.forEach((color, index) => {
      const x = index * (swatchSize + padding);
      svg += `  <rect x="${x}" y="0" width="${swatchSize}" height="${swatchSize}" fill="${color.hex}"/>\n`;
      
      if (config.template !== 'minimal') {
        svg += `  <text x="${x + swatchSize / 2}" y="${swatchSize + 15}" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#333">${color.hex}</text>\n`;
        if (color.name) {
          svg += `  <text x="${x + swatchSize / 2}" y="${swatchSize + 30}" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" fill="#666">${color.name}</text>\n`;
        }
      }
    });
    
    svg += '</svg>';
    return svg;
  }
  
  // Helper methods
  private static sanitizeName(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }
  
  private static generateFilename(paletteName: string, format: ExportFormat): string {
    const sanitized = this.sanitizeName(paletteName);
    const timestamp = new Date().toISOString().split('T')[0];
    const extension = this.getFileExtension(format);
    return `${sanitized}_${timestamp}.${extension}`;
  }
  
  private static getFileExtension(format: ExportFormat): string {
    const extensions: Record<ExportFormat, string> = {
      'json': 'json',
      'css': 'css',
      'scss': 'scss',
      'less': 'less',
      'stylus': 'styl',
      'swift': 'swift',
      'kotlin': 'kt',
      'xml': 'xml',
      'yaml': 'yaml',
      'adobe-ase': 'ase',
      'sketch-clr': 'clr',
      'figma-json': 'json',
      'pdf-swatch': 'pdf',
      'pdf-guide': 'pdf',
      'png-palette': 'png',
      'svg-palette': 'svg',
      'procreate-swatches': 'swatches',
    };
    return extensions[format] || 'txt';
  }
  
  private static getMimeType(format: ExportFormat): string {
    const mimeTypes: Record<string, string> = {
      'json': 'application/json',
      'css': 'text/css',
      'scss': 'text/scss',
      'less': 'text/less',
      'swift': 'text/swift',
      'kotlin': 'text/kotlin',
      'xml': 'application/xml',
      'yaml': 'application/yaml',
      'svg': 'image/svg+xml',
      'pdf': 'application/pdf',
      'png': 'image/png',
    };
    const extension = this.getFileExtension(format);
    return mimeTypes[extension] || 'text/plain';
  }
  
  private static rgbToCmyk(rgb: { r: number; g: number; b: number }) {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    
    const k = 1 - Math.max(r, g, b);
    const c = (1 - r - k) / (1 - k) || 0;
    const m = (1 - g - k) / (1 - k) || 0;
    const y = (1 - b - k) / (1 - k) || 0;
    
    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100),
    };
  }
  
  private static rgbToLab(rgb: { r: number; g: number; b: number }) {
    // Simplified RGB to LAB conversion
    // In production, would use proper color space conversion
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    
    const l = 0.299 * r + 0.587 * g + 0.114 * b;
    const a = (r - g) * 127;
    const bLab = (g - b) * 127;
    
    return {
      l: Math.round(l * 100),
      a: Math.round(a),
      b: Math.round(bLab),
    };
  }
  
  private static findClosestPantone(color: string): string {
    // Simplified Pantone matching
    // In production, would use actual Pantone color database
    return 'PMS 000-C';
  }
  
  private static async analyzeAccessibility(color: string) {
    // Simplified accessibility analysis
    return {
      contrastRatio: 4.5,
      wcagLevel: 'AA',
      colorBlindSafe: true,
    };
  }
  
  private static async analyzePerceptual(color: string) {
    const appearance = PerceptualColorEngine.calculateColorAppearance(color);
    return {
      lightness: appearance.lightness,
      chroma: appearance.chroma,
      hue: appearance.hue,
    };
  }
  
  private static analyzeHarmony(colors: string[]): string {
    // Simplified harmony analysis
    return 'Complementary';
  }
  
  private static analyzeTemperature(colors: string[]): 'warm' | 'cool' | 'neutral' {
    // Simplified temperature analysis
    return 'neutral';
  }
  
  private static async analyzeAllAccessibility(colors: string[]): Promise<AccessibilityData[]> {
    // Would implement comprehensive accessibility analysis
    return [];
  }
  
  private static async analyzeAllPerceptual(colors: string[]): Promise<PerceptualData[]> {
    // Would implement comprehensive perceptual analysis
    return [];
  }
  
  private static getVersion(): string {
    return '2.0.0';
  }
  
  // Additional format generators would be implemented here
  private static generateLESS(data: PaletteExportData, config: ExportConfig): string {
    // LESS format implementation
    return this.generateSCSS(data, config).replace(/\$/g, '@');
  }
  
  private static generateXML(data: PaletteExportData, config: ExportConfig): string {
    // XML format implementation
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += `<palette name="${data.name}">\n`;
    data.colors.forEach((color) => {
      xml += `  <color name="${color.name}" hex="${color.hex}" />\n`;
    });
    xml += '</palette>';
    return xml;
  }
  
  private static generateYAML(data: PaletteExportData, config: ExportConfig): string {
    // YAML format implementation
    let yaml = `name: "${data.name}"\n`;
    yaml += 'colors:\n';
    data.colors.forEach((color) => {
      yaml += `  - name: "${color.name}"\n`;
      yaml += `    hex: "${color.hex}"\n`;
      yaml += `    rgb: [${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}]\n`;
    });
    return yaml;
  }
  
  private static generateAdobeASE(data: PaletteExportData, config: ExportConfig): string {
    // Adobe ASE format (simplified)
    return 'Adobe ASE format not yet implemented';
  }
  
  private static generateSketchCLR(data: PaletteExportData, config: ExportConfig): string {
    // Sketch CLR format (simplified)
    return 'Sketch CLR format not yet implemented';
  }
  
  private static generateFigmaJSON(data: PaletteExportData, config: ExportConfig): string {
    // Figma JSON format
    const figmaData = {
      name: data.name,
      colors: data.colors.map(color => ({
        name: color.name,
        color: {
          r: color.rgb.r / 255,
          g: color.rgb.g / 255,
          b: color.rgb.b / 255,
          a: 1,
        },
      })),
    };
    return JSON.stringify(figmaData, null, 2);
  }
  
  private static generatePDFSwatch(data: PaletteExportData, config: ExportConfig): string {
    // PDF generation would require additional libraries
    return 'PDF generation requires additional implementation';
  }
  
  private static generateProcreateSwatches(data: PaletteExportData, config: ExportConfig): string {
    // Procreate swatches format
    return 'Procreate swatches format not yet implemented';
  }
}

// Export utility functions
export const ExportUtils = {
  // Get available formats
  getAvailableFormats: (): ExportFormat[] => [
    'json', 'css', 'scss', 'less', 'swift', 'kotlin', 
    'xml', 'yaml', 'svg-palette', 'figma-json'
  ],
  
  // Get available templates
  getAvailableTemplates: (): ExportTemplate[] => [
    'minimal', 'detailed', 'brand-guide', 'developer', 
    'designer', 'web-optimized', 'mobile-app'
  ],
  
  // Get format description
  getFormatDescription: (format: ExportFormat): string => {
    const descriptions: Record<ExportFormat, string> = {
      'json': 'JSON format for web applications',
      'css': 'CSS custom properties',
      'scss': 'SCSS variables and maps',
      'less': 'LESS variables',
      'swift': 'Swift UIColor extensions',
      'kotlin': 'Kotlin Compose colors',
      'xml': 'XML color definitions',
      'yaml': 'YAML configuration',
      'svg-palette': 'SVG color swatches',
      'figma-json': 'Figma-compatible JSON',
      // ... other formats
    } as any;
    return descriptions[format] || 'Professional color export';
  },
};

// AdvancedExportSystem is already exported above
