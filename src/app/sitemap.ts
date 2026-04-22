import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const staticRoutes: Array<{
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  }> = [
    { path: "/", priority: 1.0, changeFrequency: "hourly" },
    { path: "/topics", priority: 0.9, changeFrequency: "daily" },
    { path: "/events", priority: 0.8, changeFrequency: "daily" },
    { path: "/posts", priority: 0.8, changeFrequency: "hourly" },
    { path: "/church", priority: 0.6, changeFrequency: "weekly" },
    { path: "/search", priority: 0.5, changeFrequency: "monthly" },
    { path: "/about", priority: 0.4, changeFrequency: "monthly" },
  ];

  return staticRoutes.map(({ path, priority, changeFrequency }) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
