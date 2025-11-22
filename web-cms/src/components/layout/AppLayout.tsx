/**
 * App Layout Component
 * 
 * Main layout with AppBar and content area
 */

import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Button,
  Stack,
  alpha,
  Chip,
} from '@mui/material'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import LogoutIcon from '@mui/icons-material/Logout'
import DashboardIcon from '@mui/icons-material/Dashboard'
import StyleIcon from '@mui/icons-material/Style'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import HistoryIcon from '@mui/icons-material/History'
import { useAuth } from '../../auth'

export function AppLayout(): React.ReactElement {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = (): void => {
    setAnchorEl(null)
  }

  const handleLogout = (): void => {
    handleMenuClose()
    logout()
  }

  const isActive = (path: string): boolean => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          color: 'text.primary',
        }}
      >
        <Toolbar>
          {/* Logo */}
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: 'primary.main',
              }}
            >
              AI
            </Avatar>
            <Typography variant="h6" fontWeight={700} color="primary">
              AI Photo Admin
            </Typography>
            <Chip label="Beta" size="small" color="secondary" sx={{ ml: 1, height: 20 }} />
          </Box>

          {/* Navigation */}
          <Stack direction="row" spacing={1} sx={{ ml: 4 }}>
            <Button
              startIcon={<DashboardIcon />}
              onClick={() => navigate('/')}
              sx={{
                color: isActive('/') && !isActive('/templates') && !isActive('/categories') ? 'primary.main' : 'text.secondary',
                fontWeight: isActive('/') && !isActive('/templates') && !isActive('/categories') ? 600 : 400,
                bgcolor: isActive('/') && !isActive('/templates') && !isActive('/categories') ? alpha('#3f51b5', 0.08) : 'transparent',
                '&:hover': {
                  bgcolor: alpha('#3f51b5', 0.12),
                },
              }}
            >
              Dashboard
            </Button>
            <Button
              startIcon={<StyleIcon />} // Reusing StyleIcon for now, or import CategoryIcon
              onClick={() => navigate('/categories')}
              sx={{
                color: isActive('/categories') ? 'primary.main' : 'text.secondary',
                fontWeight: isActive('/categories') ? 600 : 400,
                bgcolor: isActive('/categories') ? alpha('#3f51b5', 0.08) : 'transparent',
                '&:hover': {
                  bgcolor: alpha('#3f51b5', 0.12),
                },
              }}
            >
              Categories
            </Button>
            <Button
              startIcon={<StyleIcon />}
              onClick={() => navigate('/templates')}
              sx={{
                color: isActive('/templates') ? 'primary.main' : 'text.secondary',
                fontWeight: isActive('/templates') ? 600 : 400,
                bgcolor: isActive('/templates') ? alpha('#3f51b5', 0.08) : 'transparent',
                '&:hover': {
                  bgcolor: alpha('#3f51b5', 0.12),
                },
              }}
            >
              Templates
            </Button>
            <Button
              startIcon={<ShoppingCartIcon />}
              onClick={() => navigate('/iap-products')}
              sx={{
                color: isActive('/iap-products') ? 'primary.main' : 'text.secondary',
                fontWeight: isActive('/iap-products') ? 600 : 400,
                bgcolor: isActive('/iap-products') ? alpha('#3f51b5', 0.08) : 'transparent',
                '&:hover': {
                  bgcolor: alpha('#3f51b5', 0.12),
                },
              }}
            >
              IAP Products
            </Button>
            <Button
              startIcon={<HistoryIcon />}
              onClick={() => navigate('/transactions')}
              sx={{
                color: isActive('/transactions') ? 'primary.main' : 'text.secondary',
                fontWeight: isActive('/transactions') ? 600 : 400,
                bgcolor: isActive('/transactions') ? alpha('#3f51b5', 0.08) : 'transparent',
                '&:hover': {
                  bgcolor: alpha('#3f51b5', 0.12),
                },
              }}
            >
              Transactions
            </Button>
          </Stack>

          <Box sx={{ flexGrow: 1 }} />

          {/* User Menu */}
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
            <IconButton onClick={handleMenuOpen} size="small">
              <Avatar sx={{ width: 32, height: 32 }}>
                {user?.email?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            sx={{ mt: 1 }}
          >
            <MenuItem disabled>
              <AccountCircleIcon fontSize="small" sx={{ mr: 1 }} />
              {user?.email}
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}
