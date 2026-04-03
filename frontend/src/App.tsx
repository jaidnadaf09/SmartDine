import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthModalProvider, useAuthModal } from './context/AuthModalContext';
import { Toaster } from "react-hot-toast";
import ProtectedRoute from './components/ProtectedRoute';
import ThemeToggleButton from './components/ThemeToggleButton';
import ScrollToTop from './components/utils/ScrollToTop';
import CustomerLayout from './components/layouts/CustomerLayout';
import DotLoader from './components/shared/DotLoader';
import AuthModal from './components/auth/AuthModal';
import ScrollProgress from './components/utils/ScrollProgress';
import './App.css';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const BookTablePage = lazy(() => import('./pages/BookTablePage'));
const OrderPage = lazy(() => import('./pages/OrderPage'));
const CustomerPortal = lazy(() => import('./portals/customer/CustomerPortal'));
const MyOrders = lazy(() => import('./portals/customer/pages/MyOrders'));
const WaiterPortal = lazy(() => import('./portals/waiter/WaiterPortal'));
const ChefPortal = lazy(() => import('./portals/chef/ChefPortal'));
const AdminPortal = lazy(() => import('./portals/admin/AdminPortal'));
const ProfilePage = lazy(() => import('./portals/customer/pages/ProfilePage'));
const EditProfilePage = lazy(() => import('./portals/customer/pages/EditProfilePage'));
const ChangePasswordPage = lazy(() => import('./portals/customer/pages/ChangePasswordPage'));
const WalletHistory = lazy(() => import('./portals/customer/pages/WalletHistory'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const ReturnRefundPolicy = lazy(() => import('./pages/ReturnRefundPolicy'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const ContactUs = lazy(() => import('./pages/ContactUs'));

const PageLoader = () => (
    <div style={{ height: '70vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <DotLoader size={12} color="var(--brand-primary, #A67B5B)" />
    </div>
);

const AppContent = () => {
  const { authType, setAuthType, closeAuthModal } = useAuthModal();

  return (
    <>
      <ScrollProgress />
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Customer Facing Routes with Persistent Navbar */}
          <Route element={<CustomerLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/book-table"
              element={
                <ProtectedRoute>
                  <BookTablePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/order"
              element={
                <ProtectedRoute>
                  <OrderPage />
                </ProtectedRoute>
              }
            />
            <Route path="/customer" element={<CustomerPortal />}>
              <Route index element={<Navigate to="/customer/myorders" replace />} />
              <Route path="myorders" element={<MyOrders />} />
            </Route>
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/edit"
              element={
                <ProtectedRoute>
                  <EditProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/password"
              element={
                <ProtectedRoute>
                  <ChangePasswordPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wallet"
              element={
                <ProtectedRoute>
                  <WalletHistory />
                </ProtectedRoute>
              }
            />
            {/* Legal Pages */}
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/refund-policy" element={<ReturnRefundPolicy />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/contact-us" element={<ContactUs />} />
          </Route>

          {/* Auth Pages */}
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Other Portals */}
          <Route path="/waiter" element={<WaiterPortal />} />
          <Route
            path="/chef/*"
            element={
              <ProtectedRoute allowedRoles={['chef', 'CHEF']}>
                <ChefPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPortal />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
      <ThemeToggleButton />
      
      <AuthModal
        isOpen={!!authType}
        type={authType || 'login'}
        setType={(type) => setAuthType(type)}
        onClose={closeAuthModal}
      />
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthModalProvider>
          <Toaster
            position="top-right"
            containerStyle={{
              top: 72,
              right: 24,
              zIndex: 9999,
            }}
            toastOptions={{
              duration: 4000,
              style: {
                zIndex: 9999,
              },
              className: 'hot-toast-premium',
              success: {
                iconTheme: {
                  primary: 'var(--brand-primary)',
                  secondary: 'white',
                },
              },
            }}
          />
          <Router>
            <AppContent />
          </Router>
        </AuthModalProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
