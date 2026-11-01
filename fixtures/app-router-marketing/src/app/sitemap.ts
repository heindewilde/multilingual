import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/posts";

const host = "https://tidynote.example";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/", "/pricing", "/about", "/blog", ...getPosts().map((p) => `/blog/${p.slug}`)];
  return pages.map((path) => ({ url: host + (path === "/" ? "" : path) }));
}
