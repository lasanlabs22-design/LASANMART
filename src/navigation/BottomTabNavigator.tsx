import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from '../screens/HomeScreen';
import LasanVibesScreen from '../screens/LasanVibesScreen';
import MyRequestsScreen from '../screens/MyRequestsScreen';
import MyAccountScreen from '../screens/MyAccountScreen';
import CenterTabButton from '../components/CenterTabButton';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

/** PhonePe-style purple — used only in the tab bar */
const TAB_ACTIVE = '#5F259F';
const TAB_INACTIVE = '#E5A800';

// Never rendered — the tab press is intercepted and opens a modal instead
function ToolsPlaceholder() {
  return <View />;
}

export default function BottomTabNavigator({ navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: TAB_ACTIVE,
        tabBarInactiveTintColor: TAB_INACTIVE,
        tabBarStyle: {
          borderTopColor: colors.border,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 10 },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          // Filled when active, outline when not — the way PhonePe
          // and most Indian apps do it
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Lasan Vibes') {
            iconName = focused ? 'play-circle' : 'play-circle-outline';
          } else if (route.name === 'My Requests') {
            iconName = focused
              ? 'checkmark-done-circle'
              : 'checkmark-done-circle-outline';
          } else if (route.name === 'My Account') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Lasan Vibes" component={LasanVibesScreen} />

      <Tab.Screen
        name="Tools"
        component={ToolsPlaceholder}
        options={{
          tabBarLabel: () => null,
          tabBarButton: () => (
            <CenterTabButton
              onPress={() => navigation.navigate('LasanTools')}
            />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
          },
        }}
      />

      <Tab.Screen name="My Requests" component={MyRequestsScreen} />
      <Tab.Screen name="My Account" component={MyAccountScreen} />
    </Tab.Navigator>
  );
}
