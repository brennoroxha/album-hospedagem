// Server-only helper: resolve the public base URL of this app.
// Used to build webhook (postback) URLs sent to payment gateways.
//
// Configure `PUBLIC_APP_URL` in the hosting environment, e.g.:
//   PUBLIC_APP_URL=https://seudominio.com
//
// Falls back to the original Lovable preview URL so existing deployments
// keep working until the env var is set.
import { getServerEnv } from "@/lib/env.server";

const FALLBACK_APP_URL = "https://happy-place-builder-95.lovable.app";

export function getPublicAppUrl(): string {
  const raw = getServerEnv("PUBLIC_APP_URL")?.trim();
  const base = raw && raw.length > 0 ? raw : FALLBACK_APP_URL;
  return base.replace(/\/+$/, "");
}

export function getWebhookUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getPublicAppUrl()}${normalized}`;
}
