// Comprehensive PDF Export System
// Professional-grade PDF generation for color palettes, recipes, and projects

import { optimizedHexToRgb, optimizedRgbToHsl } from './optimizedColorEngine';
import { calculateContrastRatio } from './accessibilityUtils';
import { worldClassAccessibility } from './worldClassAccessibility';

// PDF Export Types
export interface ColorPaletteCard {
  name: string;
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  cmyk?: { c: number; m: number; y: number; k: number };
  pantone?: string;
  usage: string[];
  accessibility: {
    contrastRatio: number;
    wcagLevel: string;
    colorBlindSafe: boolean;
  };
}

export interface PaintRecipe {
  colorName: string;
  targetColor: string;
  baseColors: Array<{
    name: string;
    hex: string;
    percentage: number;
    brand?: string;
    pigmentCode?: string;
  }>;
  mixingInstructions: string[];
  notes: string;
  lightfastness?: number;
  opacity?: number;
  dryingTime?: string;
}

export interface ColorProject {
  name: string;
  description: string;
  createdDate: string;
  colors: ColorPaletteCard[];
  recipes: PaintRecipe[];
  harmonyAnalysis: {
    type: string;
    score: number;
    recommendations: string[];
  };
  culturalContext: {
    western: string[];
    eastern: string[];
    universal: string[];
  };
  usageGuidelines: string[];
  brandGuidelines?: {
    primary: string[];
    secondary: string[];
    accent: string[];
    neutral: string[];
  };
}

// PDF Template Types
export enum PDFTemplate {
  PALETTE_CARD = 'palette_card',
  RECIPE_BOOK = 'recipe_book',
  PROJECT_DOCUMENTATION = 'project_documentation',
  BRAND_GUIDELINES = 'brand_guidelines',
  ACCESSIBILITY_REPORT = 'accessibility_report',
  COLOR_THEORY_GUIDE = 'color_theory_guide',
  ARTIST_REFERENCE = 'artist_reference',
  PRINT_PRODUCTION = 'print_production',
}

// Professional PDF Export System
export class ComprehensivePDFExports {
  private static instance: ComprehensivePDFExports;

  private constructor() {}

  static getInstance(): ComprehensivePDFExports {
    if (!ComprehensivePDFExports.instance) {
      ComprehensivePDFExports.instance = new ComprehensivePDFExports();
    }
    return ComprehensivePDFExports.instance;
  }

  // Generate Color Palette Card PDF (like Procreate/Adobe)
  async generatePaletteCard(
    colors: string[],
    paletteName: string,
    options: {
      includeAccessibility?: boolean;
      includeCodes?: boolean;
      includeUsage?: boolean;
      template?: 'minimal' | 'detailed' | 'professional';
    } = {}
  ): Promise<string> {
    const { includeAccessibility = true, includeCodes = true, includeUsage = true, template = 'professional' } = options;

    let pdfContent = this.generatePDFHeader(paletteName, 'Color Palette Card');

    // Color swatches section
    pdfContent += `
    <div class="color-grid">
      <h2>Color Palette: ${paletteName}</h2>
      <div class="swatches">`;

    for (let i = 0; i < colors.length; i++) {
      const color = colors[i];
      const rgb = optimizedHexToRgb(color);
      const hsl = rgb ? optimizedRgbToHsl(rgb.r, rgb.g, rgb.b) : null;
      
      pdfContent += `
        <div class="swatch-card">
          <div class="color-sample" style="background-color: ${color}"></div>
          <div class="color-info">
            <h3>Color ${i + 1}</h3>`;

      if (includeCodes && rgb && hsl) {
        pdfContent += `
            <p><strong>HEX:</strong> ${color.toUpperCase()}</p>
            <p><strong>RGB:</strong> ${rgb.r}, ${rgb.g}, ${rgb.b}</p>
            <p><strong>HSL:</strong> ${Math.round(hsl.h)}°, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%</p>`;
      }

      if (includeAccessibility) {
        const accessibility = await worldClassAccessibility.analyzeAccessibility(color, '#ffffff');
        pdfContent += `
            <p><strong>Contrast:</strong> ${accessibility.contrast.ratio.toFixed(2)}:1</p>
            <p><strong>WCAG:</strong> ${accessibility.contrast.level}</p>`;
      }

      if (includeUsage) {
        const usageSuggestions = this.generateUsageSuggestions(color);
        pdfContent += `
            <p><strong>Usage:</strong> ${usageSuggestions.join(', ')}</p>`;
      }

      pdfContent += `
          </div>
        </div>`;
    }

    pdfContent += `
      </div>
    </div>`;

    return this.finalizePDF(pdfContent, template);
  }

