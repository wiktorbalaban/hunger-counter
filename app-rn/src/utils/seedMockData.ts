import { HungerEntry, Intensity } from '../models/hunger-entry.model';

type SeedEntry = Omit<HungerEntry, 'id'>;

const INTENSITY_PROFILES: Record<Intensity, { durationRange: [number, number]; concChance: number }> = {
  low:    { durationRange: [15, 60],  concChance: 0.15 },
  medium: { durationRange: [30, 120], concChance: 0.4 },
  high:   { durationRange: [45, 180], concChance: 0.65 },
};

function pickIntensity(): Intensity {
  const r = Math.random();
  if (r < 0.3) return 'low';
  if (r < 0.8) return 'medium';
  return 'high';
}

function pickInRange([min, max]: [number, number]): number {
  return min + Math.floor(Math.random() * (max - min));
}

export function generateMockEntries(): SeedEntry[] {
  const entries: SeedEntry[] = [];

  for (let dayOffset = 9; dayOffset >= 0; dayOffset--) {
    if (dayOffset > 0 && Math.random() < 0.15) continue;

    const count = dayOffset === 0 ? 2 + Math.floor(Math.random() * 2) : 1 + Math.floor(Math.random() * 4);

    for (let i = 0; i < count; i++) {
      const date = new Date();
      date.setDate(date.getDate() - dayOffset);
      const hour = 8 + Math.floor(Math.random() * 14);
      date.setHours(hour, Math.floor(Math.random() * 60), 0, 0);

      // Skip future timestamps on today
      if (dayOffset === 0 && date.getTime() > Date.now()) continue;

      const intensity = pickIntensity();
      const profile = INTENSITY_PROFILES[intensity];

      entries.push({
        startTime: date.toISOString(),
        durationMinutes: pickInRange(profile.durationRange),
        intensity,
        concentrationProblems: Math.random() < profile.concChance,
      });
    }
  }

  return entries;
}
