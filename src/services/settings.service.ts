import { SettingsRepository, type SettingsMap } from "@/repositories/settings.repo";
import { requireAdminAuth } from "@/lib/auth";
import { ValidationError } from "@/lib/errors";
import { z } from "zod";

export const settingsInputSchema = z.object({
  about_me_1: z.string().trim().optional(),
  about_me_2: z.string().trim().optional(),
  primary_color: z
    .string()
    .trim()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid HEX color format")
    .optional(),
  custom_social_links: z
    .string()
    .refine((val) => {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed);
      } catch {
        return false;
      }
    }, "custom_social_links must be valid JSON array")
    .optional(),
  cv_file: z.string().optional(),
});

export type SettingsInput = z.infer<typeof settingsInputSchema>;

export class SettingsService {
  static async getSettings(): Promise<SettingsMap> {
    return await SettingsRepository.getCachedSettings();
  }

  static async updateSettings(entries: Record<string, string>): Promise<void> {
    await requireAdminAuth();

    const parsed = settingsInputSchema.safeParse(entries);
    if (!parsed.success) {
      throw new ValidationError("Invalid settings payload", parsed.error.flatten().fieldErrors);
    }

    const cleanedEntries: Record<string, string> = {};
    for (const [key, val] of Object.entries(parsed.data)) {
      if (val !== undefined && val !== null) {
        cleanedEntries[key] = val;
      }
    }

    await SettingsRepository.updateBatch(cleanedEntries);
  }
}
