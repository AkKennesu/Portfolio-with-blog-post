"use server";

import { ContactService } from "@/services/contact.service";
import { ApiError } from "@/lib/errors";

export type ContactState = {
  success?: boolean;
  error?: string;
  fields?: Record<string, string>;
};

export async function submitContact(prevState: ContactState, formData: FormData): Promise<ContactState> {
  const rawData = {
    name: (formData.get("name") as string) || "",
    email: (formData.get("email") as string) || "",
    message: (formData.get("message") as string) || "",
    honeypot: (formData.get("website_bot") as string) || "",
  };

  try {
    await ContactService.submitMessage(rawData);
    return { success: true };
  } catch (error) {
    console.error("Error submitting contact message:", error);
    const message =
      error instanceof ApiError
        ? error.message
        : "Failed to send message. Please try again later.";

    return {
      error: message,
      fields: {
        name: rawData.name,
        email: rawData.email,
        message: rawData.message,
      },
    };
  }
}
