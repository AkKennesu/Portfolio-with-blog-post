import { NextResponse } from "next/server";
import { ContactService } from "@/services/contact.service";
import { ApiError } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await ContactService.submitMessage(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("API /api/contact error:", error);
    if (error instanceof ApiError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code, details: error.details },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
