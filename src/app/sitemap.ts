import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site";

// Re-render the sitemap at most once per hour so newly created posts show up
// without paying the DB cost on every crawl request.
export const revalidate = 3600;

const VALID_CATEGORIES = [
  "worship",
  "prayer",
  "life",
  "faith",
  "mission",
  "youth",
  "free",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: "hourly", priority: 1.0 },
    { url: `${siteUrl}/topics`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/events`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/posts`, lastModified: now, changeFrequency: "hourly", priority: 0.8 },
    { url: `${siteUrl}/church`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${siteUrl}/search`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = VALID_CATEGORIES.map((cat) => ({
    url: `${siteUrl}/posts?category=${cat}`,
    lastModified: now,
    changeFrequency: "hourly",
    priority: 0.7,
  }));

  let postRoutes: MetadataRoute.Sitemap = [];
  let eventRoutes: MetadataRoute.Sitemap = [];

  try {
    const posts = await prisma.post.findMany({
      orderBy: { created_at: "desc" },
      select: { id: true, created_at: true },
      take: 5000,
    });
    postRoutes = posts.map((p) => ({
      url: `${siteUrl}/posts/${p.id}`,
      lastModified: p.created_at,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    const events = await prisma.event.findMany({
      orderBy: { created_at: "desc" },
      select: { id: true, updated_at: true },
      take: 1000,
    });
    eventRoutes = events.map((e) => ({
      url: `${siteUrl}/events/${e.id}`,
      lastModified: e.updated_at,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch (err) {
    // DB may be unreachable at build time — fall back to static routes only.
    console.warn("sitemap: dynamic routes unavailable", err);
  }

  return [...staticRoutes, ...categoryRoutes, ...postRoutes, ...eventRoutes];
}
