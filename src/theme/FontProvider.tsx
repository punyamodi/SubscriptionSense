import React, { useEffect, PropsWithChildren } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts as useOutfit,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import {
  useFonts as useSpectral,
  Spectral_400Regular,
  Spectral_500Medium,
  Spectral_700Bold,
} from '@expo-google-fonts/spectral';

// Don't auto-hide until fonts are ready
SplashScreen.preventAutoHideAsync().catch(() => { });

export default function FontProvider({ children }: PropsWithChildren) {
  const [outfitLoaded] = useOutfit({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  const [spectralLoaded] = useSpectral({
    Spectral_400Regular,
    Spectral_500Medium,
    Spectral_700Bold,
  });

  const fontsReady = outfitLoaded && spectralLoaded;

  useEffect(() => {
    if (fontsReady) {
      SplashScreen.hideAsync().catch(() => { });
    }
  }, [fontsReady]);

  if (!fontsReady) return null;

  return <>{children}</>;
}
