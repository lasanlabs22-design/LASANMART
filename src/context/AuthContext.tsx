import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type LoginMethod = 'google' | 'apple' | 'phone' | 'skip' | null;

export type UserProfile = {
  name: string;
  companyName: string;
  companyDescription: string;
  phone: string;
  email: string;
  instagramId: string;
  facebookId: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  profilePictureUri: string | null;
  companyLogoUri: string | null;
};

const emptyProfile: UserProfile = {
  name: '',
  companyName: '',
  companyDescription: '',
  phone: '',
  email: '',
  instagramId: '',
  facebookId: '',
  address: '',
  latitude: null,
  longitude: null,
  profilePictureUri: null,
  companyLogoUri: null,
};

/* The names under which we file things on the device */
const KEYS = {
  profile: '@lasanmart/profile',
  loginMethod: '@lasanmart/loginMethod',
  profileSaved: '@lasanmart/profileSaved',
};

type AuthContextType = {
  loginMethod: LoginMethod;
  profile: UserProfile;
  isProfileSaved: boolean;
  /** False until we've finished reading from the device on startup */
  isReady: boolean;
  /** True when we have the three things every request needs */
  hasContactDetails: boolean;
  setLoginMethod: (method: LoginMethod) => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
  markProfileSaved: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loginMethod, setLoginMethodState] = useState<LoginMethod>(null);
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [isProfileSaved, setIsProfileSaved] = useState(false);
  const [isReady, setIsReady] = useState(false);

  /* ---- Load everything back from the device on startup ---- */
  useEffect(() => {
    (async () => {
      try {
        const [storedProfile, storedMethod, storedSaved] =
          await AsyncStorage.multiGet([
            KEYS.profile,
            KEYS.loginMethod,
            KEYS.profileSaved,
          ]);

        if (storedProfile[1]) {
          // Merge over emptyProfile so new fields added later don't break
          // profiles saved by an older version of the app
          setProfile({ ...emptyProfile, ...JSON.parse(storedProfile[1]) });
        }
        if (storedMethod[1]) {
          setLoginMethodState(storedMethod[1] as LoginMethod);
        }
        if (storedSaved[1] === 'true') {
          setIsProfileSaved(true);
        }
      } catch (err) {
        console.log('Could not load saved profile:', err);
        // Not fatal — the user just starts fresh
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  /* ---- Save whenever something changes ---- */

  const updateProfile = (partial: Partial<UserProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...partial };
      AsyncStorage.setItem(KEYS.profile, JSON.stringify(next)).catch((err) =>
        console.log('Could not save profile:', err)
      );
      return next;
    });
  };

  const setLoginMethod = (method: LoginMethod) => {
    setLoginMethodState(method);
    if (method) {
      AsyncStorage.setItem(KEYS.loginMethod, method).catch(() => {});
    } else {
      AsyncStorage.removeItem(KEYS.loginMethod).catch(() => {});
    }
  };

  const markProfileSaved = () => {
    setIsProfileSaved(true);
    AsyncStorage.setItem(KEYS.profileSaved, 'true').catch(() => {});
  };

  const logout = () => {
    setLoginMethodState(null);
    setProfile(emptyProfile);
    setIsProfileSaved(false);
    AsyncStorage.multiRemove([
      KEYS.profile,
      KEYS.loginMethod,
      KEYS.profileSaved,
    ]).catch(() => {});
  };

  /* The three fields the backend requires on every request */
  const hasContactDetails =
    profile.name.trim().length > 1 &&
    profile.phone.replace(/\D/g, '').length === 10 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim());

  return (
    <AuthContext.Provider
      value={{
        loginMethod,
        profile,
        isProfileSaved,
        isReady,
        hasContactDetails,
        setLoginMethod,
        updateProfile,
        markProfileSaved,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}