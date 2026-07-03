import { useContext, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ActionIcon, AppShell, Burger, Group, Text, Tooltip } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import {
  IconDashboard,
  IconReceipt,
  IconBuildingStore,
  IconTag,
  IconUser,
  IconCreditCard,
  IconBookmarks,
  IconReportAnalytics,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
} from '@tabler/icons-react';
import type { Icon as TablerIcon } from '@tabler/icons-react';
import { format } from 'date-fns';
import classNames from 'classnames';
import { MainNavLinks, urls } from '@/utils/urls';
import { CurrentUserContext } from '@/providers/CurrentUser/CurrentUserContext';
import { NavItem } from './NavItem';
import { SidebarFooter } from './SidebarFooter';
import classes from './MainLayout.module.css';
import appIcon from './../../../public/android-chrome-512x512.png';

const COLLAPSE_KEY = 'budgeting:sidebar-collapsed';

const NAV_ICONS: Record<string, TablerIcon> = {
  Dashboard: IconDashboard,
  Transactions: IconReceipt,
  Merchants: IconBuildingStore,
  Categories: IconTag,
  Tags: IconBookmarks,
  Profile: IconUser,
  Accounts: IconCreditCard,
  Reports: IconReportAnalytics,
};

const isActive = (path: string, location: string) =>
  path === '/' ? location === path : location.startsWith(path);

const primaryLinks = MainNavLinks.filter((link) => link.path() !== urls.profile.path());

function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/transactions/')) return 'Transaction';
  if (pathname.startsWith('/merchants/')) return 'Merchant';
  if (pathname.startsWith('/categories/') && pathname !== urls.merchantCategories.path()) return 'Category';
  if (isActive(urls.profile.path(), pathname)) return 'Settings';
  const match = primaryLinks.find((link) => isActive(link.path(), pathname));
  return match?.label ?? 'BearBudget';
}

export default function MainLayout() {
  const [opened, { toggle, close }] = useDisclosure();
  const [collapsed, setCollapsed] = useState<boolean>(
    () => localStorage.getItem(COLLAPSE_KEY) === 'true',
  );
  const isDesktop = useMediaQuery('(min-width: 48em)', true);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, deleteToken } = useContext(CurrentUserContext);

  const railCollapsed = collapsed && !!isDesktop;

  const toggleCollapsed = () =>
    setCollapsed((prev) => {
      localStorage.setItem(COLLAPSE_KEY, String(!prev));
      return !prev;
    });

  const handleLogout = () => {
    deleteToken();
    navigate(urls.login.path());
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (opened) close();
  };

  const pageTitle = getPageTitle(location.pathname);
  const today = format(new Date(), 'EEEE, MMMM d');

  return (
    <AppShell
      layout="alt"
      header={{ height: 60 }}
      navbar={{
        width: { base: 264, sm: collapsed ? 76 : 248 },
        breakpoint: 'sm',
        collapsed: { mobile: !opened, desktop: false },
      }}
      padding="md"
    >
      <AppShell.Header withBorder={false} className={classes.header}>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Tooltip label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} position="right" withArrow>
              <ActionIcon
                visibleFrom="sm"
                variant="subtle"
                color="gray"
                size="lg"
                onClick={toggleCollapsed}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {collapsed
                  ? <IconLayoutSidebarLeftExpand size={22} stroke={1.7} />
                  : <IconLayoutSidebarLeftCollapse size={22} stroke={1.7} />}
              </ActionIcon>
            </Tooltip>

            <Group gap={9} wrap="nowrap" hiddenFrom="sm">
              <img src={appIcon} alt="BearBudget" className={classes.brandMark} style={{ width: 30, height: 30 }} />
              <span className={classes.brandText} style={{ fontSize: '1.05rem' }}>
                Bear<span className={classes.brandAccent}>Budget</span>
              </span>
            </Group>

            <Text visibleFrom="sm" fw={600} fz="lg" style={{ letterSpacing: '-0.01em' }}>
              {pageTitle}
            </Text>
          </Group>

          <Text visibleFrom="xs" c="dimmed" fz="sm" fw={500} style={{ whiteSpace: 'nowrap' }}>
            {today}
          </Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar
        withBorder={false}
        className={classNames(classes.navbar, railCollapsed && classes.collapsed)}
      >
        <div
          className={classes.brand}
          role="button"
          tabIndex={0}
          onClick={() => handleNavigation(urls.dashboard.path())}
          onKeyDown={(e) => e.key === 'Enter' && handleNavigation(urls.dashboard.path())}
        >
          <img src={appIcon} alt="BearBudget" className={classes.brandMark} />
          <span className={classes.brandText}>
            Bear<span className={classes.brandAccent}>Budget</span>
          </span>
        </div>

        <div className={classes.navList}>
          <div className={classes.sectionLabel}>Menu</div>
          {primaryLinks.map((link) => (
            <NavItem
              key={link.path()}
              icon={NAV_ICONS[link.label ?? ''] ?? IconDashboard}
              label={link.label ?? ''}
              active={isActive(link.path(), location.pathname)}
              collapsed={railCollapsed}
              onClick={() => handleNavigation(link.path())}
            />
          ))}
        </div>

        <SidebarFooter
          user={user}
          collapsed={railCollapsed}
          settingsActive={isActive(urls.profile.path(), location.pathname)}
          onNavigate={handleNavigation}
          onLogout={handleLogout}
        />
      </AppShell.Navbar>

      <AppShell.Main style={{ maxWidth: '1400px' }} className="main-content">
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
