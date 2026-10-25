import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, AppState } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { SCREEN_MAX_WIDTH } from './ScreenContainer';
import { isSameDay } from '../utils/entry';

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, delta: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + delta);
  return startOfDay(d);
}

interface Props {
  /** Currently selected day. */
  date: Date;
  /** Called with the newly selected day (normalized to local midnight). */
  onChange: (date: Date) => void;
  /** Latest selectable day; the forward arrow is disabled on it. Defaults to today. */
  maxDate?: Date;
  /** Label shown for the max day instead of the formatted date (e.g. "Today"). */
  maxDateLabel?: string;
}

export function DateNavBar({ date, onChange, maxDate = new Date(), maxDateLabel }: Props) {
  const { theme } = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  const atMax = isSameDay(date, maxDate);

  // Dismiss the picker if the app is backgrounded (mirrors DateTimeInput).
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') setShowPicker(false);
    });
    return () => sub.remove();
  }, []);

  const label = atMax && maxDateLabel
    ? maxDateLabel
    : date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

  const onPickerChange = (_: any, picked?: Date) => {
    setShowPicker(false);
    if (picked) onChange(startOfDay(picked));
  };

  return (
    <View className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <View
        className="flex-row items-center justify-between"
        style={{ paddingHorizontal: 16, paddingVertical: 10, width: '100%', maxWidth: SCREEN_MAX_WIDTH, alignSelf: 'center' }}
      >
        <TouchableOpacity
          onPress={() => onChange(addDays(date, -1))}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="p-2"
        >
          <Ionicons name="chevron-back" size={24} color={theme.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          className="flex-row items-center gap-2 px-3 py-2"
        >
          <Ionicons name="calendar-outline" size={18} color={theme.textLabel} />
          <Text className="text-base font-semibold text-gray-900 dark:text-gray-100">{label}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onChange(addDays(date, 1))}
          disabled={atMax}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="p-2"
        >
          <Ionicons name="chevron-forward" size={24} color={atMax ? theme.textMuted : theme.primary} />
        </TouchableOpacity>
      </View>

      {showPicker && (
        <DateTimePicker value={date} mode="date" maximumDate={maxDate} onChange={onPickerChange} />
      )}
    </View>
  );
}
