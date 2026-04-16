import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { IncidentDetailPage } from './pages/IncidentDetailPage';
import { IncidentFormPage } from './pages/IncidentFormPage';
import { LoginPage } from './pages/LoginPage';
import { useAuthStore } from './store/authStore';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/',
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      { path: '/', element: <HomePage /> },
      { path: 'incident/:id', element: <IncidentDetailPage /> },
      { path: 'create', element: <IncidentFormPage /> },
      { path: 'edit/:id', element: <IncidentFormPage /> },
    ]
  }
]);