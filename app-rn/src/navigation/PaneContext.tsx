import React, { createContext, useContext, useEffect } from 'react';

interface PaneContextValue {
  screenName: string;
  visibleScreens: string[];
  setActiveTab: (name: string) => void;
  setTitle: (title: string) => void;
}

const PaneContext = createContext<PaneContextValue | null>(null);

export function PaneProvider({
  screenName,
  visibleScreens,
  setActiveTab,
  setTitle,
  children,
}: {
  screenName: string;
  visibleScreens: string[];
  setActiveTab: (name: string) => void;
  setTitle: (title: string) => void;
  children: React.ReactNode;
}) {
  return (
    <PaneContext.Provider value={{ screenName, visibleScreens, setActiveTab, setTitle }}>
      {children}
    </PaneContext.Provider>
  );
}

export function usePaneNavigation() {
  const ctx = useContext(PaneContext);
  if (!ctx) throw new Error('usePaneNavigation must be used inside a Pane');

  return {
    navigate: (name: string) => {
      if (ctx.visibleScreens.includes(name)) return;
      ctx.setActiveTab(name);
    },
    setOptions: (opts: { title?: string }) => {
      if (opts.title !== undefined) ctx.setTitle(opts.title);
    },
  };
}

export function usePaneFocusEffect(effect: () => void | (() => void)) {
  const ctx = useContext(PaneContext);
  if (!ctx) throw new Error('usePaneFocusEffect must be used inside a Pane');

  const isVisible = ctx.visibleScreens.includes(ctx.screenName);

  useEffect(() => {
    if (!isVisible) return;
    return effect();
  }, [isVisible, effect]);
}
