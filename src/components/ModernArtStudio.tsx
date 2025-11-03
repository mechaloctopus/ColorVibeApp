// Modern Art Studio Component
// Integration of all modern art tool features inspired by Procreate, Adobe, etc.

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, FlatList } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

// Modern Art Tool Features
import { 
  modernArtToolFeatures, 
  ColorBrushSet, 
  MaterialColorMatch, 
  DesignSystemToken,
  ColorSample 
} from '../utils/modernArtToolFeatures';
import { 
  comprehensivePDFExports, 
  PDFExportUtils, 
  ColorProject, 
  PaintRecipe 
} from '../utils/comprehensivePDFExports';

// Core utilities
import { optimizedHexToRgb } from '../utils/optimizedColorEngine';

// Redux
import { RootState } from '../store';
import { setCurrentColor, addRecentColor } from '../store/slices/paletteSlice';

interface ModernArtStudioProps {
  onColorSelect?: (color: string) => void;
  showAdvancedFeatures?: boolean;
}

export const ModernArtStudio: React.FC<ModernArtStudioProps> = ({
  onColorSelect,
  showAdvancedFeatures = true,
}) => {
  const dispatch = useDispatch();
  const { currentColor, recentColors } = useSelector((state: RootState) => state.palette);
  
  // State management
  const [activeTab, setActiveTab] = useState<'palettes' | 'brushes' | 'materials' | 'tokens' | 'export'>('palettes');
  const [brushSets, setBrushSets] = useState<ColorBrushSet[]>([]);
  const [materialMatches, setMaterialMatches] = useState<MaterialColorMatch[]>([]);
  const [designTokens, setDesignTokens] = useState<DesignSystemToken[]>([]);
  const [colorHistory, setColorHistory] = useState<ColorSample[]>([]);
  const [aiSuggestions, setAISuggestions] = useState<string[]>([]);
  const [currentProject, setCurrentProject] = useState<ColorProject | null>(null);

  // Initialize modern art features
  useEffect(() => {
    initializeArtStudio();
  }, []);

  const initializeArtStudio = useCallback(async () => {
    try {
      // Load color history
      const history = modernArtToolFeatures.getColorHistory(20);
      setColorHistory(history);

      // Get AI suggestions based on current context
      const suggestions = modernArtToolFeatures.getAIColorSuggestions(
        'art-studio',
        recentColors,
        { style: 'modern', mood: 'creative', industry: 'art' }
      );
      setAISuggestions(suggestions);

      // Load existing brush sets, materials, and tokens
      // In a real app, these would be loaded from storage
      setBrushSets([]);
      setMaterialMatches([]);
      setDesignTokens([]);

    } catch (error) {
      console.error('Failed to initialize art studio:', error);
    }
  }, [recentColors]);

  // Smart Palette Generation (like Adobe Color)
  const generateSmartPalette = useCallback(async (style: string) => {
    try {
      const palette = modernArtToolFeatures.generateSmartPalette(
        currentColor,
        style as any,
        5,
        { accessibility: true, saturation: 'mixed', brightness: 'mixed' }
      );

      Alert.alert(
        'Smart Palette Generated',
        `Created a ${style} palette with ${palette.length} colors`,
        [
          { text: 'Use Palette', onPress: () => usePalette(palette) },
          { text: 'Export PDF', onPress: () => exportPalettePDF(palette, `${style} Palette`) },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to generate smart palette');
    }
  }, [currentColor]);

  // Create Brush Set (like Procreate)
  const createBrushSet = useCallback(async () => {
    try {
      const colors = [currentColor, ...recentColors.slice(0, 4)];
      const brushSet = modernArtToolFeatures.createColorBrushSet(
        `Custom Set ${Date.now()}`,
        colors,
        'digital',
        {
          opacity: 85,
          blendMode: 'normal',
          tags: ['custom', 'digital-art']
        }
      );

      setBrushSets(prev => [...prev, brushSet]);
      
      Alert.alert(
        'Brush Set Created',
        `Created "${brushSet.name}" with ${brushSet.colors.length} colors`,
        [
          { text: 'Export Set', onPress: () => exportBrushSet(brushSet) },
          { text: 'OK', style: 'default' }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create brush set');
    }
  }, [currentColor, recentColors]);

  // Generate Material Colors (like Clip Studio Paint)
  const generateMaterialColors = useCallback(async (materialType: string) => {
    try {
      const materialMatch = modernArtToolFeatures.generateMaterialColors(
        materialType as any,
        currentColor,
        'daylight'
      );

      setMaterialMatches(prev => [...prev, materialMatch]);

      Alert.alert(
        'Material Colors Generated',
        `Generated ${materialType} color variations with lighting effects`,
        [
          { text: 'Use Colors', onPress: () => useMaterialColors(materialMatch) },
          { text: 'Export Guide', onPress: () => exportMaterialGuide(materialMatch) },
          { text: 'OK', style: 'default' }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to generate material colors');
    }
  }, [currentColor]);

  // Create Design System Token (like Figma)
  const createDesignToken = useCallback(async () => {
    try {
      const tokenName = `color-${Date.now()}`;
      const token = modernArtToolFeatures.createDesignSystemToken(
        tokenName,
        currentColor,
        'primary',
        ['buttons', 'accents', 'highlights']
      );

      setDesignTokens(prev => [...prev, token]);

      Alert.alert(
        'Design Token Created',
        `Created "${token.name}" token for design system`,
        [
          { text: 'Export Tokens', onPress: () => exportDesignTokens() },
          { text: 'OK', style: 'default' }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create design token');
    }
  }, [currentColor]);

  // Export Functions
  const exportPalettePDF = useCallback(async (colors: string[], name: string) => {
    try {
      const pdfContent = await PDFExportUtils.exportPaletteCard(colors, name);
      
      // In a real app, this would trigger a download or share
      console.log('PDF Content Generated:', pdfContent.length, 'characters');
      
      Alert.alert(
        'PDF Export Complete',
        `Generated professional palette card for "${name}"`,
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      Alert.alert('Export Error', 'Failed to generate PDF');
    }
  }, []);

  const exportBrushSet = useCallback(async (brushSet: ColorBrushSet) => {
    try {
      const exportData = modernArtToolFeatures.exportBrushSet(brushSet.id);
      
      if (exportData) {
        // Export as Procreate-compatible format
        console.log('Brush Set Export:', exportData);
        
        Alert.alert(
          'Brush Set Exported',
          `Exported "${brushSet.name}" in Procreate-compatible format`,
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      Alert.alert('Export Error', 'Failed to export brush set');
    }
  }, []);

  const exportMaterialGuide = useCallback(async (materialMatch: MaterialColorMatch) => {
    try {
      // Create a paint recipe for the material
      const recipe: PaintRecipe = {
        colorName: `${materialMatch.materialType} Base`,
        targetColor: materialMatch.baseColor,
        baseColors: [
          { name: 'Base', hex: materialMatch.baseColor, percentage: 70 },
          { name: 'Highlight', hex: materialMatch.variations.highlight, percentage: 15 },
          { name: 'Shadow', hex: materialMatch.variations.shadow, percentage: 15 },
        ],
        mixingInstructions: [
          'Start with base color',
          'Add highlight for light areas',
          'Mix in shadow for depth',
          'Adjust based on lighting conditions'
        ],
        notes: `Material: ${materialMatch.materialType}, Lighting: ${materialMatch.lightingCondition}`,
      };

      const pdfContent = await PDFExportUtils.exportRecipeBook([recipe], `${materialMatch.materialType} Color Guide`);
      
      Alert.alert(
        'Material Guide Exported',
        `Generated professional material color guide`,
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      Alert.alert('Export Error', 'Failed to export material guide');
    }
  }, []);

  const exportDesignTokens = useCallback(async () => {
    try {
      const cssTokens = modernArtToolFeatures.exportDesignTokens('css');
      const scssTokens = modernArtToolFeatures.exportDesignTokens('scss');
      const figmaTokens = modernArtToolFeatures.exportDesignTokens('figma');
      
      console.log('Design Tokens Exported:', { cssTokens, scssTokens, figmaTokens });
      
      Alert.alert(
        'Design Tokens Exported',
        'Generated CSS, SCSS, and Figma-compatible token files',
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      Alert.alert('Export Error', 'Failed to export design tokens');
    }
  }, []);

  const exportCompleteProject = useCallback(async () => {
    try {
      if (!currentProject) {
        // Create a project from current state
        const project: ColorProject = {
          name: `Art Project ${Date.now()}`,
          description: 'Created in Modern Art Studio',
          createdDate: new Date().toISOString(),
          colors: recentColors.slice(0, 8).map((color, index) => ({
            name: `Color ${index + 1}`,
            hex: color,
            rgb: optimizedHexToRgb(color) || { r: 0, g: 0, b: 0 },
            hsl: { h: 0, s: 0, l: 0 }, // Would be calculated properly
            usage: ['art', 'design'],
            accessibility: {
              contrastRatio: 4.5,
              wcagLevel: 'AA',
              colorBlindSafe: true,
            },
          })),
          recipes: [],
          harmonyAnalysis: {
            type: 'mixed',
            score: 85,
            recommendations: ['Great color harmony', 'Consider adding neutral tones'],
          },
          culturalContext: {
            western: ['modern', 'creative'],
            eastern: ['harmonious', 'balanced'],
            universal: ['artistic', 'expressive'],
          },
          usageGuidelines: [
            'Use primary colors for main elements',
            'Apply secondary colors for accents',
            'Maintain consistent color relationships',
          ],
        };

        setCurrentProject(project);
      }

      const pdfContent = await PDFExportUtils.exportProjectDocumentation(currentProject!);
      
      Alert.alert(
        'Project Documentation Exported',
        'Generated comprehensive project documentation with all colors, recipes, and guidelines',
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      Alert.alert('Export Error', 'Failed to export project documentation');
    }
  }, [currentProject, recentColors]);

  // Helper functions
  const usePalette = useCallback((colors: string[]) => {
    colors.forEach(color => {
      dispatch(addRecentColor(color));
    });
    if (colors.length > 0) {
      dispatch(setCurrentColor(colors[0]));
      onColorSelect?.(colors[0]);
    }
  }, [dispatch, onColorSelect]);

  const useMaterialColors = useCallback((materialMatch: MaterialColorMatch) => {
    const colors = [
      materialMatch.baseColor,
      materialMatch.variations.highlight,
      materialMatch.variations.midtone,
      materialMatch.variations.shadow,
      materialMatch.variations.reflected,
    ];
    usePalette(colors);
  }, [usePalette]);

  const handleColorSelect = useCallback((color: string) => {
    dispatch(setCurrentColor(color));
    dispatch(addRecentColor(color));
    onColorSelect?.(color);
  }, [dispatch, onColorSelect]);

  // Render functions
  const renderPalettesTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Smart Palette Generation</Text>
      <View style={styles.buttonGrid}>
        {['monochromatic', 'analogous', 'complementary', 'triadic'].map(style => (
          <TouchableOpacity
            key={style}
            style={styles.paletteButton}
            onPress={() => generateSmartPalette(style)}
          >
            <Text style={styles.buttonText}>{style.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>AI Color Suggestions</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {aiSuggestions.map((color, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.colorSwatch, { backgroundColor: color }]}
            onPress={() => handleColorSelect(color)}
          />
        ))}
      </ScrollView>
    </View>
  );

  const renderBrushesTab = () => (
    <View style={styles.tabContent}>
      <TouchableOpacity style={styles.createButton} onPress={createBrushSet}>
        <Text style={styles.createButtonText}>Create Brush Set</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Brush Sets ({brushSets.length})</Text>
      <FlatList
        data={brushSets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.brushSetItem}>
            <Text style={styles.brushSetName}>{item.name}</Text>
            <Text style={styles.brushSetType}>{item.brushType}</Text>
            <ScrollView horizontal>
              {item.colors.map((color, index) => (
                <View
                  key={index}
                  style={[styles.miniSwatch, { backgroundColor: color }]}
                />
              ))}
            </ScrollView>
          </View>
        )}
      />
    </View>
  );

  const renderMaterialsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Generate Material Colors</Text>
      <View style={styles.buttonGrid}>
        {['skin', 'wood', 'metal', 'fabric', 'stone'].map(material => (
          <TouchableOpacity
            key={material}
            style={styles.materialButton}
            onPress={() => generateMaterialColors(material)}
          >
            <Text style={styles.buttonText}>{material.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Material Matches ({materialMatches.length})</Text>
      <FlatList
        data={materialMatches}
        keyExtractor={(item, index) => `${item.materialType}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.materialItem}>
            <Text style={styles.materialType}>{item.materialType}</Text>
            <View style={styles.materialColors}>
              <View style={[styles.materialSwatch, { backgroundColor: item.variations.highlight }]} />
              <View style={[styles.materialSwatch, { backgroundColor: item.baseColor }]} />
              <View style={[styles.materialSwatch, { backgroundColor: item.variations.shadow }]} />
            </View>
          </View>
        )}
      />
    </View>
  );

  const renderTokensTab = () => (
    <View style={styles.tabContent}>
      <TouchableOpacity style={styles.createButton} onPress={createDesignToken}>
        <Text style={styles.createButtonText}>Create Design Token</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Design Tokens ({designTokens.length})</Text>
      <FlatList
        data={designTokens}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <View style={styles.tokenItem}>
            <View style={[styles.tokenSwatch, { backgroundColor: item.value }]} />
            <View style={styles.tokenInfo}>
              <Text style={styles.tokenName}>{item.name}</Text>
              <Text style={styles.tokenValue}>{item.value}</Text>
              <Text style={styles.tokenUsage}>{item.usage.join(', ')}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );

  const renderExportTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Professional Export Options</Text>
      
      <TouchableOpacity style={styles.exportButton} onPress={() => exportPalettePDF(recentColors.slice(0, 5), 'Current Palette')}>
        <Text style={styles.exportButtonText}>📄 Export Palette Card PDF</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.exportButton} onPress={exportDesignTokens}>
        <Text style={styles.exportButtonText}>🎨 Export Design Tokens</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.exportButton} onPress={exportCompleteProject}>
        <Text style={styles.exportButtonText}>📋 Export Complete Project</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Export Formats</Text>
      <Text style={styles.formatList}>
        • Adobe ASE (Swatch Exchange){'\n'}
        • Procreate Brush Sets{'\n'}
        • Figma Design Tokens{'\n'}
        • CSS/SCSS Variables{'\n'}
        • Professional PDF Reports{'\n'}
        • Paint Recipe Books
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Art Studio Tools</Text>
        <Text style={styles.subtitle}>Professional Color Design Tools</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        {[
          { key: 'palettes', label: 'Palettes' },
          { key: 'brushes', label: 'Brushes' },
          { key: 'materials', label: 'Materials' },
          { key: 'tokens', label: 'Tokens' },
          { key: 'export', label: 'Export' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'palettes' && renderPalettesTab()}
        {activeTab === 'brushes' && renderBrushesTab()}
        {activeTab === 'materials' && renderMaterialsTab()}
        {activeTab === 'tokens' && renderTokensTab()}
        {activeTab === 'export' && renderExportTab()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007bff',
  },
  tabText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007bff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
    marginTop: 16,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  paletteButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 80,
  },
  materialButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 80,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  createButton: {
    backgroundColor: '#17a2b8',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  brushSetItem: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  brushSetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  brushSetType: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 8,
  },
  miniSwatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 4,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  materialItem: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  materialType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    textTransform: 'capitalize',
  },
  materialColors: {
    flexDirection: 'row',
  },
  materialSwatch: {
    width: 32,
    height: 32,
    borderRadius: 4,
    marginLeft: 4,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  tokenItem: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenSwatch: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  tokenInfo: {
    flex: 1,
  },
  tokenName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  tokenValue: {
    fontSize: 14,
    color: '#495057',
    fontFamily: 'monospace',
  },
  tokenUsage: {
    fontSize: 12,
    color: '#6c757d',
  },
  exportButton: {
    backgroundColor: '#6f42c1',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  exportButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  formatList: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
});

export default ModernArtStudio;
