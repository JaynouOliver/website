import type { Metadata } from "next";
import Dashboard from "./dashboard";

export const metadata: Metadata = {
  title: "Visitor analytics",
  robots: { index: false, follow: false },
};

export default function AnalyticsPage() {
  return <Dashboard />;
}
