import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { registerForPush } from '../lib/push';
import { registerPushToken } from '../api/client';

/**
 * Registers this device for push, and sends the user to the right
 * screen when they tap a notification.
 *
 * Called once from the navigator, so it runs for the whole app.
 */
export function usePushNotifications() {
  const navigation = useNavigation<any>();
  const { profile, hasContactDetails } = useAuth();

  // Avoid re-registering the same token on every profile change
  const registeredFor = useRef<string | null>(null);

  /* ---- Register the device ---- */
  useEffect(() => {
    if (!hasContactDetails) return;

    const phone = profile.phone.replace(/\D/g, '').slice(-10);
    if (registeredFor.current === phone) return;

    (async () => {
      const token = await registerForPush();
      if (!token) return;

      await registerPushToken(phone, token);
      registeredFor.current = phone;
    })();
  }, [profile.phone, hasContactDetails]);

  /* ---- Handle taps ---- */
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as any;

        // Anything about a request takes them to their requests list
        if (data?.type === 'status') {
          navigation.navigate('Main', { screen: 'My Requests' });
        }
      }
    );

    return () => subscription.remove();
  }, [navigation]);
}
