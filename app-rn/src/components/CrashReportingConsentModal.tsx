import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { setConsent } from '../services/sentry.service';

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

export default function CrashReportingConsentModal({ visible, onDismiss }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  function handleChoice(allow: boolean) {
    setConsent(allow);
    onDismiss();
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: theme.modalOverlay, justifyContent: 'center', padding: 24 }}>
        <View style={{ backgroundColor: theme.surface, borderRadius: 16, padding: 24, gap: 12 }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: theme.textPrimary }}>
            {t('crashReporting.title')}
          </Text>
          <Text style={{ fontSize: 14, lineHeight: 20, color: theme.textLabel }}>
            {t('crashReporting.message')}
          </Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
            <TouchableOpacity
              onPress={() => handleChoice(false)}
              style={{ flex: 1, padding: 12, borderRadius: 10, alignItems: 'center', backgroundColor: theme.secondarySurface }}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 15, fontWeight: '600', color: theme.textPrimary }}>
                {t('crashReporting.decline')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleChoice(true)}
              style={{ flex: 1, padding: 12, borderRadius: 10, alignItems: 'center', backgroundColor: theme.primary }}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 15, fontWeight: '600', color: theme.onPrimary }}>
                {t('crashReporting.allow')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
