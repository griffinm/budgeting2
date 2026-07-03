import { Tooltip, UnstyledButton } from '@mantine/core';
import type { Icon as TablerIcon } from '@tabler/icons-react';
import classNames from 'classnames';
import classes from './MainLayout.module.css';

interface NavItemProps {
  icon: TablerIcon;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  onClick: () => void;
}

export function NavItem({ icon: Icon, label, active, collapsed, onClick }: NavItemProps) {
  const button = (
    <UnstyledButton
      className={classNames(classes.navItem)}
      data-active={active || undefined}
      onClick={onClick}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
    >
      <Icon size={20} stroke={1.8} className={classes.navIcon} />
      <span className={classes.navLabel}>{label}</span>
    </UnstyledButton>
  );

  if (collapsed) {
    return (
      <Tooltip label={label} position="right" withArrow offset={12} openDelay={0}>
        {button}
      </Tooltip>
    );
  }

  return button;
}
