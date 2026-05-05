import { HungerEntry } from '../models/hunger-entry.model';

export function isTodayEntry(entry: HungerEntry): boolean {
  const now = new Date();
  const d = new Date(entry.startTime);
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}
