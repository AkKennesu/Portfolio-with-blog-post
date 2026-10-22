import { CertificateRepository, type CertificateItem } from "@/repositories/certificate.repo";
import { requireAdminAuth } from "@/lib/auth";
import { ValidationError } from "@/lib/errors";
import { z } from "zod";

export const certificateInputSchema = z.object({
  year: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "Year must be a 4-digit number (e.g. 2024)")
    .refine((val) => {
      const yr = parseInt(val, 10);
      return yr >= 1970 && yr <= 2100;
    }, "Year must be between 1970 and 2100"),
  title: z.string().trim().min(1, "Title is required").max(200, "Title cannot exceed 200 characters"),
  subtitle: z.string().trim().min(1, "Subtitle is required").max(200, "Subtitle cannot exceed 200 characters"),
  description: z.string().trim().min(1, "Description is required"),
  image: z.string().trim().min(1, "Image URL or path is required"),
});

export type CertificateInput = z.infer<typeof certificateInputSchema>;

export class CertificateService {
  static async getAllCertificates(): Promise<CertificateItem[]> {
    return await CertificateRepository.findAll();
  }

  static async getCertificateById(id: number): Promise<CertificateItem | undefined> {
    return await CertificateRepository.findById(id);
  }

  static async createCertificate(rawInput: unknown): Promise<{ id: number }> {
    await requireAdminAuth();

    const parsed = certificateInputSchema.safeParse(rawInput);
    if (!parsed.success) {
      throw new ValidationError("Invalid certificate data", parsed.error.flatten().fieldErrors);
    }

    return await CertificateRepository.create(parsed.data);
  }

  static async updateCertificate(id: number, rawInput: unknown): Promise<void> {
    await requireAdminAuth();

    if (!id || typeof id !== "number") {
      throw new ValidationError("Valid certificate ID is required for updating");
    }

    const parsed = certificateInputSchema.safeParse(rawInput);
    if (!parsed.success) {
      throw new ValidationError("Invalid certificate data", parsed.error.flatten().fieldErrors);
    }

    await CertificateRepository.update(id, parsed.data);
  }

  static async deleteCertificate(id: number): Promise<void> {
    await requireAdminAuth();
    if (!id || typeof id !== "number") {
      throw new ValidationError("Valid certificate ID is required for deletion");
    }
    await CertificateRepository.delete(id);
  }

  static async deleteMultipleCertificates(ids: number[]): Promise<void> {
    await requireAdminAuth();
    if (!Array.isArray(ids) || ids.length === 0) {
      return;
    }
    await CertificateRepository.deleteMany(ids);
  }
}
