import { create } from 'zustand';

type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

interface SyncState {
  status: SyncStatus;
  lastSynced: Date | null;
  error: string | null;
  pendingChanges: number;
  setStatus: (status: SyncStatus) => void;
  setLastSynced: (date: Date) => void;
  setError: (error: string | null) => void;
  incrementPending: () => void;
  decrementPending: () => void;
  resetPending: () => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  status: 'idle',
  lastSynced: null,
  error: null,
  pendingChanges: 0,

  setStatus: (status) => set({ status }),
  setLastSynced: (date) => set({ lastSynced: date, status: 'idle' }),
  setError: (error) => set({ error, status: 'error' }),
  incrementPending: () => set((state) => ({ pendingChanges: state.pendingChanges + 1 })),
  decrementPending: () =>
    set((state) => ({
      pendingChanges: Math.max(0, state.pendingChanges - 1),
    })),
  resetPending: () => set({ pendingChanges: 0 }),
}));
