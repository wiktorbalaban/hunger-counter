import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import AddHungerScreen from '../screens/AddHungerScreen';
import TodayScreen     from '../screens/TodayScreen';
import ReportScreen    from '../screens/ReportScreen';
import MoreScreen      from '../screens/MoreScreen';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle:       { backgroundColor: isDark ? theme.surface : theme.primary },
        headerTintColor:   isDark ? theme.primary : theme.onPrimary,
        headerTitleStyle:  { fontWeight: 'bold' },
        tabBarActiveTintColor:   theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: { borderTopColor: theme.border, backgroundColor: theme.surface },
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, [string, string]> = {
            Add:    ['add-circle',  'add-circle-outline'],
            Today:  ['today',       'today-outline'],
            Report: ['bar-chart',   'bar-chart-outline'],
            More:   ['settings',    'settings-outline'],
          };
          const [active, inactive] = icons[route.name] ?? ['ellipse', 'ellipse-outline'];
          return <Ionicons name={(focused ? active : inactive) as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Add"    component={AddHungerScreen} options={{ title: t('tabs.add') }} />
      <Tab.Screen name="Today"  component={TodayScreen}     options={{ title: t('tabs.today') }} />
      <Tab.Screen name="Report" component={ReportScreen}    options={{ title: t('tabs.report') }} />
      <Tab.Screen name="More"   component={MoreScreen}      options={{ title: t('tabs.more') }} />
    </Tab.Navigator>
  );
}
