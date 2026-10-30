"use client";

import { useState, useCallback, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  Award,
  Mail,
  ArrowUpRight,
  Plus,
  ShieldCheck,
  Database,
  RefreshCw,
  ExternalLink,
  Clock,
  CheckCircle2,
  PieChart,
} from "lucide-react";
import type { DashboardOverview } from "@/repositories/metrics.repo";
import { migrateData, initializeDatabase } from "@/actions/admin";
import { useAdminDashboardStats } from "@/hooks/use-admin-query";

export type AdminTab = "overview" | "settings" | "blog" | "certificates" | "messages";

interface DashboardClientProps {
  overview: DashboardOverview;
  onSelectTab?: (tab: AdminTab) => void;
  onNewPost?: () => void;
  onNewCert?: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export default function DashboardClient({
  overview: initialOverview,
  onSelectTab,
  onNewPost,
  onNewCert,
}: DashboardClientProps) {
  // Client-Side Request Caching via SWR with 60-second stale time
  const {
    overview,
    aggregations,
    isValidating: isRefreshingRpc,
    refresh,
  } = useAdminDashboardStats(initialOverview);

  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);

  const [isPendingSync, startTransitionSync] = useTransition();
  const [isPendingInit, startTransitionInit] = useTransition();

  const handleRefreshRpc = useCallback(async () => {
    await refresh();
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLastSyncedTime(now);
  }, [refresh]);

  const handleSyncData = () => {
    startTransitionSync(async () => {
      await migrateData();
      await handleRefreshRpc();
    });
  };

  const handleInitDb = () => {
    startTransitionInit(async () => {
      await initializeDatabase();
      await handleRefreshRpc();
    });
  };

