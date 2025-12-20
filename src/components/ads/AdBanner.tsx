// AdBanner Component - Safe for Expo Go
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { Colors } from '../../theme/colors';
import { AppText } from '../common/AppText';
import { AdService, getAdUnitId } from '../../services/ad.service';

const isExpoGo = Constants.executionEnvironment === 'storeClient';

interface AdBannerProps {
  size?: 'banner' | 'largeBanner' | 'mediumRectangle' | 'fullBanner';
  style?: any;
}

export const AdBanner: React.FC<AdBannerProps> = ({ 
  size = 'banner',
  style 
}) => {
  const [BannerAdComponent, setBannerAdComponent] = useState<any>(null);
  const [BannerAdSize, setBannerAdSize] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const loadAdComponent = async () => {
      if (isExpoGo) {
        setHasError(true);
        return;
      }

      try {
        const adsModule = await import('react-native-google-mobile-ads');
        setBannerAdComponent(() => adsModule.BannerAd);
        setBannerAdSize(adsModule.BannerAdSize);
        setIsLoaded(true);
      } catch (e) {
        console.warn('Failed to load banner ad:', e);
        setHasError(true);
      }
    };

    loadAdComponent();
  }, []);

  // In Expo Go or if there's an error, show placeholder
  if (isExpoGo || hasError) {
    return (
      <View style={[styles.placeholder, style]}>
        <AppText variant="regular" size="xs" color={Colors.text.tertiary}>
          [Ad Space - Available in Production]
        </AppText>
      </View>
    );
  }

  // Still loading the ad module
  if (!isLoaded || !BannerAdComponent || !BannerAdSize) {
    return null;
  }

  const adUnitId = getAdUnitId('banner');
  
  const getSizeConstant = () => {
    switch (size) {
      case 'largeBanner':
        return BannerAdSize.LARGE_BANNER;
      case 'mediumRectangle':
        return BannerAdSize.MEDIUM_RECTANGLE;
      case 'fullBanner':
        return BannerAdSize.FULL_BANNER;
      default:
        return BannerAdSize.BANNER;
    }
  };

  return (
    <View style={[styles.container, style]}>
      <BannerAdComponent
        unitId={adUnitId}
        size={getSizeConstant()}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => console.log('Banner ad loaded')}
        onAdFailedToLoad={(error: any) => {
          console.warn('Banner ad failed to load:', error);
          setHasError(true);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    height: 50,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
});
