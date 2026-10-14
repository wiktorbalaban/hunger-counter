import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({ id: 'goal-storage' });

const GOAL_KEY = 'daily_goal';

/** Daily hunger goal — a min–max band, both values in minutes. */
export interface DailyGoal {
  min: number;
  max: number;
}

export const DEFAULT_GOAL: DailyGoal = { min: 60, max: 120 };

/** Slider scale bounds (minutes). Ceiling matches DurationPickerModal's MAX_MINS. */
export const GOAL_SCALE_MIN = 0;
export const GOAL_SCALE_MAX = 300; // 5h
export const GOAL_STEP = 15;

function clampGoal(goal: DailyGoal): DailyGoal {
  const min = Math.min(Math.max(Math.round(goal.min), GOAL_SCALE_MIN), GOAL_SCALE_MAX);
  const max = Math.min(Math.max(Math.round(goal.max), GOAL_SCALE_MIN), GOAL_SCALE_MAX);
  // Keep min <= max; if inverted, collapse max up to min.
  return { min, max: Math.max(min, max) };
}

export function getGoal(): DailyGoal {
  const raw = storage.getString(GOAL_KEY);
  if (raw === undefined) return DEFAULT_GOAL;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed?.min === 'number' && typeof parsed?.max === 'number') {
      return clampGoal(parsed);
    }
  } catch {
    // fall through to default
  }
  return DEFAULT_GOAL;
}

export function setGoal(goal: DailyGoal): void {
  storage.set(GOAL_KEY, JSON.stringify(clampGoal(goal)));
}
