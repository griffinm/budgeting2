import '@mantine/core/styles.css';
import { 
  Outlet, 
  RouterProvider, 
  createBrowserRouter, 
  Link, 
  useNavigate, 
  useLocation, 
  createRoutesFromElements, 
  Route 
} from 'react-router-dom';
import { 
  AppShell, 
  Burger, 
  MantineProvider,
  NavLink,
} from '@mantine/core';
import './index.css'
import { useDisclosure } from '@mantine/hooks';

// Home Page Component
function HomePage() {
  return <div>Hello There</div>;
}

// About Page Component
function AboutPage() {
  return <div>About Page</div>;
}

// Dashboard Page Component
function DashboardPage() {
  return <div>Dashboard Page</div>;
}

// Layout component that includes the AppShell
function Layout() {
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
        {/* Option 1: Using onClick handler with useNavigate */}
        <NavLink
          label="Home"
          onClick={() => navigate('/')}
          active={location.pathname === '/'}
        />
        
        {/* Option 2: Using component prop with React Router's Link */}
        <NavLink
          label="About"
          component={Link}
          to="/about"
          active={location.pathname === '/about'}
        />
        
        {/* Option 3: Wrapping with Link */}
        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
          <NavLink
            label="Dashboard"
            active={location.pathname === '/dashboard'}
          />
        </Link>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}

// Create the router using JSX syntax
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<HomePage />} />
      <Route path="about" element={<AboutPage />} />
      <Route path="dashboard" element={<DashboardPage />} />
    </Route>
  )
);

function App() {
  return (
    <MantineProvider>
      <RouterProvider router={router} />
    </MantineProvider>
  )
}

export default App
