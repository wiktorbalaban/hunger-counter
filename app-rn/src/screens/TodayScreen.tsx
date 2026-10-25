import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, View, Text, Pressable, TouchableOpacity, Modal, Animated, I18nManager, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePaneNavigation, usePaneFocusEffect } from '../navigation/PaneContext';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useHunger } from '../context/HungerContext';
import { useTheme } from '../context/ThemeContext';
import { useGoal } from '../context/GoalContext';
import { HungerEntry, Intensity } from '../models/hunger-entry.model';
import { isEntryOnDate, isSameDay } from '../utils/entry';
import { ScreenContainer } from '../components/ScreenContainer';
import { DateNavBar } from '../components/DateNavBar';
import { HungerEntryForm } from '../components/HungerEntryForm';
import { EntryCard } from '../components/EntryCard';
import { GoalGauge } from '../components/GoalGauge';

function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function TodayScreen() {
  const { entries, updateEntry, deleteEntry } = useHunger();
  const { theme, isDark } = useTheme();
  const { goal } = useGoal();
  const { t } = useTranslation();
  const navigation = usePaneNavigation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday);
  const [editingEntry, setEditingEntry] = useState<HungerEntry | null>(null);
  const [editorVisible, setEditorVisible] = useState(false);
  const [armedId, setArmedId] = useState<string | null>(null);
  const editSlide = useRef(new Animated.Value(0)).current; // 0 = off-screen, 1 = on-screen

  const isToday = isSameDay(selectedDate, new Date());
  const dayEntries = entries.filter(e => isEntryOnDate(e, selectedDate));
  const totalMins = dayEntries.reduce((s, e) => s + e.durationMinutes, 0);

  const shortDate = selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  // Reset to today whenever the pane regains focus.
  const resetToToday = useCallback(() => {
    setSelectedDate(startOfToday());
    setArmedId(null);
  }, []);
  usePaneFocusEffect(resetToToday);

  const intensityColor: Record<Intensity, string> = {
    low:    theme.lowHunger,
    medium: theme.mediumHunger,
    high:   theme.highHunger,
  };

  useEffect(() => {
    const suffix = totalMins > 0 ? `: ${formatDuration(totalMins)}` : '';
    const base = isToday ? t('tabs.today') : shortDate;
    navigation.setOptions({ title: `${base}${suffix}` });
  }, [totalMins, t, isToday, shortDate]);

  const openEditor = (entry: HungerEntry) => {
    setEditingEntry(entry);
    setEditorVisible(true);
    editSlide.setValue(0);
    Animated.timing(editSlide, { toValue: 1, duration: 260, useNativeDriver: true }).start();
  };

  const closeEditor = () => {
    Animated.timing(editSlide, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => {
      setEditorVisible(false);
      setEditingEntry(null);
    });
  };

  const headerBg = isDark ? theme.surface : theme.primary;
  const headerText = isDark ? theme.primary : theme.onPrimary;

  // Slide in from the text-end edge (right in LTR, left in RTL).
  const editTranslateX = editSlide.interpolate({
    inputRange: [0, 1],
    outputRange: [I18nManager.isRTL ? -width : width, 0],
  });

  return (
    <Pressable className="flex-1 bg-gray-50 dark:bg-gray-900" onPress={() => setArmedId(null)}>
      <ScrollView className="flex-1">
        <ScreenContainer>
          <View style={{ padding: 16, gap: 12 }}>
            <View className="bg-white dark:bg-gray-800 rounded-xl items-center" style={{ padding: 16, elevation: 2 }}>
              <GoalGauge
                totalMinutes={totalMins}
                goal={goal}
                caption={isToday ? t('goal.todayLabel') : shortDate}
              />
            </View>
            {dayEntries.length === 0 && (
              <View className="items-center justify-center" style={{ paddingVertical: 32, gap: 12 }}>
                <Ionicons name="restaurant-outline" size={64} color={theme.textMuted} />
                <Text className="text-base text-center text-gray-400 dark:text-gray-500">
                  {isToday ? t('today.empty') : t('today.emptyDay')}
                </Text>
              </View>
            )}
            {dayEntries.map(entry => (
              <EntryCard
                key={entry.id}
                entry={entry}
                color={intensityColor[entry.intensity]}
                armed={armedId === entry.id}
                onArm={() => setArmedId(entry.id)}
                onDisarm={() => setArmedId(null)}
                onEdit={() => openEditor(entry)}
                onDelete={() => { deleteEntry(entry.id); setArmedId(null); }}
              />
            ))}
          </View>
        </ScreenContainer>
      </ScrollView>

      <DateNavBar date={selectedDate} onChange={(d) => { setArmedId(null); setSelectedDate(d); }} maxDateLabel={t('tabs.today')} />

      <Modal visible={editorVisible} animationType="none" transparent onRequestClose={closeEditor}>
        <Animated.View className="flex-1 bg-gray-50 dark:bg-gray-900" style={{ paddingTop: insets.top, transform: [{ translateX: editTranslateX }] }}>
          <View className="flex-row items-center" style={{ height: 56, paddingHorizontal: 8, backgroundColor: headerBg }}>
            <TouchableOpacity onPress={closeEditor} className="p-2" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="arrow-back" size={24} color={headerText} />
            </TouchableOpacity>
            <Text style={{ color: headerText }} className="font-bold text-lg ms-2">{t('today.editTitle')}</Text>
          </View>
          <ScrollView className="flex-1" contentContainerClassName="pb-8">
            <ScreenContainer>
              <View className="p-4">
                {editingEntry && (
                  <HungerEntryForm
                    initial={editingEntry}
                    submitLabel={t('common.save')}
                    onSubmit={(v) => { updateEntry(editingEntry.id, v); closeEditor(); }}
                  />
                )}
              </View>
            </ScreenContainer>
          </ScrollView>
        </Animated.View>
      </Modal>
    </Pressable>
  );
}
