const normalizeBaseUrl = (value?: string) => {
  if (!value) return undefined;
  return value.endsWith("/") ? value.slice(0, -1) : value;
};

const inferredRustApi =
  normalizeBaseUrl(process.env.NEXT_PUBLIC_RUST_API_URL) ??
  normalizeBaseUrl(process.env.RUST_API_URL) ??
  normalizeBaseUrl(process.env.RUST_API) ??
  "http://localhost:8000";

export const RUST_API = inferredRustApi;

export const NEXTAUTH_URL =
  process.env.NEXTAUTH_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  "http://localhost:3000";