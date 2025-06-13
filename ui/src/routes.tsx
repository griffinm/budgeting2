import { 
  RouterProvider, 
  createBrowserRouter, 
} from 'react-router-dom';
import { lazy, Suspense } from 'react';
import './index.css';
import { CurrentUserProvider } from '@/providers';
import { MainNavLinks } from './utils/urls';

// Lazy load all pages
const LoginPage = lazy(() => import('./pages/LoginPage/LoginPage'));
const MainLayout = lazy(() => import('./layouts/MainLayout/MainLayout'));
const AuthLayout = lazy(() => import('./layouts/AuthLayout/AuthLayout'));

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600" />
  </div>
);

// Create the router
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<PageLoader />}>
        <MainLayout />
      </Suspense>
    ),
    children: MainNavLinks.map(url => ({
      path: url.path(),
      element: (
        <Suspense fallback={<PageLoader />}>
          <url.component />
        </Suspense>
      ),
    })),
  },
  {
    path: '/auth',
    element: (
      <Suspense fallback={<PageLoader />}>
        <AuthLayout />
      </Suspense>
    ),
    children: [
      {
        path: 'login',
        element: (
          <Suspense fallback={<PageLoader />}>
            <LoginPage />
          </Suspense>
        ),
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
