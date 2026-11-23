import { NextResponse } from "next/server";
import { requestPasswordReset } from "@/modules/auth/service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier } = body;

    const result = await requestPasswordReset(identifier);
    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, message: "Server error handling password reset request." },
      { status: 500 }
    );
  }
}
