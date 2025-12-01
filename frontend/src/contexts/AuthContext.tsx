import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/apiClient';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (email: string, password: string, displayName: string, role: User['role']) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const mapUser = (raw: any): User => ({
    id: raw.id,
    email: raw.email,
    displayName: raw.displayName || raw.display_name || '',
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : new Date(),
  });

  const signup = async (email: string, password: string, displayName: string, _role: User['role']) => {
    const { user } = await api.auth.register({ email, password, displayName });
    setCurrentUser(mapUser(user));
  };

  const login = async (email: string, password: string) => {
    const { user } = await api.auth.login({ email, password });
    setCurrentUser(mapUser(user));
  };

  const loginWithGoogle = async () => {
    throw new Error('Google sign-in is not configured for the Flask backend');
  };

  const logout = async () => {
    api.tokens.clearTokens();
    setCurrentUser(null);
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const me = await api.auth.me();
        if (me?.user) {
          setCurrentUser(mapUser(me.user));
        } else {
          setCurrentUser(null);
        }
      } catch {
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const value: AuthContextType = {
    currentUser,
    login,
    loginWithGoogle,
    signup,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
