import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import './index.css'
import { AppRoutes } from './routes.tsx'
import { 
  MantineProvider,
  createTheme,
  MantineColorsTuple,
} from '@mantine/core'
import { NotificationProvider } from '@/providers'

const appColors: MantineColorsTuple = [
  '#e6ffee',
  '#d3f9e0',
  '#a8f2c0',
  '#7aea9f',
  '#54e382',
  '#3bdf70',
  '#2bdd66',
  '#1bc455',
  '#0bae4a',
  '#00973c'
];

const theme = createTheme({
  colors: {
    myColor: appColors,
  }
});

createRoot(document.getElementById('root')!).render(
  <MantineProvider theme={theme}>
    <NotificationProvider>
      <StrictMode>
        <AppRoutes />
      </StrictMode>
    </NotificationProvider>
  </MantineProvider>
)
