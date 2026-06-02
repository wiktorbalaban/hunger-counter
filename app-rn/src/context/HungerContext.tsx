import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { HungerEntry } from '../models/hunger-entry.model';
import * as Service from '../services/hunger.service';

interface HungerContextType {
  entries: HungerEntry[];
  draft: Partial<HungerEntry> | null;
  addEntry: (entry: Omit<HungerEntry, 'id'>) => void;
  addEntries: (entries: Omit<HungerEntry, 'id'>[]) => void;
  saveDraft: (draft: Partial<HungerEntry>) => void;
  clearDraft: () => void;
  clearEntries: () => void;
}

const HungerContext = createContext<HungerContextType | null>(null);

export function HungerProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<HungerEntry[]>(() => Service.getEntries());
  const [draft,   setDraft]   = useState<Partial<HungerEntry> | null>(() => Service.getDraft());

  const addEntry = useCallback((entry: Omit<HungerEntry, 'id'>) => {
    Service.addEntry(entry);
    setEntries(Service.getEntries());
  }, []);

  const addEntriesFn = useCallback((newEntries: Omit<HungerEntry, 'id'>[]) => {
    Service.addEntries(newEntries);
    setEntries(Service.getEntries());
  }, []);

  const saveDraftFn = useCallback((d: Partial<HungerEntry>) => {
    Service.saveDraft(d);
    setDraft(d);
  }, []);

  const clearDraftFn = useCallback(() => {
    Service.clearDraft();
    setDraft(null);
  }, []);

  const clearEntriesFn = useCallback(() => {
    Service.clearEntries();
    setEntries([]);
  }, []);

  return (
    <HungerContext.Provider value={{ entries, draft, addEntry, addEntries: addEntriesFn, saveDraft: saveDraftFn, clearDraft: clearDraftFn, clearEntries: clearEntriesFn }}>
      {children}
    </HungerContext.Provider>
  );
}

export function useHunger() {
  const ctx = useContext(HungerContext);
  if (!ctx) throw new Error('useHunger must be used within HungerProvider');
  return ctx;
}
