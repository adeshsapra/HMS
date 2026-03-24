/** Origin of the Laravel app (no `/api`), derived from `VITE_API_BASE_URL`. */
export function getBackendOrigin(): string {
  const raw = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
  return String(raw).replace(/\/api\/?$/i, "") || "http://localhost:8000";
}

/** Public files under `hms-backend/public/storage/logos/` (e.g. `icon.png`, `arovis-logo.png`). */
export function backendLogoUrl(filename: string): string {
  const name = filename.replace(/^\/+/, "");
  return `${getBackendOrigin()}/storage/logos/${name}`;
}
