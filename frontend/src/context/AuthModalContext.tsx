/**
 * AuthModalContext — Compatibility Shim
 *
 * Modal state has been merged into AuthContext.
 * This file re-exports the same API surface so existing imports continue to work
 * without requiring changes to every consumer file.
 *
 * You may migrate individual files to import from '@context/AuthContext' directly
 * using `useAuth()` when convenient; this shim is safe to keep indefinitely.
 */
import { useAuth, type AuthType, type AuthModalOptions } from './AuthContext';

export type { AuthType, AuthModalOptions };

/** Drop-in replacement for the old useAuthModal() hook. */
export const useAuthModal = () => {
  const {
    authType,
    authOptions,
    isOpen,
    openAuthModal,
    closeAuthModal,
    setAuthType,
  } = useAuth();

  return { authType, authOptions, isOpen, openAuthModal, closeAuthModal, setAuthType };
};

/**
 * AuthModalProvider — now a no-op passthrough.
 * AuthModalProvider is no longer needed because state lives in AuthContext.
 * Kept here so any import of AuthModalProvider doesn't crash.
 */
import React, { type ReactNode } from 'react';

export const AuthModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};
