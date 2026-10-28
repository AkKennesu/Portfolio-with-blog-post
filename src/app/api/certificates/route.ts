import { NextResponse } from "next/server";
import { getCertificates } from "@/lib/certificates";

export const revalidate = 300; // 5 minutes ISR cache

export async function GET() {
  try {
    const certificates = await getCertificates();
    return NextResponse.json(
      { success: true, count: certificates.length, data: certificates },
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
    console.error("API /api/certificates error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch certificates" },
      { status: 500 }
    );
  }
}

