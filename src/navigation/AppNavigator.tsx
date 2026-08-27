import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
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

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { loginMethod } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={loginMethod ? 'Main' : 'Login'}
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
          name="InfluencerSelection"
          component={InfluencerSelectionScreen}
          options={{ presentation: 'modal' }}
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
        
        {/* Account flows */}
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}