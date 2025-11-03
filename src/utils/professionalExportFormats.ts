// Professional Export Formats System
// Support for Adobe ASE, Sketch CLR, Figma JSON, and other professional formats

import { optimizedHexToRgb, optimizedRgbToHsl } from './optimizedColorEngine';

// Professional Export Format Types
export interface ExportFormat {
  name: string;
  extension: string;
  mimeType: string;
  description: string;
  supportsMetadata: boolean;
  supportsGroups: boolean;
  targetApplications: string[];
}

export interface ColorExportData {
  name: string;
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  cmyk?: { c: number; m: number; y: number; k: number };
  lab?: { l: number; a: number; b: number };
  metadata?: {
    tags?: string[];
    category?: string;
    usage?: string;
    accessibility?: any;
  };
}

export interface PaletteExportData {
  name: string;
  description?: string;
  colors: ColorExportData[];
  groups?: {
    name: string;
    colors: ColorExportData[];
  }[];
  metadata?: {
    author?: string;
    created?: string;
    version?: string;
    application?: string;
    tags?: string[];
  };
}

// Professional Export Formats Registry
export const PROFESSIONAL_FORMATS: Record<string, ExportFormat> = {
  ASE: {
    name: 'Adobe Swatch Exchange',
    extension: 'ase',
    mimeType: 'application/octet-stream',
    description: 'Adobe Creative Suite color swatches',
    supportsMetadata: true,
    supportsGroups: true,
    targetApplications: ['Photoshop', 'Illustrator', 'InDesign', 'After Effects'],
  },
  ACO: {
    name: 'Adobe Color',
    extension: 'aco',
    mimeType: 'application/octet-stream',
    description: 'Adobe Photoshop color swatches',
    supportsMetadata: false,
    supportsGroups: false,
    targetApplications: ['Photoshop'],
  },
  CLR: {
    name: 'Sketch Palette',
    extension: 'clr',
    mimeType: 'application/octet-stream',
    description: 'Sketch color palette format',
    supportsMetadata: true,
    supportsGroups: true,
    targetApplications: ['Sketch'],
  },
  FIGMA: {
    name: 'Figma JSON',
    extension: 'json',
    mimeType: 'application/json',
    description: 'Figma color styles JSON format',
    supportsMetadata: true,
    supportsGroups: true,
    targetApplications: ['Figma'],
  },
  GPL: {
    name: 'GIMP Palette',
    extension: 'gpl',
    mimeType: 'text/plain',
    description: 'GIMP color palette format',
    supportsMetadata: true,
    supportsGroups: false,
    targetApplications: ['GIMP', 'Inkscape', 'Krita'],
  },
  PROCREATE: {
    name: 'Procreate Palette',
    extension: 'swatches',
    mimeType: 'application/octet-stream',
    description: 'Procreate color swatches',
    supportsMetadata: false,
    supportsGroups: false,
    targetApplications: ['Procreate'],
  },
  CSS: {
    name: 'CSS Variables',
    extension: 'css',
    mimeType: 'text/css',
    description: 'CSS custom properties format',
    supportsMetadata: true,
    supportsGroups: true,
    targetApplications: ['Web Development'],
  },
  SCSS: {
    name: 'SCSS Variables',
    extension: 'scss',
    mimeType: 'text/scss',
    description: 'SCSS/Sass variables format',
    supportsMetadata: true,
    supportsGroups: true,
    targetApplications: ['Web Development'],
  },
  JSON: {
    name: 'JSON Color Data',
    extension: 'json',
    mimeType: 'application/json',
    description: 'Universal JSON color format',
    supportsMetadata: true,
    supportsGroups: true,
    targetApplications: ['Universal'],
  },
  XML: {
    name: 'XML Color Data',
    extension: 'xml',
    mimeType: 'application/xml',
    description: 'XML color format for various applications',
    supportsMetadata: true,
    supportsGroups: true,
    targetApplications: ['Universal'],
  },
};

// Professional Export System
export class ProfessionalExportSystem {
  private static instance: ProfessionalExportSystem;

