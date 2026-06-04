'use client'

import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

import { SidebarProvider } from '@/context/SidebarContext'
import { ThemeProvider, useTheme } from '@/context/ThemeContext'
import { ModalProvider } from '@/context/ModalContext'
import { PresenceProvider } from '@/context/PresenceContext'
import { Toaster, toast } from 'sonner'

function ToasterWithTheme() {
  const { resolvedTheme } = useTheme();
  return <Toaster position="top-right" richColors theme={resolvedTheme} />;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error: Error) => {
            toast.error(error.message || 'An error occurred while fetching data');
          },
        }),
        mutationCache: new MutationCache({
          onError: (error: Error) => {
            toast.error(error.message || 'An error occurred while performing this action');
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
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
