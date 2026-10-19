import { MessageRepository } from "@/repositories/message.repo";
import { ValidationError } from "@/lib/errors";
import { z } from "zod";

export const contactMessageSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email cannot exceed 255 characters"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(5000, "Message cannot exceed 5000 characters"),
  honeypot: z.string().optional(),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;

export class ContactService {
  static async submitMessage(rawInput: unknown): Promise<{ success: boolean }> {
    const parsed = contactMessageSchema.safeParse(rawInput);
    if (!parsed.success) {
      throw new ValidationError("Validation failed. Please verify your inputs.", parsed.error.flatten().fieldErrors);
    }

    const { name, email, message, honeypot } = parsed.data;

    // Honeypot spam defense: If filled by automated bot, drop silently with success
    if (honeypot && honeypot.trim().length > 0) {
      console.warn("Honeypot field triggered; ignoring automated bot submission.");
      return { success: true };
    }

    await MessageRepository.create({ name, email, message });
    return { success: true };
  }
}
