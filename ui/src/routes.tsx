import { 
  RouterProvider, 
  createBrowserRouter, 
} from 'react-router-dom';
import { lazy, Suspense } from 'react';
import './index.css';
import { CurrentUserProvider } from '@/providers';
import { MainNavLinks } from './utils/urls';
import { Loading } from '@/components/Loading';
import MerchantPage from './pages/MerchantPage/MerchantPage';
import { Notifications } from '@mantine/notifications';

// Lazy load all pages
const LoginPage = lazy(() => import('./pages/LoginPage/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage/SignupPage'));
const MainLayout = lazy(() => import('./layouts/MainLayout/MainLayout'));
const AuthLayout = lazy(() => import('./layouts/AuthLayout/AuthLayout'));
const MerchantTagPage = lazy(() => import('./pages/MerchantTagPage/MerchantTagPage'));

const WithSuspense = (component: React.ReactNode) => (
  <Suspense fallback={<Loading />}>
    {component}
  </Suspense>
);

const mainNavLinks = MainNavLinks.map(url => ({
  path: url.path(),
  element: WithSuspense(<url.component />),
}));

// TODO: use the urls object instead of hardcoding the paths
const otherRoutes = [
  {
    path: '/merchants/:id',
    element: WithSuspense(<MerchantPage />),
  },
  {
    path: '/categories/:id',
    element: WithSuspense(<MerchantTagPage />),
  }
];

// Create the router
const router = createBrowserRouter([
  {
    path: '/',
    element: WithSuspense(<MainLayout />),
    children: [
      ...mainNavLinks,
      ...otherRoutes,
    ],
  },
  {
    path: '/auth',
    element: WithSuspense(<AuthLayout />),
    children: [
      {
        path: 'login',
        element: WithSuspense(<LoginPage />),
      },
      {
        path: 'signup',
        element: WithSuspense(<SignupPage />),
      },
    ],
  }
]);

export function AppRoutes() {
  return (
    <CurrentUserProvider>
      <Notifications />
      <RouterProvider router={router} />
    </CurrentUserProvider>
  )
}
