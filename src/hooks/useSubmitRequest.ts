import { useState, useRef } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import {
  submitRequest,
  ApiError,
  SubmitRequestPayload,
  RequestType,
} from '../api/client';

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

  /** What the user was trying to send when we interrupted them */
  const pending = useRef<RequestBody | null>(null);

  /** Stops a double-tap sending the same request twice */
  const inFlight = useRef(false);

  const send = async (body: RequestBody, contact?: ContactDetails) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);

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

      Alert.alert(
        'Request Sent',
        'Thanks! Our team will get back to you shortly.',
        [{ text: 'OK', onPress: onSuccess }]
      );
    } catch (err) {
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
