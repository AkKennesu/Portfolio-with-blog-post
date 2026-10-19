import type { Metadata } from "next";
import { Geo } from "next/font/google"; // Using Geo as requested
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import { PageTransition } from "@/components/PageTransition";
import { ScrollProgress } from "@/components/ScrollProgress";
import { SpotlightBackground } from "@/components/SpotlightBackground";
import { MobileNav } from "@/components/MobileNav";
import { SmoothScrolling } from "@/components/SmoothScrolling";

const geo = Geo({
  subsets: ["latin"],
  weight: ["400"], // Geo usually comes in limited weights, checking common
  variable: "--font-geo", // Renamed from --font-inter
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
          <SmoothScrolling>
            <SpotlightBackground />
            <ScrollProgress />
            {!isAdmin && <MobileNav />}
            {!isAdmin && <Navbar settings={settings} />}
            <PageTransition>
              <main className={`flex-1 w-full flex flex-col ${isAdmin ? "" : "pt-16"}`}>{children}</main>
            </PageTransition>
            {!isAdmin && <Footer settings={settings} />}
          </SmoothScrolling>
        </ThemeProvider>
      </body>
    </html >
  );
}
