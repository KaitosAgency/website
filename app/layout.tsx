import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Outfit } from "next/font/google";
import "./globals.css";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper";
import { I18nProvider } from "@/lib/i18n";
import { Toaster } from "@/components/ui/sonner";
import { SoundCloudProvider } from "@/lib/contexts/soundcloud-context";
import { AuthProvider } from "@/lib/contexts/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Kaitos Agency  - L'Agence IA numéro 1 en France",
  description: "Kaitos - L'Agence IA numéro 1 en France. Nous aidons les entreprises à intégrer l'intelligence artificielle comme un axe de transformation stratégique, avec méthode, suivi et vision long terme.",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/fonts/Aileron/Aileron-Regular.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Aileron/Aileron-Bold.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Aileron/Aileron-Black.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />

        {/* AFFILIATION */}
        <meta name='impact-site-verification' content='ee81c0a9-02d6-41d8-b0f6-7f2b1b3e50de' />

      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} font-sans !p-0`}>
        <Toaster>
          <I18nProvider>
            <AuthProvider>
              <SoundCloudProvider>
                <DashboardWrapper>
                  {children}
                </DashboardWrapper>
              </SoundCloudProvider>
            </AuthProvider>
          </I18nProvider>
        </Toaster>
      </body>
    </html>
  );
}
