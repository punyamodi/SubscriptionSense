import { useState, useEffect } from 'react';
import Constants from 'expo-constants';
import { data } from '../services/switchboard';

export interface VersionConfig {
  latestVersion: string;
  minRequiredVersion: string;
  updateUrl: string;
  releaseNotes: string;
  isCritical: boolean;
}

export const useVersionCheck = () => {
  const [updateInfo, setUpdateInfo] = useState<VersionConfig | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Current app version from app.json / Constants
  const currentVersion = Constants.expoConfig?.version || '1.0.0';

  const compareVersions = (v1: string, v2: string) => {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < 3; i++) {
      if ((parts1[i] || 0) > (parts2[i] || 0)) return 1;
      if ((parts1[i] || 0) < (parts2[i] || 0)) return -1;
    }
    return 0;
  };

  const checkForUpdates = async () => {
    try {
      const config = await data.getAppConfig();
      if (!config) return;

      const hasUpdate = compareVersions(config.latestVersion, currentVersion) > 0;
      const mustUpdate = compareVersions(config.minRequiredVersion, currentVersion) > 0;

      if (hasUpdate) {
        setUpdateInfo({
          ...(config as VersionConfig),
          isCritical: mustUpdate
        });
        setShowModal(true);
      }
    } catch (error) {
      console.warn('Update check failed:', error);
    }
  };

  useEffect(() => {
    // Small delay to let the app finish rendering
    const timer = setTimeout(() => {
      checkForUpdates();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return {
    showModal,
    setShowModal,
    updateInfo,
    currentVersion
  };
};
