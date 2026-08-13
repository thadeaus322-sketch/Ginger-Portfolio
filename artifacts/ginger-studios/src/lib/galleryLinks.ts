export function toGallerySlug(value: string): string {
  const slug = value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "gallery";
}

export function getGalleryUrl(origin: string, shootTitle: string, token: string): string {
  return `${origin}/gallery/${toGallerySlug(shootTitle)}/${encodeURIComponent(token)}`;
}