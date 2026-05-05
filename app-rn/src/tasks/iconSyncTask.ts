import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { createMMKV } from 'react-native-mmkv';
import { getEntries } from '../services/hunger.service';
import { changeIcon } from '../native/DynamicIcon';
import { isTodayEntry } from '../utils/entry';

export const ICON_SYNC_TASK = 'ICON_SYNC_TASK';

const storage = createMMKV({ id: 'icon-storage' });
const ICON_KEY = 'current_icon';
const LAST_RESET_KEY = 'icon_last_reset_date';
const DEFAULT_ICON = 'Full';
const RESET_HOUR = 3;

// Must be defined at module level, before the React tree mounts.
TaskManager.defineTask(ICON_SYNC_TASK, async () => {
  const now = new Date();

  // Only run after 3am — skip if it's still night
  if (now.getHours() < RESET_HOUR) {
    return BackgroundFetch.BackgroundFetchResult.NoData;
  }

  // Only run once per calendar day (handles Doze delays gracefully)
  const today = now.toDateString();
  if (storage.getString(LAST_RESET_KEY) === today) {
    return BackgroundFetch.BackgroundFetchResult.NoData;
  }

  const entries = getEntries();
  const desired = entries.some(isTodayEntry) ? 'YinYang' : 'Full';
  const current = storage.getString(ICON_KEY) ?? DEFAULT_ICON;

  if (current !== desired) {
    try {
      await changeIcon(desired, current);
      storage.set(ICON_KEY, desired);
    } catch {
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  }

  storage.set(LAST_RESET_KEY, today);
  return BackgroundFetch.BackgroundFetchResult.NewData;
});

export async function registerIconSyncTask() {
  const status = await BackgroundFetch.getStatusAsync();
  if (
    status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
    status === BackgroundFetch.BackgroundFetchStatus.Denied
  ) {
    return;
  }

  const isRegistered = await TaskManager.isTaskRegisteredAsync(ICON_SYNC_TASK);
  if (!isRegistered) {
    await BackgroundFetch.registerTaskAsync(ICON_SYNC_TASK, {
      minimumInterval: 60 * 60, // 1 hour — OS decides actual interval
      stopOnTerminate: false,   // keep running after app is closed
      startOnBoot: true,        // resume after device restart
    });
  }
}
