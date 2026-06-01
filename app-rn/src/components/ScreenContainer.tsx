import React from 'react';
import { View } from 'react-native';

export const SCREEN_MAX_WIDTH = 600;

interface Props {
  children: React.ReactNode;
}

export function ScreenContainer({ children }: Props) {
  return (
    <View style={{ flex: 1, width: '100%', maxWidth: SCREEN_MAX_WIDTH, alignSelf: 'center' }}>
      {children}
    </View>
  );
}
