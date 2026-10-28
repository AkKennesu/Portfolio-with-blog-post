import { NextResponse } from "next/server";
import { getPosts } from "@/lib/blog";

export const revalidate = 300; // 5 minutes ISR cache

export async function GET() {
  try {
    const posts = await getPosts();
    return NextResponse.json(
      { success: true, count: posts.length, data: posts },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
          "CDN-Cache-Control": "public, s-maxage=600",
          "Vercel-CDN-Cache-Control": "public, s-maxage=3600",
        },
      }
    );
  } catch (error) {
    console.error("API /api/posts error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

