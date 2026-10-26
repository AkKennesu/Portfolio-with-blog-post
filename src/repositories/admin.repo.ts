import { cache } from "react";
import { unstable_cache } from "next/cache";
import { dbQuery } from "@/lib/db";
import type { DashboardOverview } from "./metrics.repo";
import type { Post } from "@/lib/blog";
import type { Certificate } from "@/lib/certificates";
import type { MessageItem } from "./message.repo";
import { defaultSettings, type SettingsMap } from "./settings.repo";

export interface UnifiedAdminData {
  overview: DashboardOverview;
  posts: Post[];
  certs: Certificate[];
  messages: MessageItem[];
  settings: SettingsMap;
}

export class AdminRepository {
  /**
   * Internal uncached fetcher for unified admin suite data.
   */
  static fetchUnifiedData = async (): Promise<UnifiedAdminData> => {
    if (!process.env.POSTGRES_URL) {
      return {
        overview: {
          blogCount: 0,
          certCount: 0,
          messageCount: 0,
          unreadMessageCount: 0,
          recentMessages: [],
          recentPosts: [],
        },
        posts: [],
        certs: [],
        messages: [],
        settings: defaultSettings,
      };
    }

    try {
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
                message, 
                substring(message from 1 for 100) AS snippet, 
                is_read, 
                is_important, 
                to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS created_at
              FROM messages 
              ORDER BY created_at DESC
            ) m
          ), '[]'::json) AS all_messages,
          COALESCE((
            SELECT json_agg(p) FROM (
              SELECT 
                id, 
                title, 
                slug, 
                excerpt, 
                '' AS content, 
                cover_image,
                to_char(date, 'YYYY-MM-DD') AS date
              FROM blog_posts 
              ORDER BY date DESC
            ) p
          ), '[]'::json) AS all_posts,
          COALESCE((
            SELECT json_agg(c) FROM (
              SELECT 
                id, 
                title, 
                subtitle, 
                description, 
                image, 
                year, 
                to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS created_at
              FROM certificates 
              ORDER BY year DESC, created_at DESC
            ) c
          ), '[]'::json) AS all_certs,
          COALESCE((
            SELECT json_object_agg(key, value) FROM site_settings
          ), '{}'::json) AS all_settings;
      `;

      const data = (rows[0] || {}) as Record<string, unknown>;
      const rawSettings = (data.all_settings || {}) as Record<string, string>;
      const mergedSettings: SettingsMap = {
        ...defaultSettings,
        ...rawSettings,
      };

      const allMessages = (data.all_messages || []) as MessageItem[];
      const allPosts = (data.all_posts || []) as Post[];
      const allCerts = (data.all_certs || []) as Certificate[];

      const overview: DashboardOverview = {
        blogCount: Number(data.blog_count || allPosts.length),
        certCount: Number(data.cert_count || allCerts.length),
        messageCount: Number(data.message_count || allMessages.length),
        unreadMessageCount: Number(data.unread_count || allMessages.filter((m) => !m.is_read).length),
        recentMessages: allMessages.slice(0, 4).map((m) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          snippet: m.message ? m.message.slice(0, 100) : "",
          is_read: m.is_read,
          created_at: m.created_at,
        })),
        recentPosts: allPosts.slice(0, 3).map((p) => ({
          id: p.id || 0,
          title: p.title,
          slug: p.slug,
          date: p.date,
        })),
      };

      return {
        overview,
        posts: allPosts,
        certs: allCerts,
        messages: allMessages,
        settings: mergedSettings,
      };
    } catch (error) {
      console.warn("Unable to fetch unified admin data in single query. Falling back to resilient multi-fetch:", error);
      try {
        const { BlogRepository } = await import("./blog.repo");
        const { CertificateRepository } = await import("./certificate.repo");
        const { MessageRepository } = await import("./message.repo");
        const { SettingsRepository } = await import("./settings.repo");

        const [posts, certs, messages, settings] = await Promise.all([
          BlogRepository.findAll().catch(() => []),
          CertificateRepository.findAll().catch(() => []),
          MessageRepository.findAll().catch(() => []),
          SettingsRepository.getCachedSettings().catch(() => defaultSettings),
        ]);

        return {
          overview: {
            blogCount: posts.length,
            certCount: certs.length,
            messageCount: messages.length,
            unreadMessageCount: messages.filter((m: MessageItem) => !m.is_read).length,
            recentMessages: messages.slice(0, 4).map((m: MessageItem) => ({
              id: m.id,
              name: m.name,
              email: m.email,
              snippet: m.message ? m.message.slice(0, 100) : "",
              is_read: m.is_read,
              created_at: m.created_at,
            })),
            recentPosts: posts.slice(0, 3).map((p: { id?: number; title: string; slug: string; date: string }) => ({
              id: p.id || 0,
              title: p.title,
              slug: p.slug,
              date: p.date,
            })),
          },
          posts: posts as unknown as Post[],
          certs: certs as unknown as Certificate[],
          messages,
          settings,
        };
      } catch (fallbackErr) {
        console.error("Critical fallback failed in AdminRepository:", fallbackErr);
        return {
          overview: {
            blogCount: 0,
            certCount: 0,
            messageCount: 0,
            unreadMessageCount: 0,
            recentMessages: [],
            recentPosts: [],
          },
          posts: [],
          certs: [],
          messages: [],
          settings: defaultSettings,
        };
      }
    }
  };

  /**
   * Consolidated cached fetch for the entire admin suite.
   * Eliminates trans-pacific round-trips and enables instantaneous page loads.
   * Cached across requests with on-demand revalidation via 'admin-unified-data' tag.
   */
  static getUnifiedData = cache(
    unstable_cache(
      async () => AdminRepository.fetchUnifiedData(),
      ["admin-unified-data"],
      {
        tags: ["admin-unified-data"],
        revalidate: 60,
      }
    )
  );
}
