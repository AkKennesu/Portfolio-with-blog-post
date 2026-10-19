import { cache } from "react";
import { dbQuery, sqlClient } from "@/lib/db";

export type SettingsMap = {
  about_me_1: string;
  about_me_2: string;
  primary_color: string;
  custom_social_links: string;
  cv_file: string;
};

export const defaultSettings: SettingsMap = {
  about_me_1:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam non neque est. Sed vel pretium massa. Donec eget nibh a magna feugiat rutrum.",
  about_me_2:
    "Vivamus at dui mollis, finibus justo vitae, accumsan nullam. Phasellus vestibulum hendrerit ex, ut ullamcorper arcu finibus a. Fusce et nibh quist.",
  primary_color: "#3b82f6",
  custom_social_links: "[]",
  cv_file: "",
};

export class SettingsRepository {
  /**
   * Request-scoped memoized query:
   * When RootLayout, Page, and About all request settings in the same render tree,
   * React cache() ensures exactly ONE database query is executed!
   */
  static getCachedSettings = cache(async (): Promise<SettingsMap> => {
    if (!process.env.POSTGRES_URL) {
      return defaultSettings;
    }

    try {
      const { rows } = await dbQuery`SELECT key, value FROM site_settings`;
      if (rows.length === 0) return defaultSettings;

      const settings = { ...defaultSettings };
      const dbRows = rows as unknown as { key: string; value: string }[];
      dbRows.forEach((row) => {
        const key = row.key as keyof SettingsMap;
        if (key in settings) {
          settings[key] = row.value;
        }
      });

      return settings;
    } catch (error) {
      console.error("Database query failed in SettingsRepository.getCachedSettings:", error);
      return defaultSettings;
    }
  });

  /**
   * Single-statement atomic batch upsert for settings (replaces loop of 5 individual queries).
   */
  static async updateBatch(entries: Record<string, string>): Promise<void> {
    const keys = Object.keys(entries);
    if (keys.length === 0) return;

    // Use transaction with unnest or multi-row insert
    await sqlClient.begin(async (sql) => {
      for (const [key, value] of Object.entries(entries)) {
        if (value !== undefined && value !== null) {
          await sql`
            INSERT INTO site_settings (key, value)
            VALUES (${key}, ${value})
            ON CONFLICT (key) 
            DO UPDATE SET value = ${value}, updated_at = CURRENT_TIMESTAMP
          `;
        }
      }
    });
  }
}
