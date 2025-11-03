import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, TextInput, LayoutChangeEvent, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setCurrentWorkstation } from '../store/slices/uiSlice';
import { setMusicalMode } from '../store/slices/paletteSlice';
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

  // Wheel geometry state
  const [wheelSize, setWheelSize] = useState<number>(Math.min(LAYOUT.container.lg, 520));
  const wheelRef = useRef<View | null>(null);

  const baseHsl = useMemo(() => hexToHsl(currentColor) || { h: 200, s: 100, l: 50 }, [currentColor]);

  const onWheelLayout = useCallback((e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout;
    setWheelSize(Math.min(width, 520));
  }, []);

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
      {/* Top bar */}
      <View style={[styles.header, { borderBottomColor: isDarkMode ? 'rgba(255,255,255,0.08)' : COLORS.light.border }]}> 
        <Text style={[styles.brand, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>Color Vibe Studio</Text>
        <View style={styles.headerRight}>
          <Pressable accessibilityRole="button" onPress={() => dispatch(setCurrentWorkstation('theory-lab'))} style={styles.headerLink}>
            <Text style={[styles.headerLinkText, { color: COLORS.primary[600] }]}>Labs</Text>
          </Pressable>
        </View>
      </View>

      {/* Controls: harmony */}
      <View style={styles.controlsRow}>
        <Text style={[styles.controlLabel, { color: isDarkMode ? COLORS.dark.text.secondary : COLORS.light.text.secondary }]}>Harmony</Text>
        <View style={styles.segmented}>
          {HARMONIES.map(h => (
            <Pressable key={h.id} onPress={() => setSelectedHarmony(h.id)} style={[styles.segmentItem, selectedHarmony === h.id && styles.segmentItemActive]}> 
              <Text style={[styles.segmentText, selectedHarmony === h.id && styles.segmentTextActive]}>{h.label}</Text>
            </Pressable>
          ))}
        </View>
        {selectedHarmony === 'musical' && (
          <View style={styles.musicalRow}>
            {MUSICAL_MODES.map(m => (
              <Pressable key={m.id} onPress={() => dispatch(setMusicalMode(m.id))} style={[styles.modePill, currentMusicalMode === m.id && styles.modePillActive]}>
                <Text style={[styles.modeText, currentMusicalMode === m.id && styles.modeTextActive]}>{m.label}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Main content: 2 columns */}
      <View style={styles.contentRow}>
        {/* Left: Color wheel + HEX */}
        <View style={styles.leftCol}>
          <View style={styles.wheelCard} onLayout={onWheelLayout}>
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
          <View style={styles.paletteCard}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? COLORS.dark.text.primary : COLORS.light.text.primary }]}>Generated Palette</Text>
            <View style={styles.swatchGrid}>
              {palette.map((c, idx) => (
                <Pressable key={idx} onPress={() => copyToClipboard(c)} style={[styles.swatch, { backgroundColor: c }]}>
                  <Text style={styles.swatchText}>{c.toUpperCase()}</Text>
                </Pressable>
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

  contentRow: { flex: 1, flexDirection: 'row', padding: SPACING[6], gap: 24 },
  leftCol: { flex: 1, alignItems: 'center', minWidth: 380 },
  rightCol: { flex: 1 },

  wheelCard: { padding: SPACING[4], backgroundColor: '#ffffff', borderRadius: BORDER_RADIUS.xl, ...SHADOWS.base },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: SPACING[4] },
  inputLabel: { fontSize: 14, fontWeight: '600' },
  hexInput: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, width: 160, fontFamily: 'monospace' },

  paletteCard: { padding: SPACING[5], backgroundColor: '#ffffff', borderRadius: BORDER_RADIUS.xl, ...SHADOWS.base, minHeight: 200 },
  sectionTitle: { fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: '700', marginBottom: SPACING[3] },
  swatchGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  swatch: { width: 120, height: 80, borderRadius: 12, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 8, ...SHADOWS.sm },
  swatchText: { color: '#fff', fontSize: 12, fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.35)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2, fontFamily: 'monospace' },

  actionsRow: { marginTop: SPACING[4], flexDirection: 'row', gap: 12 },
  primaryBtn: { backgroundColor: COLORS.primary[500], paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
});

export default SimplifiedStudio;

