import { cache } from "react";
import { dbQuery, sqlClient } from "@/lib/db";
import { defaultEducationItems, type EducationItem } from "@/lib/data";

export type { EducationItem };
export { defaultEducationItems };

export type SettingsMap = {
  about_me_1: string;
  about_me_2: string;
  primary_color: string;
  custom_social_links: string;
  cv_file: string;
  hero_title: string;
  hero_highlight: string;
  hero_description: string;
  logo_text: string;
  logo_image: string;
  education_title: string;
  education_subtitle: string;
  education_items: string;
};

export const defaultSettings: SettingsMap = {
  about_me_1:
    "Detail-oriented and adaptable QA Engineer and Information Technology graduate with hands-on experience in automated testing, software development, and quality assurance.",
  about_me_2:
    "Strong background in full-stack development, enabling deep technical troubleshooting and effective collaboration with cross-functional teams to deliver high-quality, scalable software solutions.",
  primary_color: "#3b82f6",
  custom_social_links: "[]",
  cv_file: "",
  hero_title: "Building digital products that",
  hero_highlight: "matter.",
  hero_description:
    "QA Engineer & Full-Stack Developer specializing in automated testing, reliable cloud architectures, and interface craftsmanship.",
  logo_text: "AK",
  logo_image: "",
  education_title: "Education Attainment",
  education_subtitle: "My academic journey and professional milestones.",
  education_items: JSON.stringify(defaultEducationItems),
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
   * Single-statement atomic batch upsert for settings (eliminates loop of individual round-trips).
   */
  static async updateBatch(entries: Record<string, string>): Promise<void> {
    const validEntries = Object.entries(entries).filter(
      ([, value]) => value !== undefined && value !== null
    );
    if (validEntries.length === 0) return;

    const keys = validEntries.map(([k]) => k);
    const values = validEntries.map(([, v]) => v);

    // Single network round-trip UNNEST batch upsert
    await sqlClient`
      INSERT INTO site_settings (key, value)
      SELECT * FROM UNNEST(${keys}::text[], ${values}::text[]) AS t(key, value)
      ON CONFLICT (key) 
      DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
    `;
  }
}
