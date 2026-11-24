import { prisma, isMockMode } from "@/lib/prisma";
import { siteConfig, type ServiceCategoryConfig } from "@/config/site";

export interface CategoryDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  imageUrl: string;
  displayOrder: number;
  services: Array<{
    id: string;
    categoryId: string;
    name: string;
    slug: string;
    description: string;
    basePrice: number;
    estimatedDurationMinutes: number;
    imageUrl?: string | null;
  }>;
}

/**
 * Retrieve all active categories with their services
 */
export async function getAllCategories(): Promise<CategoryDetail[]> {
  const fallbackCategories = siteConfig.categories.map((c: ServiceCategoryConfig) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    iconName: c.icon,
    imageUrl: c.image,
    displayOrder: 1,
    services: c.popularServices.map((name, i) => ({
      id: `${c.id}_s_${i}`,
      categoryId: c.id,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: `Professional ${name.toLowerCase()} in Noida with transparent rates.`,
      basePrice: c.startingPrice + i * 150,
      estimatedDurationMinutes: 45 + i * 15,
      imageUrl: c.image,
    })),
  }));

  if (isMockMode) {
    return fallbackCategories;
  }

  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        services: {
          where: { isActive: true },
          orderBy: { basePrice: "asc" },
        },
      },
      orderBy: { displayOrder: "asc" },
    });

    if (categories.length > 0) {
      return categories as CategoryDetail[];
    }
  } catch (error) {
    console.warn("Using fallback categories:", (error as Error).message);
  }

  return fallbackCategories;
}

/**
 * Retrieve category by slug (e.g. 'plumber', 'electrician', 'cleaner')
 */
export async function getCategoryBySlug(slug: string): Promise<CategoryDetail | null> {
  const fallback = siteConfig.categories.find((c) => c.slug === slug);
  const fallbackCategory = fallback
    ? {
        id: fallback.id,
        name: fallback.name,
        slug: fallback.slug,
        description: fallback.description,
        iconName: fallback.icon,
        imageUrl: fallback.image,
        displayOrder: 1,
        services: fallback.popularServices.map((name, i) => ({
          id: `${fallback.id}_s_${i}`,
          categoryId: fallback.id,
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          description: `Professional ${name.toLowerCase()} in Noida with transparent rates.`,
          basePrice: fallback.startingPrice + i * 150,
          estimatedDurationMinutes: 45 + i * 15,
          imageUrl: fallback.image,
        })),
      }
    : null;

  if (isMockMode) {
    return fallbackCategory;
  }

  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        services: {
          where: { isActive: true },
          orderBy: { basePrice: "asc" },
        },
      },
    });

    if (category) {
      return category as CategoryDetail;
    }
  } catch (error) {
    console.warn("Using fallback for category slug:", slug, (error as Error).message);
  }

  return fallbackCategory;
}

/**
 * Retrieve specific service item by id
 */
export async function getServiceById(serviceId: string) {
  const getFallbackService = () => {
    for (const cat of siteConfig.categories) {
      for (let i = 0; i < cat.popularServices.length; i++) {
        const generatedId = `${cat.id}_s_${i}`;
        if (generatedId === serviceId) {
          return {
            id: generatedId,
            categoryId: cat.id,
            name: cat.popularServices[i],
            slug: cat.popularServices[i].toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            description: `Standardized ${cat.popularServices[i]} service with warranty.`,
            basePrice: cat.startingPrice + i * 150,
            estimatedDurationMinutes: 60,
            imageUrl: cat.image,
            isActive: true,
            category: {
              id: cat.id,
              name: cat.name,
              slug: cat.slug,
              iconName: cat.icon,
              imageUrl: cat.image,
            },
          };
        }
      }
    }

    const defaultCat = siteConfig.categories[0];
    return {
      id: serviceId,
      categoryId: defaultCat.id,
      name: defaultCat.popularServices[0],
      slug: "tap-shower-repair",
      description: "Standardized inspection, leak repair, and faucet replacement.",
      basePrice: defaultCat.startingPrice,
      estimatedDurationMinutes: 45,
      imageUrl: defaultCat.image,
      isActive: true,
      category: {
        id: defaultCat.id,
        name: defaultCat.name,
        slug: defaultCat.slug,
        iconName: defaultCat.icon,
        imageUrl: defaultCat.image,
      },
    };
  };

  if (isMockMode) {
    return getFallbackService();
  }

  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { category: true },
    });
    if (service) return service;
  } catch (err) {
    console.warn("DB service lookup failed:", (err as Error).message);
  }

  return getFallbackService();
}
