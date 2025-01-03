import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface VersionInfo {
  version: string;
  buildTimestamp: number;
  buildDate: string;
  gitCommit: string;
  environment: string;
}

interface VersionCheckState {
  currentVersion: VersionInfo | null;
  newVersionAvailable: boolean;
  dismissedVersion: string | null;
  showNotification: boolean;
  setCurrentVersion: (version: VersionInfo | null) => void;
  setNewVersionAvailable: (available: boolean) => void;
  dismissCurrentUpdate: () => void;
  setShowNotification: (show: boolean) => void;
  clearDismissedVersion: () => void;
}

export const useVersionCheckStore = create<VersionCheckState>()(
  persist(
    (set) => ({
      currentVersion: null,
      newVersionAvailable: false,
      dismissedVersion: null,
      showNotification: false,
      setCurrentVersion: (version) => set({ currentVersion: version }),
      setNewVersionAvailable: (available) => set({ newVersionAvailable: available }),
      dismissCurrentUpdate: () =>
        set((state) => ({
          dismissedVersion: state.currentVersion?.version || null,
          showNotification: false,
        })),
      setShowNotification: (show) => set({ showNotification: show }),
      clearDismissedVersion: () => set({ dismissedVersion: null }),
    }),
    {
      name: 'merchkins-version-check',
      partialize: (state) => ({
        dismissedVersion: state.dismissedVersion,
      }),
    }
  )
);
