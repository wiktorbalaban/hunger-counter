import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Linking, Switch, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { getLocales } from 'expo-localization';
import { useTheme } from '../context/ThemeContext';
import { getConsent, setConsent } from '../services/sentry.service';
import i18n, { langStorage, LANG_KEY, AVAILABLE_LANGUAGES, LangCode } from '../i18n';

const PRIVACY_POLICY_URL = 'https://wiktorbalaban.github.io/hunger-counter/privacy-policy.html';

type SelectedLang = LangCode | 'default';

const LANGUAGE_OPTIONS: { code: SelectedLang; label: string | null }[] = [
  { code: 'default', label: null },
  ...AVAILABLE_LANGUAGES,
];

function currentLangLabel(code: SelectedLang, defaultLabel: string): string {
  if (code === 'default') return defaultLabel;
  return AVAILABLE_LANGUAGES.find(o => o.code === code)?.label ?? defaultLabel;
}

export default function MoreScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [crashReporting, setCrashReporting] = useState(() => getConsent() === true);
  const [selectedLang, setSelectedLang] = useState<SelectedLang>(
    () => (langStorage.getString(LANG_KEY) as SelectedLang | undefined) ?? 'default'
  );
  const [langModalVisible, setLangModalVisible] = useState(false);

  function handleCrashReportingToggle(value: boolean) {
    setCrashReporting(value);
    setConsent(value);
  }

  function handleLanguageChange(code: SelectedLang) {
    setSelectedLang(code);
    langStorage.set(LANG_KEY, code);
    const lang = code === 'default' ? (getLocales()[0]?.languageCode ?? 'en') : code;
    i18n.changeLanguage(lang);
    setLangModalVisible(false);
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900" style={{ padding: 16, gap: 16 }}>

      {/* Language + Privacy & crash reporting */}
      <View className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden" style={{ elevation: 1 }}>
        <TouchableOpacity
          onPress={() => setLangModalVisible(true)}
          activeOpacity={0.6}
          className="flex-row items-center border-b border-gray-100 dark:border-gray-700"
          style={{ padding: 16, gap: 12 }}
        >
          <Ionicons name="language-outline" size={22} color={theme.primary} />
          <Text className="flex-1 text-base text-gray-900 dark:text-gray-100">{t('more.language')}</Text>
          <Text className="text-sm text-gray-400 dark:text-gray-500 mr-1">
            {currentLangLabel(selectedLang, t('more.languageDefault'))}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
        </TouchableOpacity>
        <View className="flex-row items-center border-b border-gray-100 dark:border-gray-700" style={{ padding: 16, gap: 12 }}>
          <Ionicons name="bug-outline" size={22} color={theme.primary} />
          <Text className="flex-1 text-base text-gray-900 dark:text-gray-100">
            {t('more.crashReporting')}
          </Text>
          <Switch
            value={crashReporting}
            onValueChange={handleCrashReportingToggle}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#ffffff"
          />
        </View>
        <TouchableOpacity
          onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
          className="flex-row items-center"
          style={{ padding: 16, gap: 12 }}
          activeOpacity={0.6}
        >
          <Ionicons name="shield-checkmark-outline" size={22} color={theme.primary} />
          <Text className="flex-1 text-base text-gray-900 dark:text-gray-100">
            {t('more.privacyPolicy')}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Language picker modal */}
      <Modal
        visible={langModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: theme.modalOverlay, padding: 24 }}
          activeOpacity={1}
          onPress={() => setLangModalVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} className="w-full rounded-2xl overflow-hidden" style={{ backgroundColor: theme.surface, maxHeight: 400 }}>
            <Text className="text-base font-semibold text-gray-900 dark:text-gray-100" style={{ padding: 16, paddingBottom: 8 }}>
              {t('more.language')}
            </Text>
            <ScrollView bounces={false}>
              {LANGUAGE_OPTIONS.map(({ code, label }, index) => {
                const isLast = index === LANGUAGE_OPTIONS.length - 1;
                const isSelected = selectedLang === code;
                return (
                  <TouchableOpacity
                    key={code}
                    onPress={() => handleLanguageChange(code)}
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

    </View>
  );
}
