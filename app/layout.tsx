import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/hooks/useAuth";
import { ToastProvider } from "@/app/providers/toast-provider";

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
  title: "Lumo - Luksusowa Platforma Twórców Podróżniczych",
  description: "Połącz się z najlepszymi twórcami treści podróżniczych, którzy przekształcają destynacje w fascynujące historie. Wzmocnij swoją markę autentycznymi, luksusowymi treściami.",
  viewport: "width=device-width, initial-scale=1",
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
}// review trigger
