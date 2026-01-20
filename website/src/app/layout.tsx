import type { Metadata } from "next";
import { Geist, Geist_Mono, Rajdhani } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const rajdhani = Rajdhani({
  variable: "--font-logo",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MortAi | AI-Powered Lead Generation",
  description: "Turn cold leads into booked calls with AI-powered outreach. We find, contact, and book your ideal customers while you focus on closing.",
  keywords: ["AI lead generation", "cold email", "outbound sales", "B2B lead gen", "sales automation"],
  authors: [{ name: "MortAi" }],
  openGraph: {
    title: "MortAi | AI-Powered Lead Generation",
    description: "Turn cold leads into booked calls with AI-powered outreach.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${rajdhani.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
