import { NextResponse } from "next/server";
import { getAllCategories } from "@/modules/catalog/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryFilter = searchParams.get("category")?.toLowerCase();
    const query = searchParams.get("q")?.toLowerCase();

    const categories = await getAllCategories();

    if (categoryFilter) {
      const cat = categories.find((c) => c.slug === categoryFilter);
      if (!cat) {
        return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, category: cat }, { status: 200 });
    }

    if (query) {
      const allServices = categories.flatMap((c) =>
        c.services.map((s) => ({ ...s, categoryName: c.name, categorySlug: c.slug }))
      );
      const filtered = allServices.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query) ||
          s.categoryName.toLowerCase().includes(query)
      );
      return NextResponse.json({ success: true, count: filtered.length, services: filtered }, { status: 200 });
    }

    return NextResponse.json({ success: true, categories }, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to retrieve service catalog." },
      { status: 500 }
    );
  }
}
