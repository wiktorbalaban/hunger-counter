import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Switch, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePaneNavigation, usePaneFocusEffect } from '../navigation/PaneContext';
import { useTranslation } from 'react-i18next';
import { useHunger } from '../context/HungerContext';
import { Intensity } from '../models/hunger-entry.model';
import { IntensityPicker } from '../components/IntensityPicker';
import { DateTimeInput } from '../components/DateTimeInput';
import { DurationPickerModal } from '../components/DurationPickerModal';
import { useTheme } from '../context/ThemeContext';
import { ScreenContainer } from '../components/ScreenContainer';
import { isTodayEntry } from '../utils/entry';
import { useWalkthroughTarget, WalkthroughTarget } from '../walkthrough/WalkthroughTarget';
import { useWalkthrough } from '../walkthrough/WalkthroughContext';

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

export default function AddHungerScreen() {
  const navigation = usePaneNavigation();
  const { draft, entries, addEntry, saveDraft, clearDraft } = useHunger();
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const primaryBtnText = { color: isDark ? theme.primary : theme.onPrimary };

  const [mode, setMode] = useState<'track' | 'log'>('track');
  const [now, setNow] = useState(new Date());
  const { ref: modeToggleRef } = useWalkthroughTarget('add.modeToggle');
  const { activeStep } = useWalkthrough();
  const startPulse = useRef(new Animated.Value(1)).current;

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

  const [endTime,          setEndTime]          = useState(new Date());
  const [endIntensity,     setEndIntensity]     = useState<Intensity>('low');
  const [endConc,          setEndConc]          = useState(false);

  const [logStart,         setLogStart]         = useState<Date | null>(null);
  const [logDuration,      setLogDuration]      = useState<number | null>(null);
  const [logIntensity,     setLogIntensity]     = useState<Intensity>('medium');
  const [logConc,          setLogConc]          = useState(false);

  const [durationModalVisible, setDurationModalVisible] = useState(false);

  usePaneFocusEffect(useCallback(() => {
    setEndTime(new Date());
    if (draft) {
      setEndIntensity(draft.intensity ?? 'low');
      setEndConc(draft.concentrationProblems ?? false);
    }
  }, [draft]));

  // One-shot attention pulse on the Start button when the user enters the
  // screen (only when it's actually shown — track mode, no session running).
  usePaneFocusEffect(useCallback(() => {
    if (mode !== 'track' || draft || activeStep) return;
    startPulse.setValue(1);
    const beat = () => Animated.sequence([
      Animated.timing(startPulse, { toValue: 1.01, duration: 200, useNativeDriver: true }),
      Animated.timing(startPulse, { toValue: 1,    duration: 200, useNativeDriver: true }),
    ]);
    // Wait ~2s so the user can read the Today summary before the button bounces.
    const seq = Animated.sequence([Animated.delay(2000), beat(), Animated.delay(120), beat()]);
    seq.start();
    return () => seq.stop();
  }, [mode, draft, activeStep, startPulse]));

  const openDurationModal = () => setDurationModalVisible(true);

  const handleModalSet = (mins: number) => {
    setLogDuration(mins);
    setDurationModalVisible(false);
  };

  const handleStart = () => {
    // Hunger details (intensity, focus issues) are set later on the in-progress
    // screen, so the start action only records the start time.
    saveDraft({
      startTime: startTime.toISOString(),
    });
  };

  // During the walkthrough, render the in-progress (draft) layout for the
  // draft-screen steps even without a real session, so the tour can spotlight
  // intensity / focus / stop. The tap on "Start" is handled by the overlay and
  // never creates a real draft, which keeps the whole tour reversible.
  const tourDraftStep =
    activeStep?.id === 'add-intensity' ||
    activeStep?.id === 'add-focus' ||
    activeStep?.id === 'add-stop' ||
    activeStep?.id === 'tab-overview';

  // Today's totals — shown as a summary on the start screen so it doesn't feel empty.
  const todayEntries = entries.filter(isTodayEntry);
  const todayMinutes = todayEntries.reduce((sum, e) => sum + e.durationMinutes, 0);

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
      <ScreenContainer>

      {/* Mode toggle */}
      <View ref={modeToggleRef} collapsable={false} className="flex-row m-4 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800" style={{ elevation: 1 }}>
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
      {mode === 'track' && !draft && !tourDraftStep && (
        <View className="mx-4 gap-4">
          <Card title={t('add.todaySummary')}>
            {todayEntries.length === 0 ? (
              <Text className="text-gray-400 dark:text-gray-500 text-base">{t('add.todayEmpty')}</Text>
            ) : (
              <View className="flex-row">
                <View className="flex-1 items-center">
                  <Text style={{ color: theme.primary }} className="text-3xl font-bold">{todayEntries.length}</Text>
                  <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">{t('add.sessionsLabel')}</Text>
                </View>
                <View className="flex-1 items-center">
                  <Text style={{ color: theme.primary }} className="text-3xl font-bold">{formatDuration(todayMinutes)}</Text>
                  <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">{t('add.totalLabel')}</Text>
                </View>
              </View>
            )}
          </Card>
          <Card title={t('add.startTime')}>
            <DateTimeInput value={startTime} onChange={setStartTime} placeholder={t('common.selectDateTime')} />
          </Card>
          <WalkthroughTarget targetKey="add.startButton">
            <Animated.View style={{ transform: [{ scale: startPulse }] }}>
              <TouchableOpacity
                onPress={handleStart}
                activeOpacity={0.85}
                className="rounded-2xl py-7 items-center"
                style={{
                  backgroundColor: theme.buttonSurface,
                  elevation: 4,
                  shadowColor: '#000',
                  shadowOpacity: 0.18,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 3 },
                }}
              >
                <View className="flex-row items-center" style={{ gap: 10 }}>
                  <Ionicons name="play" size={26} color={primaryBtnText.color} />
                  <Text style={primaryBtnText} className="font-bold text-xl">{t('add.startHunger')}</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </WalkthroughTarget>
        </View>
      )}

      {mode === 'track' && (!!draft || tourDraftStep) && (
        <View className="mx-4 gap-4">
          <View className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 rounded-xl p-4 flex-row items-center justify-between">
            <Text className="font-bold text-amber-900 dark:text-amber-200 text-base">{t('add.inProgress')}</Text>
            <Text className="text-amber-800 dark:text-amber-300 font-semibold text-2xl">
              {draft?.startTime ? formatElapsed(now.getTime() - new Date(draft.startTime).getTime()) : '—'}
            </Text>
          </View>
          <Card title={t('add.endTime')}>
            <DateTimeInput value={endTime} onChange={setEndTime} placeholder={t('common.selectDateTime')} />
          </Card>
          <WalkthroughTarget targetKey="add.intensity">
            <Card title={t('add.intensity')}>
              <IntensityPicker value={endIntensity} onChange={setEndIntensity} />
            </Card>
          </WalkthroughTarget>
          <WalkthroughTarget targetKey="add.focus">
            <Card title={t('add.focusIssues')}>
              <Row label={t('common.concentrationProblems')}>
                <Switch value={endConc} onValueChange={setEndConc} trackColor={{ true: theme.primary, false: theme.border }} thumbColor={theme.surface} />
              </Row>
            </Card>
          </WalkthroughTarget>
          <WalkthroughTarget targetKey="add.stopButton">
            <TouchableOpacity
              onPress={handleSaveTracked}
              activeOpacity={0.85}
              className="rounded-xl py-5 items-center"
              style={{
                backgroundColor: theme.buttonSurface,
                elevation: 4,
                shadowColor: '#000',
                shadowOpacity: 0.18,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 3 },
              }}
            >
              <View className="flex-row items-center" style={{ gap: 8 }}>
                <Ionicons name="stop" size={20} color={primaryBtnText.color} />
                <Text style={primaryBtnText} className="font-bold text-lg">{t('add.stopHunger')}</Text>
              </View>
            </TouchableOpacity>
          </WalkthroughTarget>
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

      </ScreenContainer>
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
