/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */

import { lazy } from 'react';

type MenuSection = 'main' | 'none';

const TITLE_SUFFIX = ' | Budgeting';

const DashboardPage = lazy(() => import('@/pages/DashboardPage/DashboardPage'));
const TransactionsPage = lazy(() => import('@/pages/TransactionsPage/TransactionsPage'));
const MerchantsPage = lazy(() => import('@/pages/MerchantsPage/MerchantsPage'));
const MerchantPage = lazy(() => import('@/pages/MerchantPage/MerchantPage'));
const MerchantCategoriesPage = lazy(() => import('@/pages/MerchantCategoriesPage/MerchantCategoriesPage'));
const MerchantCategoryPage = lazy(() => import('@/pages/MerchantCategoryPage/MerchantCategoryPage'));
const TagsSpendPage = lazy(() => import('@/pages/TagsSpendPage/TagsSpendPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage/LoginPage'));
const SignupPage = lazy(() => import('@/pages/SignupPage/SignupPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage/ProfilePage'));
const PlaidAccountsPage = lazy(() => import('@/pages/AccountsPage/AccountPage'));

interface Url {
  path: (...args: any[]) => string;
  label?: string;
  title: (...args: any[]) => string;
  component: React.ComponentType;
  section?: MenuSection;
  routeString?: string;
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
  signup: {
    path: () =>'/auth/signup',
    label: 'Sign Up',
    title: () => 'Sign Up' + TITLE_SUFFIX,
    component: SignupPage,
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
    routeString: '/merchants/:id',
  },
  merchantCategories: {
    path: () =>'/categories',
    label: 'Categories',
    title: () => 'Categories' + TITLE_SUFFIX,
    component: MerchantCategoriesPage,
    section: 'main',
  },
  tags: {
    path: () => '/tags',
    label: 'Tags',
    title: () => 'Tags' + TITLE_SUFFIX,
    component: TagsSpendPage,
    section: 'main',
  },
  merchantCategory: {
    path: (id: number) => `/categories/${id}`,
    title: ({ categoryName }: { categoryName: string }) => `Category - ${categoryName}` + TITLE_SUFFIX,
    component: MerchantCategoryPage,
    section: 'none',
    routeString: '/categories/:id',
  },
  profile: {
    path: () =>'/profile',
    label: 'Profile',
    title: () => 'Profile' + TITLE_SUFFIX,
    component: ProfilePage,
    section: 'main',
  },
  accounts: {
    path: () =>'/accounts',
    label: 'Accounts',
    title: () => 'Accounts' + TITLE_SUFFIX,
    component: PlaidAccountsPage,
    section: 'main',
  },
}

export const MainNavLinks = Object.values(urls).filter(url => url.section === 'main');
