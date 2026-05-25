'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

import { SidebarProvider } from '@/context/SidebarContext'
import { ThemeProvider, useTheme } from '@/context/ThemeContext'
import { ModalProvider } from '@/context/ModalContext'
import { PresenceProvider } from '@/context/PresenceContext'
import { Toaster } from 'sonner'

function ToasterWithTheme() {
  const { resolvedTheme } = useTheme();
  return <Toaster position="top-right" richColors theme={resolvedTheme} />;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ModalProvider>
        <SidebarProvider>
          <ThemeProvider>
            <PresenceProvider>
              {children}
              <ToasterWithTheme />
            </PresenceProvider>
          </ThemeProvider>
        </SidebarProvider>
      </ModalProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