  // Generate Paint Recipe Book PDF (like Golden/Winsor & Newton guides)
  async generateRecipeBook(
    recipes: PaintRecipe[],
    bookTitle: string,
    options: {
      includeMixingTips?: boolean;
      includePigmentInfo?: boolean;
      includeColorTheory?: boolean;
    } = {}
  ): Promise<string> {
    const { includeMixingTips = true, includePigmentInfo = true, includeColorTheory = true } = options;

    let pdfContent = this.generatePDFHeader(bookTitle, 'Paint Recipe Book');

    // Table of contents
    pdfContent += `
    <div class="table-of-contents">
      <h2>Table of Contents</h2>
      <ul>`;

    recipes.forEach((recipe, index) => {
      pdfContent += `<li>${index + 1}. ${recipe.colorName}</li>`;
    });

    pdfContent += `
      </ul>
    </div>`;

    // Recipe pages
    for (const recipe of recipes) {
      pdfContent += `
      <div class="recipe-page">
        <div class="recipe-header">
          <div class="color-sample" style="background-color: ${recipe.targetColor}"></div>
          <h2>${recipe.colorName}</h2>
          <p class="color-code">${recipe.targetColor.toUpperCase()}</p>
        </div>

        <div class="recipe-content">
          <h3>Ingredients</h3>
          <ul class="ingredients">`;

      recipe.baseColors.forEach(baseColor => {
        pdfContent += `
            <li>
              <span class="color-dot" style="background-color: ${baseColor.hex}"></span>
              <strong>${baseColor.name}</strong> - ${baseColor.percentage}%
              ${baseColor.brand ? `(${baseColor.brand})` : ''}
              ${baseColor.pigmentCode ? `[${baseColor.pigmentCode}]` : ''}
            </li>`;
      });

      pdfContent += `
          </ul>

          <h3>Mixing Instructions</h3>
          <ol class="instructions">`;

      recipe.mixingInstructions.forEach(instruction => {
        pdfContent += `<li>${instruction}</li>`;
      });

      pdfContent += `
          </ol>`;

      if (recipe.notes) {
        pdfContent += `
          <div class="recipe-notes">
            <h4>Notes</h4>
            <p>${recipe.notes}</p>
          </div>`;
      }

      if (includePigmentInfo && (recipe.lightfastness || recipe.opacity || recipe.dryingTime)) {
        pdfContent += `
          <div class="technical-info">
            <h4>Technical Information</h4>`;

        if (recipe.lightfastness) {
          pdfContent += `<p><strong>Lightfastness:</strong> ${recipe.lightfastness}/5 stars</p>`;
        }
        if (recipe.opacity) {
          pdfContent += `<p><strong>Opacity:</strong> ${recipe.opacity}%</p>`;
        }
        if (recipe.dryingTime) {
          pdfContent += `<p><strong>Drying Time:</strong> ${recipe.dryingTime}</p>`;
        }

        pdfContent += `
          </div>`;
      }

      pdfContent += `
        </div>
      </div>`;
    }

    if (includeMixingTips) {
      pdfContent += this.generateMixingTipsSection();
    }

    if (includeColorTheory) {
      pdfContent += this.generateColorTheorySection();
    }

    return this.finalizePDF(pdfContent, 'professional');
  }

