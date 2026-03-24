/** Default static assets under `public/img/` */
export const ADMIN_LOGO_SRC = "/img/arovis-logo.png";
/** Same mark as main brand icon — keep in sync with `public/img/icon.png` */
export const ADMIN_ICON_SRC = "/img/icon.png";

/**
 * Wordmark: fixed visual height (56px / 64px) so layout is predictable.
 * Collapsed icon uses the same vertical cap (h-14) so expand/collapse feels continuous.
 */
export const ADMIN_LOGO_WORDMARK_CLASS =
  "block h-14 w-auto max-w-full shrink-0 object-contain object-left sm:h-16";

/** Centered wordmark on auth screens */
export const ADMIN_LOGO_AUTH_CLASS =
  "mx-auto block h-14 w-auto max-w-[min(300px,92vw)] object-contain sm:h-16";

/** Collapsed rail: square mark aligned to wordmark height (56px) */
export const ADMIN_LOGO_ICON_CLASS =
  "block h-14 w-14 shrink-0 object-contain";
