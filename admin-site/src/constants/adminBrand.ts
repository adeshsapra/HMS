/** Default static assets under `public/img/` */
export const ADMIN_LOGO_SRC = "/img/arovis-logo.png";
/** Same mark as main brand icon — keep in sync with `public/img/icon.png` */
export const ADMIN_ICON_SRC = "/img/icon.png";

/**
 * Wordmark: nav-sized so the sidebar header stays balanced with nav items.
 * Collapsed icon matches proportionally.
 */
export const ADMIN_LOGO_WORDMARK_CLASS =
  "block h-11 w-auto max-w-full shrink-0 object-contain object-left sm:h-12";

/** Centered wordmark on auth screens — slightly larger than shell, still restrained */
export const ADMIN_LOGO_AUTH_CLASS =
  "mx-auto block h-[3.25rem] w-auto max-w-[min(280px,92vw)] object-contain sm:h-[3.75rem]";

/** Collapsed rail: square mark */
export const ADMIN_LOGO_ICON_CLASS =
  "block h-10 w-10 shrink-0 object-contain";
