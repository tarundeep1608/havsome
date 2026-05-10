import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/Layout/ErrorBoundary';

// Layouts
import AdminLayout from './components/Layout/AdminLayout';
import KitchenLayout from './components/Layout/KitchenLayout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import CustomerMenu from './pages/CustomerMenu';
import OrderTracking from './pages/OrderTracking';
import KitchenDisplay from './pages/KitchenDisplay';

// Admin pages
import Dashboard from './pages/admin/Dashboard';
import ManualOrder from './pages/admin/ManualOrder';
import MenuManagement from './pages/admin/MenuManagement';
import Billing from './pages/admin/Billing';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/menu/:tableId" element={<CustomerMenu />} />
          <Route path="/order/:orderId" element={<OrderTracking />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Admin routes (protected) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="manual-order" element={<ManualOrder />} />
            <Route path="menu" element={<MenuManagement />} />
            <Route path="billing" element={<Billing />} />
          </Route>

          {/* Kitchen route (protected) */}
          <Route
            path="/kitchen"
            element={
              <ProtectedRoute allowedRoles={['admin', 'kitchen']}>
                <KitchenLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<KitchenDisplay />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/menu/1" replace />} />
          <Route path="*" element={<Navigate to="/menu/1" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
