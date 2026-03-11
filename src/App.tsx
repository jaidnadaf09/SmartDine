import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from "react-hot-toast";
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import BookTablePage from './pages/BookTablePage';
import OrderPage from './pages/OrderPage';
import CustomerPortal from './portals/customer/CustomerPortal';
import MyOrders from './portals/customer/pages/MyOrders';
import WaiterPortal from './portals/waiter/WaiterPortal';
import ChefPortal from './portals/chef/ChefPortal';
import AdminPortal from './portals/admin/AdminPortal';
import ProfilePage from './portals/customer/pages/ProfilePage';
import EditProfilePage from './portals/customer/pages/EditProfilePage';
import ChangePasswordPage from './portals/customer/pages/ChangePasswordPage';
import ProtectedRoute from './components/ProtectedRoute';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ReturnRefundPolicy from './pages/ReturnRefundPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import ThemeToggleButton from './components/ThemeToggleButton';
import CustomerLayout from './components/layouts/CustomerLayout';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#1f2937",
              color: "#fff",
              borderRadius: "8px",
              fontSize: "14px"
            }
          }}
        />
        <Router>
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
              {/* Legal Pages */}
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/refund-policy" element={<ReturnRefundPolicy />} />
              <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/contact-us" element={<ContactUs />} />
            </Route>

            {/* Auth Pages (without Navbar usually, or maybe they want it?) */}
            {/* User didn't specify Login/Signup, but let's keep them clean for now or include them if requested */}
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Other Portals (Admin, Chef, Waiter) */}
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
          <ThemeToggleButton />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
