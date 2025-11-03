import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { addRecentColor, setCurrentColor } from '../store/slices/paletteSlice';
import { generatePaintRecipe, PaintRecipe, PAINT_BRANDS, MICHAELS_PAINTS } from '../utils/paintRecipes';
import { optimizedHexToRgb, analyzeColorOptimized } from '../utils/optimizedColorEngine';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../styles/designSystem';
import { rgbToCmyk } from '../utils/colorEngine';


interface RecipeHistory {
  id: string;
  color: string;
  recipe: PaintRecipe;
  timestamp: number;
  notes?: string;
}

interface PaintProject {
  id: string;
  name: string;
  colors: string[];
  totalCost: number;
  createdAt: number;
  notes?: string;
}


const PaintRecipeWorkstation: React.FC = () => {
  const { isDarkMode } = useSelector((state: RootState) => state.ui);
  const dispatch = useDispatch();

  const { currentColor, recentColors } = useSelector((state: RootState) => state.palette);

  const [targetColor, setTargetColor] = useState(currentColor || '#3498db');
  const [currentRecipe, setCurrentRecipe] = useState<PaintRecipe | null>(null);
  const [selectedBrand, setSelectedBrand] = useState(
    PAINT_BRANDS.find(b => b.id === MICHAELS_PAINTS.id) || PAINT_BRANDS[0]
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [recipeHistory, setRecipeHistory] = useState<RecipeHistory[]>([]);
  const [currentProject, setCurrentProject] = useState<PaintProject | null>(null);
  const [projectName, setProjectName] = useState('');
  const [recipeNotes, setRecipeNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'recipe' | 'history' | 'projects' | 'calculator'>('recipe');
  const [paintAmount, setPaintAmount] = useState('1'); // cups
  const [surfaceArea, setSurfaceArea] = useState('100'); // square feet

  const [didInitWithPalette, setDidInitWithPalette] = useState(false);
  useEffect(() => {
    if (!didInitWithPalette && currentColor) {
      setTargetColor(currentColor);
      setDidInitWithPalette(true);
    }
  }, [currentColor, didInitWithPalette]);

  const generateRecipe = async () => {
    setIsGenerating(true);

    try {
      const rgb = optimizedHexToRgb(targetColor);
      if (!rgb) throw new Error('Invalid color');

      const recipe = generatePaintRecipe(targetColor, rgb, selectedBrand);
      setCurrentRecipe(recipe);

      // Sync global color and track recent
      dispatch(setCurrentColor(targetColor));
      dispatch(addRecentColor(targetColor));

      // Add to history
      const historyEntry: RecipeHistory = {
        id: Date.now().toString(),
        color: targetColor,
        recipe,
        timestamp: Date.now(),
        notes: recipeNotes,
      };

      setRecipeHistory(prev => [historyEntry, ...prev.slice(0, 19)]); // Keep last 20

    } catch (error) {
      Alert.alert('Error', 'Failed to generate paint recipe');
      console.error('Recipe generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const addToProject = () => {
    if (!currentRecipe || !projectName.trim()) {
      Alert.alert('Error', 'Please enter a project name and generate a recipe first');
      return;
    }

    const project: PaintProject = {
      id: Date.now().toString(),
      name: projectName.trim(),
      colors: [targetColor],
      totalCost: currentRecipe.totalCost,
      createdAt: Date.now(),
      notes: recipeNotes,
    };

    setCurrentProject(project);
    Alert.alert('Success', `Added to project: ${projectName}`);
  };

  const calculatePaintNeeded = (): { totalCost: number; scaledIngredients: any[] } => {
    if (!currentRecipe) return { totalCost: 0, scaledIngredients: [] };

    const baseAmount = parseFloat(paintAmount) || 1;
    const coverage = parseFloat(surfaceArea) || 100;

    // Typical paint coverage: 1 gallon covers ~350 sq ft
    const gallonsNeeded = coverage / 350;
    const scaleFactor = gallonsNeeded / 0.25; // Recipe is for ~1 cup (0.25 gallons)

    const scaledIngredients = currentRecipe.ingredients.map(ingredient => ({
      ...ingredient,
      scaledAmount: (ingredient.ratio / 100) * baseAmount * scaleFactor,
      scaledCost: ingredient.paint.price * (ingredient.ratio / 100) * scaleFactor,
    }));

    const totalCost = scaledIngredients.reduce((sum, ing) => sum + ing.scaledCost, 0);

    return { totalCost, scaledIngredients };
  };

  const renderRecipeTab = () => {
    const { totalCost, scaledIngredients } = calculatePaintNeeded();

    // Additional system calculations (RGB mix proportions and CMYK)
    const rgbForSystems = optimizedHexToRgb(targetColor);
    const sumRGB = rgbForSystems ? rgbForSystems.r + rgbForSystems.g + rgbForSystems.b : 0;
    const rMix = sumRGB ? Math.round((rgbForSystems!.r / sumRGB) * 100) : 0;
    const gMix = sumRGB ? Math.round((rgbForSystems!.g / sumRGB) * 100) : 0;
    const bMix = sumRGB ? Math.round((rgbForSystems!.b / sumRGB) * 100) : 0;
    const cmyk = rgbForSystems ? rgbToCmyk(rgbForSystems.r, rgbForSystems.g, rgbForSystems.b) : null;

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {/* Color Input */}
        <View style={[styles.section, { backgroundColor: isDarkMode ? COLORS.dark.card : COLORS.light.card }]}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
            Target Color
          </Text>
          <View style={styles.colorInputRow}>
            <View style={[styles.colorSwatch, { backgroundColor: targetColor }]} />
            <TextInput
              style={[styles.colorInput, {
                backgroundColor: isDarkMode ? COLORS.dark.surface : COLORS.light.surface,
                color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary,
                borderColor: isDarkMode ? COLORS.dark.border : COLORS.light.border,
              }]}
              value={targetColor}
              onChangeText={setTargetColor}
              placeholder="#3498db"
              placeholderTextColor={isDarkMode ? COLORS.dark.text.tertiary : COLORS.light.text.tertiary}
              onSubmitEditing={generateRecipe}
            />
            <TouchableOpacity
              style={[styles.generateButton, { backgroundColor: COLORS.primary[500] }]}
              onPress={generateRecipe}
              disabled={isGenerating}
            >
              <Text style={styles.generateButtonText}>
                {isGenerating ? '⏳' : '🎨'}
              </Text>
            </TouchableOpacity>

              {/* Quick actions under input */}
              <View style={{ flexDirection: 'row', gap: SPACING[2], marginTop: SPACING[2] }}>
                <TouchableOpacity
                  style={[styles.useCurrentButton, { borderColor: isDarkMode ? COLORS.dark.border : COLORS.light.border }]}
                  onPress={() => {
                    if (currentColor) {
                      setTargetColor(currentColor);
                      generateRecipe();
                    }
                  }}
                >
                  <Text style={[styles.useCurrentButtonText, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>Use Studio Color</Text>
                </TouchableOpacity>
              </View>

              {/* Recent Colors */}
              {recentColors && recentColors.length > 0 && (
                <View style={{ marginTop: SPACING[3] }}>
                  <Text style={{ color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary, marginBottom: SPACING[2], fontWeight: '600' }}>Recent</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', gap: SPACING[2] }}>
                      {recentColors.slice(0, 12).map((c, idx) => (
                        <TouchableOpacity key={idx} onPress={() => { setTargetColor(c); generateRecipe(); }}>
                          <View style={[styles.recentSwatch, { backgroundColor: c }]} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}

          </View>
        </View>

        {/* Brand Selection */}
        <View style={[styles.section, { backgroundColor: isDarkMode ? COLORS.dark.card : COLORS.light.card }]}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
            Paint Brand
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.brandSelector}>
            {PAINT_BRANDS.map((brand, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.brandButton,
                  {
                    backgroundColor: selectedBrand === brand ? COLORS.primary[500] : 'transparent',
                    borderColor: selectedBrand === brand ? COLORS.primary[500] : (isDarkMode ? COLORS.dark.border : COLORS.light.border),
                    opacity: brand.paints && brand.paints.length > 0 ? 1 : 0.5,
                  }
                ]}
                onPress={() => setSelectedBrand(brand)}
                disabled={!brand.paints || brand.paints.length === 0}
              >
                <Text style={[
                  styles.brandButtonText,
                  { color: selectedBrand === brand ? '#ffffff' : (isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary) }
                ]}>
                  {brand.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recipe Results */}
        {currentRecipe && (
          <View style={[styles.section, { backgroundColor: isDarkMode ? COLORS.dark.card : COLORS.light.card }]}>
            <View style={styles.recipeHeader}>
              <Text style={[styles.sectionTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
                Paint Recipe
              </Text>
              <View style={[styles.accuracyBadge, { backgroundColor: getAccuracyColor(currentRecipe.accuracy) }]}>
                <Text style={styles.accuracyText}>{currentRecipe.accuracy}%</Text>
              </View>


            </View>
            {/* Color Systems Summary */}
            <View style={[styles.systemRow, { marginBottom: SPACING[3] }]}>
              <View style={[styles.systemPill, { backgroundColor: isDarkMode ? COLORS.dark.surface : COLORS.light.surface, borderColor: isDarkMode ? COLORS.dark.border : COLORS.light.border }]}>
                <Text style={{ color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary, fontFamily: 'monospace' }}>HEX {targetColor.toUpperCase()}</Text>
              </View>
              <View style={[styles.systemPill, { backgroundColor: isDarkMode ? COLORS.dark.surface : COLORS.light.surface, borderColor: isDarkMode ? COLORS.dark.border : COLORS.light.border }]}>
                <Text style={{ color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }}>RGB mix: R {rMix}% G {gMix}% B {bMix}%</Text>
              </View>
              {cmyk && (
                <View style={[styles.systemPill, { backgroundColor: isDarkMode ? COLORS.dark.surface : COLORS.light.surface, borderColor: isDarkMode ? COLORS.dark.border : COLORS.light.border }]}>
                  <Text style={{ color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }}>CMYK: C {cmyk.c}% M {cmyk.m}% Y {cmyk.y}% K {cmyk.k}%</Text>
                </View>
              )}
            </View>


            {/* Ingredients */}
            <View style={styles.ingredientsList}>
              {currentRecipe.ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredient}>
                  <View style={[styles.paintSwatch, { backgroundColor: ingredient.paint.hex }]} />
                  <View style={styles.ingredientInfo}>
                    <Text style={[styles.paintName, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
                      {ingredient.paint.name}
                    </Text>
                    <Text style={[styles.paintDetails, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
                      {ingredient.amount} • {ingredient.ratio.toFixed(1)}%
                    </Text>
                  </View>
                  <Text style={[styles.paintPrice, { color: COLORS.semantic.success }]}>
                    ${ingredient.paint.price.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Instructions */}
            <View style={styles.instructionsSection}>
              <Text style={[styles.instructionsTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
                Mixing Instructions
              </Text>
              {currentRecipe.mixingInstructions.map((instruction, index) => (
                <Text key={index} style={[styles.instruction, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
                  {index + 1}. {instruction}
                </Text>
              ))}
            </View>

            {/* Tips */}
            {currentRecipe.tips.length > 0 && (
              <View style={styles.tipsSection}>
                <Text style={[styles.tipsTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
                  💡 Pro Tips
                </Text>
                {currentRecipe.tips.map((tip, index) => (
                  <Text key={index} style={[styles.tip, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
                    • {tip}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Project Management */}
        <View style={[styles.section, { backgroundColor: isDarkMode ? COLORS.dark.card : COLORS.light.card }]}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
            Project Management
          </Text>
          <View style={styles.projectInputs}>
            <TextInput
              style={[styles.projectInput, {
                backgroundColor: isDarkMode ? COLORS.dark.surface : COLORS.light.surface,
                color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary,
                borderColor: isDarkMode ? COLORS.dark.border : COLORS.light.border,
              }]}
              value={projectName}
              onChangeText={setProjectName}
              placeholder="Project name (e.g., Living Room Walls)"
              placeholderTextColor={isDarkMode ? COLORS.dark.text.tertiary : COLORS.light.text.tertiary}
            />
            <TextInput
              style={[styles.notesInput, {
                backgroundColor: isDarkMode ? COLORS.dark.surface : COLORS.light.surface,
                color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary,
                borderColor: isDarkMode ? COLORS.dark.border : COLORS.light.border,
              }]}
              value={recipeNotes}
              onChangeText={setRecipeNotes}
              placeholder="Notes (optional)"
              placeholderTextColor={isDarkMode ? COLORS.dark.text.tertiary : COLORS.light.text.tertiary}
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity
              style={[styles.addToProjectButton, { backgroundColor: COLORS.semantic.success }]}
              onPress={addToProject}
            >
              <Text style={styles.addToProjectButtonText}>Add to Project</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderCalculatorTab = () => {
    const { totalCost, scaledIngredients } = calculatePaintNeeded();

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.section, { backgroundColor: isDarkMode ? COLORS.dark.card : COLORS.light.card }]}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
            Paint Calculator
          </Text>

          <View style={styles.calculatorInputs}>
            <View style={styles.calculatorRow}>
              <Text style={[styles.calculatorLabel, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
                Surface Area (sq ft):
              </Text>
              <TextInput
                style={[styles.calculatorInput, {
                  backgroundColor: isDarkMode ? COLORS.dark.surface : COLORS.light.surface,
                  color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary,
                  borderColor: isDarkMode ? COLORS.dark.border : COLORS.light.border,
                }]}
                value={surfaceArea}
                onChangeText={setSurfaceArea}
                keyboardType="numeric"
                placeholder="100"
              />
            </View>

            <View style={styles.calculatorRow}>
              <Text style={[styles.calculatorLabel, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
                Base Amount (cups):
              </Text>
              <TextInput
                style={[styles.calculatorInput, {
                  backgroundColor: isDarkMode ? COLORS.dark.surface : COLORS.light.surface,
                  color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary,
                  borderColor: isDarkMode ? COLORS.dark.border : COLORS.light.border,
                }]}
                value={paintAmount}
                onChangeText={setPaintAmount}
                keyboardType="numeric"
                placeholder="1"
              />
            </View>
          </View>

          {currentRecipe && scaledIngredients.length > 0 && (
            <View style={styles.calculatorResults}>
              <Text style={[styles.calculatorResultsTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
                Scaled Recipe
              </Text>

              {scaledIngredients.map((ingredient, index) => (
                <View key={index} style={styles.scaledIngredient}>
                  <View style={[styles.paintSwatch, { backgroundColor: ingredient.paint.hex }]} />
                  <View style={styles.scaledIngredientInfo}>
                    <Text style={[styles.paintName, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
                      {ingredient.paint.name}
                    </Text>
                    <Text style={[styles.scaledAmount, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
                      {ingredient.scaledAmount.toFixed(2)} cups
                    </Text>
                  </View>
                  <Text style={[styles.scaledCost, { color: COLORS.semantic.success }]}>
                    ${ingredient.scaledCost.toFixed(2)}
                  </Text>
                </View>
              ))}

              <View style={styles.totalCostRow}>
                <Text style={[styles.totalCostLabel, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
                  Total Estimated Cost:
                </Text>
                <Text style={[styles.totalCostValue, { color: COLORS.semantic.success }]}>
                  ${totalCost.toFixed(2)}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    );
  };

  const getAccuracyColor = (accuracy: number): string => {
    if (accuracy >= 90) return COLORS.semantic.success;
    if (accuracy >= 75) return COLORS.accent.orange;
    if (accuracy >= 60) return COLORS.accent.yellow;
    return COLORS.semantic.error;
  };

  const tabs = [
    { id: 'recipe', title: 'Recipe', icon: '🎨' },
    { id: 'calculator', title: 'Calculator', icon: '🧮' },
    { id: 'history', title: 'History', icon: '📋' },
    { id: 'projects', title: 'Projects', icon: '📁' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? COLORS.dark.background : COLORS.light.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>
          Paint Recipe Workstation
        </Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              {
                backgroundColor: activeTab === tab.id ? COLORS.primary[500] : 'transparent',
                borderBottomWidth: activeTab === tab.id ? 2 : 0,
                borderBottomColor: COLORS.primary[500],
              },
            ]}
            onPress={() => setActiveTab(tab.id as any)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[
              styles.tabTitle,
              {
                color: activeTab === tab.id ? '#ffffff' : (isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary),
              },
            ]}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {activeTab === 'recipe' && renderRecipeTab()}
        {activeTab === 'calculator' && renderCalculatorTab()}
        {activeTab === 'history' && (
          <View style={styles.tabContent}>
            <Text style={[styles.comingSoonText, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
              Recipe History - Coming Soon
            </Text>
          </View>
        )}
        {activeTab === 'projects' && (
          <View style={styles.tabContent}>
            <Text style={[styles.comingSoonText, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>
              Project Management - Coming Soon
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: SPACING[5], paddingVertical: SPACING[4], borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.1)' },
  headerTitle: { fontSize: TYPOGRAPHY.fontSize.xl, fontWeight: 'bold' },
  tabNavigation: { flexDirection: 'row', paddingHorizontal: SPACING[2] },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING[3], gap: SPACING[1] },
  tabIcon: { fontSize: 16 },
  tabTitle: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: '600' },
  content: { flex: 1 },
  tabContent: { flex: 1, padding: SPACING[4] },
  section: { marginBottom: SPACING[4], padding: SPACING[4], borderRadius: BORDER_RADIUS.xl, ...SHADOWS.base },
  sectionTitle: { fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: 'bold', marginBottom: SPACING[3] },
  colorInputRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING[3] },
  colorSwatch: { width: 40, height: 40, borderRadius: BORDER_RADIUS.lg, borderWidth: 2, borderColor: '#ffffff', ...SHADOWS.sm },
  colorInput: { flex: 1, paddingHorizontal: SPACING[3], paddingVertical: SPACING[2], borderRadius: BORDER_RADIUS.lg, borderWidth: 1, fontSize: TYPOGRAPHY.fontSize.base, fontFamily: 'monospace' },
  generateButton: { width: 44, height: 44, borderRadius: BORDER_RADIUS.lg, justifyContent: 'center', alignItems: 'center', ...SHADOWS.base },
  generateButtonText: { fontSize: 18 },
  brandSelector: { marginTop: SPACING[2] },
  brandButton: { paddingHorizontal: SPACING[4], paddingVertical: SPACING[2], borderRadius: BORDER_RADIUS.lg, borderWidth: 1, marginRight: SPACING[2] },
  brandButtonText: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: '600' },
  useCurrentButton: { paddingHorizontal: SPACING[3], paddingVertical: SPACING[2], borderRadius: BORDER_RADIUS.lg, borderWidth: 1 },
  useCurrentButtonText: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: '600' },
  recentSwatch: { width: 28, height: 28, borderRadius: BORDER_RADIUS.base, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  systemRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING[2] },
  systemPill: { paddingHorizontal: SPACING[3], paddingVertical: SPACING[1], borderRadius: BORDER_RADIUS.lg, borderWidth: 1 },
  recipeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING[3] },
  accuracyBadge: { paddingHorizontal: SPACING[2], paddingVertical: SPACING[1], borderRadius: BORDER_RADIUS.base },
  accuracyText: { color: '#ffffff', fontSize: TYPOGRAPHY.fontSize.xs, fontWeight: 'bold' },
  ingredientsList: { marginBottom: SPACING[4] },
  ingredient: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING[2], borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.05)' },
  paintSwatch: { width: 24, height: 24, borderRadius: BORDER_RADIUS.base, marginRight: SPACING[3], borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)' },
  ingredientInfo: { flex: 1 },
  paintName: { fontSize: TYPOGRAPHY.fontSize.base, fontWeight: '600' },
  paintDetails: { fontSize: TYPOGRAPHY.fontSize.sm, marginTop: 2 },
  paintPrice: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: 'bold' },
  instructionsSection: { marginBottom: SPACING[4] },
  instructionsTitle: { fontSize: TYPOGRAPHY.fontSize.base, fontWeight: 'bold', marginBottom: SPACING[2] },
  instruction: { fontSize: TYPOGRAPHY.fontSize.sm, lineHeight: 20, marginBottom: SPACING[1] },
  tipsSection: {},
  tipsTitle: { fontSize: TYPOGRAPHY.fontSize.base, fontWeight: 'bold', marginBottom: SPACING[2] },
  tip: { fontSize: TYPOGRAPHY.fontSize.sm, lineHeight: 20, marginBottom: SPACING[1] },
  projectInputs: { gap: SPACING[3] },
  projectInput: { paddingHorizontal: SPACING[3], paddingVertical: SPACING[2], borderRadius: BORDER_RADIUS.lg, borderWidth: 1, fontSize: TYPOGRAPHY.fontSize.base },
  notesInput: { paddingHorizontal: SPACING[3], paddingVertical: SPACING[2], borderRadius: BORDER_RADIUS.lg, borderWidth: 1, fontSize: TYPOGRAPHY.fontSize.base, minHeight: 80, textAlignVertical: 'top' },
  addToProjectButton: { paddingVertical: SPACING[3], borderRadius: BORDER_RADIUS.lg, alignItems: 'center', ...SHADOWS.base },
  addToProjectButtonText: { color: '#ffffff', fontSize: TYPOGRAPHY.fontSize.base, fontWeight: '600' },
  calculatorInputs: { marginBottom: SPACING[4] },
  calculatorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING[3] },
  calculatorLabel: { fontSize: TYPOGRAPHY.fontSize.base, fontWeight: '600', flex: 1 },
  calculatorInput: { width: 100, paddingHorizontal: SPACING[3], paddingVertical: SPACING[2], borderRadius: BORDER_RADIUS.lg, borderWidth: 1, fontSize: TYPOGRAPHY.fontSize.base, textAlign: 'center' },
  calculatorResults: { marginTop: SPACING[4] },
  calculatorResultsTitle: { fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: 'bold', marginBottom: SPACING[3] },
  scaledIngredient: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING[2], borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.05)' },
  scaledIngredientInfo: { flex: 1 },
  scaledAmount: { fontSize: TYPOGRAPHY.fontSize.sm, marginTop: 2 },
  scaledCost: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: 'bold' },
  totalCostRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING[4], paddingTop: SPACING[3], borderTopWidth: 2, borderTopColor: 'rgba(255, 255, 255, 0.1)' },
  totalCostLabel: { fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: 'bold' },
  totalCostValue: { fontSize: TYPOGRAPHY.fontSize.xl, fontWeight: 'bold' },
  comingSoonText: { textAlign: 'center', fontSize: TYPOGRAPHY.fontSize.lg, marginTop: SPACING[8] },
});

export default PaintRecipeWorkstation;
