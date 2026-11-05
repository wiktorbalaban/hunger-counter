import React from 'react';
import { Modal, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { AppButton } from './AppButton';
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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => handleChoice(false)}>
      <View style={{ flex: 1, backgroundColor: theme.modalOverlay, justifyContent: 'center', padding: 24 }}>
        <View style={{ backgroundColor: theme.surface, borderRadius: 16, padding: 24, gap: 12 }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: theme.textPrimary }}>
            {t('crashReporting.title')}
          </Text>
          <Text style={{ fontSize: 14, lineHeight: 20, color: theme.textLabel }}>
            {t('crashReporting.message')}
          </Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
            <AppButton
              variant="secondary"
              size="sm"
              label={t('crashReporting.decline')}
              onPress={() => handleChoice(false)}
              fullWidth
              activeOpacity={0.7}
            />
            <AppButton
              size="sm"
              label={t('crashReporting.allow')}
              onPress={() => handleChoice(true)}
              fullWidth
              activeOpacity={0.7}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
