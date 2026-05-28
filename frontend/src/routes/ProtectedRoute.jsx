import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isLoggedIn, user } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0) {
    const role = user?.role;
    if (!role || !allowedRoles.includes(role)) {
      if (role === 'SUPER_ADMIN' || role === 'ADMIN') return <Navigate to="/admin" replace />;
      if (role === 'RECEPTIONIST' || role === 'STAFF' || role === 'MANAGER' || role === 'SUPPORT') return <Navigate to="/receptionist" replace />;
      if (role === 'TECHNICIAN') return <Navigate to="/technician" replace />;
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
