import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/components/auth/AuthProvider";
import { ToastProvider } from "@/app/providers/toast-provider";

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lumo",
  description: "Lumo",
  keywords: "twórcy podróżniczy, marketing turystyczny, treści UGC, współpraca z markami, platforma influencerów, promocja turystyki",
  authors: [{ name: "Lumo Team" }],
  creator: "Lumo",
  publisher: "Lumo",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://lumo-platform.vercel.app'),
  alternates: {
    canonical: "/",
    languages: {
      "pl": "/pl",
      "en": "/en",
    },
  },
  openGraph: {
    title: "Lumo",
    description: "Lumo",
    url: "/",
    siteName: "Lumo",
    images: [
      {
        url: "/images/og-image.jpg", 
        width: 1200,
        height: 630,
        alt: "Lumo - Platforma Twórców Podróżniczych",
      },
    ],
    locale: "pl_PL",
    alternateLocale: ["en_US"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumo",
    description: "Lumo",
    images: ["/images/twitter-image.jpg"],
    creator: "@lumo_platform",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className={`${inter.variable} ${playfairDisplay.variable}`}>
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          {children}
          <ToastProvider />
        </AuthProvider>
      </body>
    </html>
  );
}
