import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import {Toaster} from 'react-hot-toast';
import {AuthProvider} from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Profile from './pages/Profile';
import Products from './pages/Products';
import Transactions from './pages/Transactions';
import TransactionHistory from './pages/TransactionHistory';
import Reports from './pages/Reports';

// Sprint 5 - Simpan Pinjam Pages
import Simpanan from './pages/Simpanan';
import Pinjaman from './pages/Pinjaman';
import PinjamanApproval from './pages/PinjamanApproval';
import Angsuran from './pages/Angsuran';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* SuperAdmin only */}
            <Route
              path="users"
              element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <Users />
                </ProtectedRoute>
              }
            />

            {/* Admin & SuperAdmin */}
            <Route
              path="products"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                  <Products />
                </ProtectedRoute>
              }
            />
            <Route
              path="transactions"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                  <Transactions />
                </ProtectedRoute>
              }
            />
            <Route
              path="transactions/history"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                  <TransactionHistory />
                </ProtectedRoute>
              }
            />

            {/* SPRINT 5 - SIMPAN PINJAM ROUTES */}

            {/* Simpanan - SuperAdmin & Admin */}
            <Route
              path="simpanan"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                  <Simpanan />
                </ProtectedRoute>
              }
            />

            {/* Pinjaman - SuperAdmin & Admin */}
            <Route
              path="pinjaman"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                  <Pinjaman />
                </ProtectedRoute>
              }
            />

            {/* Pinjaman Approval - SuperAdmin Only */}
            <Route
              path="pinjaman-approval"
              element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <PinjamanApproval />
                </ProtectedRoute>
              }
            />

            {/* Angsuran Detail - SuperAdmin & Admin */}
            <Route
              path="angsuran/:pinjamanId"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                  <Angsuran />
                </ProtectedRoute>
              }
            />

            {/* All authenticated users */}
            <Route path="reports" element={<Reports />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#363636',
          },
          success: {
            iconTheme: {
              primary: '#FFBC54',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#E06100',
              secondary: '#fff',
            },
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
