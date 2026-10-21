import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Wrench,
  Zap,
  Sparkles,
  Search,
  MapPin,
  Star,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface CategoryWithServices {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  imageUrl: string;
  services: Array<{
    id: string;
    name: string;
    basePrice: number;
  }>;
}

interface FeaturedProvider {
  id: string;
  user: {
    profile: {
      name: string;
      bio: string | null;
    } | null;
  };
  averageRating: number;
  totalReviews: number;
  experienceYears: number;
  currentAddress: string;
  totalCompletedJobs: number;
  services: Array<{
    service: {
      category?: {
        slug: string;
      };
    };
  }>;
}

async function getHomePageData(): Promise<{
  categories: CategoryWithServices[];
  featuredProviders: FeaturedProvider[];
}> {
  try {
    const [categories, featuredProviders] = await Promise.all([
      prisma.category.findMany({
        where: { isActive: true },
        include: {
          services: {
            take: 4,
            where: { isActive: true },
            select: { id: true, name: true, basePrice: true },
          },
        },
        orderBy: { displayOrder: "asc" },
      }),
      prisma.provider.findMany({
        where: { verificationStatus: "VERIFIED" },
        take: 4,
        include: {
          user: { include: { profile: true } },
          services: {
            include: {
              service: {
                include: { category: true },
              },
            },
          },
        },
        orderBy: { averageRating: "desc" },
      }),
    ]);

    if (categories.length > 0) {
      return { categories, featuredProviders };
    }
  } catch (err) {
    console.warn("Database not accessible at build/runtime, using default catalog:", (err as Error).message);
  }

  // Graceful fallback from siteConfig
  const fallbackCategories: CategoryWithServices[] = siteConfig.categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    iconName: c.icon,
    imageUrl: c.image,
    services: c.popularServices.slice(0, 4).map((name, i) => ({
      id: `${c.id}_${i}`,
      name,
      basePrice: c.startingPrice + i * 150,
    })),
  }));

  const fallbackProviders: FeaturedProvider[] = [
    {
      id: "p1",
      user: {
        profile: {
          name: "Ramesh Verma",
          bio: "Certified Master Plumber with 8+ years experience in Noida & Indirapuram.",
        },
      },
      averageRating: 4.8,
      totalReviews: 42,
      experienceYears: 8,
      currentAddress: "C-56/28, Sector 62, Noida",
      totalCompletedJobs: 184,
      services: [{ service: { category: { slug: "plumber" } } }],
    },
    {
      id: "p2",
      user: {
        profile: {
          name: "Suresh Sharma",
          bio: "Govt-licensed wireman & electrician with 10 years experience solving circuits.",
        },
      },
      averageRating: 4.9,
      totalReviews: 67,
      experienceYears: 10,
      currentAddress: "Shop 14, Sector 18, Noida",
      totalCompletedJobs: 312,
      services: [{ service: { category: { slug: "electrician" } } }],
    },
    {
      id: "p3",
      user: {
        profile: {
          name: "Sunita Devi & Team",
          bio: "Specialized in high-rise society deep cleaning in Noida Expressway sectors.",
        },
      },
      averageRating: 4.7,
      totalReviews: 35,
      experienceYears: 6,
      currentAddress: "Sector 137, Noida Expressway",
      totalCompletedJobs: 140,
      services: [{ service: { category: { slug: "cleaner" } } }],
    },
    {
      id: "p4",
      user: {
        profile: {
          name: "Imran Khan",
          bio: "Dual-skilled technician handling urgent plumbing leaks and electrical fittings.",
        },
      },
      averageRating: 4.6,
      totalReviews: 28,
      experienceYears: 5,
      currentAddress: "Indirapuram / Noida Border",
      totalCompletedJobs: 95,
      services: [{ service: { category: { slug: "plumber" } } }],
    },
  ];

  return { categories: fallbackCategories, featuredProviders: fallbackProviders };
}

