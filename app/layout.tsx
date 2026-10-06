import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Sans for the display typography, mono for structural/technical details.
const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ATELIER MONOLITH — Architecture & Urbanism",
  description:
    "Brutalist, minimalist architecture studio. We shape silence into form through mass, light and structure.",
  openGraph: {
    title: "ATELIER MONOLITH — Architecture & Urbanism",
    description: "Architecture of mass, light and silence.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-ink text-paper">{children}</body>
    </html>
  );
}
