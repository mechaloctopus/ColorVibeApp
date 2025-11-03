import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, TextInput, LayoutChangeEvent, Platform, ScrollView, useWindowDimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setCurrentWorkstation } from '../store/slices/uiSlice';
import { setMusicalMode, setCurrentColor as setPaletteCurrentColor, addRecentColor } from '../store/slices/paletteSlice';
import { setCurrentColor as setHslColor } from '../store/slices/colorSlice';
import { hslToHex, hexToHsl } from '../utils/colorEngine';
import { generatePalette, generateAdvancedPalette } from '../utils/paletteGenerator';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY, LAYOUT } from '../styles/designSystem';
import OuijaColorPicker from './OuijaColorPicker';

// Local harmony set for simplified studio
const HARMONIES = [
  { id: 'complementary', label: 'Complementary' },
  { id: 'triadic', label: 'Triadic' },
  { id: 'tetradic', label: 'Tetradic' },
  { id: 'square', label: 'Square' },
  { id: 'analogous', label: 'Analogous' },
  { id: 'monochromatic', label: 'Monochrome' },
  { id: 'musical', label: 'Musical' },
] as const;

type HarmonyId = typeof HARMONIES[number]['id'];

const MUSICAL_MODES: Array<{ id: any; label: string }> = [
  { id: 'major', label: 'Major' },
  { id: 'minor', label: 'Minor' },
  { id: 'dorian', label: 'Dorian' },
  { id: 'phrygian', label: 'Phrygian' },
  { id: 'lydian', label: 'Lydian' },
  { id: 'mixolydian', label: 'Mixolydian' },
  { id: 'locrian', label: 'Locrian' },
];