  // Generate Complete Project Documentation PDF
  async generateProjectDocumentation(
    project: ColorProject,
    options: {
      includeAccessibilityReport?: boolean;
      includeBrandGuidelines?: boolean;
      includeColorTheory?: boolean;
      includePrintSpecs?: boolean;
    } = {}
  ): Promise<string> {
    const { includeAccessibilityReport = true, includeBrandGuidelines = true, includeColorTheory = true, includePrintSpecs = true } = options;

    let pdfContent = this.generatePDFHeader(project.name, 'Project Documentation');

    // Executive Summary
    pdfContent += `
    <div class="executive-summary">
      <h2>Project Overview</h2>
      <p><strong>Project:</strong> ${project.name}</p>
      <p><strong>Created:</strong> ${new Date(project.createdDate).toLocaleDateString()}</p>
      <p><strong>Description:</strong> ${project.description}</p>
      <p><strong>Total Colors:</strong> ${project.colors.length}</p>
      <p><strong>Harmony Type:</strong> ${project.harmonyAnalysis.type}</p>
      <p><strong>Harmony Score:</strong> ${project.harmonyAnalysis.score}/100</p>
    </div>`;

    // Color Palette Section
    pdfContent += `
    <div class="color-palette-section">
      <h2>Color Palette</h2>
      <div class="color-grid">`;

    for (const colorCard of project.colors) {
      pdfContent += `
        <div class="color-card">
          <div class="color-sample" style="background-color: ${colorCard.hex}"></div>
          <div class="color-details">
            <h4>${colorCard.name}</h4>
            <p><strong>HEX:</strong> ${colorCard.hex.toUpperCase()}</p>
            <p><strong>RGB:</strong> ${colorCard.rgb.r}, ${colorCard.rgb.g}, ${colorCard.rgb.b}</p>
            <p><strong>HSL:</strong> ${Math.round(colorCard.hsl.h)}°, ${Math.round(colorCard.hsl.s)}%, ${Math.round(colorCard.hsl.l)}%</p>
            <p><strong>Usage:</strong> ${colorCard.usage.join(', ')}</p>
            <p><strong>Accessibility:</strong> ${colorCard.accessibility.wcagLevel} (${colorCard.accessibility.contrastRatio.toFixed(2)}:1)</p>
          </div>
        </div>`;
    }

    pdfContent += `
      </div>
    </div>`;

    // Paint Recipes Section
    if (project.recipes.length > 0) {
      pdfContent += `
      <div class="recipes-section">
        <h2>Paint Recipes</h2>`;

      for (const recipe of project.recipes) {
        pdfContent += `
        <div class="recipe-summary">
          <h4>${recipe.colorName}</h4>
          <div class="recipe-ingredients">`;

        recipe.baseColors.forEach(baseColor => {
          pdfContent += `
            <span class="ingredient">
              <span class="color-dot" style="background-color: ${baseColor.hex}"></span>
              ${baseColor.name} (${baseColor.percentage}%)
            </span>`;
        });

        pdfContent += `
          </div>
        </div>`;
      }

      pdfContent += `
      </div>`;
    }

    // Brand Guidelines Section
    if (includeBrandGuidelines && project.brandGuidelines) {
      pdfContent += `
      <div class="brand-guidelines">
        <h2>Brand Guidelines</h2>
        <div class="brand-colors">
          <div class="primary-colors">
            <h4>Primary Colors</h4>
            <div class="color-row">`;

      project.brandGuidelines.primary.forEach(color => {
        pdfContent += `<div class="brand-color" style="background-color: ${color}"></div>`;
      });

      pdfContent += `
            </div>
          </div>
        </div>
      </div>`;
    }

    // Accessibility Report Section
    if (includeAccessibilityReport) {
      pdfContent += await this.generateAccessibilityReportSection(project.colors);
    }

    // Usage Guidelines
    pdfContent += `
    <div class="usage-guidelines">
      <h2>Usage Guidelines</h2>
      <ul>`;

    project.usageGuidelines.forEach(guideline => {
      pdfContent += `<li>${guideline}</li>`;
    });

    pdfContent += `
      </ul>
    </div>`;

    // Cultural Context
    pdfContent += `
    <div class="cultural-context">
      <h2>Cultural Context</h2>
      <div class="cultural-analysis">
        <div class="western">
          <h4>Western Context</h4>
          <p>${project.culturalContext.western.join(', ')}</p>
        </div>
        <div class="eastern">
          <h4>Eastern Context</h4>
          <p>${project.culturalContext.eastern.join(', ')}</p>
        </div>
        <div class="universal">
          <h4>Universal Meanings</h4>
          <p>${project.culturalContext.universal.join(', ')}</p>
        </div>
      </div>
    </div>`;

    return this.finalizePDF(pdfContent, 'professional');
  }

