/**
 * Login Page
 * 
 * Provides authentication via Firebase Google Sign-In or DevAuth
 */

import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material'
import GoogleIcon from '@mui/icons-material/Google'
import { useAuth } from '../../auth'
import { isDevAuthEnabled } from '../../auth/devAuth'

export function LoginPage(): React.ReactElement {
  const { user, login, loading: authLoading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const devAuth = isDevAuthEnabled()
  const from = (location.state as { from?: Location })?.from?.pathname || '/templates'

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate(from, { replace: true })
    }
  }, [user, authLoading, navigate, from])

  const handleLogin = async (): Promise<void> => {
    try {
      setError(null)
      setIsLoading(true)
      await login()
      // Navigation will happen via useEffect when user state updates
    } catch (err) {
      const error = err as Error
      setError(error.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        py={4}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Box textAlign="center" mb={4}>
            <Typography variant="h4" component="h1" gutterBottom>
              AI Image Stylist
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Admin CMS
            </Typography>
          </Box>

          {devAuth && (
            <Alert severity="info" sx={{ mb: 3 }}>
              DevAuth Mode: Local development authentication enabled
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={devAuth ? null : <GoogleIcon />}
            onClick={handleLogin}
            disabled={isLoading}
            sx={{ py: 1.5 }}
          >
            {isLoading ? (
              <CircularProgress size={24} />
            ) : devAuth ? (
              'Sign in (DevAuth)'
            ) : (
              'Sign in with Google'
            )}
          </Button>

          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mt: 3 }}
          >
            Admin access only. Please use your authorized account.
          </Typography>
        </Paper>
      </Box>
    </Container>
  )
}

