import "./globals.css";
import PWAInstaller from "@/components/PWAInstaller";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lottery Winnings Calculator - Plan Your Financial Future",
  description: "Professional lottery calculator with comprehensive financial analysis. Compare lump sum vs annuity payments, calculate sustainable withdrawal limits, and plan your financial future with advanced investment projections.",
  keywords: ["lottery calculator", "financial planning", "lump sum vs annuity", "investment calculator", "retirement planning"],
  authors: [{ name: "Carter Moyer" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#e85d04",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#e85d04" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body style={{ margin: 0, padding: 0, overflowX: 'hidden' }}>
        {children}
        <PWAInstaller />
      </body>
    </html>
  );
}
