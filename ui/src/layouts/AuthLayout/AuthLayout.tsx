import { AppShell, Burger, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  const [opened, { toggle }] = useDisclosure();
  
  return (
    <AppShell
      header={{ height: 60 }}
      padding="md"
    >
      <AppShell.Header p="md">
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        <Title order={3} ml="md" style={{ display: 'inline-block' }}>Budgeting</Title>
      </AppShell.Header>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
