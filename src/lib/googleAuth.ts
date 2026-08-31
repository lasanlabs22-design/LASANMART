import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

/**
 * From Firebase → Authentication → Sign-in method → Google →
 * Web SDK configuration. Despite the name, Android needs this one.
 */
const WEB_CLIENT_ID =
  '619769435695-1af73d9j24u4mvjqtn8rqcupm7jlmhoo.apps.googleusercontent.com';

/** Call once when the app starts */
export function configureGoogleSignIn() {
  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    offlineAccess: false,
  });
}

export type GoogleUser = {
  name: string;
  email: string;
  photo: string | null;
};

export class GoogleAuthError extends Error {
  /** True when the user backed out — not worth showing an error for */
  cancelled: boolean;

  constructor(message: string, cancelled = false) {
    super(message);
    this.name = 'GoogleAuthError';
    this.cancelled = cancelled;
  }
}

/**
 * Opens the Google account picker and returns the chosen account.
 * Google gives us name, email and photo — never a phone number,
 * so we still ask for that separately.
 */
export async function signInWithGoogle(): Promise<GoogleUser> {
  try {
    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });

    const result = await GoogleSignin.signIn();

    // The library returns different shapes across versions,
    // so read defensively
    const user = (result as any)?.data?.user ?? (result as any)?.user;

    if (!user?.email) {
      throw new GoogleAuthError('Could not read your Google account details.');
    }

    return {
      name: user.name || user.givenName || '',
      email: user.email,
      photo: user.photo || null,
    };
  } catch (err: any) {
    if (err instanceof GoogleAuthError) throw err;

    switch (err?.code) {
      case statusCodes.SIGN_IN_CANCELLED:
        throw new GoogleAuthError('Sign-in cancelled', true);

      case statusCodes.IN_PROGRESS:
        throw new GoogleAuthError('Sign-in is already in progress', true);

      case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
        throw new GoogleAuthError(
          'Google Play Services is not available on this device.'
        );

      default:
        console.log('Google sign-in failed:', err?.code, err?.message);
        throw new GoogleAuthError(
          "Couldn't sign in with Google. Please try again."
        );
    }
  }
}

/** Clears the cached account so the picker appears again next time */
export async function signOutGoogle() {
  try {
    await GoogleSignin.signOut();
  } catch {
    // Not worth surfacing
  }
}
