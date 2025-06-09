import { 
  RouterProvider, 
  createBrowserRouter, 
} from 'react-router-dom';
import './index.css';
import { 
  MainLayout,
} from '@/layouts';
import { AuthLayout } from '@/layouts/AuthLayout';
import {
  LoginPage,
} from './pages';
import { CurrentUserProvider } from '@/providers';
import { MainNavLinks } from './utils/urls';

// Create the router
const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: MainNavLinks.map(url => ({
      path: url.path(),
      element: <url.component />,
    })),
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
