import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthService } from '../services/authService';
import type { UserProfile, UserLoginPayload, UserSignUpPayload, UserUpdateProfilePayload } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  isProfileModalOpen: boolean;
  login: (payload: UserLoginPayload) => Promise<UserProfile>;
  signUp: (payload: UserSignUpPayload) => Promise<UserProfile>;
  logout: () => void;
  updateProfile: (payload: UserUpdateProfilePayload) => Promise<UserProfile>;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  openProfileModal: () => void;
  closeProfileModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_SESSION_STORAGE_KEY = 'athar_user_session';

const getStoredUser = (): UserProfile | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(USER_SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(getStoredUser);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored?.id) {
      // Re-verify and sync fresh data from Supabase in background
      AuthService.getProfileById(stored.id)
        .then((freshUser) => {
          if (freshUser) {
            setUser(freshUser);
            window.localStorage.setItem(USER_SESSION_STORAGE_KEY, JSON.stringify(freshUser));
          }
        })
        .catch(() => {
          // keep stored session
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (payload: UserLoginPayload): Promise<UserProfile> => {
    const authenticatedUser = await AuthService.login(payload);
    setUser(authenticatedUser);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(USER_SESSION_STORAGE_KEY, JSON.stringify(authenticatedUser));
    }
    setIsAuthModalOpen(false);
    return authenticatedUser;
  };

  const signUp = async (payload: UserSignUpPayload): Promise<UserProfile> => {
    const newUser = await AuthService.signUp(payload);
    setUser(newUser);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(USER_SESSION_STORAGE_KEY, JSON.stringify(newUser));
    }
    setIsAuthModalOpen(false);
    return newUser;
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(USER_SESSION_STORAGE_KEY);
    }
    setIsProfileModalOpen(false);
  };

  const updateProfile = async (payload: UserUpdateProfilePayload): Promise<UserProfile> => {
    if (!user?.id) {
      throw new Error('لم يتم تسجيل الدخول');
    }
    const updated = await AuthService.updateProfile(user.id, payload);
    setUser(updated);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(USER_SESSION_STORAGE_KEY, JSON.stringify(updated));
    }
    return updated;
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const openProfileModal = () => {
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isAuthModalOpen,
        authModalMode,
        isProfileModalOpen,
        login,
        signUp,
        logout,
        updateProfile,
        openAuthModal,
        closeAuthModal,
        openProfileModal,
        closeProfileModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
