import { 
  DashboardPage, 
  LoginPage, 
  MerchantsPage, 
  TransactionsPage,
} from "@/pages";
import { MerchantTagsPage } from "@/pages/MerchantTagsPage/MerchantTagsPage";

type MenuSection = 'main' | 'none';

const TITLE_SUFFIX = ' | Budgeting';

interface Url {
  path: (...args: any[]) => string;
  label?: string;
  section?: MenuSection;
  title: (...args: any[]) => string;
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
  merchant: {
    path: (id: number) => `/merchants/${id}`,
    section: 'none',
    title: () => 'Merchant' + TITLE_SUFFIX,
    component: () => <div>Merchant</div>,
  },
  merchantTags: {
    path: () =>'/categories',
    label: 'Categories',
    section: 'main',
    title: (name: string) => `${name} | Categories` + TITLE_SUFFIX,
    component: MerchantTagsPage,
  },
}

export const MainNavLinks = Object.values(urls).filter(url => url.section === 'main');
