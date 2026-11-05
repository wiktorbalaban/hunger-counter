import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export type AppButtonVariant = 'primary' | 'secondary';

export type AppButtonSize = 'sm' | 'md' | 'lg' | 'hero';

interface SizePreset {
  paddingVertical: number;
  borderRadius: number;
  fontSize: number;
  fontWeight: TextStyle['fontWeight'];
  iconSize: number;
  elevated: boolean;
}

/**
 * Pre-configured sizes. Pick one with the `size` prop; any individual value can
 * still be overridden per instance (e.g. `borderRadius`, `textStyle`, `elevated`).
 *   sm   — modal / dialog actions
 *   md   — standard screen buttons (default)
 *   lg   — prominent call-to-action
 *   hero — oversized primary action
 */
const SIZE_PRESETS: Record<AppButtonSize, SizePreset> = {
  sm:   { paddingVertical: 12, borderRadius: 12, fontSize: 15, fontWeight: '600', iconSize: 18, elevated: false },
  md:   { paddingVertical: 16, borderRadius: 12, fontSize: 16, fontWeight: '700', iconSize: 20, elevated: false },
  lg:   { paddingVertical: 20, borderRadius: 12, fontSize: 18, fontWeight: '700', iconSize: 20, elevated: true  },
  hero: { paddingVertical: 28, borderRadius: 16, fontSize: 20, fontWeight: '700', iconSize: 26, elevated: true  },
};

export interface AppButtonProps {
  label: string;
  onPress: () => void;
  /**
   * `primary` — filled accent in light mode, dark background + primary outline in dark mode.
   * `secondary` — transparent with a neutral border (cancel / dismiss actions).
   */
  variant?: AppButtonVariant;
  /** Pre-configured size preset. Defaults to `md`. */
  size?: AppButtonSize;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  /** Overrides the size preset's icon size. */
  iconSize?: number;
  disabled?: boolean;
  /** Stretch to fill a flex row (flex: 1). */
  fullWidth?: boolean;
  /** Overrides the size preset's raised shadow. */
  elevated?: boolean;
  /** Overrides the size preset's vertical padding. */
  paddingVertical?: number;
  paddingHorizontal?: number;
  /** Overrides the size preset's border radius. */
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  /** Overrides the size preset's label size/weight (applied after the defaults). */
  textStyle?: StyleProp<TextStyle>;
  activeOpacity?: number;
}

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconSize,
  disabled = false,
  fullWidth = false,
  elevated,
  paddingVertical,
  paddingHorizontal,
  borderRadius,
  style,
  textStyle,
  activeOpacity = 0.85,
}: AppButtonProps) {
  const { theme, isDark } = useTheme();
  const isPrimary = variant === 'primary';
  const preset = SIZE_PRESETS[size];

  const resolvedPaddingVertical = paddingVertical ?? preset.paddingVertical;
  const resolvedBorderRadius = borderRadius ?? preset.borderRadius;
  const resolvedIconSize = iconSize ?? preset.iconSize;
  const resolvedElevated = elevated ?? preset.elevated;

  const backgroundColor = isPrimary
    ? (isDark ? theme.surface : theme.buttonSurface)
    : 'transparent';
  const borderWidth = isPrimary ? (isDark ? 2 : 0) : 1;
  const borderColor = isPrimary ? theme.primary : theme.borderStrong;
  const contentColor = isPrimary
    ? (isDark ? theme.primary : theme.onPrimary)
    : theme.textSecondary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={activeOpacity}
      style={[
        {
          flex: fullWidth ? 1 : undefined,
          paddingVertical: resolvedPaddingVertical,
          paddingHorizontal,
          borderRadius: resolvedBorderRadius,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor,
          borderWidth,
          borderColor,
          opacity: disabled ? 0.5 : 1,
        },
        resolvedElevated && {
          elevation: 4,
          shadowColor: '#000',
          shadowOpacity: 0.18,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: icon ? 8 : 0 }}>
        {icon ? <Ionicons name={icon} size={resolvedIconSize} color={contentColor} /> : null}
        <Text style={[{ color: contentColor, fontWeight: preset.fontWeight, fontSize: preset.fontSize }, textStyle]}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
