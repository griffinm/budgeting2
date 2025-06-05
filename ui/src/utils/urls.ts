type MenuSection = 'main'

interface Url {
  path: () => string;
  label?: string;
  section?: MenuSection;
}

export const urls: Record<string, Url> = {
  dashboard: {
    path: () =>'/',
    label: 'Dashboard',
    section: 'main',
  },
  login: {
    path: () =>'/auth/login',
    label: 'Login',
  },
}

export const MainNavLinks = Object.values(urls).filter(url => url.section === 'main');
