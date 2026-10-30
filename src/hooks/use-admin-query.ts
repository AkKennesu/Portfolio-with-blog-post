"use client";

import useSWR, { mutate as globalMutate } from "swr";
import { supabase } from "@/lib/supabase";
import type { DashboardOverview, DashboardAggregations } from "@/repositories/metrics.repo";

export interface RpcStatsResponse {
  kpis?: {
    blog_count?: number;
    cert_count?: number;
    message_count?: number;
    unread_message_count?: number;
  };
  aggregations?: DashboardAggregations;
  recent_messages?: DashboardOverview["recentMessages"];
  recent_posts?: DashboardOverview["recentPosts"];
}

const DASHBOARD_STATS_KEY = "supabase:rpc:get_admin_dashboard_stats";

/**
 * Fetcher function that invokes the consolidated PostgreSQL RPC get_admin_dashboard_stats
 */
async function fetchAdminDashboardStats(): Promise<RpcStatsResponse | null> {
  const { data, error } = await supabase.rpc("get_admin_dashboard_stats");
  if (error) {
    // If not authenticated via Supabase JWT or insufficient privileges, return null gracefully
    console.warn("supabase.rpc('get_admin_dashboard_stats') returned:", error.message);
    return null;
  }
  return data as RpcStatsResponse;
}

/**
 * Client-Side Request Caching hook for admin overview metrics with a 60-second stale time.
 * Prevents redundant queries when switching tabs, opening modals, or returning to dashboard.
 */
export function useAdminDashboardStats(initialOverview: DashboardOverview) {
  const { data, error, isLoading, isValidating, mutate } = useSWR<RpcStatsResponse | null>(
    DASHBOARD_STATS_KEY,
    fetchAdminDashboardStats,
    {
      fallbackData: {
        kpis: {
          blog_count: initialOverview.blogCount,
          cert_count: initialOverview.certCount,
          message_count: initialOverview.messageCount,
          unread_message_count: initialOverview.unreadMessageCount,
        },
        aggregations: initialOverview.aggregations,
        recent_messages: initialOverview.recentMessages,
        recent_posts: initialOverview.recentPosts,
      },
      // Cache query results for 60 seconds (staleTime)
      dedupingInterval: 60_000,
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: true,
    }
  );

  const overview: DashboardOverview = {
    blogCount: Number(data?.kpis?.blog_count ?? initialOverview.blogCount),
    certCount: Number(data?.kpis?.cert_count ?? initialOverview.certCount),
    messageCount: Number(data?.kpis?.message_count ?? initialOverview.messageCount),
    unreadMessageCount: Number(data?.kpis?.unread_message_count ?? initialOverview.unreadMessageCount),
    recentMessages: data?.recent_messages ?? initialOverview.recentMessages,
    recentPosts: data?.recent_posts ?? initialOverview.recentPosts,
    aggregations: data?.aggregations ?? initialOverview.aggregations,
  };

  const aggregations = data?.aggregations ?? initialOverview.aggregations;

  const refresh = async () => {
    return await mutate();
  };

  return {
    overview,
    aggregations,
    isLoading,
    isValidating,
    error,
    refresh,
  };
}

/**
 * Invalidate the cached dashboard stats on mutations (e.g., after post creation, cert deletion)
 */
export function invalidateDashboardStats() {
  return globalMutate(DASHBOARD_STATS_KEY);
}

