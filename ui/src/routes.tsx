import { 
  RouterProvider, 
  createBrowserRouter, 
} from 'react-router-dom';
import './index.css';
import { 
  MainLayout,
  AuthLayout,
} from './layouts';
import {
  DashboardPage,
  LoginPage,
} from './pages';
import { CurrentUserProvider } from '@/providers';

// Create the router
const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
    ],
  }
]);

export function AppRoutes() {
  return (
    <CurrentUserProvider>
      <RouterProvider router={router} />
    </CurrentUserProvider>
  )
}
