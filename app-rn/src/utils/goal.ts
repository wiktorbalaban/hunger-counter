import { DailyGoal } from '../services/goal.service';

export type GoalStatus = 'under' | 'onTarget' | 'over';

/** Where today's total (minutes) sits relative to the goal band. */
export function goalStatus(totalMinutes: number, goal: DailyGoal): GoalStatus {
  if (totalMinutes < goal.min) return 'under';
  if (totalMinutes > goal.max) return 'over';
  return 'onTarget';
}

/** Canonical compact duration label for the goal UI: "1h 30m" / "45m" / "2h" / "0m". */
export function formatGoalDuration(mins: number): string {
  const safe = Math.max(0, Math.round(mins));
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** "1h – 2h" range label. */
export function formatGoalRange(goal: DailyGoal): string {
  return `${formatGoalDuration(goal.min)} – ${formatGoalDuration(goal.max)}`;
}
