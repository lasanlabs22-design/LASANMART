import React, { useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { trackScreen } from '../lib/analytics';
import LoginScreen from '../screens/LoginScreen';
import BottomTabNavigator from './BottomTabNavigator';
import ReelPlayerScreen from '../screens/ReelPlayerScreen';
import CustomRequirementScreen from '../screens/CustomRequirementScreen';
import InfluencerSelectionScreen from '../screens/InfluencerSelectionScreen';
import PostRequestScreen from '../screens/PostRequestScreen';
import BusinessIdeasScreen from '../screens/BusinessIdeasScreen';
import LasanToolsScreen from '../screens/LasanToolsScreen';
import QuotationScreen from '../screens/QuotationScreen';
import LocationPickerScreen from '../screens/LocationPickerScreen';
import PlanEnquiryScreen from '../screens/PlanEnquiryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import ToolEnquiryScreen from '../screens/ToolEnquiryScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SearchScreen from '../screens/SearchScreen';
import AddReelScreen from '../screens/AddReelScreen';
import HelpScreen from '../screens/HelpScreen';
import MyReelsScreen from '../screens/MyReelsScreen';
import PhoneAuthScreen from '../screens/PhoneAuthScreen';
import FreelancerRequestScreen from '../screens/FreelancerRequestScreen';
import OnBoardingScreen from '../screens/OnBoardingScreen';
import InfluencerProfileScreen from '../screens/InfluencerProfileScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { loginMethod } = useAuth();

  /**
   * Shown once per launch to anyone not signed in. Not persisted —
   * someone who hasn't committed hasn't really seen it.
   */
  const [seenIntro, setSeenIntro] = useState(false);

  /* Screen tracking. Firebase works out time-on-screen from the gap
     between one screen view and the next, so logging the change is
     all that's needed — no per-screen code anywhere. */
  const navigationRef = useRef<any>(null);
  const routeNameRef = useRef<string | undefined>(undefined);

  // The pitch, before anything else
  if (!loginMethod && !seenIntro) {
    return <OnBoardingScreen onDone={() => setSeenIntro(true)} />;
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;

        if (routeNameRef.current) {
          trackScreen(routeNameRef.current);
        }
      }}
      onStateChange={() => {
        const previous = routeNameRef.current;
        const current = navigationRef.current?.getCurrentRoute()?.name;

        // Only log a real change, not a re-render
        if (current && previous !== current) {
          trackScreen(current);
        }

        routeNameRef.current = current;
      }}
    >
      <RootStack initialRoute={loginMethod ? 'Main' : 'Login'} />
    </NavigationContainer>
  );
}

/** Separate component so the push hook can use navigation */
function RootStack({ initialRoute }: { initialRoute: string }) {
  usePushNotifications();

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false }}
    >
      {/* Entry */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Main" component={BottomTabNavigator} />

      {/* Full-screen takeover */}
      <Stack.Screen
        name="ReelPlayer"
        component={ReelPlayerScreen}
        options={{ presentation: 'fullScreenModal' }}
      />

      {/* Modals */}
      <Stack.Screen
        name="CustomRequirement"
        component={CustomRequirementScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="FreelancerRequest"
        component={FreelancerRequestScreen}
      />
      <Stack.Screen
        name="InfluencerSelection"
        component={InfluencerSelectionScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="InfluencerProfile"
        component={InfluencerProfileScreen}
      />
      <Stack.Screen
        name="PostRequest"
        component={PostRequestScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="BusinessIdeas"
        component={BusinessIdeasScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="MyReels" component={MyReelsScreen} />
      <Stack.Screen
        name="LasanTools"
        component={LasanToolsScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="Quotation"
        component={QuotationScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="LocationPicker"
        component={LocationPickerScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="PlanEnquiry"
        component={PlanEnquiryScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="ToolEnquiry"
        component={ToolEnquiryScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="AddReel"
        component={AddReelScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="PhoneAuth" component={PhoneAuthScreen} />
      {/* Account flows */}
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </Stack.Navigator>
  );
}
