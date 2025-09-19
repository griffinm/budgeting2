import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppRoutes } from './routes.tsx'
import { MantineProvider } from '@mantine/core'
import { NotificationProvider } from '@/providers'
import { appTheme } from '@/theme'

import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/charts/styles.css';
import './index.css' // Load this one last

createRoot(document.getElementById('root')!).render(
  <MantineProvider theme={appTheme}>
    <NotificationProvider>
      <StrictMode>
        <AppRoutes />
      </StrictMode>
    </NotificationProvider>
  </MantineProvider>
)
