export interface ServiceCategoryConfig {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  image: string;
  startingPrice: number;
  popularServices: string[];
}

export interface CityConfig {
  name: string;
  slug: string;
  state: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
}

export const siteConfig = {
  name: "LocConnect",
  shortName: "LocConnect",
  description:
    "Discover & book verified, top-rated local service professionals for plumbing, electrical, and home cleaning at transparent fixed rates.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/og.png",
  currency: {
    code: "INR",
    symbol: "₹",
  },
  platformCommissionPercent: 15, // 15% platform fee deducted on payouts
  gstPercent: 18, // 18% GST on platform convenience fee
  
  // Default Launch City (Noida, Delhi NCR)
  defaultCity: {
    name: "Noida",
    slug: "noida",
    state: "Uttar Pradesh",
    latitude: 28.5355,
    longitude: 77.391,
    radiusKm: 25,
  } satisfies CityConfig,

  supportedCities: [
    {
      name: "Noida",
      slug: "noida",
      state: "Uttar Pradesh",
      latitude: 28.5355,
      longitude: 77.391,
      radiusKm: 25,
    },
    {
      name: "Greater Noida",
      slug: "greater-noida",
      state: "Uttar Pradesh",
      latitude: 28.4744,
      longitude: 77.504,
      radiusKm: 20,
    },
    {
      name: "Delhi",
      slug: "delhi",
      state: "Delhi",
      latitude: 28.7041,
      longitude: 77.1025,
      radiusKm: 30,
    },
  ] satisfies CityConfig[],

  // Launch Categories
  categories: [
    {
      id: "cat_plumbing",
      slug: "plumber",
      name: "Plumbing Services",
      description: "Expert plumbers for taps, leakages, fittings, pipelines, and water tank solutions.",
      icon: "Wrench",
      image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80",
      startingPrice: 199,
      popularServices: [
        "Tap & Shower Repair",
        "Pipe Leakage Detection & Repair",
        "Toilet & Sanitary Fitting",
        "Water Tank Deep Cleaning",
        "Geyser Installation & Uninstallation",
      ],
    },
    {
      id: "cat_electrical",
      slug: "electrician",
      name: "Electrical Services",
      description: "Certified electricians for wiring, switches, ceiling fans, appliances, and short circuits.",
      icon: "Zap",
      image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
      startingPrice: 149,
      popularServices: [
        "Ceiling & Exhaust Fan Repair / Installation",
        "Switchboard & Socket Replacement",
        "MCB Fuse Repair & Short Circuit Fix",
        "House Inverter Wiring & Setup",
        "Decorative Light & Chandelier Fitting",
      ],
    },
    {
      id: "cat_cleaning",
      slug: "cleaner",
      name: "Home Cleaning",
      description: "Trained professionals with industrial gear for deep home, kitchen, and bathroom sanitization.",
      icon: "Sparkles",
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
      startingPrice: 499,
      popularServices: [
        "Complete Home Deep Cleaning (1/2/3/4 BHK)",
        "Intensive Bathroom Cleaning & Descaling",
        "Modular Kitchen Degreasing & Cleaning",
        "Sofa, Mattress & Carpet Shampooing",
        "Balcony & Window Dusting & Washing",
      ],
    },
  ] satisfies ServiceCategoryConfig[],

  contact: {
    email: "support@locconnect.in",
    phone: "+91 98765 43210",
    address: "Sector 62, Noida, Uttar Pradesh, 201309",
  },
};
