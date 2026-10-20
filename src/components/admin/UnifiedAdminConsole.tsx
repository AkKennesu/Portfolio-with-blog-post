"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  Plus,
  ArrowLeft,
} from "lucide-react";
import { logout } from "@/actions/admin";
import type { UnifiedAdminData } from "@/repositories/admin.repo";

import DashboardClient from "./DashboardClient";
import SettingsClient from "./SettingsClient";
import BlogListClient from "./BlogListClient";
import CertListClient from "./CertListClient";
import MessageListClient from "./MessageListClient";
import { BlogForm } from "./BlogForm";
import { CertificateForm } from "./CertificateForm";

export type AdminTab = "overview" | "settings" | "blog" | "certificates" | "messages";

interface UnifiedAdminConsoleProps {
  initialData: UnifiedAdminData;
  initialTab?: AdminTab;
}

const navItems: Array<{
  id: AdminTab;
  name: string;
  icon: typeof LayoutDashboard;
  hasBadge?: boolean;
}> = [
  {
    id: "overview",
    name: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "settings",
    name: "Personal Info",
    icon: User,
  },
  {
    id: "blog",
    name: "Blog Posts",
    icon: FileText,
  },
  {
    id: "certificates",
    name: "Certificates",
    icon: Award,
  },
  {
    id: "messages",
    name: "Messages",
    icon: Mail,
    hasBadge: true,
  },
];

export default function UnifiedAdminConsole({
  initialData,
  initialTab = "overview",
}: UnifiedAdminConsoleProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isCreatingCert, setIsCreatingCert] = useState(false);

  // Sync tab with URL query parameter on client mount / popstate without reloading
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab") as AdminTab | null;
    if (tabParam && ["overview", "settings", "blog", "certificates", "messages"].includes(tabParam)) {
      setActiveTab(tabParam);
    }

    const handlePopState = () => {
      const p = new URLSearchParams(window.location.search);
      const t = (p.get("tab") as AdminTab) || "overview";
      setActiveTab(t);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    setMobileOpen(false);
    setIsCreatingPost(false);
    setIsCreatingCert(false);

    // Update URL shallowly without triggering any server navigation or compilation
    const newUrl = tab === "overview" ? "/admin/dashboard" : `/admin/dashboard?tab=${tab}`;
    if (window.location.pathname + window.location.search !== newUrl) {
      window.history.pushState(null, "", newUrl);
    }
  };

  const unreadCount = initialData.messages.filter((m) => !m.is_read).length;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background text-foreground">
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

      {/* Mobile Backdrop */}
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
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 border-r border-border bg-card flex flex-col justify-between transition-transform duration-200 ease-out md:translate-x-0 ${
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="p-5 flex flex-col flex-1 overflow-y-auto">
          {/* Brand & Status Indicator */}
          <div className="flex items-center justify-between pb-6 mb-4 border-b border-border/60">
            <button
              onClick={() => handleTabChange("overview")}
              className="flex items-center gap-2.5 group text-left w-full cursor-pointer"
            >
              <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center text-primary transition-transform group-hover:scale-105">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight block">Portfolio Admin</span>
                <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Instant Mode Active
                </span>
              </div>
            </button>
          </div>

          {/* Instant Tab Switching Navigation */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const active = activeTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  type="button"
                  className={`relative w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer select-none text-left ${
                    active
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="unified-active-pill"
                      className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/20"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    />
                  )}
                  <div className="relative flex items-center gap-3 z-10">
                    <Icon className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                    <span>{item.name}</span>
                  </div>

                  {item.hasBadge && unreadCount > 0 && (
                    <span className="relative z-10 px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary text-primary-foreground font-mono">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer with External Link & Logout */}
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
                title="Log out"
                className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Desktop spacer to prevent fixed sidebar overlap */}
      <div className="hidden md:block w-64 shrink-0" />

      {/* Main View Area with Instant Persistent Tab Panels (0ms Input Delay) */}
      <main className="flex-1 w-full min-w-0">
        <div className={activeTab === "overview" ? "block" : "hidden"}>
          <DashboardClient
            overview={initialData.overview}
            onSelectTab={handleTabChange}
            onNewPost={() => {
              handleTabChange("blog");
              setIsCreatingPost(true);
            }}
            onNewCert={() => {
              handleTabChange("certificates");
              setIsCreatingCert(true);
            }}
          />
        </div>

        <div className={activeTab === "settings" ? "block" : "hidden"}>
          <SettingsClient initialSettings={initialData.settings} />
        </div>

        <div className={activeTab === "blog" ? "block" : "hidden"}>
          <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Blog Articles</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage, edit, and publish your technical articles.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingPost(!isCreatingPost)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
              >
                {isCreatingPost ? (
                  <>
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to Articles
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" />
                    New Post
                  </>
                )}
              </button>
            </div>

            {isCreatingPost ? (
              <div className="bg-card rounded-xl border border-border p-6 md:p-8 shadow-sm">
                <BlogForm />
              </div>
            ) : (
              <BlogListClient posts={initialData.posts} />
            )}
          </div>
        </div>

        <div className={activeTab === "certificates" ? "block" : "hidden"}>
          <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Certificates & Awards</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your verified credentials and professional honors.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingCert(!isCreatingCert)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
              >
                {isCreatingCert ? (
                  <>
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to List
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" />
                    Add Certificate
                  </>
                )}
              </button>
            </div>

            {isCreatingCert ? (
              <div className="bg-card rounded-xl border border-border p-6 md:p-8 shadow-sm">
                <CertificateForm />
              </div>
            ) : (
              <CertListClient certs={initialData.certs} />
            )}
          </div>
        </div>

        <div className={activeTab === "messages" ? "block" : "hidden"}>
          <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Inbox Inquiries</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {unreadCount > 0
                    ? `You have ${unreadCount} unread message${unreadCount !== 1 ? "s" : ""}`
                    : "All caught up. Inbox zero."}
                </p>
              </div>
            </div>

            <MessageListClient messages={initialData.messages} />
          </div>
        </div>
      </main>
    </div>
  );
}
