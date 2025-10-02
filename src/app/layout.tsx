import "./globals.css";
import type { Metadata, Viewport } from "next";
import { IframeProvider } from "@/lib/iframe-context";
import { IframeWrapper } from "@/components/IframeWrapper";

export const metadata: Metadata = {
  title: {
    default: "Professional Lottery Winnings Calculator",
    template: "%s | Lottery Calculator Pro"
  },
  description: "Professional lottery winnings calculator with advanced financial planning features. Calculate lump sum vs annuity, sustainable withdrawal rates, and optimize your financial future with our comprehensive analysis tools.",
  keywords: ["lottery calculator", "financial planning", "lump sum calculator", "annuity calculator", "retirement planning", "investment calculator"],
  authors: [{ name: "Lottery Calculator Pro" }],
  creator: "Lottery Calculator Pro",
  publisher: "Financial Tools Inc",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://lottery-calculator-pro.vercel.app'),
  openGraph: {
    title: "Professional Lottery Winnings Calculator",
    description: "Calculate your lottery winnings and plan your financial future with our professional-grade tools.",
    url: "https://lottery-calculator-pro.vercel.app",
    siteName: "Lottery Calculator Pro",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Lottery Calculator Pro - Professional Financial Planning"
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Professional Lottery Winnings Calculator",
    description: "Calculate your lottery winnings and plan your financial future with our professional-grade tools.",
    images: ["/twitter-image.png"],
    creator: "@LotteryCalcPro",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "verification-code-here",
  },
  category: "finance",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ef4444' },
    { media: '(prefers-color-scheme: dark)', color: '#dc2626' }
  ],
  colorScheme: 'dark light',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Lottery Calculator Pro" />
        <meta name="application-name" content="Lottery Calculator Pro" />
        <meta name="msapplication-TileColor" content="#dc2626" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className="antialiased">
        <IframeProvider>
          <IframeWrapper>
            <div id="root">
              {children}
            </div>
            <div id="modal-root"></div>
          </IframeWrapper>
        </IframeProvider>
      </body>
    </html>
  );
}
