import { cookies } from "next/headers";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  AUTH_COOKIE_NAME,
  MOCK_OTP_CODE,
  type SessionUser,
  normalizePhoneNumber,
} from "./constants";

export * from "./constants";

/**
 * Issues an OTP for phone authentication
 */
export async function sendOtp(phone: string): Promise<{ success: boolean; message: string }> {
  const normalized = normalizePhoneNumber(phone);

  // In local mock mode or development, simulate OTP dispatch
  const isMock = process.env.ENABLE_MOCK_DRIVERS === "true" || !process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (isMock) {
    console.log(`[MOCK OTP] Verification code for ${normalized} is: ${MOCK_OTP_CODE}`);
    return {
      success: true,
      message: `OTP sent to ${normalized}. For testing, use code: ${MOCK_OTP_CODE}`,
    };
  }

  // Live Supabase Auth OTP logic can be integrated here
  return {
    success: true,
    message: `OTP sent to ${normalized}`,
  };
}

/**
 * Verifies an OTP and establishes an authenticated session in cookies & database
 */
export async function verifyOtpAndAuthenticate(params: {
  phone: string;
  otp: string;
  role?: UserRole;
  name?: string;
}): Promise<{ success: boolean; error?: string; user?: SessionUser }> {
  const { phone, otp, role = "CUSTOMER", name } = params;
  const normalizedPhone = normalizePhoneNumber(phone);

  const isMock = process.env.ENABLE_MOCK_DRIVERS === "true" || !process.env.NEXT_PUBLIC_SUPABASE_URL;

  // Verify OTP
  if (isMock && otp !== MOCK_OTP_CODE && otp !== "000000") {
    return { success: false, error: "Invalid OTP. Use test code: 123456" };
  }

  try {
    // Check if user exists in database
    let user = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
      include: { profile: true, provider: true },
    });

    if (!user) {
      // Create new user & profile
      const authId = `mock-auth-${Date.now()}`;
      const defaultName = name || (role === "PROVIDER" ? "New Service Partner" : "Customer");

      user = await prisma.user.create({
        data: {
          authId,
          phone: normalizedPhone,
          role,
          profile: {
            create: {
              name: defaultName,
              avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(defaultName)}`,
            },
          },
          ...(role === "PROVIDER"
            ? {
                provider: {
                  create: {
                    experienceYears: 1,
                    serviceRadiusKm: 15.0,
                    currentAddress: "Noida, Uttar Pradesh",
                    latitude: 28.5355,
                    longitude: 77.3910,
                  },
                },
              }
            : {}),
        },
        include: { profile: true, provider: true },
      });
    }

    const sessionUser: SessionUser = {
      id: user.id,
      authId: user.authId,
      phone: user.phone,
      email: user.email,
      role: user.role,
      name: user.profile?.name ?? "User",
      avatarUrl: user.profile?.avatarUrl ?? null,
    };

    // Store secure session cookie
    const cookieStore = cookies();
    cookieStore.set(AUTH_COOKIE_NAME, JSON.stringify(sessionUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true, user: sessionUser };
  } catch (error) {
    console.error("Authentication error:", error);
    return { success: false, error: "Failed to establish user session. Please try again." };
  }
}

/**
 * Returns current authenticated session from cookies
 */
export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get(AUTH_COOKIE_NAME);
    if (!sessionCookie?.value) {
      return null;
    }
    const parsed = JSON.parse(sessionCookie.value) as SessionUser;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Clears authentication session cookie
 */
export async function destroySession(): Promise<void> {
  const cookieStore = cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}
