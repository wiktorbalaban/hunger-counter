/**
 * Ordered walkthrough steps. The persisted `id` is decoupled from the UI
 * `targetKey` so a target can move in the layout without invalidating a user's
 * seen-set. Shipping a new feature = add a step with a fresh `id`; on next
 * launch only that unseen step runs (see walkthrough.service.ts).
 */

export type WalkthroughStepId =
  | 'add-mode-toggle'
  | 'add-start-button'
  | 'tab-overview';

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
  },
  {
    id: 'tab-overview',
    targetKey: 'tabbar.root',
    titleKey: 'walkthrough.tabOverview.title',
    bodyKey: 'walkthrough.tabOverview.body',
    // Tab bar lives at the bottom of the screen — tooltip must sit above it.
    placement: 'above',
  },
];
