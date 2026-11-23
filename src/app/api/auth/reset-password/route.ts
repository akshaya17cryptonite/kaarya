import { NextResponse } from "next/server";
import { resetPasswordWithToken } from "@/modules/auth/service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    const result = await resetPasswordWithToken(token, newPassword);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Password reset successfully." }, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Server error resetting password." },
      { status: 500 }
    );
  }
}
