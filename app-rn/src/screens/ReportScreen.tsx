import React, { useEffect, useMemo } from 'react';
import { View, Text, ScrollView, useWindowDimensions } from 'react-native';
import { VictoryBar, VictoryChart, VictoryStack, VictoryAxis, VictoryTheme } from 'victory-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useHunger } from '../context/HungerContext';
import { useTheme } from '../context/ThemeContext';
import { AnimatedDot } from '../components/AnimatedDot';
import { HungerEntry } from '../models/hunger-entry.model';
import { ScreenContainer, SCREEN_MAX_WIDTH } from '../components/ScreenContainer';
import { shouldRequestReview, requestReview } from '../services/rating.service';

const DAYS_SHOWN = 10;

function toHHMM(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function buildDays() {
  return Array.from({ length: DAYS_SHOWN }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    return d;
  });
}

function dayEntries(entries: HungerEntry[], day: Date) {
  const next = new Date(day);
  next.setDate(next.getDate() + 1);
  return entries.filter(e => {
    const t = new Date(e.startTime).getTime();
    return t >= day.getTime() && t < next.getTime();
  });
}

export default function ReportScreen() {
  const { entries } = useHunger();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const chartWidth = Math.min(windowWidth, SCREEN_MAX_WIDTH) - 48;
  const chartHeight = Math.max(windowHeight - 420, 450);

  useEffect(() => {
    if (shouldRequestReview(entries)) {
      requestReview();
    }
  }, [entries]);

  const { lowData, mediumData, highData, labels, hasConc, hasAnyConc, hasData } = useMemo(() => {
    const days = buildDays();
    const low: { x: string; y: number }[]    = [];
    const medium: { x: string; y: number }[] = [];
    const high: { x: string; y: number }[]   = [];
    const conc: boolean[] = [];
    const lbls: string[]  = [];

    days.forEach(day => {
      const de      = dayEntries(entries, day);
      const label = day.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' });
      lbls.push(label);
      low.push({    x: label, y: de.filter(e => e.intensity === 'low')   .reduce((s, e) => s + e.durationMinutes, 0) });
      medium.push({ x: label, y: de.filter(e => e.intensity === 'medium').reduce((s, e) => s + e.durationMinutes, 0) });
      high.push({   x: label, y: de.filter(e => e.intensity === 'high')  .reduce((s, e) => s + e.durationMinutes, 0) });
      conc.push(de.some(e => e.concentrationProblems));
    });

    const hasData = low.some(d => d.y > 0) || medium.some(d => d.y > 0) || high.some(d => d.y > 0);

    return { lowData: low, mediumData: medium, highData: high, labels: lbls, hasConc: conc, hasAnyConc: conc.some(Boolean), hasData };
  }, [entries]);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <ScreenContainer>
        <View className="bg-white dark:bg-gray-800 rounded-xl p-4" style={{ elevation: 2 }}>
          <Text className="font-semibold text-base mb-1 text-gray-500 dark:text-gray-400">{t('report.title')}</Text>
          <Text className="text-xs mb-2 text-gray-400 dark:text-gray-500">{t('report.subtitle', { count: DAYS_SHOWN })}</Text>

          {hasData ? (
          <>
          <VictoryChart
            horizontal
            theme={VictoryTheme.material}
            width={chartWidth}
            height={chartHeight}
            padding={{ left: 72, right: 24, top: 8, bottom: 36 }}
            domainPadding={{ y: 10, x: 20 }}
          >
            <VictoryAxis
              tickFormat={(tick) => {
                const i = labels.indexOf(tick);
                return hasConc[i] ? `● ${tick}` : tick;
              }}
              style={{
                tickLabels: { fontSize: 13, fill: theme.textLabel, padding: 4 },
                axis: { stroke: theme.border },
                grid: { stroke: 'none' },
              }}
            />
            <VictoryAxis
              dependentAxis
              tickCount={4}
              tickFormat={(tick) => toHHMM(tick)}
              style={{
                tickLabels: { fontSize: 12, fill: theme.textMuted },
                axis: { stroke: theme.border },
                grid: { stroke: theme.chartGrid },
              }}
            />
            <VictoryStack>
              <VictoryBar data={highData}   style={{ data: { fill: theme.highHunger } }}   barWidth={theme.chartBarWidth} />
              <VictoryBar data={mediumData} style={{ data: { fill: theme.mediumHunger } }} barWidth={theme.chartBarWidth} />
              <VictoryBar data={lowData}    style={{ data: { fill: theme.lowHunger } }}    barWidth={theme.chartBarWidth} />
            </VictoryStack>
          </VictoryChart>

          {/* Legend */}
          <View className="flex-row flex-wrap gap-3 mt-2 justify-center">
            {hasAnyConc && (
              <View className="flex-row items-center gap-2">
                <AnimatedDot size={7} />
                <Text style={{ color: theme.concLight }} className="text-xs">{t('report.focusIssues')}</Text>
              </View>
            )}
            {([
              { color: theme.highHunger,   key: 'intensity.high'   as const },
              { color: theme.mediumHunger, key: 'intensity.medium' as const },
              { color: theme.lowHunger,    key: 'intensity.low'    as const },
            ]).map(({ color, key }) => (
              <View key={key} className="flex-row items-center gap-1">
                <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: color }} />
                <Text className="text-xs text-gray-500 dark:text-gray-400">{t(key)}</Text>
              </View>
            ))}
          </View>
          </>
          ) : (
          <View className="items-center justify-center" style={{ height: chartHeight, gap: 12 }}>
            <Ionicons name="bar-chart-outline" size={64} color={theme.textMuted} />
            <Text className="text-base text-center text-gray-400 dark:text-gray-500">{t('report.empty')}</Text>
          </View>
          )}
        </View>
        </ScreenContainer>
      </ScrollView>
    </View>
  );
}
