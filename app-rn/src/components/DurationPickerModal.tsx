import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

interface Props {
  visible: boolean;
  initialValue?: number;
  onSet: (mins: number) => void;
  onCancel: () => void;
}

export function DurationPickerModal({ visible, initialValue = 15, onSet, onCancel }: Props) {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const [mins, setMins] = useState(initialValue);
  const [input, setInput] = useState(String(initialValue));

  useEffect(() => {
    if (visible) {
      setMins(initialValue);
      setInput(String(initialValue));
    }
  }, [visible, initialValue]);

  const handleInput = (text: string) => {
    setInput(text);
    const n = parseInt(text, 10);
    if (!isNaN(n) && n >= 0) setMins(n);
  };

  const handleMinus = () => {
    const next = mins < 15 ? 0 : mins - 15;
    setMins(next);
    setInput(String(next));
  };

  const handlePlus = () => {
    const next = mins + 15;
    setMins(next);
    setInput(String(next));
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: theme.modalOverlay, justifyContent: 'center', alignItems: 'center' }}>
        <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 mx-8 w-72 gap-5">
          <TextInput
            value={input}
            onChangeText={handleInput}
            keyboardType="number-pad"
            className="border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-center text-2xl font-semibold text-gray-900 dark:text-gray-100 dark:bg-gray-700"
          />
          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={handleMinus}
              disabled={mins === 0}
              className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-600 items-center"
              style={{ opacity: mins === 0 ? 0.3 : 1 }}
            >
              <Text className="text-gray-700 dark:text-gray-300 text-xl font-semibold">−</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handlePlus}
              className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-600 items-center"
            >
              <Text className="text-gray-700 dark:text-gray-300 text-xl font-semibold">+</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={onCancel}
              className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-600 items-center"
            >
              <Text className="text-gray-600 dark:text-gray-400 font-semibold">{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onSet(mins)}
              className="flex-1 py-3 rounded-xl items-center"
              style={{ backgroundColor: theme.buttonSurface }}
            >
              <Text style={{ color: isDark ? theme.primary : theme.onPrimary }} className="font-semibold">{t('common.set')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
