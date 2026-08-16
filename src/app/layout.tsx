import BgDots from "@/components/bg-dots";
import { ClarityProvider } from "@/components/clarity";
import Dock from "@/components/dock";
import GoogleAnalytics from "@/components/ga";
import { ThemeProvider } from "@/components/theme-provider";
import { DATA } from "@/data/resume";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

const fontSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const plainDescription = DATA.description.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");

export const metadata: Metadata = {
  metadataBase: new URL(DATA.url),
  title: {
    default: DATA.name,
    template: `%s | ${DATA.name}`,
  },
  description: plainDescription,
  openGraph: {
    title: `${DATA.name}`,
    description: plainDescription,
    url: DATA.url,
    siteName: `${DATA.name}`,
    locale: "en_US",
    type: "website",
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
  twitter: {
    title: `${DATA.name}`,
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={fontSans.variable}>
        <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false}>
          <ClarityProvider projectId={process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID} />
          <Suspense fallback={null}>
            <GoogleAnalytics />
          </Suspense>
          <BgDots />
          {children}
          <Dock />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
