/**
 * Application Routes
 * 
 * Defines all routes with protection
 */

import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '../auth'
import { LoginPage } from '../pages/Login/LoginPage'
import { TemplatesListPage } from '../pages/Templates/TemplatesListPage'
import { TemplateDetailPage } from '../pages/Templates/TemplateDetailPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/templates" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/templates',
    element: (
      <ProtectedRoute>
        <TemplatesListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/templates/:slug',
    element: (
      <ProtectedRoute>
        <TemplateDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/templates" replace />,
  },
])

