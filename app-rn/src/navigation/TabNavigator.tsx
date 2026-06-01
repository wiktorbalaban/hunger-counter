import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions, BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { Pane } from './Pane';
import AddHungerScreen from '../screens/AddHungerScreen';
import TodayScreen from '../screens/TodayScreen';
import ReportScreen from '../screens/ReportScreen';
import MoreScreen from '../screens/MoreScreen';

const TABLET_WIDTH = 768;

type TabName = 'Add' | 'Today' | 'Report' | 'More';
const TABS: TabName[] = ['Add', 'Today', 'Report', 'More'];

const SCREENS: Record<TabName, React.ComponentType> = {
  Add: AddHungerScreen,
  Today: TodayScreen,
  Report: ReportScreen,
  More: MoreScreen,
};

const ICONS: Record<TabName, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
  Add: ['add-circle', 'add-circle-outline'],
  Today: ['today', 'today-outline'],
  Report: ['bar-chart', 'bar-chart-outline'],
  More: ['settings', 'settings-outline'],
};

const TITLE_KEYS = {
  Add: 'tabs.add',
  Today: 'tabs.today',
  Report: 'tabs.report',
  More: 'tabs.more',
} as const;

export default function TabNavigator() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabName>('Add');
  const tabHistoryRef = useRef<TabName[]>([]);

  const isLandscape = width > height;
  const panesCount = width >= TABLET_WIDTH && isLandscape ? 2 : 1;

  const navigateToTab = useCallback((name: TabName) => {
    setActiveTab((current) => {
      if (name === current) return current;
      tabHistoryRef.current.push(current);
      return name;
    });
  }, []);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (tabHistoryRef.current.length === 0) return false;
      const prev = tabHistoryRef.current.pop()!;
      setActiveTab(prev);
      return true;
    });
    return () => sub.remove();
  }, []);

  const visibleScreens = useMemo(() => {
    const activeIdx = TABS.indexOf(activeTab);
    const end = Math.min(activeIdx + panesCount, TABS.length);
    return TABS.slice(activeIdx, end);
  }, [activeTab, panesCount]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {visibleScreens.map((screenName, idx) => {
          const Screen = SCREENS[screenName];
          return (
            <Pane
              key={screenName}
              screenName={screenName}
              defaultTitle={t(TITLE_KEYS[screenName])}
              visibleScreens={visibleScreens}
              setActiveTab={(name) => navigateToTab(name as TabName)}
              showDivider={idx < visibleScreens.length - 1}
              isActive={idx === 0}
            >
              <Screen />
            </Pane>
          );
        })}
      </View>

      <View
        style={{
          flexDirection: 'row',
          borderTopWidth: 1,
          borderTopColor: theme.border,
          backgroundColor: theme.surface,
          paddingBottom: insets.bottom,
        }}
      >
        {TABS.map((tab) => {
          const isActive = tab === activeTab;
          const [activeIcon, inactiveIcon] = ICONS[tab];
          const color = isActive ? theme.primary : theme.textMuted;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => navigateToTab(tab)}
              style={{ flex: 1, alignItems: 'center', paddingVertical: 8 }}
              activeOpacity={0.6}
            >
              <Ionicons
                name={isActive ? activeIcon : inactiveIcon}
                size={24}
                color={color}
              />
              <Text style={{ color, fontSize: 12, marginTop: 2 }}>
                {t(TITLE_KEYS[tab])}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