export default async function HomePage() {
  const { categories, featuredProviders } = await getHomePageData();

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "Wrench":
        return <Wrench className="w-6 h-6 text-emerald-600" />;
      case "Zap":
        return <Zap className="w-6 h-6 text-amber-500" />;
      case "Sparkles":
        return <Sparkles className="w-6 h-6 text-blue-500" />;
      default:
        return <Wrench className="w-6 h-6 text-primary" />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/5 via-background to-background py-16 md:py-24 border-b">
        <div className="container max-w-5xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5" />
            <span>Now Live in Noida & Delhi NCR</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
            Verified home service professionals, <br className="hidden sm:inline" />
            <span className="text-primary underline decoration-primary/30 underline-offset-8">
              right at your doorstep.
            </span>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Book certified plumbers, electricians, and deep cleaning experts in Noida with guaranteed transparent pricing and 30-day rework warranty.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto pt-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 p-2 bg-card border rounded-2xl shadow-lg">
              <div className="flex items-center gap-2 px-3 flex-1 w-full text-left text-sm text-muted-foreground">
                <Search className="w-5 h-5 text-muted-foreground" />
                <span className="truncate">Search tap repair, switchboard fix, deep cleaning...</span>
              </div>
              <Link href="/services/plumber/noida" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto gap-2 px-6">
                  <span>Explore Services</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Category Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <span className="text-xs font-semibold text-muted-foreground">Popular:</span>
            {categories.map((cat) => (
              <Link key={cat.id} href={`/services/${cat.slug}/noida`}>
                <Badge variant="secondary" className="hover:bg-muted text-xs cursor-pointer py-1 px-3">
                  {cat.name}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3 Core Launch Categories */}
      <section className="py-16 bg-background">
        <div className="container space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Browse Services in Noida</h2>
            <p className="text-sm text-muted-foreground">
              Select a service category to discover verified professionals within your sector
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((cat) => (
              <Card key={cat.id} className="overflow-hidden hover:shadow-xl transition-all flex flex-col justify-between group">
                <div>
                  <div className="relative h-48 w-full overflow-hidden bg-muted">
                    <Image
                      src={cat.imageUrl}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-white/20 backdrop-blur">
                          {getCategoryIcon(cat.iconName)}
                        </div>
                        <h3 className="font-bold text-lg">{cat.name}</h3>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6 space-y-4">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {cat.description}
                    </p>

                    <div className="space-y-2 pt-2">
                      <span className="text-xs font-semibold text-foreground block">Popular Services:</span>
                      <ul className="text-xs space-y-1.5 text-muted-foreground">
                        {cat.services.map((s) => (
                          <li key={s.id} className="flex items-center justify-between">
                            <span className="truncate pr-2">• {s.name}</span>
                            <span className="font-medium text-foreground">{formatCurrency(s.basePrice)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </div>

                <div className="p-6 pt-0 border-t mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Starting from</span>
                    <span className="font-bold text-lg text-primary">
                      {formatCurrency(cat.services[0]?.basePrice || 199)}
                    </span>
                  </div>
                  <Link href={`/services/${cat.slug}/noida`}>
                    <Button variant="default" size="sm" className="gap-1.5">
                      <span>View Services</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Verified Providers */}
      <section className="py-16 bg-muted/30 border-y">
        <div className="container space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Noida Local Partners</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Top-Rated Professionals</h2>
            </div>
            <p className="text-xs text-muted-foreground max-w-md">
              Every partner is verified via Aadhaar & Police verification, trained on standard safety SOPs, and reviewed by real customers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProviders.map((p) => (
              <Card key={p.id} className="overflow-hidden hover:shadow-md transition">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base border-2 border-primary/20">
                      {p.user.profile?.name ? p.user.profile.name.slice(0, 2).toUpperCase() : "SP"}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <h4 className="font-bold text-sm text-foreground">{p.user.profile?.name}</h4>
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      </div>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="font-semibold text-foreground">{p.averageRating}</span>
                        <span>({p.totalReviews} reviews)</span>
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {p.user.profile?.bio}
                  </p>

                  <div className="border-t pt-3 space-y-1.5 text-[11px] text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>Experience:</span>
                      <span className="font-semibold text-foreground">{p.experienceYears} Years</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Service Area:</span>
                      <span className="font-medium text-foreground truncate max-w-[120px]">
                        {p.currentAddress.split(",")[1]?.trim() || "Noida"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Completed Jobs:</span>
                      <span className="font-semibold text-emerald-600">{p.totalCompletedJobs}</span>
                    </div>
                  </div>

                  <Link href={`/services/${p.services[0]?.service.category?.slug || "plumber"}/noida`}>
                    <Button variant="outline" size="sm" className="w-full text-xs mt-2">
                      Book Professional
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose LocConnect */}
      <section className="py-16 bg-background">
        <div className="container max-w-4xl text-center space-y-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">The LocConnect Guarantee</h2>
            <p className="text-sm text-muted-foreground">
              Built specifically to eliminate overcharging and unreliable service quality
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="p-6 rounded-2xl border bg-card shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-bold text-base">Standardized Fixed Rates</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                No last-minute price negotiations or unexpected surprise costs. Every service has clear transparent rate cards.
              </p>
            </div>

            <div className="p-6 rounded-2xl border bg-card shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-bold text-base">Razorpay Escrow Safety</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Pay online securely via UPI or Card. Your money is held in escrow until you approve the completed service.
              </p>
            </div>

            <div className="p-6 rounded-2xl border bg-card shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-bold text-base">30-Day Free Rework</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                If the tap starts dripping or the fan creates noise again within 30 days, we fix it at zero extra charge.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
