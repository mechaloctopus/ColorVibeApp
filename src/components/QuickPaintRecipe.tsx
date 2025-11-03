import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { generatePaintRecipe, PaintRecipe } from '../utils/paintRecipes';
import { hexToRgb } from '../utils/colorEngine';

interface QuickPaintRecipeProps {
  color: string;
  isVisible: boolean;
  onClose: () => void;
  onOpenFullRecipe: (color: string) => void;
  isDarkMode: boolean;
}

const QuickPaintRecipe: React.FC<QuickPaintRecipeProps> = ({
  color,
  isVisible,
  onClose,
  onOpenFullRecipe,
  isDarkMode,
}) => {
  const [recipe, setRecipe] = useState<PaintRecipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Animation values
  const modalOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.8);

  // Generate recipe when color changes
  useEffect(() => {
    if (isVisible && color) {
      setIsLoading(true);
      const rgb = hexToRgb(color);
      if (rgb) {
        try {
          const paintRecipe = generatePaintRecipe(color, rgb);
          setRecipe(paintRecipe);
        } catch (error) {
          console.error('Error generating paint recipe:', error);
          setRecipe(null);
        }
      }
      setIsLoading(false);
    }
  }, [color, isVisible]);

  // Handle modal animations
  useEffect(() => {
    if (isVisible) {
      modalOpacity.value = withTiming(1, { duration: 200 });
      modalScale.value = withSpring(1, { damping: 15, stiffness: 200 });
    } else {
      modalOpacity.value = withTiming(0, { duration: 200 });
      modalScale.value = withSpring(0.8, { damping: 15, stiffness: 200 });
    }
  }, [isVisible]);

  const modalStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
    transform: [{ scale: modalScale.value }],
  }));

  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  const getAccuracyColor = (accuracy: number): string => {
    if (accuracy >= 90) return '#2ecc71'; // Green - Excellent
    if (accuracy >= 75) return '#f39c12'; // Orange - Good
    if (accuracy >= 60) return '#e67e22'; // Dark Orange - Fair
    return '#e74c3c'; // Red - Poor
  };

  const getAccuracyLabel = (accuracy: number): string => {
    if (accuracy >= 90) return 'Excellent Match';
    if (accuracy >= 75) return 'Good Match';
    if (accuracy >= 60) return 'Fair Match';
    return 'Approximate Match';
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackground} onPress={onClose} />
        
        <Animated.View
          style={[
            styles.modalContent,
            {
              backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
              borderColor: isDarkMode ? '#555555' : '#cccccc',
            },
            modalStyle,
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.colorSwatch, { backgroundColor: color }]} />
              <View>
                <Text style={[styles.title, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
                  Quick Paint Recipe
                </Text>
                <Text style={[styles.colorCode, { color: isDarkMode ? '#cccccc' : '#666666' }]}>
                  {color.toUpperCase()}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={[styles.loadingText, { color: isDarkMode ? '#cccccc' : '#666666' }]}>
                  Generating recipe...
                </Text>
              </View>
            ) : recipe ? (
              <>
                {/* Accuracy Score */}
                <View style={styles.accuracySection}>
                  <View style={styles.accuracyHeader}>
                    <Text style={[styles.sectionTitle, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
                      Color Match Accuracy
                    </Text>
                    <View style={[styles.accuracyBadge, { backgroundColor: getAccuracyColor(recipe.accuracy) }]}>
                      <Text style={styles.accuracyText}>{recipe.accuracy}%</Text>
                    </View>
                  </View>
                  <Text style={[styles.accuracyLabel, { color: getAccuracyColor(recipe.accuracy) }]}>
                    {getAccuracyLabel(recipe.accuracy)}
                  </Text>
                </View>

                {/* Paint Ingredients */}
                <View style={styles.ingredientsSection}>
                  <Text style={[styles.sectionTitle, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
                    Paint Ingredients
                  </Text>
                  {recipe.ingredients.map((ingredient, index) => (
                    <View key={index} style={styles.ingredient}>
                      <View style={styles.ingredientLeft}>
                        <View style={[styles.paintSwatch, { backgroundColor: ingredient.paint.hex }]} />
                        <View>
                          <Text style={[styles.paintName, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
                            {ingredient.paint.name}
                          </Text>
                          <Text style={[styles.paintBrand, { color: isDarkMode ? '#cccccc' : '#666666' }]}>
                            {ingredient.paint.brand}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.ingredientRight}>
                        <Text style={[styles.paintAmount, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
                          {ingredient.amount}
                        </Text>
                        <Text style={[styles.paintRatio, { color: isDarkMode ? '#cccccc' : '#666666' }]}>
                          {ingredient.ratio.toFixed(1)}%
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Cost Estimate */}
                <View style={styles.costSection}>
                  <View style={styles.costRow}>
                    <Text style={[styles.costLabel, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
                      Estimated Cost:
                    </Text>
                    <Text style={[styles.costValue, { color: '#2ecc71' }]}>
                      {formatCurrency(recipe.totalCost)}
                    </Text>
                  </View>
                </View>

                {/* Quick Instructions */}
                <View style={styles.instructionsSection}>
                  <Text style={[styles.sectionTitle, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
                    Quick Instructions
                  </Text>
                  {recipe.mixingInstructions.slice(0, 3).map((instruction, index) => (
                    <Text key={index} style={[styles.instruction, { color: isDarkMode ? '#cccccc' : '#666666' }]}>
                      {index + 1}. {instruction}
                    </Text>
                  ))}
                  {recipe.mixingInstructions.length > 3 && (
                    <Text style={[styles.moreInstructions, { color: isDarkMode ? '#888888' : '#999999' }]}>
                      +{recipe.mixingInstructions.length - 3} more steps...
                    </Text>
                  )}
                </View>
              </>
            ) : (
              <View style={styles.errorContainer}>
                <Text style={[styles.errorText, { color: isDarkMode ? '#e74c3c' : '#c0392b' }]}>
                  Unable to generate recipe for this color
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton, { borderColor: isDarkMode ? '#555555' : '#cccccc' }]}
              onPress={onClose}
            >
              <Text style={[styles.secondaryButtonText, { color: isDarkMode ? '#cccccc' : '#666666' }]}>
                Close
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={() => onOpenFullRecipe(color)}
            >
              <Text style={styles.primaryButtonText}>Full Recipe</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  colorCode: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#888888',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  accuracySection: {
    marginBottom: 20,
  },
  accuracyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  accuracyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  accuracyText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  accuracyLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  ingredientsSection: {
    marginBottom: 20,
  },
  ingredient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  ingredientLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paintSwatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  paintName: {
    fontSize: 14,
    fontWeight: '600',
  },
  paintBrand: {
    fontSize: 11,
    marginTop: 2,
  },
  ingredientRight: {
    alignItems: 'flex-end',
  },
  paintAmount: {
    fontSize: 12,
    fontWeight: '600',
  },
  paintRatio: {
    fontSize: 10,
    marginTop: 2,
  },
  costSection: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    borderRadius: 12,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  costValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  instructionsSection: {
    marginBottom: 20,
  },
  instruction: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  moreInstructions: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#3498db',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default QuickPaintRecipe;
