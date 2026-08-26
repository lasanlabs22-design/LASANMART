import React, { createContext, useContext, useState, ReactNode } from 'react';

export type LoginMethod = 'google' | 'apple' | 'phone' | 'skip' | null;

export type UserProfile = {
  name: string;
  companyName: string;
  companyDescription: string;
  phone: string;
  email: string;
  instagramId: string;
  facebookId: string;
  profilePictureUri: string | null;
  companyLogoUri: string | null;
  address: string;
  latitude: number | null;
  longitude: number | null;
};

const emptyProfile: UserProfile = {
  name: '',
  companyName: '',
  companyDescription: '',
  phone: '',
  email: '',
  instagramId: '',
  facebookId: '',
  profilePictureUri: null,
  companyLogoUri: null,
   address: '',
  latitude: null,
  longitude: null,
};

type AuthContextType = {
  loginMethod: LoginMethod;
  profile: UserProfile;
  isProfileSaved: boolean;
  setLoginMethod: (method: LoginMethod) => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
  markProfileSaved: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loginMethod, setLoginMethod] = useState<LoginMethod>(null);
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [isProfileSaved, setIsProfileSaved] = useState(false);

  const updateProfile = (partial: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...partial }));
  };

  const markProfileSaved = () => setIsProfileSaved(true);

  const logout = () => {
    setLoginMethod(null);
    setProfile(emptyProfile);
    setIsProfileSaved(false);
  };

  return (
    <AuthContext.Provider
      value={{ loginMethod, profile, isProfileSaved, setLoginMethod, updateProfile, markProfileSaved, logout }}
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