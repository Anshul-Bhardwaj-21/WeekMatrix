import { onAuthStateChanged, User } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../config/firebase';
import { AuthUser, logOut } from '../services/auth';
import { readJSON, removeKey, writeJSON } from '@/services/localStorage';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  continueAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [guestMode, setGuestMode] = useState(false);
  const [authHydrated, setAuthHydrated] = useState(false);
  const [guestHydrated, setGuestHydrated] = useState(false);

  const GUEST_KEY = 'timematrix.guestMode.v1';

  useEffect(() => {
    let cancelled = false;

    const hydrateGuestMode = async () => {
      try {
        const stored = await readJSON<boolean>(GUEST_KEY);
        if (cancelled) return;
        setGuestMode(stored === true);
      } finally {
        if (!cancelled) setGuestHydrated(true);
      }
    };

    hydrateGuestMode();

    const unsubscribe = onAuthStateChanged(auth, (nextUser: User | null) => {
      setFirebaseUser(nextUser);
      setAuthHydrated(true);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  // If the user authenticates, clear any prior guest-mode selection to avoid
  // immediately falling back into guest mode when the user signs out.
  useEffect(() => {
    if (!firebaseUser) return;
    if (!guestMode) return;
    setGuestMode(false);
    void removeKey(GUEST_KEY);
  }, [firebaseUser, guestMode]);

  const loading = !(authHydrated && guestHydrated);

  const effectiveUser: AuthUser | null = firebaseUser
    ? { uid: firebaseUser.uid, email: firebaseUser.email, isGuest: false }
    : guestMode
      ? { uid: 'guest', email: null, isGuest: true }
      : null;

  const continueAsGuest = async () => {
    setGuestMode(true);
    await writeJSON(GUEST_KEY, true);
  };

  const signOut = async () => {
    if (firebaseUser) {
      await logOut();
      return;
    }

    setGuestMode(false);
    await removeKey(GUEST_KEY);
  };

  return (
    <AuthContext.Provider value={{ user: effectiveUser, loading, continueAsGuest, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
