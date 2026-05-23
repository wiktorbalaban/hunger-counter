import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Linking, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { getConsent, setConsent } from '../services/sentry.service';
import { LanguageSetting } from '../components/LanguageSetting';

const PRIVACY_POLICY_URL = 'https://wiktorbalaban.github.io/hunger-counter/privacy-policy.html';

export default function MoreScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [crashReporting, setCrashReporting] = useState(() => getConsent() === true);

  function handleCrashReportingToggle(value: boolean) {
    setCrashReporting(value);
    setConsent(value);
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900" style={{ padding: 16, gap: 16 }}>

      <View className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden" style={{ elevation: 1 }}>
        <LanguageSetting />
        <View className="flex-row items-center border-b border-gray-100 dark:border-gray-700" style={{ padding: 16, gap: 12 }}>
          <Ionicons name="bug-outline" size={22} color={theme.primary} />
          <Text numberOfLines={1} className="flex-1 text-base text-gray-900 dark:text-gray-100">
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
          <Text numberOfLines={1} className="flex-1 text-base text-gray-900 dark:text-gray-100">
            {t('more.privacyPolicy')}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

    </View>
  );
}
