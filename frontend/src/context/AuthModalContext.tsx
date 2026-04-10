import React, { createContext, useContext, useState, type ReactNode } from 'react';

type AuthType = 'login' | 'signup' | null;

export interface AuthModalOptions {
  redirectTo?: string;
}

interface AuthModalContextType {
  authType: AuthType;
  authOptions?: AuthModalOptions;
  openAuthModal: (type: 'login' | 'signup', options?: AuthModalOptions) => void;
  closeAuthModal: () => void;
  setAuthType: (type: AuthType) => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export const AuthModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authType, setAuthType] = useState<AuthType>(null);
  const [authOptions, setAuthOptions] = useState<AuthModalOptions | undefined>();

  const openAuthModal = (type: 'login' | 'signup', options?: AuthModalOptions) => {
    setAuthType(type);
    if (options) {
      setAuthOptions(options);
      if (options.redirectTo) {
        sessionStorage.setItem("redirectScroll", window.scrollY.toString());
      }
    }
  };
  
  const closeAuthModal = () => {
    setAuthType(null);
    setTimeout(() => setAuthOptions(undefined), 300);
  };

  return (
    <AuthModalContext.Provider value={{ authType, authOptions, openAuthModal, closeAuthModal, setAuthType }}>
      {children}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
};
