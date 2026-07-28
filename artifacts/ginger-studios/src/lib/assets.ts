/**
 * Resolve a public-folder asset path using the configured BASE_URL.
 * All image/video references in the app should use this so paths work
 * whether the site is hosted at the root or a subdirectory.
 *
 * Example:  img("images/logo-icon.png")  →  "/images/logo-icon.png"
 *           (or "/subdir/images/logo-icon.png" if BASE_URL = "/subdir/")
 */
export function img(path: string): string {
  // import.meta.env.BASE_URL always ends with "/"
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}
