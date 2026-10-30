import type { Metadata } from "next";
import { Geo } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import { PageTransition } from "@/components/PageTransition";
import { ScrollProgress } from "@/components/ScrollProgress";
import { MobileNav } from "@/components/MobileNav";
import { SmoothScrolling } from "@/components/SmoothScrolling";
import { SpotlightBackground } from "@/components/SpotlightBackground";

const geo = Geo({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-geo",
});

export const metadata: Metadata = {
  title: {
    default: "Arn Kenneth | QA Engineer & Full-Stack Developer",
    template: "%s | Arn Kenneth",
  },
  description: "QA Engineer & Full-Stack Developer specializing in automated testing, reliable cloud architectures, and interface craftsmanship.",
  authors: [{ name: "Arn Kenneth" }],
  keywords: ["QA Engineer", "Full-Stack Developer", "Automated Testing", "Playwright", "Selenium", "Next.js", "TypeScript"],
  openGraph: {
    title: "Arn Kenneth | QA Engineer & Full-Stack Developer",
    description: "QA Engineer & Full-Stack Developer specializing in automated testing, reliable cloud architectures, and interface craftsmanship.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Arn Kenneth | QA Engineer & Full-Stack Developer",
    description: "QA Engineer & Full-Stack Developer specializing in automated testing, reliable cloud architectures, and interface craftsmanship.",
  },
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
