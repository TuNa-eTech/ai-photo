/**
 * Application Routes
 * 
 * Defines all routes with protection and new layout
 */

import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '../auth'
import { AppLayout } from '../components/layout/AppLayout'
import { LoginPage } from '../pages/Login/LoginPage'
import { DashboardPage } from '../pages/Dashboard/DashboardPage'
import { TemplatesListPage } from '../pages/Templates/TemplatesListPage'
import { TemplateDetailPage } from '../pages/Templates/TemplateDetailPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'templates',
        element: <TemplatesListPage />,
      },
      {
        path: 'templates/:slug',
        element: <TemplateDetailPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])

