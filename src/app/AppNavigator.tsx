// src/app/AppNavigator.tsx
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useUserStore } from '../state/client/userStore';
import AuthNavigator from './AuthNavigator';
import MainStack from './MainStack';
import AppLaunchScreen from '../screens/launch/AppLaunchScreen';
import { useMe } from '../services/user/queries';

import { DarkTheme as NavDarkTheme, DefaultTheme as NavLightTheme } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';

const linking = {
  prefixes: ['subsync://', 'https://subsync.app'],
  config: {
    screens: {
      // If logged in
      MainTabs: {
        screens: {
          Dashboard: 'dashboard',
          Calendar: 'calendar',
          SubscriptionList: 'subscriptions',
          Settings: 'settings',
        },
      },
      AddSubscription: 'add',
      EditProfile: 'profile',
      
      // If logged out
      SignIn: 'signin',
      SignUp: 'signup',
      Landing: 'welcome',
    },
  },
};

export default function AppNavigator() {
  const { isDark, colors } = useTheme();
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const uid = useUserStore((s) => s.uid);
  const [launchDone, setLaunchDone] = useState(false);
  const { data: me } = useMe(uid);
  
  if (!launchDone) {
    return <AppLaunchScreen onAnimationEnd={() => setLaunchDone(true)} />;
  }

  const theme = isDark ? NavDarkTheme : NavLightTheme;

  return (
    <NavigationContainer theme={theme} linking={linking}>
      {isLoggedIn ? <MainStack /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
