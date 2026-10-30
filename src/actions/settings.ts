"use server";

import { SettingsService } from "@/services/settings.service";
import { type SettingsMap } from "@/repositories/settings.repo";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { ApiError } from "@/lib/errors";

export type { SettingsMap };

export const getSettings = unstable_cache(
  async (): Promise<SettingsMap> => {
    return await SettingsService.getSettings();
  },
  ["site-settings"],
  {
    tags: ["settings", "admin-unified-data"],
    revalidate: 300,
  }
);

export async function updateSettings(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const settingsToUpdate = [
      "about_me_1",
      "about_me_2",
      "primary_color",
      "custom_social_links",
      "cv_file",
    ];

    const entries: Record<string, string> = {};
    for (const key of settingsToUpdate) {
      const val = formData.get(key);
      if (val !== null && typeof val === "string") {
        entries[key] = val;
      }
    }

    await SettingsService.updateSettings(entries);

    revalidatePath("/");
    revalidatePath("/admin/settings");
    revalidatePath("/admin/dashboard");
    revalidateTag("admin-unified-data", "max");
    return { success: true };
  } catch (error) {
    console.error("Failed to update settings:", error);
    const message = error instanceof ApiError ? error.message : "Failed to update settings";
    return { success: false, error: message };
  }
}
