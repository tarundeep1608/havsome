import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingScreen from '../UI/LoadingScreen';

export default function ProtectedRoute({ children, allowedRoles = ['admin', 'kitchen'] }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Authenticating..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    // Redirect to appropriate dashboard based on role
    if (role === 'kitchen') {
      return <Navigate to="/kitchen" replace />;
    }
    return <Navigate to="/admin" replace />;
  }

  return children;
}
