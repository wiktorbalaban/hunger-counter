import React, { useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { getLocales } from 'expo-localization';
import { useTheme } from '../context/ThemeContext';
import i18n, { langStorage, LANG_KEY, AVAILABLE_LANGUAGES, LangCode } from '../i18n';
import { ListItemPicker } from './ListItemPicker';

type SelectedLang = LangCode | 'default';

function currentLangLabel(code: SelectedLang, defaultLabel: string): string {
  if (code === 'default') return defaultLabel;
  return AVAILABLE_LANGUAGES.find(o => o.code === code)?.label ?? defaultLabel;
}

export function LanguageSetting() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [selectedLang, setSelectedLang] = useState<SelectedLang>(
    () => (langStorage.getString(LANG_KEY) as SelectedLang | undefined) ?? 'default'
  );
  const [modalVisible, setModalVisible] = useState(false);

  function handleSelect(code: SelectedLang) {
    setSelectedLang(code);
    langStorage.set(LANG_KEY, code);
    const lang = code === 'default' ? (getLocales()[0]?.languageCode ?? 'en') : code;
    i18n.changeLanguage(lang);
    setModalVisible(false);
  }

  const items = [
    { key: 'default' as SelectedLang, label: t('more.languageDefault') },
    ...AVAILABLE_LANGUAGES.map(({ code, label }) => ({ key: code as SelectedLang, label })),
  ];

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        activeOpacity={0.6}
        className="flex-row items-center border-b border-gray-100 dark:border-gray-700"
        style={{ padding: 16, gap: 12 }}
      >
        <Ionicons name="language-outline" size={22} color={theme.primary} />
        <Text className="flex-1 text-base text-gray-900 dark:text-gray-100">{t('more.language')}</Text>
        <Text className="text-sm text-gray-400 dark:text-gray-500 me-1">
          {currentLangLabel(selectedLang, t('more.languageDefault'))}
        </Text>
        <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
      </TouchableOpacity>

      <ListItemPicker
        visible={modalVisible}
        title={t('more.language')}
        items={items}
        selectedKey={selectedLang}
        onSelect={handleSelect}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
}
