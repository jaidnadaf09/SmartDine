import React, { createContext, useContext, useState, type ReactNode } from 'react';

type AuthType = 'login' | 'signup' | null;

interface AuthModalContextType {
  authType: AuthType;
  openAuthModal: (type: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  setAuthType: (type: AuthType) => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export const AuthModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authType, setAuthType] = useState<AuthType>(null);

  const openAuthModal = (type: 'login' | 'signup') => setAuthType(type);
  const closeAuthModal = () => setAuthType(null);

  return (
    <AuthModalContext.Provider value={{ authType, openAuthModal, closeAuthModal, setAuthType }}>
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
