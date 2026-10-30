import { cache } from "react";
import { dbQuery } from "@/lib/db";

export interface DashboardMetrics {
  blogCount: number;
  certCount: number;
  messageCount: number;
}

export interface DashboardAggregations {
  messages_by_status?: {
    read: number;
    unread: number;
  };
  certs_by_year?: Array<{
    year: number;
    count: number;
  }>;
  monthly_inquiries?: Array<{
    month: string;
    count: number;
  }>;
}

export interface DashboardOverview {
  blogCount: number;
  certCount: number;
  messageCount: number;
  unreadMessageCount: number;
  recentMessages: Array<{
    id: number;
    name: string;
    email: string;
    snippet: string;
    is_read: boolean;
    created_at: string;
  }>;
  recentPosts: Array<{
    id: number;
    title: string;
    slug: string;
    date: string;
  }>;
  aggregations?: DashboardAggregations;
}

export class MetricsRepository {
  /**
   * Single CTE query to fetch headline counts in 1 round-trip.
   */
  static getDashboardCounts = cache(async (): Promise<DashboardMetrics> => {
    if (!process.env.POSTGRES_URL) {
      return { blogCount: 0, certCount: 0, messageCount: 0 };
    }

    try {
      const { rows } = await dbQuery`
        SELECT 
          (SELECT count(*) FROM blog_posts) AS blog_count,
          (SELECT count(*) FROM certificates) AS cert_count,
          (SELECT count(*) FROM messages) AS message_count;
      `;

      if (rows.length > 0) {
        return {
          blogCount: Number(rows[0].blog_count || 0),
          certCount: Number(rows[0].cert_count || 0),
          messageCount: Number(rows[0].message_count || 0),
        };
      }
    } catch (error) {
      console.warn("Unable to fetch dashboard metrics:", error);
    }

    return { blogCount: 0, certCount: 0, messageCount: 0 };
  });

  /**
   * Ultra-fast single-roundtrip PostgreSQL RPC function execution.
   * Calls get_admin_dashboard_stats() directly to retrieve all KPIs, aggregations, and feeds in 1 hop.
   */
  static getDashboardOverview = cache(async (): Promise<DashboardOverview> => {
    if (!process.env.POSTGRES_URL) {
      return {
        blogCount: 0,
        certCount: 0,
        messageCount: 0,
        unreadMessageCount: 0,
        recentMessages: [],
        recentPosts: [],
      };
    }

    try {
      // 1. Primary: Single-roundtrip PostgreSQL RPC function
      const { rows } = await dbQuery`
        SELECT public.get_admin_dashboard_stats() AS stats;
      `;

      if (rows && rows[0] && rows[0].stats) {
        const stats = rows[0].stats as {
          kpis?: {
            blog_count?: number;
            cert_count?: number;
            message_count?: number;
            unread_message_count?: number;
          };
          aggregations?: DashboardAggregations;
          recent_messages?: DashboardOverview["recentMessages"];
          recent_posts?: DashboardOverview["recentPosts"];
        };

        return {
          blogCount: Number(stats.kpis?.blog_count || 0),
          certCount: Number(stats.kpis?.cert_count || 0),
          messageCount: Number(stats.kpis?.message_count || 0),
          unreadMessageCount: Number(stats.kpis?.unread_message_count || 0),
          recentMessages: stats.recent_messages || [],
          recentPosts: stats.recent_posts || [],
          aggregations: stats.aggregations,
        };
      }
    } catch (rpcError) {
      console.warn("RPC get_admin_dashboard_stats not available, falling back to CTE aggregation:", rpcError);
    }

    try {
      // 2. Resilient fallback query
      const { rows } = await dbQuery`
        SELECT 
          (SELECT count(*) FROM blog_posts) AS blog_count,
          (SELECT count(*) FROM certificates) AS cert_count,
          (SELECT count(*) FROM messages) AS message_count,
          (SELECT count(*) FROM messages WHERE is_read = false) AS unread_count,
          COALESCE((
            SELECT json_agg(m) FROM (
              SELECT 
                id, 
                name, 
                email, 
                substring(message from 1 for 100) AS snippet, 
                is_read, 
                to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS created_at
              FROM messages 
              ORDER BY created_at DESC 
              LIMIT 4
            ) m
          ), '[]'::json) AS recent_messages,
          COALESCE((
            SELECT json_agg(p) FROM (
              SELECT 
                id, 
                title, 
                slug, 
                to_char(date, 'YYYY-MM-DD') AS date
              FROM blog_posts 
              ORDER BY date DESC 
              LIMIT 3
            ) p
          ), '[]'::json) AS recent_posts;
      `;

      const data = (rows[0] || {}) as Record<string, unknown>;

      return {
        blogCount: Number(data.blog_count || 0),
        certCount: Number(data.cert_count || 0),
        messageCount: Number(data.message_count || 0),
        unreadMessageCount: Number(data.unread_count || 0),
        recentMessages: (data.recent_messages || []) as DashboardOverview["recentMessages"],
        recentPosts: (data.recent_posts || []) as DashboardOverview["recentPosts"],
      };
    } catch (error) {
      console.warn("Unable to fetch comprehensive dashboard overview:", error);
      return {
        blogCount: 0,
        certCount: 0,
        messageCount: 0,
        unreadMessageCount: 0,
        recentMessages: [],
        recentPosts: [],
      };
    }
  });
}
