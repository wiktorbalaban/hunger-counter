import { Linking } from 'react-native';
import { createMMKV } from 'react-native-mmkv';
import * as StoreReview from 'expo-store-review';
import Constants from 'expo-constants';
import { HungerEntry } from '../models/hunger-entry.model';

const storage = createMMKV({ id: 'rating-storage' });

const INSTALL_DATE_KEY     = 'version_install_date';
const INSTALLED_VERSION_KEY = 'installed_version';
const ASKED_FOR_VERSION_KEY = 'asked_for_version';

const REQUIRED_DAYS = 7;
const REQUIRED_UNIQUE_DAYS_WITH_ENTRIES = 3;

function packageName(): string {
  return Constants.expoConfig?.android?.package ?? '';
}

function currentVersion(): string {
  return Constants.expoConfig?.version ?? '0.0.0';
}

export function markInstallDate(): void {
  const stored = storage.getString(INSTALLED_VERSION_KEY);
  if (stored !== currentVersion()) {
    storage.set(INSTALLED_VERSION_KEY, currentVersion());
    storage.set(INSTALL_DATE_KEY, Date.now().toString());
    storage.remove(ASKED_FOR_VERSION_KEY);
  }
}

function uniqueDaysWithEntries(entries: HungerEntry[]): number {
  return new Set(entries.map(e => new Date(e.startTime).toDateString())).size;
}

export function shouldRequestReview(entries: HungerEntry[]): boolean {
  const installDateRaw = storage.getString(INSTALL_DATE_KEY);
  if (!installDateRaw) return false;

  const daysSinceInstall = (Date.now() - parseInt(installDateRaw, 10)) / (1000 * 60 * 60 * 24);
  if (daysSinceInstall < REQUIRED_DAYS) return false;

  if (uniqueDaysWithEntries(entries) < REQUIRED_UNIQUE_DAYS_WITH_ENTRIES) return false;

  if (storage.getString(ASKED_FOR_VERSION_KEY) === currentVersion()) return false;

  return true;
}

export async function requestReview(): Promise<void> {
  storage.set(ASKED_FOR_VERSION_KEY, currentVersion());
  try {
    if (await StoreReview.isAvailableAsync()) {
      await StoreReview.requestReview();
      return;
    }
  } catch {
    // Fall through to manual store link
  }
  openStorePage();
}

export function openStorePage(): void {
  const webUrl = `https://play.google.com/store/apps/details?id=${packageName()}`;
  Linking.openURL(`market://details?id=${packageName()}`).catch(() => Linking.openURL(webUrl));
}
