import BgDots from "@/components/bg-dots";
import { ClarityProvider } from "@/components/clarity";
import Dock from "@/components/dock";
import SiteFooter from "@/components/site-footer";
import GoogleAnalytics from "@/components/ga";
import { ThemeProvider } from "@/components/theme-provider";
import VisitTracker from "@/components/visit-tracker";
import { DATA } from "@/data/resume";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-mono",
});

const fontSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const plainDescription = DATA.seoDescription;

const siteTitle = `${DATA.name} (${DATA.nickname}) · ${DATA.role}`;

export const metadata: Metadata = {
  metadataBase: new URL(DATA.url),
  title: {
    default: siteTitle,
    template: `%s · ${DATA.name}`,
  },
  description: plainDescription,
  applicationName: DATA.name,
  authors: [{ name: DATA.name, url: DATA.url }],
  creator: DATA.name,
  alternates: { canonical: "/" },
  openGraph: {
    title: siteTitle,
    description: plainDescription,
    url: "/",
    siteName: DATA.name,
    locale: "en_US",
    type: "profile",
    firstName: "Suvrakamal",
    lastName: "Das",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: DATA.heroImageAlt }],
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
    title: siteTitle,
    description: plainDescription,
    card: "summary_large_image",
    creator: "@SuvrakamalD",
    images: ["/og.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={fontSans.variable + " " + fontMono.variable}>
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ClarityProvider projectId={process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID} />
          <Suspense fallback={null}>
            <GoogleAnalytics />
          </Suspense>
          <BgDots />
          {children}
          <SiteFooter />
          <Dock />
          <Analytics />
          <VisitTracker />
        </ThemeProvider>
      </body>
    </html>
  );
}
