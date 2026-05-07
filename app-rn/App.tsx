import './global.css';
import './src/i18n';
import './src/tasks/iconSyncTask'; // defineTask must run before React tree
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { HungerProvider } from './src/context/HungerContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { useAppIconSync } from './src/hooks/useAppIconSync';
import { registerIconSyncTask } from './src/tasks/iconSyncTask';
import TabNavigator from './src/navigation/TabNavigator';
import CrashReportingConsentModal from './src/components/CrashReportingConsentModal';
import { initSentry, getConsent } from './src/services/sentry.service';

initSentry();

function AppContent() {
  useAppIconSync();
  const [showConsent, setShowConsent] = useState(() => getConsent() === undefined);

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <TabNavigator />
      <CrashReportingConsentModal visible={showConsent} onDismiss={() => setShowConsent(false)} />
    </NavigationContainer>
  );
}

export default function App() {
  useEffect(() => {
    NavigationBar.setVisibilityAsync('hidden');
    NavigationBar.setBehaviorAsync('overlay-swipe');
    registerIconSyncTask();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <HungerProvider>
          <AppContent />
        </HungerProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