  private constructor() {}

  static getInstance(): ProfessionalExportSystem {
    if (!ProfessionalExportSystem.instance) {
      ProfessionalExportSystem.instance = new ProfessionalExportSystem();
    }
    return ProfessionalExportSystem.instance;
  }

  // Export palette to Adobe Swatch Exchange (ASE) format
  async exportToASE(palette: PaletteExportData): Promise<Uint8Array> {
    const buffer = new ArrayBuffer(1024);
    const view = new DataView(buffer);
    let offset = 0;

    // ASE Header
    view.setUint32(offset, 0x41534546, false); // 'ASEF'
    offset += 4;
    view.setUint16(offset, 1, false); // Version major
    offset += 2;
    view.setUint16(offset, 0, false); // Version minor
    offset += 2;
    view.setUint32(offset, palette.colors.length, false); // Number of blocks
    offset += 4;

    // Color blocks
    for (const color of palette.colors) {
      // Block type (color entry)
      view.setUint16(offset, 0x0001, false);
      offset += 2;
      
      // Block length (will be calculated)
      const blockLengthOffset = offset;
      offset += 4;
      
      // Color name length
      const nameLength = color.name.length * 2;
      view.setUint16(offset, nameLength + 2, false);
      offset += 2;
      
      // Color name (UTF-16)
      for (let i = 0; i < color.name.length; i++) {
        view.setUint16(offset, color.name.charCodeAt(i), false);
        offset += 2;
      }
      view.setUint16(offset, 0, false); // Null terminator
      offset += 2;
      
      // Color model ('RGB ')
      view.setUint32(offset, 0x52474220, false);
      offset += 4;
      
      // RGB values (32-bit floats)
      view.setFloat32(offset, color.rgb.r / 255, false);
      offset += 4;
      view.setFloat32(offset, color.rgb.g / 255, false);
      offset += 4;
      view.setFloat32(offset, color.rgb.b / 255, false);
      offset += 4;
      
      // Color type (normal)
      view.setUint16(offset, 0, false);
      offset += 2;
      
      // Update block length
      const blockLength = offset - blockLengthOffset - 4;
      view.setUint32(blockLengthOffset, blockLength, false);
    }

    return new Uint8Array(buffer, 0, offset);
  }

  // Export palette to Sketch CLR format
  async exportToSketchCLR(palette: PaletteExportData): Promise<string> {
    const clrData = {
      colors: palette.colors.map(color => ({
        red: color.rgb.r / 255,
        green: color.rgb.g / 255,
        blue: color.rgb.b / 255,
        alpha: 1,
        colorSpace: 'sRGB',
        name: color.name,
      })),
      metadata: {
        name: palette.name,
        description: palette.description,
        version: '1.0',
        created: new Date().toISOString(),
      },
    };

    return JSON.stringify(clrData, null, 2);
  }

  // Export palette to Figma JSON format
  async exportToFigmaJSON(palette: PaletteExportData): Promise<string> {
    const figmaData = {
      version: '1.0',
      name: palette.name,
      description: palette.description || '',
      colors: palette.colors.map(color => ({
        name: color.name,
        description: color.metadata?.usage || '',
        color: {
          r: color.rgb.r / 255,
          g: color.rgb.g / 255,
          b: color.rgb.b / 255,
          a: 1,
        },
        scopes: ['ALL_SCOPES'],
        codeSyntax: {},
      })),
      metadata: palette.metadata || {},
    };

    return JSON.stringify(figmaData, null, 2);
  }

  // Export palette to GIMP GPL format
  async exportToGIMPGPL(palette: PaletteExportData): Promise<string> {
    let gplContent = 'GIMP Palette\n';
    gplContent += `Name: ${palette.name}\n`;
    gplContent += `Columns: 4\n`;
    gplContent += `# Created by Color Vibe Workstation\n`;
    
    if (palette.description) {
      gplContent += `# ${palette.description}\n`;
    }
    
    gplContent += '#\n';

    for (const color of palette.colors) {
      const r = color.rgb.r.toString().padStart(3, ' ');
      const g = color.rgb.g.toString().padStart(3, ' ');
      const b = color.rgb.b.toString().padStart(3, ' ');
      gplContent += `${r} ${g} ${b} ${color.name}\n`;
    }

    return gplContent;
  }

