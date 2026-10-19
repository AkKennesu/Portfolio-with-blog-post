import { dbQuery } from "@/lib/db";

export interface DashboardMetrics {
  blogCount: number;
  certCount: number;
  messageCount: number;
}

export class MetricsRepository {
  /**
   * Executes a single CTE/subquery to fetch all dashboard metrics in 1 round-trip
   * instead of 3 sequential queries across the network.
   */
  static async getDashboardCounts(): Promise<DashboardMetrics> {
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
      console.warn("Unable to fetch dashboard metrics (tables may not be created yet):", error);
    }

    return { blogCount: 0, certCount: 0, messageCount: 0 };
  }
}
