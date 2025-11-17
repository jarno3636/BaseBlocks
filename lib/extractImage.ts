// lib/extractImage.ts
export function extractImageFromTokenUri(uri?: string | null) {
  if (!uri) return;

  if (uri.startsWith("data:application/json")) {
    try {
      const base64 = uri.split(",")[1];
      const json = JSON.parse(atob(base64));
      return json?.image;
    } catch {
      return;
    }
  }

  return uri;
}
