import type { Metadata } from "next";
import { Geo } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import { PageTransition } from "@/components/PageTransition";
import { ScrollProgress } from "@/components/ScrollProgress";
import { MobileNav } from "@/components/MobileNav";
import { SmoothScrolling } from "@/components/SmoothScrolling";

// Lazy-load Three.js particle canvas background
const SpotlightBackground = dynamic(
  () => import("@/components/SpotlightBackground").then((mod) => mod.SpotlightBackground)
);

const geo = Geo({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-geo",
});

export const metadata: Metadata = {
  title: "Arn Kenneth | Portfolio",
  description: "Personal portfolio and blog.",
};

import { getSettings } from "@/actions/settings";
import { headers } from "next/headers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || headerList.get("x-invoke-path") || "";
  const isAdmin = pathname.startsWith("/admin");

  return (
    <html lang="en" suppressHydrationWarning className={`${geo.variable} dark`} style={{ colorScheme: "dark" }}>
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            html:root {
              --primary: ${settings.primary_color || '#3b82f6'} !important;
            }
            html.dark {
              --primary: ${settings.primary_color || '#3b82f6'} !important;
            }
          `
        }} />
      </head>
      <body
        className={`antialiased min-h-screen flex flex-col bg-background text-foreground font-sans text-lg`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {isAdmin ? (
            <main className="flex-1 w-full flex flex-col">{children}</main>
          ) : (
            <SmoothScrolling>
              <SpotlightBackground />
              <ScrollProgress />
              <MobileNav />
              <Navbar settings={settings} />
              <PageTransition>
                <main className="flex-1 w-full flex flex-col pt-16">{children}</main>
              </PageTransition>
              <Footer settings={settings} />
            </SmoothScrolling>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
