import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import { useAuth } from './useAuth';
import { isDevAuth, getDevToken, clearDevToken } from './devAuth';

export default function ProtectedRoute() {
  const { user, loading, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      if (isDevAuth) {
        clearDevToken();
        navigate('/login', { replace: true });
      } else {
        await signOut();
        navigate('/login', { replace: true });
      }
    } catch {
      navigate('/login', { replace: true });
    }
  };

  // Dev auth mode: gate on presence of dev token
  if (isDevAuth) {
    const token = getDevToken();
    if (!token) {
      return <Navigate to="/login" replace state={{ from: location }} />;
    }
    return (
      <>
        <div style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 1000, borderBottom: '1px solid #eee', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600 }}>Web CMS</span>
          <Button variant="outlined" size="small" onClick={handleLogout}>Logout</Button>
        </div>
        <Outlet />
      </>
    );
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

  return (
    <>
      <div style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 1000, borderBottom: '1px solid #eee', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 600 }}>Web CMS</span>
        <Button variant="outlined" size="small" onClick={handleLogout}>Logout</Button>
      </div>
      <Outlet />
    </>
  );
}
