import React, { type ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { useAuthModal } from '@context/AuthModalContext';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const { openAuthModal } = useAuthModal();
  const location = useLocation();

  const publicRoutes = ["/", "/order", "/book-table"];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  useEffect(() => {
    if (!loading && !isAuthenticated && !isPublicRoute) {
      openAuthModal('login', { redirectTo: location.pathname });
    }
  }, [loading, isAuthenticated, isPublicRoute, location.pathname, openAuthModal]);

  if (loading) {
    return (
      <div className="loading-spinner-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated && isPublicRoute) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    // Return null while modal handles login
    return null;
  }

  if (allowedRoles && user && user.role && !allowedRoles.includes(user.role.toLowerCase())) {
    // If user is authenticated but doesn't have the required role, redirect to home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
