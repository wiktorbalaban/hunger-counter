import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export function AnimatedDot({ size = 7, color }: { size?: number; color?: string }) {
  const { theme } = useTheme();
  const dotColor = color ?? theme.concLight;
  const opacity = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1,   duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.2, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={{
        opacity,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: dotColor,
        marginTop: 3,
      }}
    />
  );
}
