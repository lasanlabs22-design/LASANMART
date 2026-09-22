import { useState, useRef } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import {
  submitRequest,
  registerPushToken,
  ApiError,
  DuplicateRequestError,
  SubmitRequestPayload,
  RequestType,
} from '../api/client';
import { events } from '../lib/analytics';
import { registerForPush } from '../lib/push';

/** Everything a screen supplies about the request itself */
type RequestBody = {
  type: RequestType;
  title?: string;
  description?: string;
  descriptionLabel?: string;
  sector?: string;
  city?: string;
  details?: Record<string, any>;
};

/**
 * What the contact sheet hands back once it's done.
 * The phone is included because the sheet collects and verifies it,
 * but it never goes to the backend — the token carries that.
 */
type ContactDetails = {
  name: string;
  phone: string;
  email: string;
};

/** What's shown when the backend says this was already asked for */
export type DuplicateInfo = {
  requestId: string;
  status: string;
  message: string;
  matchedCreator: string | null;
};

/**
 * Handles the whole submission flow:
 *   1. Check we have a name, an email, and a verified phone number
 *   2. If not, open the details sheet and remember what was being submitted
 *   3. Send it to the backend
 *   4. Show success or a useful error
 *
 * Screens call `submit(...)`, render <ContactDetailsSheet> with the returned
 * props, and don't worry about any of the above.
 */
export function useSubmitRequest(onSuccess?: () => void) {
  const { profile, hasContactDetails } = useAuth();

  const [busy, setBusy] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [duplicate, setDuplicate] = useState<DuplicateInfo | null>(null);

  /** What the user was trying to send when we interrupted them */
  const pending = useRef<RequestBody | null>(null);

  /** Stops a double-tap sending the same request twice */
  const inFlight = useRef(false);

  const send = async (body: RequestBody, contact?: ContactDetails) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setDuplicate(null);

    // Use the details passed in (fresh from the sheet) if given,
    // otherwise fall back to the saved profile
    const name = (contact?.name ?? profile.name).trim();
    const email = (contact?.email ?? profile.email).trim().toLowerCase();

    // No phone here — the backend reads it from the verified Firebase
    // token, so sending one would be ignored anyway
    const payload: SubmitRequestPayload = {
      type: body.type,
      name,
      email,
      companyName: profile.companyName || undefined,
      companyDescription: profile.companyDescription || undefined,
      sector: body.sector || profile.sector || undefined,
      city: body.city || profile.address || undefined,
      title: body.title,
      description: body.description,
      descriptionLabel: body.descriptionLabel,
      details: body.details,
    };

    try {
      await submitRequest(payload);
      events.requestSubmitted(body.type, body.title);

      // A first request is what creates the contact, so this is the
      // moment the device can be tied to it. Fire-and-forget.
      registerForPush()
        .then((token) => (token ? registerPushToken(token) : false))
        .catch(() => {});

      Alert.alert(
        'Request Sent',
        'Thanks! Our team will get back to you shortly.',
        [{ text: 'OK', onPress: onSuccess }]
      );
    } catch (err) {
      // Shown inline by the screen, not as a blocking alert — the
      // user has a real next step (view the existing request)
      if (err instanceof DuplicateRequestError) {
        setDuplicate({
          requestId: err.existingRequestId,
          status: err.existingStatus,
          message: err.message,
          matchedCreator: err.matchedCreator,
        });
        return;
      }

      const message =
        err instanceof ApiError
          ? err.message
          : 'Something went wrong. Please try again.';

      Alert.alert('Could not send', message);
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };

  /** Call this from the screen's submit button */
  const submit = (body: RequestBody) => {
    setDuplicate(null);

    if (!hasContactDetails) {
      pending.current = body;
      setSheetVisible(true);
      return;
    }
    send(body);
  };

  /** Called by the sheet once details are saved and the number verified */
  const handleDetailsComplete = (details: ContactDetails) => {
    setSheetVisible(false);

    const body = pending.current;
    pending.current = null;

    // Pass the details straight through — no waiting for state to settle
    if (body) send(body, details);
  };

  return {
    submit,
    busy,
    duplicate,
    clearDuplicate: () => setDuplicate(null),
    sheetProps: {
      visible: sheetVisible,
      onClose: () => {
        pending.current = null;
        setSheetVisible(false);
      },
      onComplete: handleDetailsComplete,
    },
  };
}
