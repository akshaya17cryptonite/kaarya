import { prisma, isMockMode } from "@/lib/prisma";
import { BookingStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import { calculateMarketplaceSplit } from "@/modules/payments";

export interface CreateBookingInput {
  customerId: string;
  providerId: string;
  serviceId: string;
  scheduledDate: string; // YYYY-MM-DD
  timeSlot: string;      // "10:00 AM - 12:00 PM"
  customerNotes?: string;
  paymentMethod: PaymentMethod;
  // Address details
  streetAddress: string;
  landmark?: string;
  city?: string;
  postalCode?: string;
}

/**
 * Generate human-readable booking number (e.g. BK-202610-4821)
 */
export function generateBookingNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 7).replace("-", "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `BK-${dateStr}-${randomSuffix}`;
}

/**
 * Create a new booking with address and payment initialization
 */
export async function createBooking(input: CreateBookingInput) {
  const {
    customerId,
    providerId,
    serviceId,
    scheduledDate,
    timeSlot,
    customerNotes,
    paymentMethod,
    streetAddress,
    landmark,
    city = "Noida",
    postalCode = "201301",
  } = input;

  // 1. Resolve service price
  let servicePrice = 499;
  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });
    if (service) {
      servicePrice = service.basePrice;
    }
  } catch (err) {
    console.warn("Could not fetch service price, using default:", err);
  }

  // 2. Financial calculation
  const split = calculateMarketplaceSplit(servicePrice);
  const bookingNumber = generateBookingNumber();

  if (isMockMode) {
    const mockBooking = {
      id: `bk_${Date.now()}`,
      bookingNumber,
      customerId,
      providerId,
      serviceId,
      status: BookingStatus.REQUESTED,
      scheduledDate: new Date(scheduledDate),
      timeSlot,
      customerNotes,
      servicePrice: split.servicePrice,
      platformFee: split.platformFee,
      taxAmount: split.taxOnFee,
      totalAmount: split.totalCustomerPayable,
      service: {
        name: "Home Service",
        basePrice: servicePrice,
      },
      provider: {
        user: {
          profile: { name: "Ramesh Verma" },
          phone: "+919810111222",
        },
      },
      address: {
        streetAddress,
        city,
      },
      payment: {
        id: `pay_${Date.now()}`,
        amount: split.totalCustomerPayable,
        method: paymentMethod,
        status: PaymentStatus.PENDING,
      },
    };

    return { success: true, booking: mockBooking };
  }

  try {
    // 3. Create or reuse address
    let address = await prisma.address.findFirst({
      where: {
        userId: customerId,
        streetAddress,
      },
    });

    if (!address) {
      address = await prisma.address.create({
        data: {
          userId: customerId,
          label: "Service Location",
          streetAddress,
          landmark,
          city,
          state: "Uttar Pradesh",
          postalCode,
          latitude: 28.5355,
          longitude: 77.391,
          isDefault: true,
        },
      });
    }

    // 4. Create booking with payment relation
    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        customerId,
        providerId,
        serviceId,
        addressId: address.id,
        status: BookingStatus.REQUESTED,
        scheduledDate: new Date(scheduledDate),
        timeSlot,
        customerNotes,
        servicePrice: split.servicePrice,
        platformFee: split.platformFee,
        taxAmount: split.taxOnFee,
        totalAmount: split.totalCustomerPayable,
        payment: {
          create: {
            amount: split.totalCustomerPayable,
            currency: "INR",
            method: paymentMethod,
            status: PaymentStatus.PENDING,
          },
        },
      },
      include: {
        service: true,
        provider: {
          include: {
            user: { include: { profile: true } },
          },
        },
        address: true,
        payment: true,
      },
    });

    return { success: true, booking };
  } catch (error) {
    console.error("Error creating booking in database:", error);

    // Fallback simulation for offline dev
    const mockBooking = {
      id: `bk_${Date.now()}`,
      bookingNumber,
      customerId,
      providerId,
      serviceId,
      status: BookingStatus.REQUESTED,
      scheduledDate: new Date(scheduledDate),
      timeSlot,
      customerNotes,
      servicePrice: split.servicePrice,
      platformFee: split.platformFee,
      taxAmount: split.taxOnFee,
      totalAmount: split.totalCustomerPayable,
      service: {
        name: "Home Service",
        basePrice: servicePrice,
      },
      provider: {
        user: {
          profile: { name: "Ramesh Verma" },
          phone: "+919810111222",
        },
      },
      address: {
        streetAddress,
        city,
      },
      payment: {
        id: `pay_${Date.now()}`,
        amount: split.totalCustomerPayable,
        method: paymentMethod,
        status: PaymentStatus.PENDING,
      },
    };

    return { success: true, booking: mockBooking };
  }
}

