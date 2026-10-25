import { HungerEntry } from '../models/hunger-entry.model';

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isEntryOnDate(entry: HungerEntry, date: Date): boolean {
  return isSameDay(new Date(entry.startTime), date);
}

export function isTodayEntry(entry: HungerEntry): boolean {
  return isEntryOnDate(entry, new Date());
}
