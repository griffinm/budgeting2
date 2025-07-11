import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import './index.css'
import { AppRoutes } from './routes.tsx'
import { MantineProvider } from '@mantine/core'
import { NotificationProvider } from '@/providers'
import { appTheme } from '@/theme'

createRoot(document.getElementById('root')!).render(
  <MantineProvider theme={appTheme}>
    <NotificationProvider>
      <StrictMode>
        <AppRoutes />
      </StrictMode>
    </NotificationProvider>
  </MantineProvider>
)
