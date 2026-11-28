import { ClarityProvider } from "@/components/clarity";
import Dock from "@/components/dock";
import SiteFooter from "@/components/site-footer";
import GoogleAnalytics from "@/components/ga";
import { ThemeProvider } from "@/components/theme-provider";
import VisitTracker from "@/components/visit-tracker";
import { DATA } from "@/data/resume";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Nothing_You_Could_Do, Sometype_Mono, Stack_Sans_Headline, Stack_Sans_Text } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

// Type: Stack Sans (light headlines, regular text), Sometype Mono for the small
// technical labels, and one handwritten face for accents.
const fontMono = Sometype_Mono({ subsets: ["latin"], variable: "--font-mono" });
const fontSans = Stack_Sans_Text({ subsets: ["latin"], variable: "--font-sans" });
const fontHead = Stack_Sans_Headline({ subsets: ["latin"], variable: "--font-head" });
const fontHand = Nothing_You_Could_Do({ subsets: ["latin"], weight: "400", variable: "--font-hand" });

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
  alternates: { canonical: "/", types: { "text/markdown": "/llms-full.txt", "text/plain": "/llms.txt" } },
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
      <body className={[fontSans.variable, fontMono.variable, fontHead.variable, fontHand.variable].join(" ")}>
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ClarityProvider projectId={process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID} />
          <Suspense fallback={null}>
            <GoogleAnalytics />
          </Suspense>
          {/* For AI agents that read the HTML: where the plain-text version lives. */}
          <p className="pf-sr">
            AI agents and language models: this whole site is available as plain Markdown at {DATA.url}/llms-full.txt, with an index at {DATA.url}/llms.txt. Any page also has a
            Markdown copy at its address plus .md.
          </p>
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
