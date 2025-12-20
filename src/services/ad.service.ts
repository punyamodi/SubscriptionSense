// AdMob Service for SubSync
// Uses react-native-google-mobile-ads for Expo bare workflow
// For Expo Go testing, ads will be mocked/disabled

import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Check if we're in Expo Go (where AdMob won't work)
const isExpoGo = Constants.executionEnvironment === 'storeClient';

// Test Ad Unit IDs (use these for development)
const TEST_AD_UNITS = {
  banner: {
    ios: 'ca-app-pub-3940256099942544/2934735716',
    android: 'ca-app-pub-3940256099942544/6300978111',
  },
  interstitial: {
    ios: 'ca-app-pub-3940256099942544/4411468910',
    android: 'ca-app-pub-3940256099942544/1033173712',
  },
  rewarded: {
    ios: 'ca-app-pub-3940256099942544/1712485313',
    android: 'ca-app-pub-3940256099942544/5224354917',
  },
};

// Production Ad Unit IDs (replace with your actual AdMob IDs)
const PROD_AD_UNITS = {
  banner: {
    ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
    android: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  },
  interstitial: {
    ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
    android: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  },
  rewarded: {
    ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
    android: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  },
};

// Use test ads in development
const isDev = __DEV__;
const AD_UNITS = isDev ? TEST_AD_UNITS : PROD_AD_UNITS;

// Lazy load the ads module to prevent import errors in Expo Go
let MobileAds: any = null;
let InterstitialAd: any = null;
let RewardedAd: any = null;
let BannerAd: any = null;
let TestIds: any = null;
let AdEventType: any = null;
let RewardedAdEventType: any = null;

const loadAdsModule = async () => {
  if (isExpoGo) {
    console.log('AdMob: Running in Expo Go, ads are disabled');
    return false;
  }
  
  try {
    const adsModule = await import('react-native-google-mobile-ads');
    MobileAds = adsModule.default;
    InterstitialAd = adsModule.InterstitialAd;
    RewardedAd = adsModule.RewardedAd;
    BannerAd = adsModule.BannerAd;
    TestIds = adsModule.TestIds;
    AdEventType = adsModule.AdEventType;
    RewardedAdEventType = adsModule.RewardedAdEventType;
    return true;
  } catch (error) {
    console.warn('AdMob: Failed to load ads module:', error);
    return false;
  }
};

// Track initialization status
let isInitialized = false;
let interstitialAd: any = null;
let rewardedAd: any = null;

export class AdService {
  // Initialize AdMob
  static async initialize(): Promise<boolean> {
    if (isExpoGo) {
      console.log('AdMob: Disabled in Expo Go');
      return false;
    }
    
    if (isInitialized) return true;
    
    const loaded = await loadAdsModule();
    if (!loaded || !MobileAds) return false;
    
    try {
      await MobileAds().initialize();
      isInitialized = true;
      console.log('AdMob: Initialized successfully');
      return true;
    } catch (error) {
      console.error('AdMob: Initialization failed:', error);
      return false;
    }
  }

  // Get banner ad unit ID for current platform
  static getBannerAdUnit(): string {
    return Platform.OS === 'ios' ? AD_UNITS.banner.ios : AD_UNITS.banner.android;
  }

  // Load and show interstitial ad
  static async showInterstitial(): Promise<boolean> {
    if (isExpoGo || !isInitialized) {
      console.log('AdMob: Interstitial skipped (not available)');
      return false;
    }
    
    try {
      const adUnitId = Platform.OS === 'ios' 
        ? AD_UNITS.interstitial.ios 
        : AD_UNITS.interstitial.android;
      
      return new Promise((resolve) => {
        interstitialAd = InterstitialAd.createForAdRequest(adUnitId, {
          requestNonPersonalizedAdsOnly: true,
        });
        
        const unsubscribeLoaded = interstitialAd.addAdEventListener(
          AdEventType.LOADED,
          () => {
            interstitialAd.show();
          }
        );
        
        const unsubscribeClosed = interstitialAd.addAdEventListener(
          AdEventType.CLOSED,
          () => {
            unsubscribeLoaded();
            unsubscribeClosed();
            resolve(true);
          }
        );
        
        interstitialAd.load();
      });
    } catch (error) {
      console.error('AdMob: Interstitial error:', error);
      return false;
    }
  }

  // Load and show rewarded ad
  static async showRewarded(): Promise<{ rewarded: boolean; amount?: number }> {
    if (isExpoGo || !isInitialized) {
      console.log('AdMob: Rewarded ad skipped (not available)');
      return { rewarded: false };
    }
    
    try {
      const adUnitId = Platform.OS === 'ios' 
        ? AD_UNITS.rewarded.ios 
        : AD_UNITS.rewarded.android;
      
      return new Promise((resolve) => {
        rewardedAd = RewardedAd.createForAdRequest(adUnitId, {
          requestNonPersonalizedAdsOnly: true,
        });
        
        const unsubscribeLoaded = rewardedAd.addAdEventListener(
          AdEventType.LOADED,
          () => {
            rewardedAd.show();
          }
        );
        
        const unsubscribeEarned = rewardedAd.addAdEventListener(
          RewardedAdEventType.EARNED_REWARD,
          (reward: any) => {
            console.log('User earned reward:', reward);
            unsubscribeLoaded();
            unsubscribeEarned();
            resolve({ rewarded: true, amount: reward?.amount ?? 1 });
          }
        );
        
        const unsubscribeClosed = rewardedAd.addAdEventListener(
          AdEventType.CLOSED,
          () => {
            unsubscribeLoaded();
            unsubscribeClosed();
            // If closed without reward, resolve as not rewarded
            resolve({ rewarded: false });
          }
        );
        
        rewardedAd.load();
      });
    } catch (error) {
      console.error('AdMob: Rewarded ad error:', error);
      return { rewarded: false };
    }
  }

  // Check if ads are available
  static isAvailable(): boolean {
    return !isExpoGo && isInitialized;
  }

  // Check if running in Expo Go
  static isExpoGo(): boolean {
    return isExpoGo;
  }
}

// Export ad unit getters for BannerAd component
export const getAdUnitId = (type: 'banner' | 'interstitial' | 'rewarded'): string => {
  switch (type) {
    case 'banner':
      return Platform.OS === 'ios' ? AD_UNITS.banner.ios : AD_UNITS.banner.android;
    case 'interstitial':
      return Platform.OS === 'ios' ? AD_UNITS.interstitial.ios : AD_UNITS.interstitial.android;
    case 'rewarded':
      return Platform.OS === 'ios' ? AD_UNITS.rewarded.ios : AD_UNITS.rewarded.android;
  }
};
