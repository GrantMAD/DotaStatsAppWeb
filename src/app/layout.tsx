import type { Metadata } from "next";
import { outfit } from "./fonts";
import "./globals.css";
import Providers from "@/components/Providers";
import { SupabaseAuthProvider } from "@/context/SupabaseAuthContext";
import { SteamAuthProvider } from "@/context/SteamAuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Toaster } from "sonner";
import { GlobalModalContainer } from "@/components/ui/GlobalModalContainer";

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
      <body className={`${outfit.variable} antialiased`}>
        <SupabaseAuthProvider>
          <SteamAuthProvider>
            <Providers>
              <AppLayout>
                {children}
              </AppLayout>
              <GlobalModalContainer />
            </Providers>
          </SteamAuthProvider>
        </SupabaseAuthProvider>
      </body>
    </html>
  );
}
