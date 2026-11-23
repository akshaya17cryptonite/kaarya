"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Wrench, Zap, Sparkles, ArrowRight, CornerDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchableItem {
  id: string;
  title: string;
  categoryName: string;
  categorySlug: string;
  type: "category" | "service";
  startingPrice?: number;
  url: string;
}

const SEARCH_ITEMS: SearchableItem[] = [
  // Categories
  {
    id: "cat_plumber",
    title: "Plumbers & Pipe Services",
    categoryName: "Plumbing",
    categorySlug: "plumber",
    type: "category",
    startingPrice: 199,
    url: "/services/plumber/noida",
  },
  {
    id: "cat_electrician",
    title: "Electricians & Wiring Services",
    categoryName: "Electrical",
    categorySlug: "electrician",
    type: "category",
    startingPrice: 149,
    url: "/services/electrician/noida",
  },
  {
    id: "cat_cleaner",
    title: "Deep Home Cleaning & Sanitization",
    categoryName: "Cleaning",
    categorySlug: "cleaner",
    type: "category",
    startingPrice: 499,
    url: "/services/cleaner/noida",
  },
  // Plumbing Services
  {
    id: "srv_tap_repair",
    title: "Tap & Shower Repair / Installation",
    categoryName: "Plumbing",
    categorySlug: "plumber",
    type: "service",
    startingPrice: 199,
    url: "/checkout/srv_tap_repair",
  },
  {
    id: "srv_leakage",
    title: "Pipe Leakage Detection & Repair",
    categoryName: "Plumbing",
    categorySlug: "plumber",
    type: "service",
    startingPrice: 349,
    url: "/checkout/srv_leakage",
  },
  {
    id: "srv_toilet_fitting",
    title: "Toilet, Cistern & Sanitary Fitting",
    categoryName: "Plumbing",
    categorySlug: "plumber",
    type: "service",
    startingPrice: 499,
    url: "/checkout/srv_toilet_fitting",
  },
  {
    id: "srv_water_tank",
    title: "Water Tank Deep Cleaning",
    categoryName: "Plumbing",
    categorySlug: "plumber",
    type: "service",
    startingPrice: 799,
    url: "/checkout/srv_water_tank",
  },
  {
    id: "srv_geyser",
    title: "Geyser Installation & Servicing",
    categoryName: "Plumbing",
    categorySlug: "plumber",
    type: "service",
    startingPrice: 599,
    url: "/checkout/srv_geyser",
  },
  // Electrical Services
  {
    id: "srv_fan",
    title: "Ceiling & Exhaust Fan Repair / Fitting",
    categoryName: "Electrical",
    categorySlug: "electrician",
    type: "service",
    startingPrice: 149,
    url: "/checkout/srv_fan",
  },
  {
    id: "srv_switchboard",
    title: "Switchboard & Socket Replacement",
    categoryName: "Electrical",
    categorySlug: "electrician",
    type: "service",
    startingPrice: 249,
    url: "/checkout/srv_switchboard",
  },
  {
    id: "srv_mcb",
    title: "MCB Fuse Repair & Short Circuit Fix",
    categoryName: "Electrical",
    categorySlug: "electrician",
    type: "service",
    startingPrice: 399,
    url: "/checkout/srv_mcb",
  },
  {
    id: "srv_inverter",
    title: "House Inverter Wiring & Battery Setup",
    categoryName: "Electrical",
    categorySlug: "electrician",
    type: "service",
    startingPrice: 699,
    url: "/checkout/srv_inverter",
  },
  {
    id: "srv_lighting",
    title: "Chandelier & Decorative Light Fitting",
    categoryName: "Electrical",
    categorySlug: "electrician",
    type: "service",
    startingPrice: 349,
    url: "/checkout/srv_lighting",
  },
  // Cleaning Services
  {
    id: "srv_full_home",
    title: "Complete Home Deep Cleaning (1-4 BHK)",
    categoryName: "Cleaning",
    categorySlug: "cleaner",
    type: "service",
    startingPrice: 1499,
    url: "/checkout/srv_full_home",
  },
  {
    id: "srv_bathroom_clean",
    title: "Intensive Bathroom Cleaning & Descaling",
    categoryName: "Cleaning",
    categorySlug: "cleaner",
    type: "service",
    startingPrice: 499,
    url: "/checkout/srv_bathroom_clean",
  },
  {
    id: "srv_kitchen_clean",
    title: "Modular Kitchen Degreasing & Cleaning",
    categoryName: "Cleaning",
    categorySlug: "cleaner",
    type: "service",
    startingPrice: 899,
    url: "/checkout/srv_kitchen_clean",
  },
  {
    id: "srv_sofa_clean",
    title: "Sofa, Carpet & Mattress Shampooing",
    categoryName: "Cleaning",
    categorySlug: "cleaner",
    type: "service",
    startingPrice: 699,
    url: "/checkout/srv_sofa_clean",
  },
];

