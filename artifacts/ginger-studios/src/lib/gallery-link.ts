export function slugifyGalleryName(clientName: string, shootTitle: string): string {
  const slug = `${clientName}-${shootTitle}`
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return slug.slice(0, 80) || "gallery";
}

export function getGalleryUrl(
  origin: string,
  clientName: string,
  shootTitle: string,
  accessToken: string,
): string {
  return `${origin}/gallery/${slugifyGalleryName(clientName, shootTitle)}/${encodeURIComponent(accessToken)}`;
}