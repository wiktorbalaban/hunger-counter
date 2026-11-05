import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import BaseWheelPicker, { withVirtualized } from '@quidone/react-native-wheel-picker';
import { useTranslation } from 'react-i18next';
import { AppButton } from './AppButton';
import { useTheme } from '../context/ThemeContext';

const WheelPicker = withVirtualized(BaseWheelPicker);

interface Props {
  visible: boolean;
  initialValue?: number;
  onSet: (mins: number) => void;
  onCancel: () => void;
}

const MAX_MINS = 300;

function formatDuration(m: number): string {
  if (m === 0) return '0min';
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (h === 0) return `${rem}min`;
  if (rem === 0) return `${h}h`;
  return `${h}h ${rem}min`;
}

const WHEEL_DATA = Array.from({ length: MAX_MINS + 1 }, (_, i) => ({ value: i, label: formatDuration(i) }));

export function DurationPickerModal({ visible, initialValue = 15, onSet, onCancel }: Props) {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const [mins, setMins] = useState(initialValue);

  useEffect(() => {
    if (visible) setMins(initialValue);
  }, [visible, initialValue]);

  const handleMinus = () => setMins(mins < 15 ? 0 : mins - 15);
  const handlePlus = () => setMins(Math.min(MAX_MINS, mins + 15));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={{ flex: 1, backgroundColor: theme.modalOverlay, justifyContent: 'center', alignItems: 'center' }}>
        <View className="bg-white dark:bg-gray-900 rounded-2xl p-6 mx-8 w-80 gap-5">
          <View
            className="border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden"
            style={{ alignSelf: 'center', width: 160 }}
          >
            <WheelPicker
              data={WHEEL_DATA}
              value={mins}
              onValueChanged={({ item: { value } }) => setMins(value)}
              itemHeight={52}
              visibleItemCount={3}
              itemTextStyle={{ fontSize: 26, fontWeight: '600', color: theme.textPrimary }}
              overlayItemStyle={{ backgroundColor: isDark ? theme.surface : theme.secondarySurface }}
            />
          </View>

          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={handleMinus}
              disabled={mins === 0}
              className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-600 items-center"
              style={{ opacity: mins === 0 ? 0.3 : 1 }}
            >
              <Text className="text-gray-700 dark:text-gray-300 text-xl font-semibold">− 15</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handlePlus}
              disabled={mins >= MAX_MINS}
              className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-600 items-center"
              style={{ opacity: mins >= MAX_MINS ? 0.3 : 1 }}
            >
              <Text className="text-gray-700 dark:text-gray-300 text-xl font-semibold">+ 15</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-4">
            <AppButton
              variant="secondary"
              size="sm"
              label={t('common.cancel')}
              onPress={onCancel}
              fullWidth
            />
            <AppButton
              size="sm"
              label={t('common.set')}
              onPress={() => onSet(mins)}
              fullWidth
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
