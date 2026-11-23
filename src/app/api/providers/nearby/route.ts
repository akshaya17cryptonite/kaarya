import { NextResponse } from "next/server";
import { getFilteredProviders } from "@/modules/providers/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category") || undefined;
    const radiusKm = parseFloat(searchParams.get("radius") || "25");
    const minRating = parseFloat(searchParams.get("rating") || "0");
    const sortBy = (searchParams.get("sort") as "distance" | "rating" | "experience") || "distance";

    const providers = await getFilteredProviders({
      categorySlug,
      radiusKm,
      minRating,
      sortBy,
    });

    return NextResponse.json(
      {
        success: true,
        count: providers.length,
        providers,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to retrieve nearby providers." },
      { status: 500 }
    );
  }
}
