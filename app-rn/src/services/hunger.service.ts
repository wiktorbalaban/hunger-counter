import { createMMKV } from 'react-native-mmkv';
import { HungerEntry } from '../models/hunger-entry.model';

const storage = createMMKV();

const ENTRIES_KEY = 'hunger_entries';
const DRAFT_KEY   = 'hunger_draft';

export function getEntries(): HungerEntry[] {
  const json = storage.getString(ENTRIES_KEY);
  return json ? JSON.parse(json) : [];
}

export function addEntry(entry: Omit<HungerEntry, 'id'>): void {
  const entries = getEntries();
  const newEntry: HungerEntry = { ...entry, id: Date.now().toString() };
  storage.set(ENTRIES_KEY, JSON.stringify([...entries, newEntry]));
}

export function addEntries(newEntries: Omit<HungerEntry, 'id'>[]): void {
  const existing = getEntries();
  const baseId = Date.now();
  const stamped: HungerEntry[] = newEntries.map((e, i) => ({ ...e, id: (baseId + i).toString() }));
  storage.set(ENTRIES_KEY, JSON.stringify([...existing, ...stamped]));
}

export function getDraft(): Partial<HungerEntry> | null {
  const json = storage.getString(DRAFT_KEY);
  return json ? JSON.parse(json) : null;
}

export function saveDraft(draft: Partial<HungerEntry>): void {
  storage.set(DRAFT_KEY, JSON.stringify(draft));
}

export function clearDraft(): void {
  storage.remove(DRAFT_KEY);
}

export function clearEntries(): void {
  storage.remove(ENTRIES_KEY);
}
