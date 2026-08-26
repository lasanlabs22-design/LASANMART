import React, { useCallback } from 'react';
import { View, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_800ExtraBold,
} from '@expo-google-fonts/bricolage-grotesque';
import {
  PlusJakartaSans_500Medium,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { AuthProvider, useAuth } from './src/context/AuthContext';

import AppNavigator from './src/navigation/AppNavigator';

LogBox.ignoreLogs(['Method moveAsync', 'Method copyAsync']);

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_800ExtraBold,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_700Bold,
  });

  return (
    <SafeAreaProvider>
      <AuthProvider>
          <AppGate fontsLoaded={fontsLoaded} />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

/** Waits for both the fonts and the stored profile before showing anything */
function AppGate({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { isReady } = useAuth();

  const onLayout = useCallback(async () => {
    if (fontsLoaded && isReady) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isReady]);

  if (!fontsLoaded || !isReady) return null;

  return (
    <View style={{ flex: 1 }} onLayout={onLayout}>
      <AppNavigator />
    </View>
  );
}