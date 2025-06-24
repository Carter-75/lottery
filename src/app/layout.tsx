import "./globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lottery Winnings Calculator",
  description: "Calculate your lottery winnings and financial future.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
