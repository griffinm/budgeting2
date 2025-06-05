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
    <RouterProvider router={router} />
  )
}
