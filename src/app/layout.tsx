import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { SupabaseAuthProvider } from "@/context/SupabaseAuthContext";
import { SteamAuthProvider } from "@/context/SteamAuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Toaster } from "sonner";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "DotaApp | Pro Stats & Analytics",
  description: "Advanced Dota 2 statistics and professional match analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} antialiased font-sans`}>
        <SupabaseAuthProvider>
          <SteamAuthProvider>
            <Providers>
              <AppLayout>
                {children}
              </AppLayout>
              <Toaster position="top-right" richColors theme="dark" />
            </Providers>
          </SteamAuthProvider>
        </SupabaseAuthProvider>
      </body>
    </html>
  );
}