  // Export palette to CSS Variables format
  async exportToCSSVariables(palette: PaletteExportData): Promise<string> {
    let cssContent = `/* ${palette.name} Color Palette */\n`;
    cssContent += `/* Generated by Color Vibe Workstation */\n\n`;
    cssContent += ':root {\n';

    for (const color of palette.colors) {
      const varName = color.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      cssContent += `  --color-${varName}: ${color.hex};\n`;
      cssContent += `  --color-${varName}-rgb: ${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b};\n`;
      cssContent += `  --color-${varName}-hsl: ${Math.round(color.hsl.h)}, ${Math.round(color.hsl.s)}%, ${Math.round(color.hsl.l)}%;\n`;
    }

    cssContent += '}\n\n';
    cssContent += '/* Usage examples:\n';
    cssContent += ' * background-color: var(--color-primary);\n';
    cssContent += ' * color: rgb(var(--color-primary-rgb));\n';
    cssContent += ' * background: hsl(var(--color-primary-hsl));\n';
    cssContent += ' */\n';

    return cssContent;
  }

  // Export palette to SCSS Variables format
  async exportToSCSSVariables(palette: PaletteExportData): Promise<string> {
    let scssContent = `// ${palette.name} Color Palette\n`;
    scssContent += `// Generated by Color Vibe Workstation\n\n`;

    // Color variables
    for (const color of palette.colors) {
      const varName = color.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      scssContent += `$color-${varName}: ${color.hex};\n`;
    }

    scssContent += '\n// Color map for programmatic access\n';
    scssContent += '$colors: (\n';
    
    for (let i = 0; i < palette.colors.length; i++) {
      const color = palette.colors[i];
      const varName = color.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const comma = i < palette.colors.length - 1 ? ',' : '';
      scssContent += `  '${varName}': ${color.hex}${comma}\n`;
    }
    
    scssContent += ');\n\n';
    scssContent += '// Helper function to get colors\n';
    scssContent += '@function color($name) {\n';
    scssContent += '  @return map-get($colors, $name);\n';
    scssContent += '}\n';

    return scssContent;
  }

  // Export palette to comprehensive JSON format
  async exportToJSON(palette: PaletteExportData): Promise<string> {
    const jsonData = {
      ...palette,
      exportedAt: new Date().toISOString(),
      exportedBy: 'Color Vibe Workstation',
      version: '1.0',
      colors: palette.colors.map(color => ({
        ...color,
        formats: {
          hex: color.hex,
          rgb: `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`,
          hsl: `hsl(${Math.round(color.hsl.h)}, ${Math.round(color.hsl.s)}%, ${Math.round(color.hsl.l)}%)`,
          rgba: `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, 1)`,
          hsla: `hsla(${Math.round(color.hsl.h)}, ${Math.round(color.hsl.s)}%, ${Math.round(color.hsl.l)}%, 1)`,
        },
      })),
    };

    return JSON.stringify(jsonData, null, 2);
  }

  // Export palette to XML format
  async exportToXML(palette: PaletteExportData): Promise<string> {
    let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xmlContent += `<palette name="${palette.name}" version="1.0">\n`;
    
    if (palette.description) {
      xmlContent += `  <description>${palette.description}</description>\n`;
    }
    
    if (palette.metadata) {
      xmlContent += '  <metadata>\n';
      Object.entries(palette.metadata).forEach(([key, value]) => {
        xmlContent += `    <${key}>${value}</${key}>\n`;
      });
      xmlContent += '  </metadata>\n';
    }
    
    xmlContent += '  <colors>\n';
    
    for (const color of palette.colors) {
      xmlContent += `    <color name="${color.name}">\n`;
      xmlContent += `      <hex>${color.hex}</hex>\n`;
      xmlContent += `      <rgb r="${color.rgb.r}" g="${color.rgb.g}" b="${color.rgb.b}" />\n`;
      xmlContent += `      <hsl h="${Math.round(color.hsl.h)}" s="${Math.round(color.hsl.s)}" l="${Math.round(color.hsl.l)}" />\n`;
      
      if (color.metadata) {
        xmlContent += '      <metadata>\n';
        Object.entries(color.metadata).forEach(([key, value]) => {
          xmlContent += `        <${key}>${value}</${key}>\n`;
        });
        xmlContent += '      </metadata>\n';
      }
      
      xmlContent += '    </color>\n';
    }
    
    xmlContent += '  </colors>\n';
    xmlContent += '</palette>\n';

    return xmlContent;
  }

