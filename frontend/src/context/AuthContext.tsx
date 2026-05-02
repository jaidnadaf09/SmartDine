import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import api from '@utils/api';
import { getSocket } from '@socket/socketClient';

export type AuthType = 'login' | 'signup' | null;

export interface AuthModalOptions {
  redirectTo?: string;
}

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
  isAuthReady: boolean;
  reconnecting: boolean;
  // Modal state (merged from AuthModalContext)
  authType: AuthType;
  authOptions?: AuthModalOptions;
  isOpen: boolean;
  openAuthModal: (type: 'login' | 'signup', options?: AuthModalOptions) => void;
  closeAuthModal: () => void;
  setAuthType: (type: AuthType) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Using api utility instead of raw fetch

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [reconnecting, setReconnecting] = useState(false);
  const hasHydrated = useRef(false);

  // Modal state (merged from AuthModalContext)
  const [authType, setAuthType] = useState<AuthType>(null);
  const [authOptions, setAuthOptions] = useState<AuthModalOptions | undefined>();

  const openAuthModal = useCallback((type: 'login' | 'signup', options?: AuthModalOptions) => {
    setAuthType(type);
    if (options) {
      setAuthOptions(options);
      if (options.redirectTo) {
        sessionStorage.setItem('redirectScroll', window.scrollY.toString());
      }
    }
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthType(null);
    setTimeout(() => setAuthOptions(undefined), 300);
  }, []);

  const isOpen = !!authType;



  const connectSocket = useCallback(() => {
    getSocket();
  }, []);

  useEffect(() => {
    if (user?.token) {
      connectSocket();
    }
  }, [user?.token, connectSocket]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    
    if (!token) {
      setLoading(false);
      return;
    }

    if (hasHydrated.current) return;
    hasHydrated.current = true;

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
        connectSocket(); // re-authenticate socket on page refresh
        closeAuthModal(); // ensure modal is closed if user is already authenticated
        setLoading(false);
      } catch (e) {
        console.warn('Auth Hydration failed, retrying once to handle backend restarts...');
        setReconnecting(true);
        setTimeout(async () => {
          try {
            const retryRes = await api.get('/auth/me');
            const retryData = retryRes.data;
            const fetchedUser: User = {
              id: retryData.id,
              name: retryData.name,
              email: retryData.email,
              phone: retryData.phone || undefined,
              profileImage: retryData.profileImage || null,
              role: (retryData.role as string).toLowerCase() as UserRole,
              token: token,
              walletBalance: retryData.walletBalance || 0,
            };
            setUser(fetchedUser);
            connectSocket();
            closeAuthModal(); // close modal on successful retry hydration
          } catch (retryErr) {
            console.error('Auth Hydration retry failed');
            localStorage.removeItem('token');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
            getSocket().disconnect();
          } finally {
            setReconnecting(false);
            setLoading(false);
          }
        }, 800);
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
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      localStorage.setItem('smartdine_user', JSON.stringify(loggedInUser));
      localStorage.setItem('token', data.accessToken || data.token);
      localStorage.setItem('accessToken', data.accessToken || data.token);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      setUser(loggedInUser);
      connectSocket(); // connect socket after successful login
      closeAuthModal(); // IMPORTANT: close modal BEFORE caller can navigate

      return loggedInUser;
    } catch (error: any) {
      console.error('LOGIN FAILED:', error);
      
      /* IMPORTANT: ensure failed login does not persist state */
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
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
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      localStorage.setItem('smartdine_user', JSON.stringify(newUser));
      if (data.token || data.accessToken) {
        localStorage.setItem('token', data.accessToken || data.token);
        localStorage.setItem('accessToken', data.accessToken || data.token);
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
        connectSocket(); // connect socket after signup
      }
      setUser(newUser);
      closeAuthModal(); // IMPORTANT: close modal BEFORE caller can navigate

      return newUser;
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.response?.data?.message || 'Failed to register.');
    }
  };

  const logout = () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      api.post('/auth/logout', { refreshToken }).catch(console.error);
    }
    setUser(null);
    localStorage.removeItem('smartdine_user');
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    getSocket().disconnect(); // clean up socket on logout
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
    <AuthContext.Provider value={{
      user, login, signup, logout, updateUser, changePassword,
      isAuthenticated: !!user, isGuest: !user, loading, isAuthReady: !loading, reconnecting,
      authType, authOptions, isOpen, openAuthModal, closeAuthModal, setAuthType
    }}>
      {children}
      {reconnecting && (
        <div style={{ position: 'fixed', bottom: 10, left: 10, padding: '4px 8px', background: 'var(--brand-primary)', color: 'white', fontSize: 12, borderRadius: 4, zIndex: 9999 }}>
          Reconnecting...
        </div>
      )}
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
