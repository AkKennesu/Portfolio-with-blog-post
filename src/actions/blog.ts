"use server";

import { BlogService } from "@/services/blog.service";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/errors";

export async function createPost(formData: FormData) {
  let success = false;
  try {
    const rawData = {
      title: formData.get("title") as string,
      slug: formData.get("slug") as string,
      excerpt: formData.get("excerpt") as string,
      date: formData.get("date") as string,
      content: formData.get("content") as string,
      cover_image: (formData.get("cover_image") as string) || "",
    };

    await BlogService.createPost(rawData);
    success = true;
  } catch (error) {
    console.error("Failed to create post:", error);
    const message = error instanceof ApiError ? error.message : "Failed to create post. Please try again.";
    return { error: message };
  }

  if (success) {
    revalidatePath("/blog");
    revalidatePath("/admin/dashboard");
    revalidatePath("/");
    revalidateTag("blog-posts");
    revalidateTag("admin-unified-data");
    redirect("/admin/dashboard?tab=blog");
  }
}

export async function updatePost(id: number, formData: FormData) {
  let success = false;
  let newSlug = "";
  try {
    const rawData = {
      title: formData.get("title") as string,
      slug: formData.get("slug") as string,
      excerpt: formData.get("excerpt") as string,
      date: formData.get("date") as string,
      content: formData.get("content") as string,
      cover_image: (formData.get("cover_image") as string) || "",
    };

    const result = await BlogService.updatePost(id, rawData);
    newSlug = result.slug;
    success = true;
  } catch (error) {
    console.error("Failed to update post:", error);
    const message = error instanceof ApiError ? error.message : "Failed to update post. Please try again.";
    return { error: message };
  }

  if (success) {
    revalidatePath("/blog");
    if (newSlug) {
      revalidatePath(`/blog/${newSlug}`);
      revalidateTag(`blog-post-${newSlug}`);
    }
    revalidatePath("/admin/dashboard");
    revalidatePath("/");
    revalidateTag("blog-posts");
    revalidateTag("admin-unified-data");
    redirect("/admin/dashboard?tab=blog");
  }
}

export async function deletePost(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    await BlogService.deletePost(id);
    revalidatePath("/blog");
    revalidatePath("/admin/dashboard");
    revalidatePath("/");
    revalidateTag("blog-posts");
    revalidateTag("admin-unified-data");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete post:", error);
    const message = error instanceof ApiError ? error.message : "Deletion failed. Please try again.";
    return { success: false, error: message };
  }
}

/**
 * Single-query batch deletion using ANY()
 */
export async function deletePosts(ids: number[]): Promise<{ success: boolean; error?: string }> {
  try {
    if (!ids || ids.length === 0) return { success: true };

    await BlogService.deleteMultiplePosts(ids);

    revalidatePath("/blog");
    revalidatePath("/admin/dashboard");
    revalidatePath("/");
    revalidateTag("blog-posts");
    revalidateTag("admin-unified-data");
    return { success: true };
  } catch (error) {
    console.error("Failed to batch delete posts:", error);
    const message = error instanceof ApiError ? error.message : "Bulk deletion failed. Please try again.";
    return { success: false, error: message };
  }
}
