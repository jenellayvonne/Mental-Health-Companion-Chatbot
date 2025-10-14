
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type UserRole = 'user' | 'moderator';

interface User {
  id: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (role: UserRole) => {
    const userToStore = { id: Math.random().toString(36).substring(2, 15), role };
    localStorage.setItem('user', JSON.stringify(userToStore));
    setUser(userToStore);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
