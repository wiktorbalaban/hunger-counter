import { NativeModules } from 'react-native';

const { DynamicIcon } = NativeModules as {
  DynamicIcon: {
    changeIcon(nextIcon: string, currentIcon: string): Promise<string>;
  };
};

export function changeIcon(
  nextIcon: string,
  currentIcon: string,
): Promise<string> {
  return DynamicIcon.changeIcon(nextIcon, currentIcon);
}
