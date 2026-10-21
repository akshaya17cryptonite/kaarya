import { PrismaClient } from "@prisma/client";
import { calculateHaversineDistanceKm } from "@/modules/geo";

const prismaClientSingleton = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
};

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

export interface NearbyProviderResult {
  id: string;
  userId: string;
  name: string;
  avatarUrl: string | null;
  phone: string;
  experienceYears: number;
  averageRating: number;
  totalReviews: number;
  distanceKm: number;
  currentAddress: string;
  serviceRadiusKm: number;
}

/**
 * Executes a geospatial PostGIS query to find verified providers within radius.
 * Falls back to Haversine formula calculation if PostGIS native SQL fails.
 */
export async function findNearbyProviders(params: {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  categorySlug?: string;
  limit?: number;
}): Promise<NearbyProviderResult[]> {
  const { latitude, longitude, radiusKm = 15, categorySlug, limit = 20 } = params;
  const radiusMeters = radiusKm * 1000;

  try {
    // Attempt native PostGIS stored procedure / query
    const results = await prisma.$queryRaw<
      Array<{
        provider_id: string;
        user_id: string;
        name: string;
        avatar_url: string | null;
        phone: string;
        experience_years: number;
        average_rating: number;
        total_reviews: number;
        distance_meters: number;
        current_address: string;
      }>
    >`
      SELECT * FROM find_providers_within_radius(
        ${latitude}::DOUBLE PRECISION,
        ${longitude}::DOUBLE PRECISION,
        ${radiusMeters}::DOUBLE PRECISION,
        ${categorySlug ?? null}::TEXT
      )
      LIMIT ${limit};
    `;

    return results.map((row) => ({
      id: row.provider_id,
      userId: row.user_id,
      name: row.name,
      avatarUrl: row.avatar_url,
      phone: row.phone,
      experienceYears: row.experience_years,
      averageRating: row.average_rating,
      totalReviews: row.total_reviews,
      distanceKm: Math.round((row.distance_meters / 1000) * 10) / 10,
      currentAddress: row.current_address,
      serviceRadiusKm: radiusKm,
    }));
  } catch (error) {
    // Fallback: In-memory Haversine distance computation over verified providers
    console.warn("PostGIS native query fallback triggered:", (error as Error).message);

    const providers = await prisma.provider.findMany({
      where: {
        verificationStatus: "VERIFIED",
        isAvailable: true,
        ...(categorySlug
          ? {
              services: {
                some: {
                  isAvailable: true,
                  service: {
                    category: {
                      slug: categorySlug,
                    },
                  },
                },
              },
            }
          : {}),
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    const nearby = providers
      .map((p) => {
        const distanceKm = calculateHaversineDistanceKm(
          latitude,
          longitude,
          p.latitude,
          p.longitude
        );
        return {
          id: p.id,
          userId: p.userId,
          name: p.user.profile?.name ?? "Provider",
          avatarUrl: p.user.profile?.avatarUrl ?? null,
          phone: p.user.phone,
          experienceYears: p.experienceYears,
          averageRating: p.averageRating,
          totalReviews: p.totalReviews,
          distanceKm,
          currentAddress: p.currentAddress,
          serviceRadiusKm: p.serviceRadiusKm,
        };
      })
      .filter((p) => p.distanceKm <= Math.min(p.serviceRadiusKm, radiusKm))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, limit);

    return nearby;
  }
}
