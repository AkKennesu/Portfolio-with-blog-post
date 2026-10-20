"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Award,
  Mail,
  User,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { logout } from "@/actions/admin";

interface AdminSidebarProps {
  unreadMessagesCount?: number;
}

const navItems = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Personal Info",
    href: "/admin/settings",
    icon: User,
  },
  {
    name: "Blog Posts",
    href: "/admin/blog",
    icon: FileText,
  },
  {
    name: "Certificates",
    href: "/admin/certificates",
    icon: Award,
  },
  {
    name: "Messages",
    href: "/admin/messages",
    icon: Mail,
    hasBadge: true,
  },
];

export default function AdminSidebar({ unreadMessagesCount = 0 }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Prefetch admin routes on mount for instant navigation
  useEffect(() => {
    navItems.forEach((item) => {
      router.prefetch(item.href);
    });
    router.prefetch("/admin/blog/new");
    router.prefetch("/admin/certificates/new");
  }, [router]);

  const isActive = (href: string) => {
    if (href === "/admin/dashboard") {
      return pathname === "/admin/dashboard" || pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-card/90 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <span className="font-semibold text-sm tracking-tight">Admin Console</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 border-r border-border bg-card flex flex-col justify-between transition-transform duration-300 ease-out md:translate-x-0 ${
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="p-5 flex flex-col flex-1 overflow-y-auto">
          {/* Brand & System Status */}
          <div className="flex items-center justify-between pb-6 mb-4 border-b border-border/60">
            <Link
              href="/admin/dashboard"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 group"
            >
              <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center text-primary transition-transform group-hover:scale-105">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight block">Portfolio Admin</span>
                <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Supabase Live
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  onClick={() => setMobileOpen(false)}
                  className={`relative flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="admin-active-pill"
                      className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/20"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <div className="relative flex items-center gap-3 z-10">
                    <Icon className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                    <span>{item.name}</span>
                  </div>

                  {item.hasBadge && unreadMessagesCount > 0 && (
                    <span className="relative z-10 px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary text-primary-foreground font-mono">
                      {unreadMessagesCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer with User & Actions */}
        <div className="p-4 border-t border-border/60 space-y-3 bg-muted/10">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5" />
              View Live Site
            </span>
            <span className="text-[10px] text-muted-foreground/70 font-mono">↗</span>
          </Link>

          <div className="flex items-center justify-between pt-2 px-1">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center text-xs font-bold text-primary">
                A
              </div>
              <div className="text-left">
                <span className="text-xs font-semibold block leading-tight">Admin</span>
                <span className="text-[10px] text-muted-foreground font-mono">Superuser</span>
              </div>
            </div>

            <form action={logout}>
              <button
                type="submit"
                title="Log out of session"
                className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Desktop spacer to prevent content overlap with fixed sidebar */}
      <div className="hidden md:block w-64 shrink-0" />
    </>
  );
}