  // Universal export method
  async exportPalette(
    palette: PaletteExportData,
    format: keyof typeof PROFESSIONAL_FORMATS
  ): Promise<string | Uint8Array> {
    switch (format) {
      case 'ASE':
        return this.exportToASE(palette);
      case 'CLR':
        return this.exportToSketchCLR(palette);
      case 'FIGMA':
        return this.exportToFigmaJSON(palette);
      case 'GPL':
        return this.exportToGIMPGPL(palette);
      case 'CSS':
        return this.exportToCSSVariables(palette);
      case 'SCSS':
        return this.exportToSCSSVariables(palette);
      case 'JSON':
        return this.exportToJSON(palette);
      case 'XML':
        return this.exportToXML(palette);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  // Get format information
  getFormatInfo(format: keyof typeof PROFESSIONAL_FORMATS): ExportFormat {
    return PROFESSIONAL_FORMATS[format];
  }

  // Get all supported formats
  getSupportedFormats(): ExportFormat[] {
    return Object.values(PROFESSIONAL_FORMATS);
  }

  // Convert color data to export format
  prepareColorForExport(hex: string, name?: string): ColorExportData {
    const rgb = optimizedHexToRgb(hex);
    if (!rgb) throw new Error('Invalid color format');

    const hsl = optimizedRgbToHsl(rgb.r, rgb.g, rgb.b);

    return {
      name: name || hex,
      hex,
      rgb,
      hsl,
      metadata: {
        tags: [],
        category: 'custom',
        usage: 'general',
      },
    };
  }

  // Prepare palette for export
  preparePaletteForExport(
    colors: string[],
    name: string,
    description?: string,
    colorNames?: string[]
  ): PaletteExportData {
    const exportColors = colors.map((color, index) => 
      this.prepareColorForExport(color, colorNames?.[index] || `Color ${index + 1}`)
    );

    return {
      name,
      description,
      colors: exportColors,
      metadata: {
        author: 'Color Vibe Workstation User',
        created: new Date().toISOString(),
        version: '1.0',
        application: 'Color Vibe Workstation',
        tags: ['custom', 'palette'],
      },
    };
  }
}

// Export singleton instance
export const professionalExporter = ProfessionalExportSystem.getInstance();

// Export utility functions
export const ExportUtils = {
  // Download file helper
  downloadFile: (content: string | Uint8Array, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // Generate filename with timestamp
  generateFilename: (baseName: string, extension: string): string => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    return `${baseName}-${timestamp}.${extension}`;
  },

  // Validate color format
  validateColor: (hex: string): boolean => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
  },

  // Batch export multiple formats
  batchExport: async (
    palette: PaletteExportData,
    formats: Array<keyof typeof PROFESSIONAL_FORMATS>
  ): Promise<Array<{ format: string; content: string | Uint8Array; filename: string }>> => {
    const results = [];
    
    for (const format of formats) {
      try {
        const content = await professionalExporter.exportPalette(palette, format);
        const formatInfo = professionalExporter.getFormatInfo(format);
        const filename = ExportUtils.generateFilename(palette.name, formatInfo.extension);
        
        results.push({
          format,
          content,
          filename,
        });
      } catch (error) {
        console.error(`Failed to export ${format}:`, error);
      }
    }
    
    return results;
  },
} as const;
