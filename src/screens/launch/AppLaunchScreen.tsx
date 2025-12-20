// src/screens/launch/AppLaunchScreen.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '../../components/common/AppText';
import { Colors } from '../../theme/colors';

type Props = { onAnimationEnd: () => void; maxDurationMs?: number };

export default function AppLaunchScreen({ onAnimationEnd, maxDurationMs = 2500 }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const finishedRef = useRef(false);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onAnimationEnd();
    });
  }, [fadeAnim, onAnimationEnd]);

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-transition after delay
    const timeout = setTimeout(finish, maxDurationMs);
    return () => clearTimeout(timeout);
  }, [fadeAnim, scaleAnim, finish, maxDurationMs]);

  return (
    <LinearGradient
      colors={[Colors.background, '#0D1117', Colors.background]}
      style={styles.container}
    >
      <Animated.View 
        style={[
          styles.content, 
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={Colors.gradient.premium}
            style={styles.logoGradient}
          >
            <Ionicons name="wallet-outline" size={56} color={Colors.text.inverse} />
          </LinearGradient>
        </View>
        
        <AppText variant="serifBold" size="4xl" align="center" style={styles.title}>
          SubSync
        </AppText>
        
        <AppText variant="regular" size="base" color={Colors.text.secondary} align="center">
          Take control of your subscriptions
        </AppText>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoGradient: {
    width: 120,
    height: 120,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 8,
  },
});