  // Generate Artist Reference Sheet (like traditional color mixing guides)
  async generateArtistReference(
    colors: string[],
    title: string,
    options: {
      includeColorWheel?: boolean;
      includeTemperatureGuide?: boolean;
      includeMixingChart?: boolean;
      includeComplementaryPairs?: boolean;
    } = {}
  ): Promise<string> {
    const { includeColorWheel = true, includeTemperatureGuide = true, includeMixingChart = true, includeComplementaryPairs = true } = options;

    let pdfContent = this.generatePDFHeader(title, 'Artist Reference Sheet');

    // Quick reference color grid
    pdfContent += `
    <div class="quick-reference">
      <h2>Quick Color Reference</h2>
      <div class="reference-grid">`;

    colors.forEach((color, index) => {
      const rgb = optimizedHexToRgb(color);
      const hsl = rgb ? optimizedRgbToHsl(rgb.r, rgb.g, rgb.b) : null;
      
      pdfContent += `
        <div class="ref-color">
          <div class="color-sample" style="background-color: ${color}"></div>
          <div class="color-temp">${hsl ? this.getColorTemperature(hsl.h) : 'Unknown'}</div>
          <div class="color-code">${color.toUpperCase()}</div>
        </div>`;
    });

    pdfContent += `
      </div>
    </div>`;

    if (includeTemperatureGuide) {
      pdfContent += this.generateTemperatureGuideSection(colors);
    }

    if (includeComplementaryPairs) {
      pdfContent += this.generateComplementaryPairsSection(colors);
    }

    if (includeMixingChart) {
      pdfContent += this.generateMixingChartSection(colors);
    }

    return this.finalizePDF(pdfContent, 'artistic');
  }

