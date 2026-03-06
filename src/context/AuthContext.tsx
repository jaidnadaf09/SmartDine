import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type UserRole = 'customer' | 'waiter' | 'chef' | 'admin' | null;

interface User {
  id: number;
  email: string;
  role: UserRole;
  name: string;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || "https://smartdine-l22i.onrender.com/api";

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
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const data = await response.json();
      console.log('AuthContext DEBUG: Raw API Response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to login');
      }

      const loggedInUser: User = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: (data.role as string).toLowerCase() as UserRole,
        token: data.token,
      };

      console.log('AuthContext DEBUG: Normalized User Object:', loggedInUser);

      // Clear old data first to ensure clean state
      localStorage.removeItem('smartdine_user');
      setUser(loggedInUser);
      localStorage.setItem('smartdine_user', JSON.stringify(loggedInUser));

      return loggedInUser;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message || 'Wrong email or password.');
      } else {
        throw new Error('Wrong email or password.');
      }
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<User> => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password, role: 'customer' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to register');
      }

      const newUser: User = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: (data.role as string).toLowerCase() as UserRole,
        token: data.token,
      };

      localStorage.removeItem('smartdine_user');
      setUser(newUser);
      localStorage.setItem('smartdine_user', JSON.stringify(newUser));

      return newUser;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message || 'Failed to register.');
      } else {
        throw new Error('Failed to register.');
      }
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('smartdine_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user, loading }}>
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
