export type Intensity = 'low' | 'medium' | 'high';

export interface HungerEntry {
  id: string;
  startTime: string; // ISO string
  durationMinutes: number;
  intensity: Intensity;
  concentrationProblems: boolean;
}
