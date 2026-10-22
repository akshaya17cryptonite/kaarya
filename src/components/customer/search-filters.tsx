"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal, MapPin, Star, DollarSign } from "lucide-react";

export function SearchFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentRadius = searchParams.get("radius") || "25";
  const currentRating = searchParams.get("rating") || "0";
  const currentSort = searchParams.get("sort") || "distance";

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "0" && value !== "default") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="bg-card border rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <SlidersHorizontal className="w-4 h-4 text-primary" />
        <span>Filter Professionals:</span>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs">
        {/* Distance Radius */}
        <div className="flex items-center gap-1.5 bg-muted/50 border rounded-lg px-2.5 py-1.5">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          <span className="text-muted-foreground">Radius:</span>
          <select
            value={currentRadius}
            onChange={(e) => handleFilterChange("radius", e.target.value)}
            className="bg-transparent font-medium text-foreground focus:outline-none cursor-pointer"
          >
            <option value="5">Within 5 km (Sector)</option>
            <option value="10">Within 10 km (Central)</option>
            <option value="15">Within 15 km (Noida)</option>
            <option value="25">Within 25 km (All NCR)</option>
          </select>
        </div>

        {/* Rating Filter */}
        <div className="flex items-center gap-1.5 bg-muted/50 border rounded-lg px-2.5 py-1.5">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span className="text-muted-foreground">Rating:</span>
          <select
            value={currentRating}
            onChange={(e) => handleFilterChange("rating", e.target.value)}
            className="bg-transparent font-medium text-foreground focus:outline-none cursor-pointer"
          >
            <option value="0">All Ratings</option>
            <option value="4.0">⭐ 4.0 & above</option>
            <option value="4.5">⭐ 4.5 & above</option>
            <option value="4.8">⭐ 4.8 & above (Top Rated)</option>
          </select>
        </div>

        {/* Sort by */}
        <div className="flex items-center gap-1.5 bg-muted/50 border rounded-lg px-2.5 py-1.5">
          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-muted-foreground">Sort:</span>
          <select
            value={currentSort}
            onChange={(e) => handleFilterChange("sort", e.target.value)}
            className="bg-transparent font-medium text-foreground focus:outline-none cursor-pointer"
          >
            <option value="distance">Nearest First</option>
            <option value="rating">Highest Rated</option>
            <option value="experience">Most Experienced</option>
          </select>
        </div>
      </div>
    </div>
  );
}
