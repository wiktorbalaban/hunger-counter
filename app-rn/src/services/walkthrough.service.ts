import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({ id: 'walkthrough-storage' });
const SEEN_KEY = 'seen_step_ids';

/** Ids of walkthrough steps the user has already been shown. */
export function getSeenIds(): Set<string> {
  const raw = storage.getString(SEEN_KEY);
  if (raw === undefined) return new Set();
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set<string>(parsed) : new Set();
  } catch {
    return new Set();
  }
}

/** Union the given ids into the seen set (idempotent). */
export function markSeen(ids: string[]): void {
  const merged = getSeenIds();
  ids.forEach((id) => merged.add(id));
  storage.set(SEEN_KEY, JSON.stringify([...merged]));
}

/** Clear the seen set — used by dev tools / QA to replay onboarding. */
export function resetSeen(): void {
  storage.remove(SEEN_KEY);
}
