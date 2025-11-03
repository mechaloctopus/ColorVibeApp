import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Palette } from '../store/slices/paletteSlice';
import {
  exportPaletteAsPNG,
  sharePalette,
  savePaletteToDevice,
  exportPaletteAsJSON,
  exportPaletteAsCSS,
  exportPaletteAsSCSS,
  PaletteExportOptions,
} from '../utils/exportUtils';
import { AdvancedExportSystem, ExportUtils, ExportFormat, ExportTemplate, ExportConfig } from '../utils/advancedExportSystem';
import { PremiumInteractions } from '../utils/premiumInteractions';

interface PaletteExportModalProps {
  visible: boolean;
  palette: Palette | null;
  onClose: () => void;
}

const PaletteExportModal: React.FC<PaletteExportModalProps> = ({
  visible,
  palette,
  onClose,
}) => {
  const { isDarkMode } = useSelector((state: RootState) => state.ui);
  
  const [exportOptions, setExportOptions] = useState<PaletteExportOptions>({
    includeColorCodes: true,
    includeHarmonyInfo: true,
    format: 'png',
    quality: 1.0,
    width: 800,
    height: 600,
  });

  // Advanced export configuration
  const [advancedConfig, setAdvancedConfig] = useState<ExportConfig>({
    format: 'json',
    template: 'detailed',
    includeMetadata: true,
    includeAnalysis: true,
    includeAccessibility: true,
    includePerceptual: true,
    compression: 'none',
    quality: 'high',
  });

  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');

  const handleExportPNG = async () => {
    if (!palette) return;
    
    setIsExporting(true);
    try {
      const uri = await exportPaletteAsPNG(palette, exportOptions);
      if (uri) {
        Alert.alert('Success', 'Palette exported as PNG!');
      } else {
        Alert.alert('Error', 'Failed to export palette');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export palette');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (!palette) return;
    
    setIsExporting(true);
    try {
      await sharePalette(palette, exportOptions);
    } catch (error) {
      Alert.alert('Error', 'Failed to share palette');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveToDevice = async () => {
    if (!palette) return;
    
    setIsExporting(true);
    try {
      const uri = await savePaletteToDevice(palette, exportOptions);
      if (uri) {
        Alert.alert('Success', 'Palette saved to device!');
      } else {
        Alert.alert('Error', 'Failed to save palette');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save palette');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = () => {
    if (!palette) return;
    
    try {
      const jsonData = exportPaletteAsJSON(palette);
      // In a real app, you'd save this to a file or copy to clipboard
      Alert.alert('JSON Export', 'JSON data generated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to export as JSON');
    }
  };

  const handleExportCSS = () => {
    if (!palette) return;
    
    try {
      const cssData = exportPaletteAsCSS(palette);
      // In a real app, you'd save this to a file or copy to clipboard
      Alert.alert('CSS Export', 'CSS variables generated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to export as CSS');
    }
  };

  const handleExportSCSS = () => {
    if (!palette) return;

    try {
      const scssData = exportPaletteAsSCSS(palette);
      // In a real app, you'd save this to a file or copy to clipboard
      Alert.alert('SCSS Export', 'SCSS variables generated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to export as SCSS');
    }
  };

  // Advanced export handler
  const handleAdvancedExport = async () => {
    if (!palette) return;

    setIsExporting(true);

    // Premium interaction feedback
    await PremiumInteractions.exportSuccess();

    try {
      const result = await AdvancedExportSystem.exportPalette(
        palette.colors,
        advancedConfig,
        {
          name: palette.name,
          description: `Generated palette with ${palette.colors.length} colors`,
          metadata: {
            createdAt: new Date().toISOString(),
            version: '1.0.0',
            source: 'color-vibe-workstation',
            generator: 'Advanced Export System',
            tags: ['generated', 'color-palette'],
          },
        }
      );

      // In a real app, would save file or share
      Alert.alert(
        'Export Complete',
        `Successfully exported as ${advancedConfig.format.toUpperCase()}\nFilename: ${result.filename}`,
        [
          { text: 'OK', style: 'default' },
          { text: 'Share', onPress: () => {/* Share functionality */} },
        ]
      );

    } catch (error) {
      console.error('Advanced export error:', error);
      Alert.alert('Export Error', 'Failed to export palette with advanced options');
      await PremiumInteractions.error();
    } finally {
      setIsExporting(false);
    }
  };

  const textColor = isDarkMode ? '#ffffff' : '#000000';
  const backgroundColor = isDarkMode ? '#1a1a1a' : '#ffffff';
  const cardBackgroundColor = isDarkMode ? '#2a2a2a' : '#f5f5f5';
  const borderColor = isDarkMode ? '#333333' : '#cccccc';

  if (!palette) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor, borderColor }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>
              Export Palette
            </Text>
            <Text style={[styles.paletteName, { color: textColor }]}>
              {palette.name}
            </Text>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Palette Preview */}
            <View style={[styles.palettePreview, { backgroundColor: cardBackgroundColor, borderColor }]}>
              <View style={styles.colorRow}>
                {palette.colors.map((color, index) => (
                  <View
                    key={index}
                    style={[styles.colorSwatch, { backgroundColor: color }]}
                  />
                ))}
              </View>
            </View>

            {/* Export Options */}
            <View style={[styles.section, { backgroundColor: cardBackgroundColor, borderColor }]}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Export Options
              </Text>
              
              <View style={styles.option}>
                <Text style={[styles.optionLabel, { color: textColor }]}>
                  Include Color Codes
                </Text>
                <Switch
                  value={exportOptions.includeColorCodes}
                  onValueChange={(value) =>
                    setExportOptions({ ...exportOptions, includeColorCodes: value })
                  }
                />
              </View>

              <View style={styles.option}>
                <Text style={[styles.optionLabel, { color: textColor }]}>
                  Include Harmony Info
                </Text>
                <Switch
                  value={exportOptions.includeHarmonyInfo}
                  onValueChange={(value) =>
                    setExportOptions({ ...exportOptions, includeHarmonyInfo: value })
                  }
                />
              </View>

              <View style={styles.option}>
                <Text style={[styles.optionLabel, { color: textColor }]}>
                  High Quality (1.0)
                </Text>
                <Switch
                  value={exportOptions.quality === 1.0}
                  onValueChange={(value) =>
                    setExportOptions({ ...exportOptions, quality: value ? 1.0 : 0.8 })
                  }
                />
              </View>
            </View>

            {/* Export Actions */}
            <View style={[styles.section, { backgroundColor: cardBackgroundColor, borderColor }]}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Export Actions
              </Text>

              <TouchableOpacity
                style={[styles.exportButton, { backgroundColor: '#3498db' }]}
                onPress={handleExportPNG}
                disabled={isExporting}
              >
                <Text style={styles.exportButtonText}>
                  📸 Export as PNG
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.exportButton, { backgroundColor: '#2ecc71' }]}
                onPress={handleShare}
                disabled={isExporting}
              >
                <Text style={styles.exportButtonText}>
                  📤 Share Palette
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.exportButton, { backgroundColor: '#9b59b6' }]}
                onPress={handleSaveToDevice}
                disabled={isExporting}
              >
                <Text style={styles.exportButtonText}>
                  💾 Save to Device
                </Text>
              </TouchableOpacity>
            </View>

            {/* Developer Exports */}
            <View style={[styles.section, { backgroundColor: cardBackgroundColor, borderColor }]}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Developer Formats
              </Text>

              <TouchableOpacity
                style={[styles.exportButton, { backgroundColor: '#f39c12' }]}
                onPress={handleExportJSON}
              >
                <Text style={styles.exportButtonText}>
                  📄 Export as JSON
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.exportButton, { backgroundColor: '#e74c3c' }]}
                onPress={handleExportCSS}
              >
                <Text style={styles.exportButtonText}>
                  🎨 Export as CSS
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.exportButton, { backgroundColor: '#1abc9c' }]}
                onPress={handleExportSCSS}
              >
                <Text style={styles.exportButtonText}>
                  ⚙️ Export as SCSS
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[styles.closeButton, { borderColor }]}
            onPress={onClose}
          >
            <Text style={[styles.closeButtonText, { color: textColor }]}>
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  paletteName: {
    fontSize: 16,
    opacity: 0.7,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  palettePreview: {
    borderRadius: 15,
    borderWidth: 1,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  section: {
    borderRadius: 15,
    borderWidth: 1,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionLabel: {
    fontSize: 16,
  },
  exportButton: {
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  exportButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    margin: 20,
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaletteExportModal;
