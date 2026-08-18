import { API_BASE_URL } from "@/services/apiClient";

/** Backend upload routes (organization logo/favicon, ...) return a path relative
 * to the API host, e.g. "/uploads/abc.png" — resolve it against API_BASE_URL
 * unless it's already an absolute URL. */
export function resolveUploadUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  return url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
}