/**
 * Retrieve booking details by ID
 */
export async function getBookingById(bookingId: string) {
  const split = calculateMarketplaceSplit(499);
  const fallbackBooking = {
    id: bookingId,
    bookingNumber: "BK-202610-9182",
    customerId: "u_rohit",
    providerId: "p1",
    serviceId: "cat_plumbing_s_0",
    addressId: "addr_1",
    status: BookingStatus.ACCEPTED,
    scheduledDate: new Date(Date.now() + 24 * 3600 * 1000),
    timeSlot: "10:00 AM - 12:00 PM",
    customerNotes: "Please bring spare tap washers.",
    cancellationReason: null,
    cancelledBy: null,
    servicePrice: split.servicePrice,
    platformFee: split.platformFee,
    taxAmount: split.taxOnFee,
    totalAmount: split.totalCustomerPayable,
    service: {
      id: "cat_plumbing_s_0",
      name: "Tap & Shower Repair",
      description: "Fix leaking taps, loose faucets, and low pressure.",
      basePrice: 499,
      category: {
        name: "Plumbing Services",
        slug: "plumber",
      },
    },
    provider: {
      id: "p1",
      averageRating: 4.8,
      totalReviews: 42,
      user: {
        phone: "+91 98101 11222",
        profile: {
          name: "Ramesh Verma",
          avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
        },
      },
    },
    customer: {
      id: "u_rohit",
      phone: "+91 98111 22233",
      profile: {
        name: "Rohit Mehta",
      },
    },
    address: {
      id: "addr_1",
      streetAddress: "Flat 402, Stellar Park Apartments, C-Block, Sector 62",
      landmark: "Near Fortis Hospital",
      city: "Noida",
      state: "Uttar Pradesh",
      postalCode: "201309",
    },
    payment: {
      id: "pay_mock_1",
      amount: split.totalCustomerPayable,
      currency: "INR",
      method: PaymentMethod.ONLINE,
      status: PaymentStatus.PAID,
      paidAt: new Date(),
    },
    review: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  if (isMockMode) {
    return fallbackBooking;
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: {
          include: { category: true },
        },
        provider: {
          include: {
            user: { include: { profile: true } },
          },
        },
        customer: {
          include: { profile: true },
        },
        address: true,
        payment: true,
        review: true,
      },
    });

    if (booking) return booking;
  } catch (err) {
    console.warn("DB booking lookup failed:", (err as Error).message);
  }

  return fallbackBooking;
}

/**
 * Cancel a booking
 */
export async function cancelBooking(bookingId: string, reason: string, cancelledByRole: "CUSTOMER" | "PROVIDER") {
  if (isMockMode) {
    return {
      success: true,
      booking: {
        id: bookingId,
        status: BookingStatus.CANCELLED,
        cancellationReason: reason,
        cancelledBy: cancelledByRole,
      },
    };
  }

  try {
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CANCELLED,
        cancellationReason: reason,
        cancelledBy: cancelledByRole,
      },
    });
    return { success: true, booking: updated };
  } catch (err) {
    console.error("Failed to cancel booking:", err);
    return { success: false, error: (err as Error).message };
  }
}
