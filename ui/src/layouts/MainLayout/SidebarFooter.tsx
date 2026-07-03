import {
  Avatar,
  Menu,
  UnstyledButton,
} from '@mantine/core';
import {
  IconChevronRight,
  IconLogout,
  IconSettings,
} from '@tabler/icons-react';
import { User } from '@/utils/types';
import { urls } from '@/utils/urls';
import { NavItem } from './NavItem';
import classes from './MainLayout.module.css';

interface SidebarFooterProps {
  user: User | null;
  collapsed: boolean;
  settingsActive: boolean;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

function initialsFor(user: User | null): string {
  if (!user) return '?';
  const first = user.firstName?.[0] ?? '';
  const last = user.lastName?.[0] ?? '';
  return (first + last).toUpperCase() || user.email?.[0]?.toUpperCase() || '?';
}

export function SidebarFooter({
  user,
  collapsed,
  settingsActive,
  onNavigate,
  onLogout,
}: SidebarFooterProps) {
  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Account';

  return (
    <div className={classes.footer}>
      <NavItem
        icon={IconSettings}
        label="Settings"
        active={settingsActive}
        collapsed={collapsed}
        onClick={() => onNavigate(urls.profile.path())}
      />

      <Menu
        position={collapsed ? 'right-end' : 'top'}
        offset={collapsed ? 12 : 8}
        width={collapsed ? 220 : 'target'}
        withArrow={collapsed}
        shadow="md"
        radius="md"
      >
        <Menu.Target>
          <UnstyledButton className={classes.userCard} aria-label="Account menu">
            <Avatar radius="xl" size={collapsed ? 32 : 36} color="primary" variant="filled">
              {initialsFor(user)}
            </Avatar>
            <div className={classes.userInfo}>
              <span className={classes.userName}>{fullName}</span>
              <span className={classes.userEmail}>{user?.email}</span>
            </div>
            <IconChevronRight size={16} stroke={1.8} className={classes.userChevron} />
          </UnstyledButton>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>
            <div style={{ fontWeight: 600, color: 'var(--mantine-color-text)' }}>{fullName}</div>
            <div style={{ fontSize: '0.72rem' }}>{user?.email}</div>
          </Menu.Label>
          <Menu.Item
            leftSection={<IconSettings size={16} stroke={1.8} />}
            onClick={() => onNavigate(urls.profile.path())}
          >
            Settings
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item
            color="red"
            leftSection={<IconLogout size={16} stroke={1.8} />}
            onClick={onLogout}
          >
            Log out
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </div>
  );
}
