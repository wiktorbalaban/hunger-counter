import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useWalkthrough } from './WalkthroughContext';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const CARD_MAX_WIDTH = 320;
const SCREEN_PAD = 16; // min gap from screen edges
const CARD_GAP = 12; // gap between the cutout and the card
const CUTOUT_PAD = 8; // padding around the target inside the hole
const RADIUS = 12; // corner radius of the cutout (matches rounded-xl)
const MAX_MEASURE_ATTEMPTS = 30; // ~0.5s of frames before skipping a step

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/** SVG path: full-screen rect minus a rounded-rect hole (even-odd fill). */
function cutoutPath(W: number, H: number, r: Rect): string {
  const outer = `M0,0 H${W} V${H} H0 Z`;
  const rad = Math.min(RADIUS, r.width / 2, r.height / 2);
  const x2 = r.x + r.width;
  const y2 = r.y + r.height;
  const hole =
    `M${r.x + rad},${r.y} ` +
    `H${x2 - rad} A${rad},${rad} 0 0 1 ${x2},${r.y + rad} ` +
    `V${y2 - rad} A${rad},${rad} 0 0 1 ${x2 - rad},${y2} ` +
    `H${r.x + rad} A${rad},${rad} 0 0 1 ${r.x},${y2 - rad} ` +
    `V${r.y + rad} A${rad},${rad} 0 0 1 ${r.x + rad},${r.y} Z`;
  return `${outer} ${hole}`;
}

