import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { isDevAuth, getDevToken } from './devAuth';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Dev auth mode: gate on presence of dev token
  if (isDevAuth) {
    const token = getDevToken();
    if (!token) {
      return <Navigate to="/login" replace state={{ from: location }} />;
    }
    return <Outlet />;
  }

  // Firebase auth mode (default)
  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <span>Loading...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
