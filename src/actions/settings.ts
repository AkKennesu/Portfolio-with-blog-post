"use server";

import { SettingsService } from "@/services/settings.service";
import { type SettingsMap } from "@/repositories/settings.repo";
import { revalidatePath } from "next/cache";
import { ApiError } from "@/lib/errors";

export type { SettingsMap };

export async function getSettings(): Promise<SettingsMap> {
  return await SettingsService.getSettings();
}

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
    return { success: true };
  } catch (error) {
    console.error("Failed to update settings:", error);
    const message = error instanceof ApiError ? error.message : "Failed to update settings";
    return { success: false, error: message };
  }
}
