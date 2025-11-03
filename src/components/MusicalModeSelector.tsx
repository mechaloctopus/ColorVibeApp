import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
// Removed Reanimated for compatibility
import { RootState } from '../store/store';
import { setMusicalMode, MusicalMode } from '../store/slices/paletteSlice';

const MUSICAL_MODES: { mode: MusicalMode; name: string; description: string; emotion: string }[] = [
  {
    mode: 'major',
    name: 'Major',
    description: 'Bright, happy, and uplifting colors',
    emotion: '😊 Joyful',
  },
  {
    mode: 'minor',
    name: 'Minor',
    description: 'Deep, complex, and emotional colors',
    emotion: '😌 Contemplative',
  },
  {
    mode: 'dorian',
    name: 'Dorian',
    description: 'Balanced, sophisticated color relationships',
    emotion: '🎭 Sophisticated',
  },
  {
    mode: 'phrygian',
    name: 'Phrygian',
    description: 'Exotic, tension-filled color combinations',
    emotion: '🔥 Intense',
  },
  {
    mode: 'lydian',
    name: 'Lydian',
    description: 'Ethereal, expansive color harmonies',
    emotion: '✨ Dreamy',
  },
  {
    mode: 'mixolydian',
    name: 'Mixolydian',
    description: 'Warm, grounded color schemes',
    emotion: '🌅 Warm',
  },
  {
    mode: 'locrian',
    name: 'Locrian',
    description: 'Rare, dissonant color experiments',
    emotion: '⚡ Edgy',
  },
];

const MusicalModeSelector: React.FC = () => {
  const dispatch = useDispatch();
  const { currentMusicalMode } = useSelector((state: RootState) => state.palette);
  const { isDarkMode } = useSelector((state: RootState) => state.ui);
  
  const [isModalVisible, setIsModalVisible] = useState(false);

  const currentModeInfo = MUSICAL_MODES.find(m => m.mode === currentMusicalMode);

  const handlePress = () => {
    setIsModalVisible(true);
  };

  const selectMode = (mode: MusicalMode) => {
    dispatch(setMusicalMode(mode));
    setIsModalVisible(false);
  };

  const buttonStyle = [
    styles.selectorButton,
    {
      backgroundColor: isDarkMode ? '#333333' : '#ffffff',
      borderColor: isDarkMode ? '#555555' : '#cccccc',
    }
  ];

  const textColor = isDarkMode ? '#ffffff' : '#000000';
  const modalBackgroundColor = isDarkMode ? '#1a1a1a' : '#ffffff';
  const modalBorderColor = isDarkMode ? '#333333' : '#cccccc';

  return (
    <>
      <View>
        <TouchableOpacity style={buttonStyle} onPress={handlePress}>
          <Text style={[styles.modeText, { color: textColor }]}>
            {currentModeInfo?.name || 'Major'}
          </Text>
          <Text style={[styles.emotionText, { color: textColor }]}>
            {currentModeInfo?.emotion || '😊'}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: modalBackgroundColor, borderColor: modalBorderColor }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              Select Musical Mode
            </Text>
            <Text style={[styles.modalSubtitle, { color: textColor }]}>
              Each mode creates unique color harmonies inspired by musical theory
            </Text>

            <ScrollView style={styles.modeList} showsVerticalScrollIndicator={false}>
              {MUSICAL_MODES.map((modeInfo) => (
                <TouchableOpacity
                  key={modeInfo.mode}
                  style={[
                    styles.modeOption,
                    {
                      backgroundColor: currentMusicalMode === modeInfo.mode 
                        ? (isDarkMode ? '#444444' : '#f0f0f0')
                        : 'transparent',
                      borderColor: isDarkMode ? '#555555' : '#e0e0e0',
                    }
                  ]}
                  onPress={() => selectMode(modeInfo.mode)}
                >
                  <View style={styles.modeHeader}>
                    <Text style={[styles.modeName, { color: textColor }]}>
                      {modeInfo.name}
                    </Text>
                    <Text style={styles.modeEmotion}>
                      {modeInfo.emotion}
                    </Text>
                  </View>
                  <Text style={[styles.modeDescription, { color: textColor }]}>
                    {modeInfo.description}
                  </Text>
                  
                  {/* Visual representation of the mode */}
                  <View style={styles.modeVisualization}>
                    {[0, 1, 2, 3, 4].map((index) => (
                      <View
                        key={index}
                        style={[
                          styles.modeColorDot,
                          {
                            backgroundColor: `hsl(${(index * 72) + (modeInfo.mode === 'major' ? 0 : 
                              modeInfo.mode === 'minor' ? 30 : 
                              modeInfo.mode === 'dorian' ? 45 : 
                              modeInfo.mode === 'phrygian' ? 60 : 
                              modeInfo.mode === 'lydian' ? 15 : 
                              modeInfo.mode === 'mixolydian' ? 75 : 90)}, 70%, 60%)`,
                          }
                        ]}
                      />
                    ))}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.closeButton, { borderColor: modalBorderColor }]}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={[styles.closeButtonText, { color: textColor }]}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  selectorButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modeText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  emotionText: {
    fontSize: 16,
  },
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
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.7,
  },
  modeList: {
    flex: 1,
  },
  modeOption: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  modeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  modeName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modeEmotion: {
    fontSize: 20,
  },
  modeDescription: {
    fontSize: 14,
    marginBottom: 10,
    opacity: 0.8,
  },
  modeVisualization: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 3,
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MusicalModeSelector;
