import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getToken, setToken, clearToken } from '../services/api';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'faculty' | 'student';
  full_name: string;
  department?: string;
  student_id?: string;
  faculty_id?: string;
  requires_password_change?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (identifier: string, password: string, role: string) => Promise<AuthUser>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  isAdmin: boolean;
  isFaculty: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('unisphere_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setTokenState] = useState<string | null>(getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    try {
      const profile = await api.getProfile();
      setUser(profile);
      localStorage.setItem('unisphere_user', JSON.stringify(profile));
    } catch {
      logout();
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const existingToken = getToken();
      if (existingToken) {
        try {
          const profile = await api.getProfile();
          setUser(profile);
          localStorage.setItem('unisphere_user', JSON.stringify(profile));
        } catch {
          clearToken();
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (identifier: string, password: string, role: string): Promise<AuthUser> => {
    const res = await api.login({ identifier, password, role });
    setToken(res.access_token);
    setTokenState(res.access_token);

    const profile = await api.getProfile();
    setUser(profile);
    localStorage.setItem('unisphere_user', JSON.stringify(profile));
    return profile;
  };

  const logout = () => {
    clearToken();
    setTokenState(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';
  const isFaculty = user?.role === 'faculty';
  const isStudent = user?.role === 'student';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        refreshProfile,
        isAdmin,
        isFaculty,
        isStudent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
