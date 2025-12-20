import React, { memo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Image } from 'react-native';
import LandingScreen from '../screens/auth/LandingScreen';
import SignInScreen from '../screens/auth/SignInScreen';
import SelectUsernameScreen from '../screens/onboarding/SelectUsernameScreen';
import SetupPreferencesScreen from '../screens/onboarding/SetupPreferencesScreen';
import SignUpScreen from '../screens/onboarding/SignUpScreen';
import { useAssetsStore } from '../state/client/assetsStore';

type AuthStackParamList = {
  Landing: undefined;
  SignIn: undefined;
  Username: undefined;
  Preferences: undefined;
  SignUp: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const HeaderLogo = memo(({ source }: { source: any }) => (
  <Image
    style={{ width: 55, height: 55, bottom: 5 }}
    source={source}
    resizeMode="contain"
  />
));

export default function AuthNavigator() {
  const logoBlack = useAssetsStore((s) => s.cachedAssets.logoBlack);
  const logoWhite = useAssetsStore((s) => s.cachedAssets.logoWhite);

  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        headerTransparent: true,
        headerTintColor: '#FFFFFF',
        headerTitle: () => (logoWhite ? <HeaderLogo source={logoWhite} /> : null),
      }}
    >
      <Stack.Screen name="Landing" options={{ headerShown: false }} component={LandingScreen} />
      <Stack.Screen name="SignIn" options={{ headerShown: false }} component={SignInScreen} />
      <Stack.Screen name="Username" component={SelectUsernameScreen} />
      <Stack.Screen 
        name="Preferences" 
        component={SetupPreferencesScreen} 
        options={{ animation: 'fade' }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUpScreen}
        options={{
          headerBackVisible: false,
          animation: 'fade',
        }}
      />
    </Stack.Navigator>
  );
}