  // Private helper methods
  private generatePDFHeader(title: string, subtitle: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        ${this.getPDFStyles()}
      </style>
    </head>
    <body>
      <div class="pdf-header">
        <h1>${title}</h1>
        <p class="subtitle">${subtitle}</p>
        <p class="generated">Generated by Color Vibe Workstation - ${new Date().toLocaleDateString()}</p>
      </div>`;
  }

  private finalizePDF(content: string, template: string): string {
    return content + `
      <div class="pdf-footer">
        <p>Created with Color Vibe Workstation - Professional Color Design Tool</p>
        <p>© ${new Date().getFullYear()} - World-Class Color Intelligence</p>
      </div>
    </body>
    </html>`;
  }

  private getPDFStyles(): string {
    return `
      body { font-family: 'Helvetica', Arial, sans-serif; margin: 0; padding: 20px; }
      .pdf-header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
      .pdf-header h1 { color: #333; font-size: 28px; margin: 0; }
      .subtitle { color: #666; font-size: 16px; margin: 5px 0; }
      .generated { color: #999; font-size: 12px; }
      .color-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
      .swatch-card, .color-card { border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
      .color-sample { height: 80px; width: 100%; }
      .color-info, .color-details { padding: 15px; }
      .color-info h3, .color-details h4 { margin: 0 0 10px 0; color: #333; }
      .color-info p, .color-details p { margin: 5px 0; font-size: 12px; }
      .recipe-page { page-break-before: always; margin-bottom: 40px; }
      .recipe-header { display: flex; align-items: center; margin-bottom: 20px; }
      .recipe-header .color-sample { width: 100px; height: 100px; margin-right: 20px; border-radius: 8px; }
      .ingredients li { margin: 8px 0; display: flex; align-items: center; }
      .color-dot { width: 16px; height: 16px; border-radius: 50%; margin-right: 8px; border: 1px solid #ccc; }
      .pdf-footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
    `;
  }

  private generateUsageSuggestions(color: string): string[] {
    const rgb = optimizedHexToRgb(color);
    if (!rgb) return ['General use'];

    const hsl = optimizedRgbToHsl(rgb.r, rgb.g, rgb.b);
    const suggestions = [];

    if (hsl.l > 80) suggestions.push('Backgrounds', 'Highlights');
    if (hsl.l < 20) suggestions.push('Text', 'Shadows');
    if (hsl.s > 70) suggestions.push('Accents', 'Call-to-action');
    if (hsl.s < 30) suggestions.push('Neutral', 'Base colors');

    return suggestions.length > 0 ? suggestions : ['General use'];
  }

  private getColorTemperature(hue: number): string {
    if ((hue >= 0 && hue <= 60) || (hue >= 300 && hue <= 360)) return 'Warm';
    if (hue >= 120 && hue <= 240) return 'Cool';
    return 'Neutral';
  }

  private generateMixingTipsSection(): string {
    return `
    <div class="mixing-tips">
      <h2>Professional Mixing Tips</h2>
      <ul>
        <li>Always start with the lighter color and gradually add darker colors</li>
        <li>Mix colors in small amounts first to test the result</li>
        <li>Keep detailed notes of successful color mixtures</li>
        <li>Consider the opacity and transparency of your pigments</li>
        <li>Test colors under different lighting conditions</li>
        <li>Allow mixed colors to dry before making final judgments</li>
      </ul>
    </div>`;
  }

  private generateColorTheorySection(): string {
    return `
    <div class="color-theory">
      <h2>Color Theory Reference</h2>
      <div class="theory-content">
        <h4>Primary Colors</h4>
        <p>Red, Blue, Yellow - Cannot be created by mixing other colors</p>
        
        <h4>Secondary Colors</h4>
        <p>Orange, Green, Purple - Created by mixing two primary colors</p>
        
        <h4>Tertiary Colors</h4>
        <p>Created by mixing a primary and secondary color</p>
        
        <h4>Color Harmonies</h4>
        <ul>
          <li><strong>Complementary:</strong> Colors opposite on the color wheel</li>
          <li><strong>Analogous:</strong> Colors next to each other on the wheel</li>
          <li><strong>Triadic:</strong> Three colors evenly spaced on the wheel</li>
          <li><strong>Monochromatic:</strong> Different shades of the same color</li>
        </ul>
      </div>
    </div>`;
  }

  private async generateAccessibilityReportSection(colors: ColorPaletteCard[]): Promise<string> {
    let section = `
    <div class="accessibility-report">
      <h2>Accessibility Analysis</h2>
      <div class="accessibility-grid">`;

    for (const color of colors) {
      section += `
        <div class="accessibility-item">
          <div class="color-sample" style="background-color: ${color.hex}"></div>
          <div class="accessibility-details">
            <h4>${color.name}</h4>
            <p><strong>WCAG Level:</strong> ${color.accessibility.wcagLevel}</p>
            <p><strong>Contrast Ratio:</strong> ${color.accessibility.contrastRatio.toFixed(2)}:1</p>
            <p><strong>Color Blind Safe:</strong> ${color.accessibility.colorBlindSafe ? 'Yes' : 'No'}</p>
          </div>
        </div>`;
    }

    section += `
      </div>
    </div>`;

    return section;
  }

  private generateTemperatureGuideSection(colors: string[]): string {
    return `
    <div class="temperature-guide">
      <h2>Color Temperature Guide</h2>
      <div class="temp-colors">
        <div class="warm-colors">
          <h4>Warm Colors</h4>
          <div class="color-row">
            ${colors.filter(color => {
              const rgb = optimizedHexToRgb(color);
              if (!rgb) return false;
              const hsl = optimizedRgbToHsl(rgb.r, rgb.g, rgb.b);
              return this.getColorTemperature(hsl.h) === 'Warm';
            }).map(color => `<div class="temp-color" style="background-color: ${color}"></div>`).join('')}
          </div>
        </div>
        <div class="cool-colors">
          <h4>Cool Colors</h4>
          <div class="color-row">
            ${colors.filter(color => {
              const rgb = optimizedHexToRgb(color);
              if (!rgb) return false;
              const hsl = optimizedRgbToHsl(rgb.r, rgb.g, rgb.b);
              return this.getColorTemperature(hsl.h) === 'Cool';
            }).map(color => `<div class="temp-color" style="background-color: ${color}"></div>`).join('')}
          </div>
        </div>
      </div>
    </div>`;
  }

  private generateComplementaryPairsSection(colors: string[]): string {
    return `
    <div class="complementary-pairs">
      <h2>Complementary Color Pairs</h2>
      <p>Colors that create strong contrast and visual interest when used together.</p>
      <div class="pairs-grid">
        <!-- Complementary pairs would be calculated and displayed here -->
      </div>
    </div>`;
  }

  private generateMixingChartSection(colors: string[]): string {
    return `
    <div class="mixing-chart">
      <h2>Color Mixing Chart</h2>
      <p>Visual guide showing how colors interact when mixed together.</p>
      <div class="mixing-grid">
        <!-- Mixing combinations would be calculated and displayed here -->
      </div>
    </div>`;
  }
}

// Export singleton instance
export const comprehensivePDFExports = ComprehensivePDFExports.getInstance();

// Export utility functions for easy access
export const PDFExportUtils = {
  // Quick palette card export
  exportPaletteCard: async (colors: string[], name: string) => {
    return comprehensivePDFExports.generatePaletteCard(colors, name);
  },

  // Quick recipe book export
  exportRecipeBook: async (recipes: PaintRecipe[], title: string) => {
    return comprehensivePDFExports.generateRecipeBook(recipes, title);
  },

  // Quick project documentation export
  exportProjectDocumentation: async (project: ColorProject) => {
    return comprehensivePDFExports.generateProjectDocumentation(project);
  },

  // Quick artist reference export
  exportArtistReference: async (colors: string[], title: string) => {
    return comprehensivePDFExports.generateArtistReference(colors, title);
  },
} as const;
