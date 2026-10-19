"use server";

import { CertificateService } from "@/services/certificate.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/errors";

export async function createCertificate(formData: FormData) {
  let success = false;
  try {
    const rawData = {
      year: formData.get("year") as string,
      title: formData.get("title") as string,
      subtitle: formData.get("subtitle") as string,
      description: formData.get("description") as string,
      image: formData.get("image") as string,
    };

    await CertificateService.createCertificate(rawData);
    success = true;
  } catch (error) {
    console.error("Failed to create certificate:", error);
    const message = error instanceof ApiError ? error.message : "Failed to create certificate. Please try again.";
    return { error: message };
  }

  if (success) {
    revalidatePath("/");
    revalidatePath("/admin/certificates");
    redirect("/admin/certificates");
  }
}

export async function updateCertificate(id: number, formData: FormData) {
  let success = false;
  try {
    const rawData = {
      year: formData.get("year") as string,
      title: formData.get("title") as string,
      subtitle: formData.get("subtitle") as string,
      description: formData.get("description") as string,
      image: formData.get("image") as string,
    };

    await CertificateService.updateCertificate(id, rawData);
    success = true;
  } catch (error) {
    console.error("Failed to update certificate:", error);
    const message = error instanceof ApiError ? error.message : "Failed to update certificate. Please try again.";
    return { error: message };
  }

  if (success) {
    revalidatePath("/");
    revalidatePath("/admin/certificates");
    redirect("/admin/certificates");
  }
}

export async function deleteCertificate(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    await CertificateService.deleteCertificate(id);
    revalidatePath("/");
    revalidatePath("/admin/certificates");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete certificate:", error);
    const message = error instanceof ApiError ? error.message : "Deletion failed. Please try again.";
    return { success: false, error: message };
  }
}

/**
 * Single-query batch deletion using ANY()
 */
export async function deleteCertificates(ids: number[]): Promise<{ success: boolean; error?: string }> {
  try {
    if (!ids || ids.length === 0) return { success: true };

    await CertificateService.deleteMultipleCertificates(ids);

    revalidatePath("/");
    revalidatePath("/admin/certificates");
    return { success: true };
  } catch (error) {
    console.error("Failed to batch delete certificates:", error);
    const message = error instanceof ApiError ? error.message : "Bulk deletion failed. Please try again.";
    return { success: false, error: message };
  }
}