  const statCards: Array<{
    title: string;
    value: number;
    meta: string;
    targetTab: AdminTab;
    actionText: string;
    icon: typeof FileText;
    badge: string;
    highlight?: boolean;
    onAction?: () => void;
  }> = [
    {
      title: "Blog Articles",
      value: overview.blogCount,
      meta: `${overview.blogCount} published articles`,
      targetTab: "blog",
      actionText: "Manage Articles",
      icon: FileText,
      badge: "Published",
      onAction: onNewPost,
    },
    {
      title: "Certificates & Awards",
      value: overview.certCount,
      meta: `${overview.certCount} verified credentials`,
      targetTab: "certificates",
      actionText: "Manage Records",
      icon: Award,
      badge: "Verified",
      onAction: onNewCert,
    },
    {
      title: "Inbox Inquiries",
      value: overview.messageCount,
      meta:
        overview.unreadMessageCount > 0
          ? `${overview.unreadMessageCount} unread inquiry`
          : "All caught up",
      targetTab: "messages",
      actionText: "View Messages",
      icon: Mail,
      badge: overview.unreadMessageCount > 0 ? `${overview.unreadMessageCount} New` : "Inbox Zero",
      highlight: overview.unreadMessageCount > 0,
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 md:p-10 max-w-7xl mx-auto space-y-8"
    >
      {/* Header Command Bar */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/60"
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Overview
            </h1>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Supabase Postgres 17 · Active
            </div>
            {lastSyncedTime && (
              <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline">
                Synced at {lastSyncedTime}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time portfolio metrics, content publishing, and database controls powered by <code className="text-primary font-mono text-xs">get_admin_dashboard_stats()</code> RPC.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Supabase RPC Live Refresh Button */}
          <button
            type="button"
            onClick={handleRefreshRpc}
            disabled={isRefreshingRpc}
            title="Execute supabase.rpc('get_admin_dashboard_stats')"
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted/50 text-foreground transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-primary ${isRefreshingRpc ? "animate-spin" : ""}`} />
            <span>{isRefreshingRpc ? "Fetching RPC..." : "Refresh RPC"}</span>
          </button>

          {onNewPost ? (
            <button
              type="button"
              onClick={onNewPost}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              New Post
            </button>
          ) : (
            <Link
              href="/admin/blog/new"
              prefetch={true}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm active:scale-[0.98]"
            >
              <Plus className="h-3.5 w-3.5" />
              New Post
            </Link>
          )}

          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted/50 text-foreground transition-all"
          >
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            Live Preview
          </Link>
        </div>
      </motion.div>

      {/* Primary Metric Tiles */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              onClick={onSelectTab ? () => onSelectTab(stat.targetTab) : undefined}
              className={`group relative rounded-xl border p-6 bg-card transition-all duration-200 hover:border-foreground/25 hover:shadow-md cursor-pointer ${
                stat.highlight ? "border-primary/40 bg-primary/2" : "border-border/70"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {stat.title}
                  </span>
                  <div className="mt-2 text-4xl font-extrabold tracking-tight font-mono text-foreground">
                    {stat.value}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/60 text-muted-foreground group-hover:text-foreground group-hover:bg-muted transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">{stat.meta}</span>
                {onSelectTab ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                    <span>{stat.actionText}</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                ) : (
                  <Link
                    href={`/admin/dashboard?tab=${stat.targetTab}`}
                    className="inline-flex items-center gap-1 font-semibold text-primary hover:underline group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>{stat.actionText}</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Group-by / Aggregations Bar (Generated by RPC) */}
      {aggregations?.certs_by_year && aggregations.certs_by_year.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="rounded-xl border border-border/70 bg-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2.5">
            <PieChart className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">Credential Distribution by Year:</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {aggregations.certs_by_year.map((cy) => (
              <span
                key={cy.year}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-medium bg-muted/60 border border-border/60 text-foreground"
              >
                <span className="text-primary font-bold">{cy.year}:</span>
                <span>{cy.count}</span>
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Main Grid: Recent Activities & System Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Inquiries & Activity (7 Cols) */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-7 rounded-xl border border-border/70 bg-card p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-border/60 mb-4">
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-primary" />
                <h2 className="font-semibold text-base text-foreground">Recent Inquiries</h2>
              </div>
              {onSelectTab ? (
                <button
                  type="button"
                  onClick={() => onSelectTab("messages")}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                >
                  <span>View all</span>
                  <ArrowUpRight className="h-3 w-3" />
                </button>
              ) : (
                <Link
                  href="/admin/dashboard?tab=messages"
                  prefetch={true}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <span>View all</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              )}
            </div>

            {overview.recentMessages.length === 0 ? (
              <div className="py-12 px-4 text-center rounded-lg border border-dashed border-border/60 bg-muted/10 my-2">
                <div className="mx-auto h-10 w-10 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-foreground">No inquiries yet</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                  Messages submitted through your portfolio contact form will appear here in real-time.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {overview.recentMessages.map((msg) =>
                  onSelectTab ? (
                    <button
                      key={msg.id}
                      type="button"
                      onClick={() => onSelectTab("messages")}
                      className="w-full text-left block p-3.5 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-2">
                          {!msg.is_read && (
                            <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                          )}
                          <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {msg.name}
                          </span>
                          <span className="text-muted-foreground text-[11px] font-mono">
                            ({msg.email})
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(msg.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 pl-4">
                        {msg.snippet || "No preview text"}
                      </p>
                    </button>
                  ) : (
                    <Link
                      key={msg.id}
                      href="/admin/dashboard?tab=messages"
                      className="block p-3.5 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors group"
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-2">
                          {!msg.is_read && (
                            <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                          )}
                          <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {msg.name}
                          </span>
                          <span className="text-muted-foreground text-[11px] font-mono">
                            ({msg.email})
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(msg.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 pl-4">
                        {msg.snippet || "No preview text"}
                      </p>
                    </Link>
                  )
                )}
              </div>
            )}
          </div>

          {/* Quick Publishing Bar */}
          <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">
              Latest Published Article:
            </span>
            {overview.recentPosts.length > 0 ? (
              <Link
                href={`/blog/${overview.recentPosts[0].slug}`}
                target="_blank"
                className="text-xs font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1.5 truncate max-w-xs"
              >
                <span className="truncate">{overview.recentPosts[0].title}</span>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </Link>
            ) : (
              <span className="text-xs text-muted-foreground">None</span>
            )}
          </div>
        </motion.div>

        {/* Right Column: Database Status & Operations (5 Cols) */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-5 rounded-xl border border-border/70 bg-card p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-border/60 mb-5">
              <div className="flex items-center gap-2.5">
                <Database className="h-4 w-4 text-primary" />
                <h2 className="font-semibold text-base text-foreground">Infrastructure Status</h2>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Database Engine</span>
                <span className="font-mono font-medium text-foreground">Supabase PostgreSQL 17</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Connection Pooler</span>
                <span className="font-mono font-medium text-foreground">Supavisor (Port 6543)</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Row-Level Security</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Enforced (5 Tables)
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Data Leakage Protection</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                  Least Privilege Active
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">RPC Analytics Function</span>
                <span className="font-mono text-primary font-medium">
                  public.get_admin_dashboard_stats()
                </span>
              </div>
            </div>
          </div>

          {/* Maintenance & Sync Controls */}
          <div className="mt-8 pt-5 border-t border-border/60 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 block">
              Administrative Operations
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleSyncData}
                disabled={isPendingSync}
                className="inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border border-border bg-muted/30 hover:bg-muted/70 text-foreground transition-all disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isPendingSync ? "animate-spin" : ""}`} />
                <span>{isPendingSync ? "Syncing..." : "Sync Static"}</span>
              </button>

              <button
                type="button"
                onClick={handleInitDb}
                disabled={isPendingInit}
                className="inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border border-border bg-muted/30 hover:bg-muted/70 text-foreground transition-all disabled:opacity-50"
              >
                <Database className={`h-3.5 w-3.5 ${isPendingInit ? "animate-spin" : ""}`} />
                <span>{isPendingInit ? "Verifying..." : "Verify DB"}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
