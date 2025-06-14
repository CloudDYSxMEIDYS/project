'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

// TODO: Replace Supabase logic with Firebase
interface AuthContextType {
  user: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Implement Firebase auth state listener
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // TODO: Implement Firebase sign in
    return { data: null, error: null };
  };

  const signUp = async (email: string, password: string) => {
    // TODO: Implement Firebase sign up
    return { data: null, error: null };
  };

  const signOut = async () => {
    // TODO: Implement Firebase sign out
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};