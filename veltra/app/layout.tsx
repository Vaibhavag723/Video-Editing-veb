import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/space-grotesk";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Veltra — Create videos that keep moving",
    template: "%s · Veltra",
  },
  description:
    "Veltra is a premium browser video editing studio. Pro timeline, AI captions, instant exports. Create videos that keep moving.",
  keywords: ["video editor", "saas", "veltra", "ai captions", "timeline editor"],
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#05060d",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">
        {/* global ambient atmosphere */}
        <div className="aurora" aria-hidden="true">
          <span className="orb orb-a" />
          <span className="orb orb-b" />
          <span className="orb orb-c" />
        </div>
        <div className="grid-floor" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}