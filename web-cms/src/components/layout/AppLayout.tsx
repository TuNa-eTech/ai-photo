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
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import LogoutIcon from '@mui/icons-material/Logout'
import DashboardIcon from '@mui/icons-material/Dashboard'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import HistoryIcon from '@mui/icons-material/History'
import PeopleIcon from '@mui/icons-material/People'
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary'
import CategoryIcon from '@mui/icons-material/Category'
import MenuIcon from '@mui/icons-material/Menu'

const mockData = [
  { label: 'Dashboard', icon: DashboardIcon, link: '/' },
  { label: 'Users', icon: PeopleIcon, link: '/users' },
  { label: 'Templates', icon: PhotoLibraryIcon, link: '/templates' },
  { label: 'Categories', icon: CategoryIcon, link: '/categories' },
  { label: 'IAP Products', icon: ShoppingCartIcon, link: '/iap-products' },
  { label: 'Transactions', icon: HistoryIcon, link: '/transactions' },
];

import { useAuth } from '../../auth'

const DRAWER_WIDTH = 240;

export function AppLayout(): React.ReactElement {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

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

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Box sx={{ py: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>AI</Avatar>
        <Typography variant="h6" sx={{ my: 2 }}>
          AI Photo Admin
        </Typography>
      </Box>
      <Divider />
      <List>
        {mockData.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.link) && (item.link === '/' ? location.pathname === '/' : true);
          return (
            <ListItem key={item.link} disablePadding>
              <ListItemButton
                onClick={() => navigate(item.link)}
                selected={active}
                sx={{
                  '&.Mui-selected': {
                    bgcolor: alpha('#3f51b5', 0.08),
                    '&:hover': {
                      bgcolor: alpha('#3f51b5', 0.12),
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ color: active ? 'primary.main' : 'inherit' }}>
                  <Icon />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: active ? 600 : 400,
                    color: active ? 'primary.main' : 'inherit',
                  }}
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
    </Box>
  )

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
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo - Desktop */}
          <Box
            display={{ xs: 'none', md: 'flex' }}
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

          {/* Logo - Mobile (Center) */}
          <Box
            display={{ xs: 'flex', md: 'none' }}
            alignItems="center"
            gap={1}
            sx={{ flexGrow: 1 }}
          >
            <Typography variant="h6" fontWeight={700} color="primary">
              AI Photo Admin
            </Typography>
          </Box>

          {/* Navigation - Desktop */}
          <Stack direction="row" spacing={1} sx={{ ml: 4, display: { xs: 'none', md: 'flex' } }}>
            {mockData.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.link) && (item.link === '/' ? location.pathname === '/' : true);

              return (
                <Button
                  key={item.link}
                  startIcon={<Icon />}
                  onClick={() => navigate(item.link)}
                  sx={{
                    color: active ? 'primary.main' : 'text.secondary',
                    fontWeight: active ? 600 : 400,
                    bgcolor: active ? alpha('#3f51b5', 0.08) : 'transparent',
                    '&:hover': {
                      bgcolor: alpha('#3f51b5', 0.12),
                    },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Stack>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'block' } }} />

          {/* User Menu */}
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
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

      {/* Mobile Drawer */}
      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

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
