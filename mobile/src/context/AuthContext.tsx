import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { apiRequest } from '@/api/client';
import { API_PATH } from '@/constants/apiPaths';
import { HTTP_METHOD } from '@/constants/http';
import { PLATFORM } from '@/constants/platform';
import type { AuthUser, LoginResult } from '@/types/auth';

const SESSION_KEY = 'hrSession';

const isWeb = Platform.OS === PLATFORM.WEB;

const readSession = async (): Promise<LoginResult | null> => {
  const raw = isWeb
    ? typeof localStorage === 'undefined'
      ? null
      : localStorage.getItem(SESSION_KEY)
    : await SecureStore.getItemAsync(SESSION_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as LoginResult;
  } catch {
    return null;
  }
};

const writeSession = async (session: LoginResult): Promise<void> => {
  const raw = JSON.stringify(session);
  if (isWeb) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SESSION_KEY, raw);
    }
    return;
  }
  await SecureStore.setItemAsync(SESSION_KEY, raw);
};

const clearSession = async (): Promise<void> => {
  if (isWeb) {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(SESSION_KEY);
    }
    return;
  }
  await SecureStore.deleteItemAsync(SESSION_KEY);
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isRestoring: boolean;
  signInWithGoogle: (idToken: string) => Promise<void>;
  signInAsDeveloper: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<LoginResult | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    let isActive = true;

    const restore = async () => {
      const stored = await readSession();
      if (isActive) {
        setSession(stored);
        setIsRestoring(false);
      }
    };

    restore();

    return () => {
      isActive = false;
    };
  }, []);

  const startSession = useCallback(async (result: LoginResult) => {
    await writeSession(result);
    setSession(result);
  }, []);

  const signInWithGoogle = useCallback(
    async (idToken: string) => {
      const result = await apiRequest<LoginResult>(API_PATH.AUTH_GOOGLE, {
        method: HTTP_METHOD.POST,
        body: { idToken },
      });
      await startSession(result);
    },
    [startSession],
  );

  const signInAsDeveloper = useCallback(
    async (email: string) => {
      const result = await apiRequest<LoginResult>(API_PATH.AUTH_DEV_LOGIN, {
        method: HTTP_METHOD.POST,
        body: { email },
      });
      await startSession(result);
    },
    [startSession],
  );

  const signOut = useCallback(async () => {
    await clearSession();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isRestoring,
      signInWithGoogle,
      signInAsDeveloper,
      signOut,
    }),
    [session, isRestoring, signInWithGoogle, signInAsDeveloper, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
