import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@mantine/core/styles.css'
import './index.css'
import { AppRoutes } from './routes.tsx'
import { MantineProvider } from '@mantine/core'

createRoot(document.getElementById('root')!).render(
  <MantineProvider>
    <StrictMode>
      <AppRoutes />
    </StrictMode>
  </MantineProvider>
)
