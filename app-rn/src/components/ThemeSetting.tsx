import React, { useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { ListItemPicker } from './ListItemPicker';

type ThemeMeta = { mode: ThemeMode; labelKey: 'more.themeDefault' | 'more.themeLight' | 'more.themeDark'; descriptionKey?: 'more.themeDefaultDescription' };

const THEME_META: ThemeMeta[] = [
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

  const currentLabelKey = THEME_META.find(o => o.mode === themeMode)?.labelKey ?? 'more.themeDefault';

  const items = THEME_META.map(({ mode, labelKey, descriptionKey }) => ({
    key: mode,
    label: t(labelKey),
    description: descriptionKey ? t(descriptionKey) : undefined,
  }));

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

      <ListItemPicker
        visible={modalVisible}
        title={t('more.theme')}
        items={items}
        selectedKey={themeMode}
        onSelect={handleSelect}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
}
