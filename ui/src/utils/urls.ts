type MenuSection = 'main'

const TITLE_SUFFIX = ' | Budgeting';

interface Url {
  path: () => string;
  label?: string;
  section?: MenuSection;
  title: () => string;
}

export const urls: Record<string, Url> = {
  dashboard: {
    path: () =>'/',
    label: 'Dashboard',
    section: 'main',
    title: () => 'Dashboard' + TITLE_SUFFIX,
  },
  login: {
    path: () =>'/auth/login',
    label: 'Login',
    title: () => 'Login' + TITLE_SUFFIX,
  },
}

export const MainNavLinks = Object.values(urls).filter(url => url.section === 'main');
