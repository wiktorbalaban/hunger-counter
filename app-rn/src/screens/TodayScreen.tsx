import React, { useEffect } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { usePaneNavigation } from '../navigation/PaneContext';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useHunger } from '../context/HungerContext';
import { useTheme } from '../context/ThemeContext';
import { AnimatedDot } from '../components/AnimatedDot';
import { Intensity } from '../models/hunger-entry.model';
import { isTodayEntry } from '../utils/entry';
import { ScreenContainer } from '../components/ScreenContainer';

function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export default function TodayScreen() {
  const { entries } = useHunger();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = usePaneNavigation();
  const todayEntries = entries.filter(isTodayEntry);
  const totalMins = todayEntries.reduce((s, e) => s + e.durationMinutes, 0);

  const intensityColor: Record<Intensity, string> = {
    low:    theme.lowHunger,
    medium: theme.mediumHunger,
    high:   theme.highHunger,
  };

  useEffect(() => {
    const suffix = totalMins > 0 ? `: ${formatDuration(totalMins)}` : '';
    navigation.setOptions({ title: `${t('tabs.today')}${suffix}` });
  }, [totalMins, t]);

  if (todayEntries.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900" style={{ gap: 12 }}>
        <Ionicons name="restaurant-outline" size={64} color={theme.textMuted} />
        <Text className="text-base text-center text-gray-400 dark:text-gray-500">{t('today.empty')}</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScreenContainer>
        <View style={{ padding: 16, gap: 12 }}>
      {todayEntries.map(entry => {
        const color = intensityColor[entry.intensity];
        return (
          <View key={entry.id} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden" style={{ elevation: 2 }}>
            <View style={{ height: 4, backgroundColor: color }} />
            <View style={{ padding: 16, gap: 12 }}>
              <View className="flex-row items-center justify-between">
                <Text style={{ color }} className="font-bold text-base">{t(`intensity.${entry.intensity}`)}</Text>
                <Text className="text-sm text-gray-400 dark:text-gray-500">
                  {new Date(entry.startTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <View className="flex-row gap-2 flex-wrap">
                <Chip icon="time-outline" label={formatDuration(entry.durationMinutes)} primaryColor={theme.primary} />
                {entry.concentrationProblems && (
                  <View style={{ backgroundColor: theme.conc }} className="flex-row items-center gap-1 px-3 py-1 rounded-full">
                    <AnimatedDot size={6} color={theme.white} />
                    <Text className="text-white text-xs font-medium">{t('today.focusIssues')}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        );
      })}
        </View>
      </ScreenContainer>
    </ScrollView>
  );
}

function Chip({ icon, label, primaryColor }: { icon: keyof typeof Ionicons.glyphMap; label: string; primaryColor: string }) {
  return (
    <View style={{ backgroundColor: primaryColor + '1a' }} className="flex-row items-center gap-1 px-3 py-1 rounded-full">
      <Ionicons name={icon} size={13} color={primaryColor} />
      <Text style={{ color: primaryColor }} className="text-xs font-medium">{label}</Text>
    </View>
  );
}
