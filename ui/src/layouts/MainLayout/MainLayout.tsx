
import { 
  Outlet, 
  useNavigate, 
  useLocation, 
} from 'react-router-dom';
import { 
  AppShell, 
  Burger, 
  NavLink,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { MainNavLinks } from '@/utils/urls';

export function MainLayout() {
  const [opened, { toggle }] = useDisclosure();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      aside={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {MainNavLinks.map((link) => (
          <NavLink
            key={link.path()}
            label={link.label}
            onClick={() => navigate(link.path())}
            active={location.pathname === link.path()}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
