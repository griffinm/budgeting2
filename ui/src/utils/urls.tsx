import { lazy } from 'react';

type MenuSection = 'main' | 'none';

const TITLE_SUFFIX = ' | Budgeting';

const DashboardPage = lazy(() => import('@/pages/DashboardPage/DashboardPage'));
const TransactionsPage = lazy(() => import('@/pages/TransactionsPage/TransactionsPage'));
const MerchantsPage = lazy(() => import('@/pages/MerchantsPage/MerchantsPage'));
const MerchantPage = lazy(() => import('@/pages/MerchantPage/MerchantPage'));
const MerchantTagsPage = lazy(() => import('@/pages/MerchantTagsPage/MerchantTagsPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage/LoginPage'));

interface Url {
  path: (...args: any[]) => string;
  label?: string;
  title: (...args: any[]) => string;
  component: React.ComponentType;
  section?: MenuSection;
}

export const urls: Record<string, Url> = {
  dashboard: {
    path: () =>'/',
    label: 'Dashboard',
    title: () => 'Dashboard' + TITLE_SUFFIX,
    component: DashboardPage,
    section: 'main',
  },
  transactions: {
    path: () =>'/transactions',
    label: 'Transactions',
    title: () => 'Transactions' + TITLE_SUFFIX,
    component: TransactionsPage,
    section: 'main',
  },
  login: {
    path: () =>'/auth/login',
    label: 'Login',
    title: () => 'Login' + TITLE_SUFFIX,
    component: LoginPage,
    section: 'none',
  },
  merchants: {
    path: () =>'/merchants',
    label: 'Merchants',
    title: () => 'Merchants' + TITLE_SUFFIX,
    component: MerchantsPage,
    section: 'main',
  },
  merchant: {
    path: (id: number) => `/merchants/${id}`,
    title: () => 'Merchant' + TITLE_SUFFIX,
    component: MerchantPage,
    section: 'none',
  },
  merchantTags: {
    path: () =>'/categories',
    label: 'Categories',
    title: (name: string) => `${name} | Categories` + TITLE_SUFFIX,
    component: MerchantTagsPage,
    section: 'main',
  },
}

export const MainNavLinks = Object.values(urls).filter(url => url.section === 'main');