export function WalkthroughOverlay() {
  const { activeStep, index, total, next, skip, getTargetRef } = useWalkthrough();
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const { width: W, height: H } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [rect, setRect] = useState<Rect | null>(null);
  const pulse = useRef(new Animated.Value(0.5)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const containerRef = useRef<View>(null);

  // Measure the active target (with retry); skip the step if it never resolves.
  useEffect(() => {
    if (!activeStep) {
      setRect(null);
      return;
    }
    setRect(null);
    let cancelled = false;
    let attempts = 0;

    const attempt = () => {
      if (cancelled) return;
      const node = getTargetRef(activeStep.targetKey)?.current;
      const container = containerRef.current;
      if (!node || !container) return retry();
      // Measure both in the same coordinate system, then position the target
      // relative to the overlay container so any origin offset (status bar /
      // edge-to-edge insets) cancels out.
      container.measureInWindow((cx, cy) => {
        if (cancelled) return;
        node.measureInWindow((x, y, width, height) => {
          if (cancelled) return;
          if (width === 0 && height === 0) return retry();
          setRect({ x: x - cx, y: y - cy, width, height });
        });
      });
    };
    const retry = () => {
      attempts += 1;
      if (attempts > MAX_MEASURE_ATTEMPTS) {
        next(); // target never appeared — advance gracefully
        return;
      }
      requestAnimationFrame(attempt);
    };

    attempt();
    return () => {
      cancelled = true;
    };
    // Re-measure when the step changes or the window resizes (rotation).
  }, [activeStep, getTargetRef, next, W, H]);

  // Pulsing highlight ring.
  useEffect(() => {
    if (!rect) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.5, duration: 750, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [rect, pulse]);

  // Fade the whole overlay in when the tour starts (not on every step change).
  useEffect(() => {
    if (!activeStep) return;
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  }, [!!activeStep, fade]);

  if (!activeStep) return null;

  const isLast = index >= total - 1;

  // Padded cutout rect, clamped to the screen.
  const cut = rect
    ? {
        x: Math.max(rect.x - CUTOUT_PAD, 0),
        y: Math.max(rect.y - CUTOUT_PAD, 0),
        width: 0,
        height: 0,
      }
    : null;
  if (rect && cut) {
    cut.width = Math.min(rect.width + 2 * CUTOUT_PAD, W - cut.x);
    cut.height = Math.min(rect.height + 2 * CUTOUT_PAD, H - cut.y);
  }

  // Tooltip vertical placement.
  let cardStyle: { left: number; top?: number; bottom?: number } | null = null;
  if (rect && cut) {
    const spaceBelow = H - (rect.y + rect.height);
    const spaceAbove = rect.y;
    let placeBelow: boolean;
    if (activeStep.placement === 'above') placeBelow = false;
    else if (activeStep.placement === 'below') placeBelow = true;
    else placeBelow = spaceBelow >= spaceAbove;

    const cardWidth = Math.min(CARD_MAX_WIDTH, W - 2 * SCREEN_PAD);
    const left = clamp(
      rect.x + rect.width / 2 - cardWidth / 2,
      insets.left + SCREEN_PAD,
      W - insets.right - SCREEN_PAD - cardWidth,
    );
    cardStyle = placeBelow
      ? { left, top: cut.y + cut.height + CARD_GAP }
      : { left, bottom: H - (cut.y - CARD_GAP) };
  }

  const primaryTextColor = isDark ? theme.primary : theme.onPrimary;
  const cardWidth = Math.min(CARD_MAX_WIDTH, W - 2 * SCREEN_PAD);
  const interactive = !!activeStep.interactive;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[StyleSheet.absoluteFill, { zIndex: 1000, opacity: fade }]}
    >
      <View
        ref={containerRef}
        collapsable={false}
        pointerEvents="box-none"
        style={StyleSheet.absoluteFill}
      >
      {rect && cut && cardStyle && (
        <>
          {/* Touch layer. Interactive steps make the spotlight itself a tap
              target that advances the tour — the tap is handled entirely here
              and never reaches the real control, so the flow stays reversible.
              The surrounding frame is blocked so only the highlight advances.
              Non-interactive steps advance on any tap. */}
          {interactive ? (
            <>
              <Pressable onPress={() => {}} style={{ position: 'absolute', left: 0, right: 0, top: 0, height: cut.y }} />
              <Pressable onPress={() => {}} style={{ position: 'absolute', left: 0, right: 0, top: cut.y + cut.height, bottom: 0 }} />
              <Pressable onPress={() => {}} style={{ position: 'absolute', top: cut.y, height: cut.height, left: 0, width: cut.x }} />
              <Pressable onPress={() => {}} style={{ position: 'absolute', top: cut.y, height: cut.height, left: cut.x + cut.width, right: 0 }} />
              <Pressable onPress={next} style={{ position: 'absolute', top: cut.y, left: cut.x, width: cut.width, height: cut.height }} />
            </>
          ) : (
            <Pressable style={StyleSheet.absoluteFill} onPress={next} />
          )}

          {/* Scrim with a hole cut out around the target. */}
          <Svg
            width={W}
            height={H}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          >
            <Path d={cutoutPath(W, H, cut)} fill={theme.modalOverlay} fillRule="evenodd" />
          </Svg>

          {/* Pulsing highlight ring around the hole. */}
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: cut.x,
              top: cut.y,
              width: cut.width,
              height: cut.height,
              borderRadius: RADIUS,
              borderWidth: 2,
              borderColor: theme.primary,
              opacity: pulse,
            }}
          />

          {/* Tooltip card. */}
          <View
            style={{
              position: 'absolute',
              width: cardWidth,
              backgroundColor: theme.surface,
              borderRadius: 16,
              padding: 20,
              gap: 12,
              elevation: 6,
              shadowColor: '#000',
              shadowOpacity: 0.2,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
              ...cardStyle,
            }}
          >
            <Text style={{ color: theme.textPrimary, fontSize: 17, fontWeight: '700' }}>
              {t(activeStep.titleKey as never)}
            </Text>
            <Text style={{ color: theme.textLabel, fontSize: 14, lineHeight: 20 }}>
              {t(activeStep.bodyKey as never)}
            </Text>

            <View className="flex-row items-center justify-between" style={{ marginTop: 4 }}>
              {/* Progress dots */}
              <View className="flex-row" style={{ gap: 6 }}>
                {Array.from({ length: total }).map((_, i) => (
                  <View
                    key={i}
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 4,
                      backgroundColor: i === index ? theme.primary : theme.border,
                    }}
                  />
                ))}
              </View>

              <View className="flex-row items-center" style={{ gap: 8 }}>
                {!isLast && (
                  <TouchableOpacity onPress={skip} activeOpacity={0.6} style={{ paddingVertical: 8, paddingHorizontal: 8 }}>
                    <Text style={{ color: theme.textLabel, fontWeight: '600' }}>
                      {t('walkthrough.skip')}
                    </Text>
                  </TouchableOpacity>
                )}
                {!interactive && (
                  <TouchableOpacity
                    onPress={next}
                    activeOpacity={0.7}
                    style={{
                      backgroundColor: theme.buttonSurface,
                      borderRadius: 10,
                      paddingVertical: 10,
                      paddingHorizontal: 20,
                    }}
                  >
                    <Text style={{ color: primaryTextColor, fontWeight: '700' }}>
                      {isLast ? t('walkthrough.gotIt') : t('walkthrough.next')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </>
      )}
      </View>
    </Animated.View>
  );
}
