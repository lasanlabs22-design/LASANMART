import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

/**
 * What happens when a notification arrives while the app is open.
 * Without this, foreground notifications are silently swallowed.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Asks permission and returns this device's push token.
 * Returns null if the user declines, or if we're on an emulator —
 * push doesn't work on emulators, only real devices.
 */
export async function registerForPush(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Push needs a real device — emulators are not supported');
    return null;
  }

  try {
    // Android needs a channel before notifications will show,
    // and this is where the sound and vibration are set
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Request updates',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6B35',
      });
    }

    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;

    // Only ask if we haven't already — repeatedly prompting annoys people
    if (status !== 'granted') {
      const asked = await Notifications.requestPermissionsAsync();
      status = asked.status;
    }

    if (status !== 'granted') {
      console.log('Push permission declined');
      return null;
    }

    // EAS injects the project id into the build
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    const token = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );

    return token.data;
  } catch (err) {
    console.log('Could not register for push:', err);
    return null;
  }
}
