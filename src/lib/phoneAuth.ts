import {
  getAuth,
  signInWithPhoneNumber,
  signOut,
} from '@react-native-firebase/auth';

export class PhoneAuthError extends Error {
  code: string;

  constructor(message: string, code = 'unknown') {
    super(message);
    this.name = 'PhoneAuthError';
    this.code = code;
  }
}

/** Turns Firebase's error codes into something a person can read */
function readable(err: any): PhoneAuthError {
  const code = err?.code || 'unknown';

  switch (code) {
    case 'auth/invalid-phone-number':
      return new PhoneAuthError("That phone number doesn't look right.", code);

    case 'auth/too-many-requests':
      return new PhoneAuthError(
        'Too many attempts. Please wait a while and try again.',
        code
      );

    case 'auth/invalid-verification-code':
      return new PhoneAuthError(
        'That code is incorrect. Please check and try again.',
        code
      );

    case 'auth/code-expired':
    case 'auth/session-expired':
      return new PhoneAuthError(
        'That code has expired. Request a new one.',
        code
      );

    case 'auth/quota-exceeded':
      return new PhoneAuthError(
        "We can't send codes right now. Please try again later.",
        code
      );

    case 'auth/network-request-failed':
      return new PhoneAuthError(
        'Check your internet connection and try again.',
        code
      );

    case 'auth/missing-client-identifier':
      return new PhoneAuthError(
        'This app is not set up for phone sign-in yet. Please try another method.',
        code
      );

    default:
      console.log('Phone auth error:', code, err?.message);
      return new PhoneAuthError(
        'Something went wrong. Please try again.',
        code
      );
  }
}

/**
 * The object Firebase hands back after sending an OTP.
 * Typed from the function's own return value, so it stays correct
 * regardless of what Firebase names its types namespace.
 */
export type Confirmation = Awaited<ReturnType<typeof signInWithPhoneNumber>>;

/**
 * Sends an OTP to a 10-digit Indian number.
 * Returns a confirmation object you pass back to `verifyCode`.
 */
export async function sendOtp(phone: string): Promise<Confirmation> {
  const digits = phone.replace(/\D/g, '').slice(-10);

  if (digits.length !== 10) {
    throw new PhoneAuthError('Enter a valid 10-digit mobile number.');
  }

  try {
    return await signInWithPhoneNumber(getAuth(), `+91${digits}`);
  } catch (err) {
    throw readable(err);
  }
}

/** Checks the six-digit code the user typed */
export async function verifyCode(
  confirmation: Confirmation,
  code: string
): Promise<void> {
  const digits = code.replace(/\D/g, '');

  if (digits.length !== 6) {
    throw new PhoneAuthError('Enter the 6-digit code.');
  }

  try {
    await confirmation.confirm(digits);
  } catch (err) {
    throw readable(err);
  }
}

/** Clears the Firebase session — called on logout */
export async function signOutPhone() {
  try {
    await signOut(getAuth());
  } catch {
    // Not worth surfacing
  }
}
