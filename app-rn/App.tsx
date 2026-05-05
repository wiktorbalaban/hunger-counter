import './global.css';
import './src/i18n';
import './src/tasks/iconSyncTask'; // defineTask must run before React tree
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { HungerProvider } from './src/context/HungerContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { useAppIconSync } from './src/hooks/useAppIconSync';
import { registerIconSyncTask } from './src/tasks/iconSyncTask';
import TabNavigator from './src/navigation/TabNavigator';

function AppContent() {
  useAppIconSync();
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <TabNavigator />
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
