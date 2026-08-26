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
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          borderTopColor: colors.border,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 10 },
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Lasan Vibes') {
            iconName = 'play-circle';
          } else if (route.name === 'My Requests') {
            iconName = 'checkmark-done-circle';
          } else if (route.name === 'My Account') {
            iconName = 'person';
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