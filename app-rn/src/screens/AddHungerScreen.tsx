import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Switch, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useHunger } from '../context/HungerContext';
import { Intensity } from '../models/hunger-entry.model';
import { IntensityPicker } from '../components/IntensityPicker';
import { DateTimeInput } from '../components/DateTimeInput';
import { DurationPickerModal } from '../components/DurationPickerModal';
import { useTheme } from '../context/ThemeContext';

function formatElapsed(ms: number): string {
  const totalMins = Math.floor(ms / 60000);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

function formatDuration(mins: number): string {
  if (mins === 0) return '0 min';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export default function AddHungerScreen({ navigation }: any) {
  const { draft, addEntry, saveDraft, clearDraft } = useHunger();
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const primaryBtnText = { color: isDark ? theme.primary : theme.onPrimary };

  const [mode, setMode] = useState<'track' | 'log'>('track');
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    if (!draft) return;
    const id = setInterval(() => {
      const tick = new Date();
      setNow(tick);
      setEndTime(tick);
    }, 30000);
    return () => clearInterval(id);
  }, [draft]);

  const [startTime,        setStartTime]        = useState(new Date());
  const [startIntensity,   setStartIntensity]   = useState<Intensity | null>(null);
  const [startConc,        setStartConc]        = useState(false);

  const [endTime,          setEndTime]          = useState(new Date());
  const [endIntensity,     setEndIntensity]     = useState<Intensity>('medium');
  const [endConc,          setEndConc]          = useState(false);

  const [logStart,         setLogStart]         = useState<Date | null>(null);
  const [logDuration,      setLogDuration]      = useState<number | null>(null);
  const [logIntensity,     setLogIntensity]     = useState<Intensity>('medium');
  const [logConc,          setLogConc]          = useState(false);

  const [durationModalVisible, setDurationModalVisible] = useState(false);

  useFocusEffect(useCallback(() => {
    setEndTime(new Date());
    if (draft) {
      setEndIntensity(draft.intensity ?? 'medium');
      setEndConc(draft.concentrationProblems ?? false);
    }
  }, [draft]));

  const openDurationModal = () => setDurationModalVisible(true);

  const handleModalSet = (mins: number) => {
    setLogDuration(mins);
    setDurationModalVisible(false);
  };

  const handleStart = () => {
    saveDraft({
      startTime: startTime.toISOString(),
      intensity: startIntensity ?? undefined,
      concentrationProblems: startConc,
    });
  };

  const handleSaveTracked = () => {
    if (!draft?.startTime) return;
    const start = new Date(draft.startTime);
    const durationMinutes = Math.max(1, Math.round((endTime.getTime() - start.getTime()) / 60000));
    addEntry({ startTime: draft.startTime, durationMinutes, intensity: endIntensity, concentrationProblems: endConc });
    clearDraft();
    navigation.navigate('Today');
  };

  const handleSaveManual = () => {
    if (!logDuration || logDuration <= 0) { Alert.alert(t('add.invalidDuration')); return; }
    const startISO = logStart ? logStart.toISOString() : new Date().toISOString();
    addEntry({ startTime: startISO, durationMinutes: logDuration, intensity: logIntensity, concentrationProblems: logConc });
    setLogStart(null); setLogDuration(null); setLogIntensity('medium'); setLogConc(false);
    navigation.navigate('Today');
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900" contentContainerClassName="pb-8">

      {/* Mode toggle */}
      <View className="flex-row m-4 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800" style={{ elevation: 1 }}>
        {(['track', 'log'] as const).map(m => (
          <TouchableOpacity
            key={m} onPress={() => setMode(m)}
            className="flex-1 py-3 items-center"
            style={{ backgroundColor: mode === m ? theme.buttonSurface : 'transparent' }}
          >
            <Text style={{ color: mode === m ? (isDark ? theme.primary : theme.onPrimary) : theme.textInactive }} className="font-semibold">
              {m === 'track' ? t('add.modeTrack') : t('add.modeLog')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── TRACK MODE ── */}
      {mode === 'track' && !draft && (
        <View className="mx-4 gap-4">
          <Card title={t('add.startTime')}>
            <DateTimeInput value={startTime} onChange={setStartTime} placeholder={t('common.selectDateTime')} />
          </Card>
          <Card title={t('add.intensityOptional')}>
            <IntensityPicker value={startIntensity} onChange={setStartIntensity} />
          </Card>
          <Card title={t('add.focusIssues')}>
            <Row label={t('common.concentrationProblems')}>
              <Switch value={startConc} onValueChange={setStartConc} trackColor={{ true: theme.primary, false: theme.border }} thumbColor={theme.surface} />
            </Row>
          </Card>
          <TouchableOpacity onPress={handleStart} className="rounded-xl py-4 items-center" style={{ elevation: 2, backgroundColor: theme.buttonSurface }}>
            <Text style={primaryBtnText} className="font-bold text-base">{t('add.startHunger')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {mode === 'track' && !!draft && (
        <View className="mx-4 gap-4">
          <View className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 rounded-xl p-4 flex-row items-center justify-between">
            <Text className="font-bold text-amber-900 dark:text-amber-200 text-base">{t('add.inProgress')}</Text>
            <Text className="text-amber-800 dark:text-amber-300 font-semibold text-2xl">
              {draft.startTime ? formatElapsed(now.getTime() - new Date(draft.startTime).getTime()) : '—'}
            </Text>
          </View>
          <Card title={t('add.endTime')}>
            <DateTimeInput value={endTime} onChange={setEndTime} placeholder={t('common.selectDateTime')} />
          </Card>
          <Card title={t('add.intensity')}>
            <IntensityPicker value={endIntensity} onChange={setEndIntensity} />
          </Card>
          <Card title={t('add.focusIssues')}>
            <Row label={t('common.concentrationProblems')}>
              <Switch value={endConc} onValueChange={setEndConc} trackColor={{ true: theme.primary, false: theme.border }} thumbColor={theme.surface} />
            </Row>
          </Card>
          <TouchableOpacity onPress={handleSaveTracked} className="rounded-xl py-4 items-center" style={{ elevation: 2, backgroundColor: theme.buttonSurface }}>
            <Text style={primaryBtnText} className="font-bold text-base">{t('common.save')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => clearDraft()} className="border border-gray-300 dark:border-gray-600 rounded-xl py-4 items-center">
            <Text className="text-gray-600 dark:text-gray-400 font-semibold">{t('add.cancelSession')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── LOG MANUALLY ── */}
      {mode === 'log' && (
        <View className="mx-4 gap-4">
          <Card title={t('add.startTimeOptional')}>
            <DateTimeInput value={logStart} onChange={setLogStart} placeholder={t('common.now')} />
          </Card>
          <Card title={t('add.duration')}>
            <TouchableOpacity
              onPress={openDurationModal}
              className="border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-700"
            >
              <Text className={logDuration ? 'text-gray-900 dark:text-gray-100 text-base' : 'text-gray-400 dark:text-gray-500 text-base'}>
                {logDuration ? formatDuration(logDuration) : t('add.setDuration')}
              </Text>
            </TouchableOpacity>
          </Card>
          <Card title={t('add.intensity')}>
            <IntensityPicker value={logIntensity} onChange={setLogIntensity} />
          </Card>
          <Card title={t('add.focusIssues')}>
            <Row label={t('common.concentrationProblems')}>
              <Switch value={logConc} onValueChange={setLogConc} trackColor={{ true: theme.primary, false: theme.border }} thumbColor={theme.surface} />
            </Row>
          </Card>
          <TouchableOpacity
            onPress={handleSaveManual}
            disabled={!logDuration}
            className="rounded-xl py-4 items-center"
            style={{ elevation: 2, opacity: logDuration ? 1 : 0.5, backgroundColor: theme.buttonSurface }}
          >
            <Text style={primaryBtnText} className="font-bold text-base">{t('common.save')}</Text>
          </TouchableOpacity>
        </View>
      )}

      <DurationPickerModal
        visible={durationModalVisible}
        initialValue={logDuration ?? 15}
        onSet={handleModalSet}
        onCancel={() => setDurationModalVisible(false)}
      />

    </ScrollView>
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
