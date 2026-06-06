import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, AppState } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Props {
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
}

export function DateTimeInput({ value, onChange, placeholder = 'Select date & time' }: Props) {
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [pendingDate, setPendingDate] = useState<Date>(value ?? new Date());

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
        setShowDate(false);
        setShowTime(false);
      }
    });
    return () => sub.remove();
  }, []);

  const onDateChange = (_: any, selected?: Date) => {
    setShowDate(false);
    if (!selected) return;
    setPendingDate(selected);
    setTimeout(() => {
      if (AppState.currentState === 'active') setShowTime(true);
    }, 100);
  };

  const onTimeChange = (_: any, selected?: Date) => {
    setShowTime(false);
    if (!selected) return;
    const combined = new Date(pendingDate);
    combined.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    onChange(combined);
  };

  const label = value
    ? value.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : placeholder;

  return (
    <>
      <TouchableOpacity
        onPress={() => { setPendingDate(value ?? new Date()); setShowDate(true); }}
        className="border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-700"
      >
        <Text className={value ? 'text-gray-900 dark:text-gray-100 text-base' : 'text-gray-400 dark:text-gray-500 text-base'}>{label}</Text>
      </TouchableOpacity>

      {showDate && (
        <DateTimePicker value={pendingDate} mode="date" onChange={onDateChange} />
      )}
      {showTime && (
        <DateTimePicker value={pendingDate} mode="time" onChange={onTimeChange} />
      )}
    </>
  );
}
