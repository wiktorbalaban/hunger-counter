/**
 * Ordered walkthrough steps. The persisted `id` is decoupled from the UI
 * `targetKey` so a target can move in the layout without invalidating a user's
 * seen-set. Shipping a new feature = add a step with a fresh `id`; on next
 * launch only that unseen step runs (see walkthrough.service.ts).
 */

export type WalkthroughStepId =
  | 'add-mode-toggle'
  | 'add-start-button'
  | 'add-intensity'
  | 'add-focus'
  | 'add-stop'
  | 'tab-overview'
  | 'tour-complete';

/** Where the tooltip sits relative to its target. `auto` picks the side with room. */
export type Placement = 'auto' | 'above' | 'below';

export interface WalkthroughStep {
  /** Stable, persisted id. Never reuse or rename once shipped. */
  id: WalkthroughStepId;
  /** Registry key of the on-screen element to spotlight. */
  targetKey: string;
  titleKey: string;
  bodyKey: string;
  placement?: Placement;
  /**
   * When true, the spotlight lets touches through to the real element and no
   * "Next" button is shown — the tour advances when the user actually performs
   * the action (the screen calls `next()`). Used to make the flow hands-on.
   */
  interactive?: boolean;
}

export const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    id: 'add-mode-toggle',
    targetKey: 'add.modeToggle',
    titleKey: 'walkthrough.modeToggle.title',
    bodyKey: 'walkthrough.modeToggle.body',
  },
  {
    id: 'add-start-button',
    targetKey: 'add.startButton',
    titleKey: 'walkthrough.startButton.title',
    bodyKey: 'walkthrough.startButton.body',
    interactive: true, // user taps Start for real → opens the in-progress screen
  },
  {
    id: 'add-intensity',
    targetKey: 'add.intensity',
    titleKey: 'walkthrough.intensity.title',
    bodyKey: 'walkthrough.intensity.body',
  },
  {
    id: 'add-focus',
    targetKey: 'add.focus',
    titleKey: 'walkthrough.focus.title',
    bodyKey: 'walkthrough.focus.body',
  },
  {
    id: 'add-stop',
    targetKey: 'add.stopButton',
    titleKey: 'walkthrough.stop.title',
    bodyKey: 'walkthrough.stop.body',
  },
  {
    id: 'tab-overview',
    targetKey: 'tabbar.root',
    titleKey: 'walkthrough.tabOverview.title',
    bodyKey: 'walkthrough.tabOverview.body',
    // Tab bar lives at the bottom of the screen — tooltip must sit above it.
    placement: 'above',
  },
  {
    // Returns to the start screen and highlights the Start button so the tour
    // ends where the user begins — avoids finishing on the in-progress view.
    id: 'tour-complete',
    targetKey: 'add.startButton',
    titleKey: 'walkthrough.complete.title',
    bodyKey: 'walkthrough.complete.body',
  },
];
