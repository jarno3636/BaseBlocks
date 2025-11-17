export function extractImageFromTokenUri(uri?: string | null): string | undefined {
  if (!uri) return;

  if (uri.startsWith("data:application/json")) {
    try {
      const b64 = uri.split(",")[1];
      if (!b64) return;
      const json = JSON.parse(atob(b64));
      return json?.image;
    } catch (e) {
      return;
    }
  }

  return uri;
}
