import * as BackgroundTask from 'expo-background-task';
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
    return BackgroundTask.BackgroundTaskResult.Success;
  }

  // Only run once per calendar day (handles Doze delays gracefully)
  const today = now.toDateString();
  if (storage.getString(LAST_RESET_KEY) === today) {
    return BackgroundTask.BackgroundTaskResult.Success;
  }

  const entries = getEntries();
  const desired = entries.some(isTodayEntry) ? 'YinYang' : 'Full';
  const current = storage.getString(ICON_KEY) ?? DEFAULT_ICON;

  if (current !== desired) {
    try {
      await changeIcon(desired, current);
      storage.set(ICON_KEY, desired);
    } catch {
      return BackgroundTask.BackgroundTaskResult.Failed;
    }
  }

  storage.set(LAST_RESET_KEY, today);
  return BackgroundTask.BackgroundTaskResult.Success;
});

export async function registerIconSyncTask() {
  const status = await BackgroundTask.getStatusAsync();
  if (status === BackgroundTask.BackgroundTaskStatus.Restricted) {
    return;
  }

  const isRegistered = await TaskManager.isTaskRegisteredAsync(ICON_SYNC_TASK);
  if (!isRegistered) {
    await BackgroundTask.registerTaskAsync(ICON_SYNC_TASK, {
      minimumInterval: 60, // 60 minutes — OS decides actual interval
    });
  }
}
