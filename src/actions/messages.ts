"use server";

import { MessageRepository, type MessageItem } from "@/repositories/message.repo";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdminAuth } from "@/lib/auth";
import { ApiError } from "@/lib/errors";

export type Message = MessageItem;

export async function getMessages(): Promise<Message[]> {
  await requireAdminAuth();
  return await MessageRepository.findAll();
}

export async function toggleRead(id: number, status: boolean): Promise<void> {
  await requireAdminAuth();
  try {
    await MessageRepository.toggleRead(id, status);
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/messages");
    revalidateTag("admin-unified-data", "max");
  } catch (error) {
    console.error("Failed to toggle read status:", error);
    throw error;
  }
}

export async function toggleImportant(id: number, status: boolean): Promise<void> {
  await requireAdminAuth();
  try {
    await MessageRepository.toggleImportant(id, status);
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/messages");
    revalidateTag("admin-unified-data", "max");
  } catch (error) {
    console.error("Failed to toggle important status:", error);
    throw error;
  }
}

export async function deleteMessage(id: number): Promise<{ success: boolean; error?: string }> {
  await requireAdminAuth();
  try {
    await MessageRepository.delete(id);
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/messages");
    revalidateTag("admin-unified-data", "max");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete message:", error);
    const message = error instanceof ApiError ? error.message : "Deletion failed";
    return { success: false, error: message };
  }
}

/**
 * Single-query batch delete using ANY()
 */
export async function deleteMessages(ids: number[]): Promise<{ success: boolean; error?: string }> {
  await requireAdminAuth();
  try {
    if (!ids || ids.length === 0) return { success: true };

    await MessageRepository.deleteMany(ids);
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/messages");
    revalidateTag("admin-unified-data", "max");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete messages:", error);
    const message = error instanceof ApiError ? error.message : "Bulk deletion failed";
    return { success: false, error: message };
  }
}
