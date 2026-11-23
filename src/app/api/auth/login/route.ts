import { NextResponse } from "next/server";
import { loginWithPassword } from "@/modules/auth/service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    const result = await loginWithPassword({
      identifier,
      password,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 401 });
    }

    return NextResponse.json({ success: true, user: result.user }, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request payload or server error." },
      { status: 500 }
    );
  }
}
