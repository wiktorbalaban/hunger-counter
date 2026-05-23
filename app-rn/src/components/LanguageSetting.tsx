import React, { useState } from 'react';
import { Modal, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { getLocales } from 'expo-localization';
import { useTheme } from '../context/ThemeContext';
import i18n, { langStorage, LANG_KEY, AVAILABLE_LANGUAGES, LangCode } from '../i18n';

type SelectedLang = LangCode | 'default';

const LANGUAGE_OPTIONS: { code: SelectedLang; label: string | null }[] = [
  { code: 'default', label: null },
  ...AVAILABLE_LANGUAGES,
];

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
              {t('more.language')}
            </Text>
            <ScrollView bounces={false}>
              {LANGUAGE_OPTIONS.map(({ code, label }, index) => {
                const isLast = index === LANGUAGE_OPTIONS.length - 1;
                const isSelected = selectedLang === code;
                return (
                  <TouchableOpacity
                    key={code}
                    onPress={() => handleSelect(code)}
                    activeOpacity={0.6}
                    className={`flex-row items-center${isLast ? '' : ' border-b border-gray-100 dark:border-gray-700'}`}
                    style={{ padding: 16, gap: 12 }}
                  >
                    <Text className="flex-1 text-base text-gray-900 dark:text-gray-100">
                      {label ?? t('more.languageDefault')}
                    </Text>
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
