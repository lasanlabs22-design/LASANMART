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
      // we are, so there is no phone number to pass. Only counted as
      // done once it's saved — before a first request there is no
      // contact yet, and useSubmitRequest tries again after one.
      registered.current = await registerPushToken(token);
    })();
  }, [hasContactDetails]);

  /* ---- Handle taps ----
     The hook covers both cases: a tap while the app is running, and
     the tap that launched it from closed. Reading the launch tap once
     at startup doesn't work — Android hands it over a moment after the
     JavaScript starts, so it came back empty (seen on device in Hub). */
  const lastResponse = Notifications.useLastNotificationResponse();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (!lastResponse) return;
    if (lastResponse.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) {
      return;
    }

    const id = lastResponse.notification.request.identifier;
    if (handled.current === id) return;

    const data = lastResponse.notification.request.content.data as any;

    // A beat for the stack to finish mounting on a cold start. Marked
    // handled only once it runs, so a re-render can't swallow the tap.
    const timer = setTimeout(() => {
      handled.current = id;

      if (data?.type === 'status') {
        // Anything about a request takes them to their requests list
        navigation.navigate('Main', { screen: 'My Requests' });
      } else if (data?.type === 'vibes') {
        // A posting decision — that screen shows approved or declined
        navigation.navigate('AddReel');
      }

      // So a later remount doesn't route there again
      Notifications.clearLastNotificationResponseAsync().catch(() => {});
    }, 300);

    return () => clearTimeout(timer);
  }, [lastResponse, navigation]);
}
