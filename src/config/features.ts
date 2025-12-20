import Constants from 'expo-constants';

export type FeatureFlags = {
  backgroundSync: boolean;
  ads: boolean;
  versionCheck: boolean;
  crashReporting: boolean;
};

const defaults: FeatureFlags = {
  backgroundSync: true,
  ads: true,
  versionCheck: true,
  crashReporting: true,
};

const extraFlags = (Constants.expoConfig?.extra as { FEATURE_FLAGS?: Partial<FeatureFlags> } | undefined)?.FEATURE_FLAGS ?? {};

export const featureFlags: FeatureFlags = {
  ...defaults,
  ...extraFlags,
};

export const isFeatureEnabled = (flag: keyof FeatureFlags) => Boolean(featureFlags[flag]);
