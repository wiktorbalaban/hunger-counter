import { useEffect } from 'react';
import { AppState } from 'react-native';
import { createMMKV } from 'react-native-mmkv';
import { changeIcon } from '../native/DynamicIcon';
import { useHunger } from '../context/HungerContext';
import { HungerEntry } from '../models/hunger-entry.model';
import { isTodayEntry } from '../utils/entry';

const storage = createMMKV({ id: 'icon-storage' });
const ICON_KEY = 'current_icon';
const DEFAULT_ICON = 'Full';

function syncIcon(entries: HungerEntry[]) {
  const desired = entries.some(isTodayEntry) ? 'YinYang' : 'Full';
  const current = storage.getString(ICON_KEY) ?? DEFAULT_ICON;
  if (current === desired) return;
  changeIcon(desired, current)
    .then(() => storage.set(ICON_KEY, desired))
    .catch(() => {});
}

export function useAppIconSync() {
  const { entries } = useHunger();

  useEffect(() => {
    syncIcon(entries);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background') syncIcon(entries);
    });
    return () => sub.remove();
  }, [entries]);
}
