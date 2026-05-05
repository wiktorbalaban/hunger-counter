import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Intensity } from '../models/hunger-entry.model';
import { useTheme } from '../context/ThemeContext';

interface Props {
  value: Intensity | null;
  onChange: (v: Intensity) => void;
}

export function IntensityPicker({ value, onChange }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const config: Record<Intensity, { color: string }> = {
    low:    { color: theme.lowHunger },
    medium: { color: theme.mediumHunger },
    high:   { color: theme.highHunger },
  };
  return (
    <View className="flex-row gap-2">
      {(['low', 'medium', 'high'] as Intensity[]).map(intensity => {
        const { color } = config[intensity];
        const selected = value === intensity;
        return (
          <TouchableOpacity
            key={intensity}
            onPress={() => onChange(intensity)}
            className="flex-1 py-2 rounded-lg items-center"
            style={{ backgroundColor: selected ? color : 'transparent', borderWidth: 1.5, borderColor: color }}
          >
            <Text style={{ color: selected ? theme.onHunger : color }} className="font-semibold text-sm">
              {t(`intensity.${intensity}`)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
