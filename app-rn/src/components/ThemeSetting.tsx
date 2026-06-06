import React, { useState } from 'react';
import { Modal, Text, TouchableOpacity, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme, ThemeMode } from '../context/ThemeContext';

type ThemeOption = {
  mode: ThemeMode;
  labelKey: 'more.themeDefault' | 'more.themeLight' | 'more.themeDark';
  descriptionKey?: 'more.themeDefaultDescription';
};

const THEME_OPTIONS: ThemeOption[] = [
  { mode: 'default', labelKey: 'more.themeDefault', descriptionKey: 'more.themeDefaultDescription' },
  { mode: 'light',   labelKey: 'more.themeLight' },
  { mode: 'dark',    labelKey: 'more.themeDark' },
];

export function ThemeSetting() {
  const { theme, themeMode, setThemeMode } = useTheme();
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);

  function handleSelect(mode: ThemeMode) {
    setThemeMode(mode);
    setModalVisible(false);
  }

  const currentLabelKey = THEME_OPTIONS.find(o => o.mode === themeMode)?.labelKey ?? 'more.themeDefault';

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        activeOpacity={0.6}
        className="flex-row items-center border-b border-gray-100 dark:border-gray-700"
        style={{ padding: 16, gap: 12 }}
      >
        <Ionicons name="contrast-outline" size={22} color={theme.primary} />
        <Text className="flex-1 text-base text-gray-900 dark:text-gray-100">{t('more.theme')}</Text>
        <Text className="text-sm text-gray-400 dark:text-gray-500 me-1">
          {t(currentLabelKey)}
        </Text>
        <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: theme.modalOverlay, padding: 24 }}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            className="w-full rounded-2xl overflow-hidden"
            style={{ backgroundColor: theme.surface, maxHeight: 400 }}
          >
            <Text
              className="text-base font-semibold text-gray-900 dark:text-gray-100"
              style={{ padding: 16, paddingBottom: 8 }}
            >
              {t('more.theme')}
            </Text>
            <ScrollView bounces={false}>
              {THEME_OPTIONS.map(({ mode, labelKey, descriptionKey }, index) => {
                const isLast = index === THEME_OPTIONS.length - 1;
                const isSelected = themeMode === mode;
                return (
                  <TouchableOpacity
                    key={mode}
                    onPress={() => handleSelect(mode)}
                    activeOpacity={0.6}
                    className={`flex-row items-center${isLast ? '' : ' border-b border-gray-100 dark:border-gray-700'}`}
                    style={{ padding: 16, gap: 12 }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text className="text-base text-gray-900 dark:text-gray-100">
                        {t(labelKey)}
                      </Text>
                      {descriptionKey && (
                        <Text className="text-base text-gray-500 dark:text-gray-400 mt-1">
                          {t(descriptionKey)}
                        </Text>
                      )}
                    </View>
                    {isSelected && <Ionicons name="checkmark" size={20} color={theme.primary} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
