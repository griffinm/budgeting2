import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppRoutes } from './routes.tsx'
import { MantineProvider } from '@mantine/core'
import { NotificationProvider } from '@/providers'
import { theme } from '@/theme'

import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/charts/styles.css';
import './index.css' // Load this one last

function getColorSchemeFromCookie(): 'light' | 'dark' | 'auto' {
  const match = document.cookie.match(/mantine-color-scheme=(\w+)/);
  if (match && ['light', 'dark', 'auto'].includes(match[1])) {
    return match[1] as 'light' | 'dark' | 'auto';
  }
  return 'auto';
}

createRoot(document.getElementById('root')!).render(
  <MantineProvider theme={theme} defaultColorScheme={getColorSchemeFromCookie()}>
    <NotificationProvider>
      <StrictMode>
        <AppRoutes />
      </StrictMode>
    </NotificationProvider>
  </MantineProvider>
)
