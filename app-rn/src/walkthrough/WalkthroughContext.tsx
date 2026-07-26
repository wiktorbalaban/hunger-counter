import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';
import { BackHandler, InteractionManager, View } from 'react-native';
import { WalkthroughStep, WALKTHROUGH_STEPS } from './steps';
import { getSeenIds, markSeen } from '../services/walkthrough.service';

interface WalkthroughContextValue {
  /** The step currently being shown, or null when the tour is idle. */
  activeStep: WalkthroughStep | null;
  /** Zero-based index of the active step within the running queue. */
  index: number;
  /** Number of steps in the running queue (for progress dots). */
  total: number;
  /** Start a tour over the given steps. `force` is informational (replay passes all). */
  run: (steps: WalkthroughStep[], opts?: { force?: boolean }) => void;
  /** Advance to the next step, or finish if on the last one. */
  next: () => void;
  /** Go back one step; exits the tour when already on the first step. */
  prev: () => void;
  /** End the tour early; still marks the queued steps as seen. */
  skip: () => void;
  registerTarget: (key: string, ref: RefObject<View | null>) => void;
  unregisterTarget: (key: string) => void;
  getTargetRef: (key: string) => RefObject<View | null> | undefined;
}

const WalkthroughContext = createContext<WalkthroughContextValue | null>(null);

export function useWalkthrough(): WalkthroughContextValue {
  const ctx = useContext(WalkthroughContext);
  if (!ctx) throw new Error('useWalkthrough must be used within a WalkthroughProvider');
  return ctx;
}

export function WalkthroughProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: React.ReactNode;
}) {
  // Registry is a ref, not state: registering a target must never re-render.
  const targets = useRef(new Map<string, RefObject<View | null>>()).current;
  const [steps, setSteps] = useState<WalkthroughStep[]>([]);
  const [index, setIndex] = useState(-1);
  const hasAutoRunRef = useRef(false);

  const registerTarget = useCallback(
    (key: string, ref: RefObject<View | null>) => {
      targets.set(key, ref);
    },
    [targets],
  );

  const unregisterTarget = useCallback(
    (key: string) => {
      targets.delete(key);
    },
    [targets],
  );

  const getTargetRef = useCallback((key: string) => targets.get(key), [targets]);

  const finish = useCallback(() => {
    if (steps.length) markSeen(steps.map((s) => s.id));
    setSteps([]);
    setIndex(-1);
  }, [steps]);

  const run = useCallback((nextSteps: WalkthroughStep[], _opts?: { force?: boolean }) => {
    if (nextSteps.length === 0) return;
    setSteps(nextSteps);
    setIndex(0);
  }, []);

  const next = useCallback(() => {
    if (index < 0) return;
    if (index + 1 < steps.length) setIndex(index + 1);
    else finish();
  }, [index, steps.length, finish]);

  const prev = useCallback(() => {
    if (index <= 0) finish();
    else setIndex(index - 1);
  }, [index, finish]);

  const skip = useCallback(() => finish(), [finish]);

  // Auto-run: on first launch (or after a new step ships), run only unseen steps.
  // Deferred until interactions settle so targets are laid out and measurable.
  useEffect(() => {
    if (!enabled || hasAutoRunRef.current) return;
    hasAutoRunRef.current = true;
    const seen = getSeenIds();
    const pending = WALKTHROUGH_STEPS.filter((s) => !seen.has(s.id));
    if (pending.length === 0) return;
    const task = InteractionManager.runAfterInteractions(() => run(pending));
    return () => task.cancel();
  }, [enabled, run]);

  // While a step is showing, hardware back steps backward through the tour.
  // Registered after TabNavigator's handler, so (newest-first) it wins and
  // returning true prevents both tab-back and app-exit.
  useEffect(() => {
    if (index < 0) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      prev();
      return true;
    });
    return () => sub.remove();
  }, [index, prev]);

  const activeStep = index >= 0 && index < steps.length ? steps[index] : null;

  return (
    <WalkthroughContext.Provider
      value={{
        activeStep,
        index,
        total: steps.length,
        run,
        next,
        prev,
        skip,
        registerTarget,
        unregisterTarget,
        getTargetRef,
      }}
    >
      {children}
    </WalkthroughContext.Provider>
  );
}
