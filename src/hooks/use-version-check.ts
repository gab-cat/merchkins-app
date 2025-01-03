import { useEffect, useRef, useCallback } from 'react';
import { useVersionCheckStore } from '@/src/stores/version-check';

interface VersionInfo {
  version: string;
  buildTimestamp: number;
  buildDate: string;
  gitCommit: string;
  environment: string;
}

const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
const VERSION_STORAGE_KEY = 'merchkins-app-version';

const checkForUpdate = async (): Promise<VersionInfo | null> => {
  try {
    const response = await fetch(`/version.json?t=${Date.now()}`, {
      cache: 'no-store',
    });
    if (!response.ok) return null;
    const versionInfo: VersionInfo = await response.json();
    return versionInfo;
  } catch (error) {
    console.error('Error checking for version update:', error);
    return null;
  }
};

export const useVersionCheck = () => {
  const {
    currentVersion,
    newVersionAvailable,
    dismissedVersion,
    showNotification,
    setCurrentVersion,
    setNewVersionAvailable,
    setShowNotification,
    clearDismissedVersion,
  } = useVersionCheckStore();

  const checkTimeoutRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const performVersionCheck = useCallback(async () => {
    const latestVersion = await checkForUpdate();

    if (!latestVersion) return;

    const storedVersion = localStorage.getItem(VERSION_STORAGE_KEY);
    const currentLocalVersion = storedVersion || null;

    // If we don't have a stored version yet, store this one and don't show notification
    if (!currentLocalVersion) {
      localStorage.setItem(VERSION_STORAGE_KEY, JSON.stringify(latestVersion));
      setCurrentVersion(latestVersion);
      setNewVersionAvailable(false);
      setShowNotification(false);
      return;
    }

    // Parse stored version
    const parsedStoredVersion: VersionInfo = JSON.parse(currentLocalVersion);

    // Check if versions differ
    const versionChanged =
      parsedStoredVersion.version !== latestVersion.version || parsedStoredVersion.buildTimestamp !== latestVersion.buildTimestamp;

    if (versionChanged) {
      // Don't show notification if user already dismissed this specific version
      if (dismissedVersion === latestVersion.version) {
        // Update localStorage to the new version so we don't keep checking
        localStorage.setItem(VERSION_STORAGE_KEY, JSON.stringify(latestVersion));
        setCurrentVersion(latestVersion);
        setNewVersionAvailable(false);
        setShowNotification(false);
        return;
      }

      // Update state to show notification
      localStorage.setItem(VERSION_STORAGE_KEY, JSON.stringify(latestVersion));
      setCurrentVersion(latestVersion);
      setNewVersionAvailable(true);
      setShowNotification(true);
    } else {
      // Versions match - user is running the current version (likely after refresh)
      // Update localStorage to ensure sync, clear dismissed version, and hide notification
      localStorage.setItem(VERSION_STORAGE_KEY, JSON.stringify(latestVersion));
      setCurrentVersion(latestVersion);
      setNewVersionAvailable(false);
      setShowNotification(false);

      // Clear dismissed version if it matches current version (user refreshed to this version)
      if (dismissedVersion === latestVersion.version) {
        clearDismissedVersion();
      }
    }
  }, [dismissedVersion, setCurrentVersion, setNewVersionAvailable, setShowNotification, clearDismissedVersion]);

  useEffect(() => {
    // Initial check
    performVersionCheck();

    // Set up interval checks
    const startIntervalCheck = () => {
      if (checkTimeoutRef.current) {
        clearInterval(checkTimeoutRef.current);
      }
      checkTimeoutRef.current = setInterval(performVersionCheck, CHECK_INTERVAL);
    };

    // Start interval
    startIntervalCheck();

    // Handle visibility change - check when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        performVersionCheck();
        // Restart interval to ensure proper timing
        startIntervalCheck();
      } else if (document.visibilityState === 'hidden') {
        // Clear interval when tab is hidden to save resources
        if (checkTimeoutRef.current) {
          clearInterval(checkTimeoutRef.current);
          checkTimeoutRef.current = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      if (checkTimeoutRef.current) {
        clearInterval(checkTimeoutRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [dismissedVersion, performVersionCheck]);

  return {
    newVersionAvailable,
    showNotification,
    currentVersion,
  };
};
