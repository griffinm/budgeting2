import { 
  RouterProvider, 
  createBrowserRouter, 
} from 'react-router-dom';
import { lazy, Suspense } from 'react';
import './index.css';
import { CurrentUserProvider } from '@/providers';
import { MainNavLinks } from './utils/urls';
import { Loading } from '@/components/Loading';

// Lazy load all pages
const LoginPage = lazy(() => import('./pages/LoginPage/LoginPage'));
const MainLayout = lazy(() => import('./layouts/MainLayout/MainLayout'));
const AuthLayout = lazy(() => import('./layouts/AuthLayout/AuthLayout'));

const WithSuspense = (component: React.ReactNode) => (
  <Suspense fallback={<Loading />}>
    {component}
  </Suspense>
);

// Create the router
const router = createBrowserRouter([
  {
    path: '/',
    element: WithSuspense(<MainLayout />),
    children: MainNavLinks.map(url => ({
      path: url.path(),
      element: WithSuspense(<url.component />),
    })),
  },
  {
    path: '/auth',
    element: WithSuspense(<AuthLayout />),
    children: [
      {
        path: 'login',
        element: WithSuspense(<LoginPage />),
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
