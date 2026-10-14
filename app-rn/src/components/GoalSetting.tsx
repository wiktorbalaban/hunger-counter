import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useGoal } from '../context/GoalContext';
import { GOAL_SCALE_MIN, GOAL_SCALE_MAX, GOAL_STEP } from '../services/goal.service';
import { formatGoalDuration, formatGoalRange } from '../utils/goal';
import { RangeSlider } from './RangeSlider';

export function GoalSetting() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const { goal, setGoal } = useGoal();

  const [modalVisible, setModalVisible] = useState(false);
  const [draftLow, setDraftLow] = useState(goal.min);
  const [draftHigh, setDraftHigh] = useState(goal.max);

  // Seed the slider from the current goal whenever the modal opens.
  useEffect(() => {
    if (modalVisible) {
      setDraftLow(goal.min);
      setDraftHigh(goal.max);
    }
  }, [modalVisible, goal.min, goal.max]);

  function handleSet() {
    setGoal({ min: draftLow, max: draftHigh });
    setModalVisible(false);
  }

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        activeOpacity={0.6}
        className="flex-row items-center"
        style={{ padding: 16, gap: 12, borderBottomWidth: 1, borderColor: theme.divider }}
      >
        <Ionicons name="flag-outline" size={22} color={theme.primary} />
        <Text style={{ color: theme.textPrimary }} className="flex-1 text-base">{t('more.dailyGoal')}</Text>
        <Text style={{ color: theme.textMuted }} className="text-sm me-1">{formatGoalRange(goal)}</Text>
        <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: theme.modalOverlay, justifyContent: 'center', alignItems: 'center' }}>
          <View className="rounded-2xl p-6 mx-8 gap-5" style={{ width: 320, backgroundColor: theme.surface }}>
            <Text style={{ color: theme.textPrimary }} className="text-lg font-semibold text-center">
              {t('goal.title')}
            </Text>

            <Text className="text-2xl font-bold text-center" style={{ color: theme.primary }}>
              {formatGoalRange({ min: draftLow, max: draftHigh })}
            </Text>

            <View className="px-1">
              <RangeSlider
                min={GOAL_SCALE_MIN}
                max={GOAL_SCALE_MAX}
                step={GOAL_STEP}
                low={draftLow}
                high={draftHigh}
                onChange={(lo, hi) => {
                  setDraftLow(lo);
                  setDraftHigh(hi);
                }}
                formatLabel={formatGoalDuration}
              />
            </View>

            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="flex-1 py-3 rounded-xl items-center"
                style={{ borderWidth: 1, borderColor: theme.borderStrong }}
              >
                <Text style={{ color: theme.textSecondary }} className="font-semibold">{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSet}
                className="flex-1 py-3 rounded-xl items-center"
                style={{ backgroundColor: theme.buttonSurface }}
              >
                <Text style={{ color: isDark ? theme.primary : theme.onPrimary }} className="font-semibold">
                  {t('common.set')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
