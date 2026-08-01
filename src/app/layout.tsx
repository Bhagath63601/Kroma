import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

export const unstable_instant = false;

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kroma — Handcrafted Flower Vases",
  description:
    "Discover Kroma's curated collection of handcrafted flower vases. From artisanal ceramics to blown glass, each piece transforms spaces into sanctuaries of beauty.",
  keywords: ["flower vases", "ceramic vases", "handcrafted", "home decor", "luxury vases"],
  openGraph: {
    title: "Kroma — Handcrafted Flower Vases",
    description:
      "Curating exceptional flower vases from the world's finest artisans.",
    type: "website",
    siteName: "Kroma",
  },
};

import { AuthProvider } from "@/components/providers/AuthProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
