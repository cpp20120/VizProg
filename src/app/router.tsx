import { Navigate, createBrowserRouter } from 'react-router-dom';
import { LoginPage } from '@features/auth/LoginPage';
import { ProtectedRoute } from '@features/auth/ProtectedRoute';
import { RegisterPage } from '@features/auth/RegisterPage';
import { DashboardPage } from '@features/documents/DashboardPage';
import { SpreadsheetPage } from '@features/spreadsheet/SpreadsheetPage';
import { ProfilePage } from '@features/profile/ProfilePage';
import { AppLayout } from '@features/ui/AppLayout';
import { NotFoundPage } from '@features/ui/NotFoundPage';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/documents/:documentId', element: <SpreadsheetPage /> },
          { path: '/profile', element: <ProfilePage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
