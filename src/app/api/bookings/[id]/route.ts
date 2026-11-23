import { NextResponse } from "next/server";
import { getBookingById, cancelBooking } from "@/modules/bookings/service";
import { getSession } from "@/modules/auth/service";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await getBookingById(params.id);
    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, booking }, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to retrieve booking." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, reason } = body;

    if (action === "CANCEL") {
      const res = await cancelBooking(
        params.id,
        reason || "Cancelled by user via API",
        session.role === "PROVIDER" ? "PROVIDER" : "CUSTOMER"
      );
      return NextResponse.json(res, { status: res.success ? 200 : 400 });
    }

    return NextResponse.json({ success: false, error: "Invalid action." }, { status: 400 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to update booking." },
      { status: 500 }
    );
  }
}
