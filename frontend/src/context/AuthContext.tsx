import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../utils/api';

export type UserRole = 'customer' | 'waiter' | 'chef' | 'admin' | null;

interface User {
  id: number;
  email: string;
  role: UserRole;
  name: string;
  phone?: string;
  profileImage?: string;
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
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Using api utility instead of raw fetch

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for user data on load
    const storedUser = localStorage.getItem('smartdine_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Normalize role on load to fix stale session data
        if (parsedUser.role) {
          parsedUser.role = parsedUser.role.toLowerCase() as UserRole;
        }
        console.log('AuthContext: Restored user from storage:', parsedUser.email, 'Role:', parsedUser.role);
        setUser(parsedUser);
      } catch (e) {
        console.error('Failed to parse user from local storage');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password
      });

      const data = response.data;
      console.log('AuthContext DEBUG: Raw API Response:', data);

      const loggedInUser: User = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        profileImage: data.profileImage || undefined,
        role: (data.role as string).toLowerCase() as UserRole,
        token: data.token,
        walletBalance: data.walletBalance || 0,
      };

      console.log('AuthContext DEBUG: Normalized User Object:', loggedInUser);

      // Clear old data first to ensure clean state
      localStorage.removeItem('smartdine_user');
      localStorage.removeItem('token');
      
      setUser(loggedInUser);
      localStorage.setItem('smartdine_user', JSON.stringify(loggedInUser));
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      return loggedInUser;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Wrong email or password.');
    }
  };

  const signup = async (name: string, email: string, password: string, phone?: string): Promise<User> => {
    try {
      const response = await api.post('/auth/register', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone || null,
        role: 'customer'
      });

      const data = response.data;

      const newUser: User = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        profileImage: data.profileImage || undefined,
        role: (data.role as string).toLowerCase() as UserRole,
        token: data.token,
        walletBalance: data.walletBalance || 0,
      };

      localStorage.removeItem('smartdine_user');
      localStorage.removeItem('token');
      
      setUser(newUser);
      localStorage.setItem('smartdine_user', JSON.stringify(newUser));
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

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
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser, changePassword, isAuthenticated: !!user, loading }}>
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
