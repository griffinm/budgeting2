import { 
  Outlet, 
  useNavigate, 
  useLocation, 
} from 'react-router-dom';
import { 
  AppShell, 
  Burger, 
  Button, 
  NavLink,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { MainNavLinks, urls } from '@/utils/urls';
import { useContext } from 'react';
import { CurrentUserContext } from '@/providers/CurrentUser/CurrentUserContext';

const isActive = (path: string, location: string) => {
  if (path === '/') {
    return location === path;
  }
  return location.startsWith(path);
}

export default function MainLayout() {
  const [opened, { toggle }] = useDisclosure();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, deleteToken } = useContext(CurrentUserContext);

  const handleLogout = () => {
    deleteToken();
    navigate(urls.login.path());
  }

  const handleNavigation = (path: string) => {
    navigate(path);
    // Close mobile menu after navigation
    if (opened) {
      toggle();
    }
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 200, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <div className="visible md:hidden flex flex-row justify-between items-center w-full px-5 h-full">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        </div>
        <div className="flex-row justify-between items-center w-full hidden sm:flex align-middle h-full px-5">
          <div className="text-2xl font-bold">
            Budgeting
          </div>
          <div>
            {user?.email}
            <Button variant="subtle" size="xs" color="red" onClick={handleLogout}>Logout</Button>
          </div>
        </div>
        
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {MainNavLinks.map((link) => (
          <NavLink
            key={link.path()}
            label={link.label}
            onClick={() => handleNavigation(link.path())}
            active={isActive(link.path(), location.pathname)}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main style={{ maxWidth: '1400px' }}>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}

