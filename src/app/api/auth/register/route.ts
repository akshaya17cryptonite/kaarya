import { NextResponse } from "next/server";
import { registerWithPassword } from "@/modules/auth/service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, password, role } = body;

    const result = await registerWithPassword({
      name,
      phone,
      email,
      password,
      role,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: result.user }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request payload or server error." },
      { status: 500 }
    );
  }
}
