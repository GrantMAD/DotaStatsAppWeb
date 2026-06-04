'use client'

import { outfit } from "./fonts"
import "@/app/globals.css"
import { ErrorCard } from "@/components/ui/ErrorCard"

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} antialiased bg-[#0b0b14]`}>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <ErrorCard
            title="Critical System Error"
            message="A critical error occurred that crashed the entire application. Please try refreshing or come back later."
            onRetry={() => reset()}
          />
        </div>
      </body>
    </html>
  )
}
