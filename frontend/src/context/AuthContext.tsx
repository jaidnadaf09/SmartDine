import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '@utils/api';
import socket from '@socket/socketClient';

export type UserRole = 'customer' | 'waiter' | 'chef' | 'admin' | null;

interface User {
  id: number;
  email: string;
  role: UserRole;
  name: string;
  phone?: string;
  profileImage?: string | null;
  token?: string;
  walletBalance?: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string, phone?: string) => Promise<User>;
  logout: () => void;
  updateUser: (newData: Partial<User>) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  isAuthenticated: boolean;
  isGuest: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Using api utility instead of raw fetch

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Connect socket and authenticate with the stored JWT
  const connectSocket = (token: string) => {
    if (!socket.connected) {
      socket.connect();
    }
    socket.emit('authenticate', token);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setLoading(false);
      return;
    }

    const hydrateAuth = async () => {
      try {
        const res = await api.get('/auth/me');
        const data = res.data;
        const fetchedUser: User = {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone || undefined,
          profileImage: data.profileImage || null,
          role: (data.role as string).toLowerCase() as UserRole,
          token: token,
          walletBalance: data.walletBalance || 0,
        };
        setUser(fetchedUser);
        connectSocket(token); // re-authenticate socket on page refresh
      } catch (e) {
        console.error('Auth Hydration failed');
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    hydrateAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password
      });

      const data = response.data;
      console.log('AuthContext DEBUG: Raw API Response:', data);

      if (!data || !data.token || !data.id) {
        throw new Error(data?.message || 'Invalid email or password');
      }

      const loggedInUser: User = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        profileImage: data.profileImage || null,
        role: (data.role as string).toLowerCase() as UserRole,
        token: data.token,
        walletBalance: data.walletBalance || 0,
      };

      console.log('AuthContext DEBUG: Normalized User Object:', loggedInUser);

      // Clear old data first to ensure clean state
      localStorage.removeItem('smartdine_user');
      localStorage.removeItem('token');
      
      localStorage.setItem('smartdine_user', JSON.stringify(loggedInUser));
      localStorage.setItem('token', data.token);
      setUser(loggedInUser);
      connectSocket(data.token); // connect socket after successful login

      return loggedInUser;
    } catch (error: any) {
      console.error('LOGIN FAILED:', error);
      
      /* IMPORTANT: ensure failed login does not persist state */
      setUser(null);
      localStorage.removeItem('token');
      
      throw new Error(
        error?.response?.data?.message ||
        error?.message ||
        "Invalid email or password"
      );
    }
  };

  const signup = async (name: string, email: string, password: string, phone?: string): Promise<User> => {
    try {
      const response = await api.post('/auth/register', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone || null
      });

      const data = response.data;

      const newUser: User = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        profileImage: data.profileImage || null,
        role: (data.role as string).toLowerCase() as UserRole,
        token: data.token,
        walletBalance: data.walletBalance || 0,
      };

      localStorage.removeItem('smartdine_user');
      localStorage.removeItem('token');
      
      localStorage.setItem('smartdine_user', JSON.stringify(newUser));
      if (data.token) {
        localStorage.setItem('token', data.token);
        connectSocket(data.token); // connect socket after signup
      }
      setUser(newUser);

      return newUser;
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.response?.data?.message || 'Failed to register.');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('smartdine_user');
    localStorage.removeItem('token');
    socket.disconnect(); // clean up socket on logout
  };

  const updateUser = (newData: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...newData };
    setUser(updatedUser);
    localStorage.setItem('smartdine_user', JSON.stringify(updatedUser));
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser, changePassword, isAuthenticated: !!user, isGuest: !user, loading }}>
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