function copyToClipboard(text: string) {
  try {
    if (typeof navigator !== 'undefined' && (navigator as any).clipboard?.writeText) {
      (navigator as any).clipboard.writeText(text);
    } else if (Platform.OS === 'web') {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  } catch (e) {
    // no-op fallback
  }
}

const SimplifiedStudio: React.FC = () => {
  const dispatch = useDispatch();
  const { isDarkMode } = useSelector((s: RootState) => s.ui);
  const { currentColor, currentMusicalMode } = useSelector((s: RootState) => s.palette);

  const [selectedHarmony, setSelectedHarmony] = useState<HarmonyId>('complementary');
  const [hexInput, setHexInput] = useState<string>(currentColor);

  // Sync input with global currentColor changes from other workstations
  useEffect(() => {
    setHexInput(currentColor);
  }, [currentColor]);
  // Wheel geometry state
  const wheelRef = useRef<View | null>(null);
  const { width: winW, height: winH } = useWindowDimensions();

  const baseHsl = useMemo(() => hexToHsl(currentColor) || { h: 200, s: 100, l: 50 }, [currentColor]);

  // Responsive wheel size: fits viewport comfortably, clamped for usability
  const wheelSize = useMemo(() => {
    const max = Math.min(winW * 0.6, winH * 0.6, 420);
    const min = Math.min(280, Math.max(240, Math.min(winW, winH) * 0.4));
    return Math.max(min, max);
  }, [winW, winH]);

  const updateFromPoint = useCallback((x: number, y: number) => {
    const r = wheelSize / 2;
    const cx = r;
    const cy = r;
    const dx = x - cx;
    const dy = y - cy;
    const angle = Math.atan2(dy, dx); // -PI..PI, 0 at +x
    // Convert to degrees with 0 at top for our wheel visual
    let deg = (angle * 180) / Math.PI + 90;
    if (deg < 0) deg += 360;
    const dist = Math.sqrt(dx * dx + dy * dy);
    // Map distance to saturation (inner 30% to outer 90%)
    const inner = r * 0.3;
    const outer = r * 0.9;
    const satNorm = Math.max(0, Math.min(1, (dist - inner) / (outer - inner)));
    const h = Math.round(deg) % 360;
    const s = Math.round(satNorm * 100);
    const l = 50; // keep simple and vibrant
    const hex = hslToHex(h, Math.max(40, s), l);
    setHexInput(hex.toUpperCase());
    // Sync to global stores for consistency
    dispatch(setHslColor({ hue: h, saturation: Math.max(40, s), lightness: l }));
  }, [dispatch, wheelSize]);

  const handleResponder = useCallback((evt: any) => {
    const { locationX, locationY } = evt.nativeEvent;
    updateFromPoint(locationX, locationY);
  }, [updateFromPoint]);

  const sanitizedHex = useMemo(() => {
    const v = hexInput.trim();
    if (!v) return currentColor;
    const withHash = v.startsWith('#') ? v : `#${v}`;
    const valid = /^#([0-9a-fA-F]{6})$/.test(withHash);
    return valid ? withHash.toLowerCase() : currentColor;
  }, [hexInput, currentColor]);

  // Keep global currentColor in sync with the studio input so other workstations (e.g., Paint Recipes) use the latest color
  useEffect(() => {
    if (sanitizedHex && sanitizedHex !== currentColor) {
      dispatch(setPaletteCurrentColor(sanitizedHex));
    }
  }, [sanitizedHex, currentColor, dispatch]);

  const palette = useMemo(() => {
    const hsl = hexToHsl(sanitizedHex) || baseHsl;
    const baseHue = hsl.h;
    const s = hsl.s;
    const l = hsl.l;
    if (selectedHarmony === 'musical') {
      return generateAdvancedPalette(baseHue, s, l, currentMusicalMode, 'musical', 6);
    }
    if (selectedHarmony === 'monochromatic') {
      return generateAdvancedPalette(baseHue, s, l, 'major', 'monochromatic', 6);
    }
    return generatePalette(selectedHarmony as any, baseHue, s, l);
  }, [sanitizedHex, baseHsl, selectedHarmony, currentMusicalMode]);

  const onHexSubmit = useCallback(() => {
    // No-op: palette recalculates from input already; this is primarily for UX
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? COLORS.dark.background : COLORS.light.background }]}>

      {/* Controls: harmony */}
      <View style={styles.controlsRow}>
        <Text style={[styles.controlLabel, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>Harmony</Text>
        <View style={styles.segmented}>
          {HARMONIES.map(h => (
            <Pressable key={h.id} onPress={() => setSelectedHarmony(h.id)} style={[
              styles.segmentItem,
              { borderColor: isDarkMode ? COLORS.dark.border : COLORS.neutral[200], backgroundColor: isDarkMode ? COLORS.dark.surface : '#fff' },
              selectedHarmony === h.id && styles.segmentItemActive
            ]}>
              <Text style={[styles.segmentText, selectedHarmony === h.id && styles.segmentTextActive]}>{h.label}</Text>
            </Pressable>
          ))}
        </View>
        {selectedHarmony === 'musical' && (
          <View style={styles.musicalRow}>
            {MUSICAL_MODES.map(m => (
              <Pressable key={m.id} onPress={() => dispatch(setMusicalMode(m.id))} style={[styles.modePill, { borderColor: isDarkMode ? COLORS.dark.border : COLORS.neutral[200], backgroundColor: isDarkMode ? COLORS.dark.surface : '#fff' }, currentMusicalMode === m.id && styles.modePillActive]}>
                <Text style={[styles.modeText, currentMusicalMode === m.id && styles.modeTextActive]}>{m.label}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Main content: 2 columns */}
      <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingBottom: 140 }}>
        <View style={[styles.contentRow, winW < 1000 ? { flexDirection: 'column' } : null]}>
          {/* Left: Color wheel + HEX */}
          <View style={styles.leftCol}>
            <View style={[styles.wheelCard, { backgroundColor: isDarkMode ? COLORS.dark.card : COLORS.light.card }] }>
              <View
                style={{ width: wheelSize, height: wheelSize }}
                // Capture pointer/touch on web and mobile
                onStartShouldSetResponder={() => true}
                onResponderStart={handleResponder}
                onResponderMove={handleResponder}
                onResponderRelease={handleResponder}
              >
                <OuijaColorPicker size={wheelSize} />
              </View>
            </View>

            <View style={styles.inputRow}>
              <Text style={[styles.inputLabel, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>HEX</Text>
              <TextInput
                value={hexInput}
                onChangeText={setHexInput}
                onSubmitEditing={onHexSubmit}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                style={[styles.hexInput, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary, borderColor: COLORS.border.focus }]}
              />
            </View>
          </View>

          {/* Right: Palette swatches */}
          <View style={styles.rightCol}>
            <View style={[styles.paletteCard, { backgroundColor: isDarkMode ? COLORS.dark.card : COLORS.light.card }] }>
              <Text style={[styles.sectionTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>Generated Palette</Text>
              <View style={styles.swatchGrid}>
                {palette.map((c, idx) => (
                  <View key={idx} style={styles.swatchWrap}>
                    <Pressable onPress={() => copyToClipboard(c)} style={[styles.swatch, { backgroundColor: c }]}>
                      <Text style={styles.swatchText}>{c.toUpperCase()}</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => { dispatch(setPaletteCurrentColor(c)); dispatch(addRecentColor(c)); dispatch(setCurrentWorkstation('paint-recipes')); }}
                      style={styles.recipeChip}
                    >
                      <Text style={styles.recipeChipText}>Get Recipe</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
              <View style={styles.actionsRow}>
                <Pressable onPress={() => copyToClipboard(palette.join(', '))} style={styles.primaryBtn}>
                  <Text style={styles.primaryBtnText}>Copy All</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 64, paddingHorizontal: SPACING[6], flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, backgroundColor: 'transparent' },
  brand: { fontSize: 18, fontWeight: '700' },
  headerRight: { flexDirection: 'row', gap: 12 },
  headerLink: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  headerLinkText: { fontSize: 14, fontWeight: '600' },

  controlsRow: { paddingHorizontal: SPACING[6], paddingVertical: SPACING[4], gap: 12 },
  controlLabel: { fontSize: 14, fontWeight: '600', opacity: 0.9 },
  segmented: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  segmentItem: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: COLORS.neutral[200], backgroundColor: '#fff' },
  segmentItemActive: { backgroundColor: COLORS.primary[500], borderColor: COLORS.primary[600] },
  segmentText: { fontSize: 13, fontWeight: '600', color: COLORS.neutral[700] },
  segmentTextActive: { color: '#fff' },
  musicalRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  modePill: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1, borderColor: COLORS.neutral[200], backgroundColor: '#fff' },
  modePillActive: { backgroundColor: COLORS.primary[100], borderColor: COLORS.primary[500] },
  modeText: { fontSize: 12, fontWeight: '600', color: COLORS.neutral[700] },
  modeTextActive: { color: COLORS.primary[700] },

  scrollArea: { flex: 1 },
  contentRow: { flex: 1, flexDirection: 'row', padding: SPACING[6], gap: 24 },
  leftCol: { flex: 1, alignItems: 'center', minWidth: 320 },
  rightCol: { flex: 1, minWidth: 320 },

  wheelCard: { padding: SPACING[4], backgroundColor: '#ffffff', borderRadius: BORDER_RADIUS.xl, ...SHADOWS.base },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: SPACING[4] },
  inputLabel: { fontSize: 14, fontWeight: '600' },
  hexInput: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, width: 160, fontFamily: 'monospace' },

  paletteCard: { padding: SPACING[5], backgroundColor: '#ffffff', borderRadius: BORDER_RADIUS.xl, ...SHADOWS.base, minHeight: 200 },
  sectionTitle: { fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: '700', marginBottom: SPACING[3] },
  swatchGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  swatchWrap: { width: 120, height: 80, position: 'relative' },
  swatch: { width: '100%', height: '100%', borderRadius: 12, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 8, ...SHADOWS.sm },
  swatchText: { color: '#fff', fontSize: 12, fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.35)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2, fontFamily: 'monospace' },
  recipeChip: { position: 'absolute', right: 6, bottom: 6, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  recipeChipText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  actionsRow: { marginTop: SPACING[4], flexDirection: 'row', gap: 12 },
  primaryBtn: { backgroundColor: COLORS.primary[500], paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
});

export default SimplifiedStudio;

