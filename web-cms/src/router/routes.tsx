import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../auth/ProtectedRoute';
import Login from '../pages/Login';
import TemplatesList from '../pages/Templates/TemplatesList';
import TemplateDetail from '../pages/Templates/TemplateDetail';
import AdminTemplatesList from '../pages/Admin/Templates/List';
import AdminTemplateCreate from '../pages/Admin/Templates/Create';
import AdminTemplateEdit from '../pages/Admin/Templates/Edit';

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
        element: <AdminTemplatesList />,
      },
      {
        path: '/templates',
        element: <TemplatesList />,
      },
      {
        path: '/admin/templates',
        element: <AdminTemplatesList />,
      },
      {
        path: '/admin/templates/new',
        element: <AdminTemplateCreate />,
      },
      {
        path: '/admin/templates/:slug',
        element: <AdminTemplateEdit />,
      },
      {
        path: '/templates/:id',
        element: <TemplateDetail />,
      },
    ],
  },
]);

export default router;
