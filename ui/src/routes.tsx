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
import { TransactionsPage } from './pages/TransactionsPage/TransactionsPage';

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
      {
        path: 'transactions',
        element: <TransactionsPage />,
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
