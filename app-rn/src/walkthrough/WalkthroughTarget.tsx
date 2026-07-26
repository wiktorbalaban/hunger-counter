import React, { useEffect, useRef, type ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import { useWalkthrough } from './WalkthroughContext';

/**
 * Registers a ref under `key` so the walkthrough overlay can measure the element
 * with `measureInWindow`. Spread the returned ref onto any View, and set
 * `collapsable={false}` on it — Android may otherwise flatten a style-less View
 * out of the native tree, making `measureInWindow` return zeros.
 */
export function useWalkthroughTarget(key: string) {
  const { registerTarget, unregisterTarget } = useWalkthrough();
  const ref = useRef<View>(null);
  useEffect(() => {
    registerTarget(key, ref);
    return () => unregisterTarget(key);
  }, [key, registerTarget, unregisterTarget]);
  return { ref };
}

/**
 * Wrapper form for spotlighting an element without touching its internals:
 * `<WalkthroughTarget targetKey="...">{children}</WalkthroughTarget>`.
 */
export function WalkthroughTarget({
  targetKey,
  children,
  ...viewProps
}: { targetKey: string; children: ReactNode } & ViewProps) {
  const { ref } = useWalkthroughTarget(targetKey);
  return (
    <View ref={ref} {...viewProps} collapsable={false}>
      {children}
    </View>
  );
}
