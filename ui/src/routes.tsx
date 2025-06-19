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

// Lazy load all pages
const LoginPage = lazy(() => import('./pages/LoginPage/LoginPage'));
const MainLayout = lazy(() => import('./layouts/MainLayout/MainLayout'));
const AuthLayout = lazy(() => import('./layouts/AuthLayout/AuthLayout'));

const WithSuspense = (component: React.ReactNode) => (
  <Suspense fallback={<Loading />}>
    {component}
  </Suspense>
);

const mainNavLinks = MainNavLinks.map(url => ({
  path: url.path(),
  element: WithSuspense(<url.component />),
}));

const otherRoutes = [
  {
    path: '/merchants/:id',
    element: WithSuspense(<MerchantPage />),
  },
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
