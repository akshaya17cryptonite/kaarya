import { PrismaClient, UserRole, BookingStatus, PaymentStatus, PaymentMethod, ProviderVerificationStatus, KycDocumentType, PayoutStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting LocConnect database seed...");

  // Clean existing data in reverse order of foreign keys
  await prisma.message.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.kycDocument.deleteMany();
  await prisma.availabilitySlot.deleteMany();
  await prisma.providerService.deleteMany();
  await prisma.service.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Cleaned existing database records.");

  // ---------------------------------------------------------------------------
  // 1. ADMIN USER
  // ---------------------------------------------------------------------------
  const adminUser = await prisma.user.create({
    data: {
      authId: "auth-admin-001",
      email: "admin@locconnect.in",
      phone: "+919999900000",
      role: UserRole.ADMIN,
      profile: {
        create: {
          name: "LocConnect Super Admin",
          avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
          bio: "Platform Administrator & Operations Head",
        },
      },
    },
  });
  console.log(`👤 Admin created: ${adminUser.email}`);

  // ---------------------------------------------------------------------------
  // 2. CATEGORIES & SERVICES
  // ---------------------------------------------------------------------------
  const plumbingCategory = await prisma.category.create({
    data: {
      name: "Plumbing Services",
      slug: "plumber",
      description: "Fast, reliable plumbing solutions for leakages, pipe fittings, taps, and water tanks.",
      iconName: "Wrench",
      imageUrl: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80",
      displayOrder: 1,
      services: {
        create: [
          {
            name: "Tap & Shower Repair",
            slug: "tap-shower-repair",
            description: "Fix leaking taps, loose faucets, low shower water pressure, and nozzle blockages.",
            basePrice: 199,
            estimatedDurationMinutes: 45,
            imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80",
          },
          {
            name: "Pipe Leakage & Drainage Repair",
            slug: "pipe-leakage-repair",
            description: "Thorough inspection and heavy-duty seal or replacement for underground or concealed PVC/GI pipe leakages.",
            basePrice: 349,
            estimatedDurationMinutes: 60,
            imageUrl: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80",
          },
          {
            name: "Toilet & Washbasin Fitting",
            slug: "toilet-fitting",
            description: "Installation or replacement of western/Indian commodes, flush tanks, jets, and ceramic washbasins.",
            basePrice: 499,
            estimatedDurationMinutes: 90,
            imageUrl: "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=600&q=80",
          },
          {
            name: "Water Tank Deep Cleaning",
            slug: "water-tank-cleaning",
            description: "Complete mechanized de-watering, sludge removal, high-pressure washing, and UV disinfection (up to 1000L).",
            basePrice: 899,
            estimatedDurationMinutes: 120,
            imageUrl: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80",
          },
        ],
      },
    },
    include: { services: true },
  });

  const electricalCategory = await prisma.category.create({
    data: {
      name: "Electrical Services",
      slug: "electrician",
      description: "Certified electricians for fan installations, short circuits, switchboards, and wiring.",
      iconName: "Zap",
      imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
      displayOrder: 2,
      services: {
        create: [
          {
            name: "Ceiling Fan Installation & Repair",
            slug: "ceiling-fan-repair",
            description: "Installation of new ceiling or exhaust fans, capacitor changes, regulator fixes, and noise elimination.",
            basePrice: 149,
            estimatedDurationMinutes: 45,
            imageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80",
          },
          {
            name: "Switchboard & Socket Replacement",
            slug: "switchboard-replacement",
            description: "Replacement or repair of modular switch plates, burnt sockets, dimmer switches, and indicators.",
            basePrice: 199,
            estimatedDurationMinutes: 30,
            imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80",
          },
          {
            name: "MCB & Fuse Short Circuit Fix",
            slug: "mcb-fuse-repair",
            description: "Locating internal short circuits, replacing tripping MCBs, and main distribution board overhaul.",
            basePrice: 399,
            estimatedDurationMinutes: 60,
            imageUrl: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=600&q=80",
          },
          {
            name: "House Inverter & Battery Wiring",
            slug: "inverter-wiring",
            description: "Safe wiring setup, load distribution, and battery electrolyte check for home backup inverters.",
            basePrice: 699,
            estimatedDurationMinutes: 90,
            imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
          },
        ],
      },
    },
    include: { services: true },
  });

  const cleaningCategory = await prisma.category.create({
    data: {
      name: "Home Cleaning Services",
      slug: "cleaner",
      description: "Professional deep cleaning with hospital-grade sanitizers and mechanized scrubbers.",
      iconName: "Sparkles",
      imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
      displayOrder: 3,
      services: {
        create: [
          {
            name: "Full Home Deep Cleaning (2 BHK)",
            slug: "full-home-cleaning-2bhk",
            description: "Intensive cleaning of all rooms, balconies, kitchen, bathrooms, windows, and floors with single-disc scrubbers.",
            basePrice: 1699,
            estimatedDurationMinutes: 240,
            imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80",
          },
          {
            name: "Intensive Bathroom Cleaning",
            slug: "bathroom-deep-cleaning",
            description: "Removal of hard water stains, tile descaling, commode sanitization, tap buffing, and mirror polishing.",
            basePrice: 499,
            estimatedDurationMinutes: 60,
            imageUrl: "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=600&q=80",
          },
          {
            name: "Modular Kitchen Degreasing & Cleaning",
            slug: "kitchen-deep-cleaning",
            description: "Heavy oil and grease removal from chimney filters, exhaust fan, cabinets, countertop, and floor.",
            basePrice: 799,
            estimatedDurationMinutes: 90,
            imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80",
          },
          {
            name: "Sofa & Carpet Shampooing",
            slug: "sofa-carpet-shampooing",
            description: "Dry vacuuming followed by specialized injection-extraction wet shampooing for fabric and leather sofas.",
            basePrice: 699,
            estimatedDurationMinutes: 75,
            imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80",
          },
        ],
      },
    },
    include: { services: true },
  });

  console.log(`📁 3 Categories created with ${plumbingCategory.services.length + electricalCategory.services.length + cleaningCategory.services.length} services.`);

  // ---------------------------------------------------------------------------
  // 3. SERVICE PROVIDERS IN NOIDA
  // ---------------------------------------------------------------------------
  // Provider 1: Ramesh Verma (Plumber - Sector 62, Noida)
  const provider1User = await prisma.user.create({
    data: {
      authId: "auth-provider-001",
      email: "ramesh.plumber@example.com",
      phone: "+919810111222",
      role: UserRole.PROVIDER,
      profile: {
        create: {
          name: "Ramesh Verma",
          avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
          bio: "Certified Master Plumber with 8+ years of residential and commercial experience in Noida & Indirapuram.",
        },
      },
      provider: {
        create: {
          experienceYears: 8,
          verificationStatus: ProviderVerificationStatus.VERIFIED,
          serviceRadiusKm: 15.0,
          latitude: 28.628,
          longitude: 77.368, // Sector 62, Noida
          currentAddress: "C-56/28, Sector 62, Noida, Uttar Pradesh, 201309",
          isAvailable: true,
          averageRating: 4.8,
          totalReviews: 42,
          totalCompletedJobs: 184,
          bankAccountNumber: "918273645012",
          bankIfscCode: "HDFC0001234",
          bankAccountName: "Ramesh Verma",
          upiId: "ramesh.verma@okhdfcbank",
          kycDocuments: {
            create: [
              {
                documentType: KycDocumentType.AADHAAR,
                documentNumber: "XXXX-XXXX-4589",
                fileUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
                verificationStatus: ProviderVerificationStatus.VERIFIED,
              },
              {
                documentType: KycDocumentType.PAN,
                documentNumber: "ABCDE1234F",
                fileUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
                verificationStatus: ProviderVerificationStatus.VERIFIED,
              },
            ],
          },
          availabilitySlots: {
            create: [1, 2, 3, 4, 5, 6].flatMap((day) => [
              { dayOfWeek: day, startTime: "09:00", endTime: "12:00" },
              { dayOfWeek: day, startTime: "14:00", endTime: "18:00" },
            ]),
          },
        },
      },
    },
    include: { provider: true },
  });

  // Link services to Provider 1
  for (const s of plumbingCategory.services) {
    await prisma.providerService.create({
      data: {
        providerId: provider1User.provider!.id,
        serviceId: s.id,
        customPrice: s.basePrice,
        isAvailable: true,
      },
    });
  }

  // Provider 2: Suresh Sharma (Electrician - Sector 18, Noida)
  const provider2User = await prisma.user.create({
    data: {
      authId: "auth-provider-002",
      email: "suresh.electric@example.com",
      phone: "+919810333444",
      role: UserRole.PROVIDER,
      profile: {
        create: {
          name: "Suresh Sharma",
          avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
          bio: "Govt-licensed wireman & electrician with 10 years experience solving circuit trips and complex fittings.",
        },
      },
      provider: {
        create: {
          experienceYears: 10,
          verificationStatus: ProviderVerificationStatus.VERIFIED,
          serviceRadiusKm: 20.0,
          latitude: 28.5708,
          longitude: 77.326, // Sector 18, Noida
          currentAddress: "Shop 14, Atta Market, Sector 18, Noida, Uttar Pradesh, 201301",
          isAvailable: true,
          averageRating: 4.9,
          totalReviews: 67,
          totalCompletedJobs: 312,
          bankAccountNumber: "50100234567890",
          bankIfscCode: "ICIC0000021",
          bankAccountName: "Suresh Sharma",
          upiId: "sureshsharma@okaxis",
          kycDocuments: {
            create: [
              {
                documentType: KycDocumentType.AADHAAR,
                documentNumber: "XXXX-XXXX-9123",
                fileUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
                verificationStatus: ProviderVerificationStatus.VERIFIED,
              },
            ],
          },
          availabilitySlots: {
            create: [1, 2, 3, 4, 5, 6].flatMap((day) => [
              { dayOfWeek: day, startTime: "08:30", endTime: "13:00" },
              { dayOfWeek: day, startTime: "14:30", endTime: "19:00" },
            ]),
          },
        },
      },
    },
    include: { provider: true },
  });

  for (const s of electricalCategory.services) {
    await prisma.providerService.create({
      data: {
        providerId: provider2User.provider!.id,
        serviceId: s.id,
        customPrice: s.basePrice,
        isAvailable: true,
      },
    });
  }

  // Provider 3: Sunita Devi (Cleaning Specialist - Sector 137, Noida)
  const provider3User = await prisma.user.create({
    data: {
      authId: "auth-provider-003",
      email: "sunita.clean@example.com",
      phone: "+919810555666",
      role: UserRole.PROVIDER,
      profile: {
        create: {
          name: "Sunita Devi & Team",
          avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
          bio: "Specialized in high-rise society deep cleaning in Noida Expressway sectors (137, 143, 93) with eco-friendly solutions.",
        },
      },
      provider: {
        create: {
          experienceYears: 6,
          verificationStatus: ProviderVerificationStatus.VERIFIED,
          serviceRadiusKm: 18.0,
          latitude: 28.5042,
          longitude: 77.4116, // Sector 137, Noida Expressway
          currentAddress: "Tower 4, Paras Tierea, Sector 137, Noida, Uttar Pradesh, 201305",
          isAvailable: true,
          averageRating: 4.7,
          totalReviews: 35,
          totalCompletedJobs: 140,
          bankAccountNumber: "00123456789012",
          bankIfscCode: "SBIN0004567",
          bankAccountName: "Sunita Devi",
          upiId: "sunita.clean@paytm",
          kycDocuments: {
            create: [
              {
                documentType: KycDocumentType.AADHAAR,
                documentNumber: "XXXX-XXXX-7788",
                fileUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
                verificationStatus: ProviderVerificationStatus.VERIFIED,
              },
            ],
          },
          availabilitySlots: {
            create: [1, 2, 3, 4, 5, 6, 0].flatMap((day) => [
              { dayOfWeek: day, startTime: "09:00", endTime: "14:00" },
              { dayOfWeek: day, startTime: "15:00", endTime: "19:00" },
            ]),
          },
        },
      },
    },
    include: { provider: true },
  });

  for (const s of cleaningCategory.services) {
    await prisma.providerService.create({
      data: {
        providerId: provider3User.provider!.id,
        serviceId: s.id,
        customPrice: s.basePrice,
        isAvailable: true,
      },
    });
  }

  // Provider 4: Imran Khan (Plumbing & Electrical - Indirapuram / Noida Border)
  const provider4User = await prisma.user.create({
    data: {
      authId: "auth-provider-004",
      email: "imran.services@example.com",
      phone: "+919810777888",
      role: UserRole.PROVIDER,
      profile: {
        create: {
          name: "Imran Khan",
          avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
          bio: "Dual-skilled technician handling urgent plumbing leaks and electrical switchboard / appliance repairs.",
        },
      },
      provider: {
        create: {
          experienceYears: 5,
          verificationStatus: ProviderVerificationStatus.VERIFIED,
          serviceRadiusKm: 12.0,
          latitude: 28.641,
          longitude: 77.375, // Indirapuram / Sector 62 border
          currentAddress: "Gyan Khand 1, Indirapuram, Ghaziabad / Noida Border, 201014",
          isAvailable: true,
          averageRating: 4.6,
          totalReviews: 28,
          totalCompletedJobs: 95,
          bankAccountNumber: "12345678901234",
          bankIfscCode: "PUNB0123400",
          bankAccountName: "Imran Khan",
          upiId: "imrankhan@ybl",
        },
      },
    },
    include: { provider: true },
  });

  // Imran does tap repair and ceiling fan repair
  await prisma.providerService.create({
    data: {
      providerId: provider4User.provider!.id,
      serviceId: plumbingCategory.services[0].id,
      customPrice: 199,
      isAvailable: true,
    },
  });
  await prisma.providerService.create({
    data: {
      providerId: provider4User.provider!.id,
      serviceId: electricalCategory.services[0].id,
      customPrice: 149,
      isAvailable: true,
    },
  });

  console.log("🛠️ 4 Verified Providers seeded in Noida (Sector 62, Sector 18, Sector 137, Indirapuram).");

  // ---------------------------------------------------------------------------
  // 4. CUSTOMERS & SAVED ADDRESSES
  // ---------------------------------------------------------------------------
  const customer1User = await prisma.user.create({
    data: {
      authId: "auth-customer-001",
      email: "rohit.mehta@example.com",
      phone: "+919811122233",
      role: UserRole.CUSTOMER,
      profile: {
        create: {
          name: "Rohit Mehta",
          avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80",
          bio: "Resident in Sector 62, Noida",
        },
      },
      addresses: {
        create: [
          {
            label: "Home",
            streetAddress: "Flat 402, Stellar Park Apartments, C-Block",
            landmark: "Near Fortis Hospital",
            city: "Noida",
            state: "Uttar Pradesh",
            postalCode: "201309",
            latitude: 28.625,
            longitude: 77.365,
            isDefault: true,
          },
        ],
      },
    },
    include: { addresses: true },
  });

  const customer2User = await prisma.user.create({
    data: {
      authId: "auth-customer-002",
      email: "priya.sen@example.com",
      phone: "+919811144455",
      role: UserRole.CUSTOMER,
      profile: {
        create: {
          name: "Priya Sen",
          avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
          bio: "IT Professional in Sector 18, Noida",
        },
      },
      addresses: {
        create: [
          {
            label: "Home",
            streetAddress: "House 28, Sector 19",
            landmark: "Behind Max Hospital",
            city: "Noida",
            state: "Uttar Pradesh",
            postalCode: "201301",
            latitude: 28.575,
            longitude: 77.329,
            isDefault: true,
          },
        ],
      },
    },
    include: { addresses: true },
  });

  console.log("👥 2 Customers with Noida addresses seeded.");

  // ---------------------------------------------------------------------------
  // 5. REALISTIC BOOKINGS WITH PAYMENTS, REVIEWS, & PAYOUTS
  // ---------------------------------------------------------------------------
  // Booking 1: COMPLETED (Tap Repair by Ramesh Verma for Rohit Mehta)
  const booking1 = await prisma.booking.create({
    data: {
      bookingNumber: "BK-202610-001",
      customerId: customer1User.id,
      providerId: provider1User.provider!.id,
      serviceId: plumbingCategory.services[0].id, // Tap Repair
      addressId: customer1User.addresses[0].id,
      status: BookingStatus.COMPLETED,
      scheduledDate: new Date("2026-10-18T10:00:00Z"),
      timeSlot: "10:00 AM - 12:00 PM",
      customerNotes: "Bathroom mixer tap is leaking continuously.",
      servicePrice: 199,
      platformFee: 30, // 15% of 199 rounded
      taxAmount: 5,   // GST on fee
      totalAmount: 204,
      payment: {
        create: {
          amount: 204,
          currency: "INR",
          method: PaymentMethod.ONLINE,
          status: PaymentStatus.PAID,
          razorpayOrderId: "order_mock_001",
          razorpayPaymentId: "pay_mock_001",
          razorpaySignature: "sig_mock_001",
          paidAt: new Date("2026-10-18T09:45:00Z"),
        },
      },
      payout: {
        create: {
          providerId: provider1User.provider!.id,
          grossAmount: 199,
          platformFee: 30,
          netPayout: 169,
          status: PayoutStatus.COMPLETED,
          payoutReference: "pout_mock_001",
        },
      },
      review: {
        create: {
          customerId: customer1User.id,
          providerId: provider1User.provider!.id,
          rating: 5,
          comment: "Ramesh arrived on time and fixed the tap in 20 minutes with high-quality washers. Very professional!",
          providerReply: "Thank you Rohit ji! Happy to help.",
        },
      },
    },
  });

  // Booking 2: IN_PROGRESS (Switchboard replacement by Suresh Sharma for Priya Sen)
  const booking2 = await prisma.booking.create({
    data: {
      bookingNumber: "BK-202610-002",
      customerId: customer2User.id,
      providerId: provider2User.provider!.id,
      serviceId: electricalCategory.services[1].id, // Switchboard replacement
      addressId: customer2User.addresses[0].id,
      status: BookingStatus.IN_PROGRESS,
      scheduledDate: new Date(),
      timeSlot: "02:00 PM - 04:00 PM",
      customerNotes: "Bedroom switchboard sparkling when turning on AC.",
      servicePrice: 199,
      platformFee: 30,
      taxAmount: 5,
      totalAmount: 204,
      payment: {
        create: {
          amount: 204,
          currency: "INR",
          method: PaymentMethod.ONLINE,
          status: PaymentStatus.PAID,
          razorpayOrderId: "order_mock_002",
          razorpayPaymentId: "pay_mock_002",
          razorpaySignature: "sig_mock_002",
          paidAt: new Date(),
        },
      },
    },
  });

  // Booking 3: ACCEPTED (Full Home Deep Cleaning by Sunita Devi for Rohit Mehta)
  const booking3 = await prisma.booking.create({
    data: {
      bookingNumber: "BK-202610-003",
      customerId: customer1User.id,
      providerId: provider3User.provider!.id,
      serviceId: cleaningCategory.services[0].id, // Full Home Deep Cleaning
      addressId: customer1User.addresses[0].id,
      status: BookingStatus.ACCEPTED,
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      timeSlot: "09:00 AM - 01:00 PM",
      customerNotes: "Please bring machine for floor scrubbing.",
      servicePrice: 1699,
      platformFee: 255,
      taxAmount: 46,
      totalAmount: 1745,
      payment: {
        create: {
          amount: 1745,
          currency: "INR",
          method: PaymentMethod.CASH,
          status: PaymentStatus.PENDING,
        },
      },
    },
  });

  // Booking 4: REQUESTED (Water Tank Cleaning by Ramesh Verma for Priya Sen)
  const booking4 = await prisma.booking.create({
    data: {
      bookingNumber: "BK-202610-004",
      customerId: customer2User.id,
      providerId: provider1User.provider!.id,
      serviceId: plumbingCategory.services[3].id, // Water Tank Cleaning
      addressId: customer2User.addresses[0].id,
      status: BookingStatus.REQUESTED,
      scheduledDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // Day after tomorrow
      timeSlot: "10:00 AM - 12:00 PM",
      customerNotes: "Rooftop Sintex tank 1000L.",
      servicePrice: 899,
      platformFee: 135,
      taxAmount: 24,
      totalAmount: 923,
      payment: {
        create: {
          amount: 923,
          currency: "INR",
          method: PaymentMethod.ONLINE,
          status: PaymentStatus.PENDING,
          razorpayOrderId: "order_mock_004",
        },
      },
    },
  });

  console.log(`📋 4 Bookings seeded across states (COMPLETED: ${booking1.bookingNumber}, IN_PROGRESS: ${booking2.bookingNumber}, ACCEPTED: ${booking3.bookingNumber}, REQUESTED: ${booking4.bookingNumber}).`);

  // ---------------------------------------------------------------------------
  // 6. SAMPLE NOTIFICATIONS
  // ---------------------------------------------------------------------------
  await prisma.notification.createMany({
    data: [
      {
        userId: customer1User.id,
        title: "Booking Confirmed",
        message: "Sunita Devi & Team has accepted your booking for tomorrow at 09:00 AM.",
        type: "BOOKING",
        link: `/bookings/${booking3.id}`,
      },
      {
        userId: provider1User.id,
        title: "New Booking Request",
        message: "You have received a new Water Tank Cleaning request for Sector 19, Noida.",
        type: "BOOKING",
        link: `/provider/jobs/${booking4.id}`,
      },
    ],
  });

  console.log("🔔 Sample notifications seeded.");
  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
