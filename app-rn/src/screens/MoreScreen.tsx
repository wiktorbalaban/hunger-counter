import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

const PRIVACY_POLICY_URL = 'https://wiktorbalaban.github.io/hunger-counter/docs/privacy-policy.html';

export default function MoreScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900" style={{ padding: 16 }}>
      <View className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden" style={{ elevation: 1 }}>
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
    </View>
  );
}
