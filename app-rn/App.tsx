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
import { GoalProvider } from './src/context/GoalContext';
import { useAppIconSync } from './src/hooks/useAppIconSync';
import { useTheme } from './src/context/ThemeContext';
import { registerIconSyncTask } from './src/tasks/iconSyncTask';
import TabNavigator from './src/navigation/TabNavigator';
import CrashReportingConsentModal from './src/components/CrashReportingConsentModal';
import { WalkthroughProvider } from './src/walkthrough/WalkthroughContext';
import { WalkthroughOverlay } from './src/walkthrough/WalkthroughOverlay';
import { initSentry } from './src/services/sentry.service';
import { markInstallDate } from './src/services/rating.service';

initSentry();
markInstallDate();

function AppContent() {
  useAppIconSync();
  // Consent popup temporarily disabled — don't prompt on first launch.
  // The More-tab toggle still lets users opt into sending statistics.
  // To re-enable, restore: useState(() => getConsent() === undefined)
  const [showConsent, setShowConsent] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');
  }, [isDark]);

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <WalkthroughProvider enabled={!showConsent}>
        <TabNavigator />
        <CrashReportingConsentModal visible={showConsent} onDismiss={() => setShowConsent(false)} />
        <WalkthroughOverlay />
      </WalkthroughProvider>
    </NavigationContainer>
  );
}

export default function App() {
  useEffect(() => {
    // will be useful if ads introduced in bottom bar
    // NavigationBar.setVisibilityAsync('hidden');
    // NavigationBar.setBehaviorAsync('overlay-swipe');
    registerIconSyncTask();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <HungerProvider>
          <GoalProvider>
            <AppContent />
          </GoalProvider>
        </HungerProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
