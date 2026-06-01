import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { PaneProvider } from './PaneContext';

interface Props {
  screenName: string;
  defaultTitle: string;
  visibleScreens: string[];
  setActiveTab: (name: string) => void;
  showDivider: boolean;
  isActive: boolean;
  children: React.ReactNode;
}

export function Pane({
  screenName,
  defaultTitle,
  visibleScreens,
  setActiveTab,
  showDivider,
  isActive,
  children,
}: Props) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState(defaultTitle);

  const headerBg = isActive
    ? (isDark ? theme.surface : theme.primary)
    : theme.companionHeaderBg;
  const headerTextColor = isActive
    ? (isDark ? theme.primary : theme.onPrimary)
    : theme.companionHeaderText;

  return (
    <View
      style={{
        flex: 1,
        borderRightWidth: showDivider ? 1 : 0,
        borderRightColor: theme.border,
      }}
    >
      <View
        style={{
          paddingTop: insets.top,
          backgroundColor: headerBg,
        }}
      >
        <View
          style={{
            height: 56,
            justifyContent: 'center',
            paddingHorizontal: 16,
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              color: headerTextColor,
              fontWeight: 'bold',
              fontSize: 18,
            }}
          >
            {title}
          </Text>
        </View>
      </View>

      <PaneProvider
        screenName={screenName}
        visibleScreens={visibleScreens}
        setActiveTab={setActiveTab}
        setTitle={setTitle}
      >
        <View style={{ flex: 1 }}>{children}</View>
      </PaneProvider>
    </View>
  );
}
