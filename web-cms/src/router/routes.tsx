import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../auth/ProtectedRoute';
import Login from '../pages/Login';
import TemplatesList from '../pages/Templates/TemplatesList';
import TemplateDetail from '../pages/Templates/TemplateDetail';
import AdminTemplates from '../pages/Admin/AdminTemplates';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AdminTemplates />,
      },
      {
        path: '/templates',
        element: <TemplatesList />,
      },
      {
        path: '/admin/templates',
        element: <AdminTemplates />,
      },
      {
        path: '/templates/:id',
        element: <TemplateDetail />,
      },
    ],
  },
]);

export default router;