export function HomeSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter items
  const trimmed = query.trim().toLowerCase();
  const filteredItems = trimmed
    ? SEARCH_ITEMS.filter(
        (item) =>
          item.title.toLowerCase().includes(trimmed) ||
          item.categoryName.toLowerCase().includes(trimmed) ||
          item.categorySlug.toLowerCase().includes(trimmed)
      ).slice(0, 6)
    : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: SearchableItem) => {
    setIsOpen(false);
    setQuery("");
    router.push(item.url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filteredItems.length > 0 && selectedIndex >= 0 && selectedIndex < filteredItems.length) {
      handleSelect(filteredItems[selectedIndex]);
    } else if (trimmed) {
      // Find closest category or default to plumber search
      const matchedCat = SEARCH_ITEMS.find(
        (i) => i.categorySlug.includes(trimmed) || i.categoryName.toLowerCase().includes(trimmed)
      );
      if (matchedCat) {
        router.push(matchedCat.url);
      } else {
        router.push(`/services/plumber/noida`);
      }
      setIsOpen(false);
    } else {
      router.push("/services/plumber/noida");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const getCategoryIcon = (categorySlug: string) => {
    switch (categorySlug) {
      case "plumber":
        return <Wrench className="w-4 h-4 text-emerald-600" />;
      case "electrician":
        return <Zap className="w-4 h-4 text-amber-500" />;
      case "cleaner":
        return <Sparkles className="w-4 h-4 text-blue-500" />;
      default:
        return <Search className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div ref={containerRef} className="relative max-w-2xl mx-auto pt-4 text-left">
      <form onSubmit={handleSubmit} className="relative z-30">
        <div className="flex flex-col sm:flex-row items-center gap-2 p-2 bg-card border rounded-2xl shadow-lg focus-within:ring-2 focus-within:ring-primary/30 transition-all">
          <div className="flex items-center gap-2.5 px-3 flex-1 w-full text-sm">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
                setSelectedIndex(0);
              }}
              onFocus={() => {
                if (query.trim()) setIsOpen(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search tap repair, switchboard fix, deep cleaning..."
              className="w-full bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-sm py-1.5"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setIsOpen(false);
                }}
                className="text-muted-foreground hover:text-foreground p-1 rounded-full"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <Button type="submit" className="w-full sm:w-auto gap-2 px-6 h-10 shadow-sm shrink-0">
            <span>Explore Services</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>

      {/* Live Autocomplete Dropdown */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-md border rounded-2xl shadow-2xl z-40 overflow-hidden animate-in fade-in-50 slide-in-from-top-2 duration-150">
          {filteredItems.length > 0 ? (
            <div className="p-2 space-y-1">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                <span>Matching Services & Categories</span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-normal">
                  <span>Press</span>
                  <kbd className="px-1.5 py-0.5 text-[9px] bg-muted border rounded">↵</kbd>
                  <span>to select</span>
                </span>
              </div>
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    selectedIndex === index
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-background border shrink-0">
                      {getCategoryIcon(item.categorySlug)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm leading-tight flex items-center gap-2">
                        <span>{item.title}</span>
                        {item.type === "category" && (
                          <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.2 rounded font-medium">
                            Category
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        In {item.categoryName} • Sector-wide Noida coverage
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right shrink-0">
                    {item.startingPrice && (
                      <div>
                        <span className="text-[10px] text-muted-foreground block">From</span>
                        <span className="text-sm font-bold text-foreground">₹{item.startingPrice}</span>
                      </div>
                    )}
                    <CornerDownLeft className="w-3.5 h-3.5 text-muted-foreground opacity-60" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center space-y-2">
              <Search className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
              <p className="text-sm font-medium text-foreground">
                No services found matching &ldquo;{query}&rdquo;
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Try searching for keywords like <span className="font-semibold text-primary">tap</span>,{" "}
                <span className="font-semibold text-primary">switchboard</span>,{" "}
                <span className="font-semibold text-primary">geyser</span>, or{" "}
                <span className="font-semibold text-primary">deep cleaning</span>.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
