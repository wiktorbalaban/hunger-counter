import React, { createContext, useContext, useState } from 'react';
import { DailyGoal, DEFAULT_GOAL, getGoal, setGoal as persistGoal } from '../services/goal.service';

interface GoalContextValue {
  goal: DailyGoal;
  setGoal: (goal: DailyGoal) => void;
}

const GoalContext = createContext<GoalContextValue>({
  goal: DEFAULT_GOAL,
  setGoal: () => {},
});

export function GoalProvider({ children }: { children: React.ReactNode }) {
  const [goal, setGoalState] = useState<DailyGoal>(() => getGoal());

  const setGoal = (next: DailyGoal) => {
    persistGoal(next);
    // Re-read so state reflects the clamped/normalised value the service stored.
    setGoalState(getGoal());
  };

  return <GoalContext.Provider value={{ goal, setGoal }}>{children}</GoalContext.Provider>;
}

export function useGoal(): GoalContextValue {
  return useContext(GoalContext);
}
