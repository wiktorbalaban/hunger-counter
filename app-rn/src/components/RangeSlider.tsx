import React, { useRef, useState } from 'react';
import { View, Text, PanResponder, LayoutChangeEvent } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface Props {
  min: number;
  max: number;
  step: number;
  low: number;
  high: number;
  onChange: (low: number, high: number) => void;
  formatLabel?: (v: number) => string;
}

const THUMB = 28;

export function RangeSlider({ min, max, step, low, high, onChange, formatLabel }: Props) {
  const { theme } = useTheme();
  const [travel, setTravel] = useState(0); // px the thumb's left edge can move across
  const travelRef = useRef(0);

  // Live values + config, read by the pan responders (created once).
  const lowRef = useRef(low);
  const highRef = useRef(high);
  lowRef.current = low;
  highRef.current = high;
  const cfg = useRef({ min, max, step, onChange });
  cfg.current = { min, max, step, onChange };

  const valueToX = (v: number) => {
    const { min: lo, max: hi } = cfg.current;
    const w = travelRef.current;
    if (w <= 0 || hi === lo) return 0;
    return ((v - lo) / (hi - lo)) * w;
  };
  const xToValue = (x: number) => {
    const { min: lo, max: hi, step: st } = cfg.current;
    const w = travelRef.current;
    if (w <= 0) return lo;
    const raw = lo + (x / w) * (hi - lo);
    return Math.min(hi, Math.max(lo, Math.round(raw / st) * st));
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const w = Math.max(0, e.nativeEvent.layout.width - THUMB);
    travelRef.current = w;
    setTravel(w);
  };

  const makeResponder = (which: 'low' | 'high') => {
    let startX = 0;
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startX = valueToX(which === 'low' ? lowRef.current : highRef.current);
      },
      onPanResponderMove: (_, g) => {
        const x = Math.min(Math.max(startX + g.dx, 0), travelRef.current);
        let v = xToValue(x);
        if (which === 'low') {
          v = Math.min(v, highRef.current);
          cfg.current.onChange(v, highRef.current);
        } else {
          v = Math.max(v, lowRef.current);
          cfg.current.onChange(lowRef.current, v);
        }
      },
    });
  };
  const lowResponder = useRef(makeResponder('low')).current;
  const highResponder = useRef(makeResponder('high')).current;

  const lowX = valueToX(low);
  const highX = valueToX(high);
  const fmt = formatLabel ?? ((v: number) => String(v));

  return (
    <View>
      <View onLayout={onLayout} style={{ height: THUMB, justifyContent: 'center' }}>
        {/* Base track */}
        <View
          style={{
            position: 'absolute',
            left: THUMB / 2,
            right: THUMB / 2,
            height: 4,
            borderRadius: 2,
            backgroundColor: theme.border,
          }}
        />
        {/* Selected segment */}
        <View
          style={{
            position: 'absolute',
            left: THUMB / 2 + lowX,
            width: Math.max(0, highX - lowX),
            height: 4,
            borderRadius: 2,
            backgroundColor: theme.primary,
          }}
        />
        {/* Low thumb */}
        <View
          {...lowResponder.panHandlers}
          style={{
            position: 'absolute',
            left: lowX,
            width: THUMB,
            height: THUMB,
            borderRadius: THUMB / 2,
            backgroundColor: theme.surface,
            borderWidth: 3,
            borderColor: theme.primary,
            elevation: 2,
          }}
        />
        {/* High thumb */}
        <View
          {...highResponder.panHandlers}
          style={{
            position: 'absolute',
            left: highX,
            width: THUMB,
            height: THUMB,
            borderRadius: THUMB / 2,
            backgroundColor: theme.surface,
            borderWidth: 3,
            borderColor: theme.primary,
            elevation: 2,
          }}
        />
      </View>

      {/* Thumb value labels */}
      <View style={{ height: 18, marginTop: 4 }}>
        <Text
          style={{ position: 'absolute', left: lowX, width: THUMB * 2.5, marginLeft: -(THUMB * 0.75), textAlign: 'center', color: theme.textSecondary }}
          className="text-xs font-semibold"
        >
          {fmt(low)}
        </Text>
        <Text
          style={{ position: 'absolute', left: highX, width: THUMB * 2.5, marginLeft: -(THUMB * 0.75), textAlign: 'center', color: theme.textSecondary }}
          className="text-xs font-semibold"
        >
          {fmt(high)}
        </Text>
      </View>
    </View>
  );
}
