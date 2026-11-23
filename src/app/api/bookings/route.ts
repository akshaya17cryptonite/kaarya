import { NextResponse } from "next/server";
import { getSession } from "@/modules/auth/service";
import { createBooking } from "@/modules/bookings/service";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      where: session.role === "PROVIDER" ? { providerId: session.id } : { customerId: session.id },
      include: {
        service: true,
        provider: { include: { user: { include: { profile: true } } } },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, count: bookings.length, bookings }, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookings." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      serviceId,
      providerId,
      scheduledDate,
      timeSlot,
      streetAddress,
      landmark,
      postalCode,
      paymentMethod,
      customerNotes,
    } = body;

    if (!serviceId || !scheduledDate || !timeSlot || !streetAddress) {
      return NextResponse.json(
        { success: false, error: "Missing required booking fields (serviceId, scheduledDate, timeSlot, streetAddress)." },
        { status: 400 }
      );
    }

    const booking = await createBooking({
      customerId: session.id,
      providerId: providerId || "p1",
      serviceId,
      scheduledDate,
      timeSlot,
      streetAddress,
      landmark,
      postalCode,
      paymentMethod: paymentMethod === "CASH" ? "CASH" : "ONLINE",
      customerNotes,
    });

    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to create booking." },
      { status: 500 }
    );
  }
}
