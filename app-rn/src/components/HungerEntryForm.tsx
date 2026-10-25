import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { HungerEntry, Intensity } from '../models/hunger-entry.model';
import { IntensityPicker } from './IntensityPicker';
import { DateTimeInput } from './DateTimeInput';
import { DurationPickerModal } from './DurationPickerModal';
import { useTheme } from '../context/ThemeContext';

function formatDuration(mins: number): string {
  if (mins === 0) return '0 min';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export interface HungerEntryValues {
  startTime: string;
  durationMinutes: number;
  intensity: Intensity;
  concentrationProblems: boolean;
}

interface Props {
  initial?: Partial<Pick<HungerEntry, 'startTime' | 'durationMinutes' | 'intensity' | 'concentrationProblems'>>;
  /** Create/log mode: start time is optional and defaults to now on submit. */
  allowEmptyStart?: boolean;
  submitLabel: string;
  onSubmit: (values: HungerEntryValues) => void;
}

export function HungerEntryForm({ initial, allowEmptyStart = false, submitLabel, onSubmit }: Props) {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const primaryBtnText = { color: isDark ? theme.primary : theme.onPrimary };

  const [start, setStart] = useState<Date | null>(initial?.startTime ? new Date(initial.startTime) : null);
  const [duration, setDuration] = useState<number | null>(initial?.durationMinutes ?? null);
  const [intensity, setIntensity] = useState<Intensity>(initial?.intensity ?? 'medium');
  const [conc, setConc] = useState<boolean>(initial?.concentrationProblems ?? false);
  const [durationModalVisible, setDurationModalVisible] = useState(false);

  const handleSubmit = () => {
    if (!duration || duration <= 0) { Alert.alert(t('add.invalidDuration')); return; }
    const startISO = start ? start.toISOString() : new Date().toISOString();
    onSubmit({ startTime: startISO, durationMinutes: duration, intensity, concentrationProblems: conc });
  };

  return (
    <View className="gap-4">
      <Card title={allowEmptyStart ? t('add.startTimeOptional') : t('add.startTime')}>
        <DateTimeInput
          value={start}
          onChange={setStart}
          placeholder={allowEmptyStart ? t('common.now') : t('common.selectDateTime')}
        />
      </Card>
      <Card title={t('add.duration')}>
        <TouchableOpacity
          onPress={() => setDurationModalVisible(true)}
          className="border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-700"
        >
          <Text className={duration ? 'text-gray-900 dark:text-gray-100 text-base' : 'text-gray-400 dark:text-gray-500 text-base'}>
            {duration ? formatDuration(duration) : t('add.setDuration')}
          </Text>
        </TouchableOpacity>
      </Card>
      <Card title={t('add.intensity')}>
        <IntensityPicker value={intensity} onChange={setIntensity} />
      </Card>
      <Card title={t('add.focusIssues')}>
        <Row label={t('common.concentrationProblems')}>
          <Switch value={conc} onValueChange={setConc} trackColor={{ true: theme.primary, false: theme.border }} thumbColor={theme.surface} />
        </Row>
      </Card>
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={!duration}
        className="rounded-xl py-4 items-center"
        style={{ elevation: 2, opacity: duration ? 1 : 0.5, backgroundColor: theme.buttonSurface }}
      >
        <Text style={primaryBtnText} className="font-bold text-base">{submitLabel}</Text>
      </TouchableOpacity>

      <DurationPickerModal
        visible={durationModalVisible}
        initialValue={duration ?? 15}
        onSet={(mins) => { setDuration(mins); setDurationModalVisible(false); }}
        onCancel={() => setDurationModalVisible(false)}
      />
    </View>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-4 gap-3" style={{ elevation: 1 }}>
      <Text className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide">{title}</Text>
      {children}
    </View>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-gray-800 dark:text-gray-200 text-base">{label}</Text>
      {children}
    </View>
  );
}
