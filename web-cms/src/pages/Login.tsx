import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import { useAuth } from '../auth/useAuth';
import { isDevAuth, devLogin, setDevToken } from '../auth/devAuth';

export default function Login() {
  const { signIn, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as any;

  // Dev auth state
  const [email, setEmail] = React.useState('admin@example.com');
  const [password, setPassword] = React.useState('admin123');
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const redirectTo = location?.state?.from?.pathname ?? '/';

  async function handleGoogleLogin() {
    await signIn();
    navigate(redirectTo, { replace: true });
  }

  async function handleDevLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const baseURL = String(import.meta.env.VITE_API_BASE_URL || '').trim();
      const resp = await devLogin(baseURL, email.trim(), password.trim());
      setDevToken(resp.token);
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setPending(false);
    }
  }

  React.useEffect(() => {
    if (!isDevAuth && !loading && user) {
      navigate(redirectTo, { replace: true });
    }
  }, [loading, user, navigate, redirectTo]);

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
      }}
    >
      <Stack spacing={3} alignItems="center" sx={{ width: 360, maxWidth: '100%' }}>
        <Typography variant="h4" component="h1">
          CMS Sign In
        </Typography>

        {isDevAuth ? (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              Development login for CMS with default email/password from Docker env.
            </Typography>
            {error ? <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert> : null}
            <Stack component="form" spacing={2} sx={{ width: '100%' }} onSubmit={handleDevLogin}>
              <TextField
                label="Email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <Button variant="contained" type="submit" disabled={pending}>
                {pending ? 'Signing in…' : 'Sign in'}
              </Button>
            </Stack>
          </>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 420 }}>
              Sign in with your Google account to access the CMS dashboard.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {loading ? 'Please wait…' : 'Sign in with Google'}
            </Button>
          </>
        )}
      </Stack>
    </Box>
  );
}
