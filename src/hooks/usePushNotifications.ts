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
  const { hasContactDetails } = useAuth();

  // Avoid asking for permission and registering twice in one session
  const registered = useRef(false);

  /* ---- Register the device ---- */
  useEffect(() => {
    // Nothing to attach a token to until they've verified a number
    if (!hasContactDetails) {
      registered.current = false;
      return;
    }

    if (registered.current) return;

    (async () => {
      const token = await registerForPush();
      if (!token) return;

      // The backend attaches this to whoever the verified token says
      // we are, so there is no phone number to pass
      await registerPushToken(token);
      registered.current = true;
    })();
  }, [hasContactDetails]);

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
