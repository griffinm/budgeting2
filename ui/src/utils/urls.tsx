import { 
  DashboardPage, 
  LoginPage, 
  MerchantsPage, 
  TransactionsPage,
} from "@/pages";
import { MerchantTagsPage } from "@/pages/MerchantTagsPage/MerchantTagsPage";

type MenuSection = 'main'

const TITLE_SUFFIX = ' | Budgeting';

interface Url {
  path: () => string;
  label?: string;
  section?: MenuSection;
  title: () => string;
  component: React.ComponentType;
}

export const urls: Record<string, Url> = {
  dashboard: {
    path: () =>'/',
    label: 'Dashboard',
    section: 'main',
    title: () => 'Dashboard' + TITLE_SUFFIX,
    component: DashboardPage,
  },
  transactions: {
    path: () =>'/transactions',
    label: 'Transactions',
    section: 'main',
    title: () => 'Transactions' + TITLE_SUFFIX,
    component: TransactionsPage,
  },
  login: {
    path: () =>'/auth/login',
    label: 'Login',
    title: () => 'Login' + TITLE_SUFFIX,
    component: LoginPage,
  },
  merchants: {
    path: () =>'/merchants',
    label: 'Merchants',
    section: 'main',
    title: () => 'Merchants' + TITLE_SUFFIX,
    component: MerchantsPage,
  },
  merchantTags: {
    path: () =>'/categories',
    label: 'Categories',
    section: 'main',
    title: () => 'Categories' + TITLE_SUFFIX,
    component: MerchantTagsPage,
  },
}

export const MainNavLinks = Object.values(urls).filter(url => url.section === 'main');
