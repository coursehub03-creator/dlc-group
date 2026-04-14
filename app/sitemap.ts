import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/about", "/services", "/legal-consultations", "/land-disputes", "/patents", "/trademarks", "/global-monitoring", "/ai-assistant", "/blog", "/contact", "/faq", "/privacy-policy", "/terms"];
  return routes.map((route) => ({ url: `https://dlcgroup.online${route}`, lastModified: new Date() }));
}
