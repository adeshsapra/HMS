import React, { useState, useEffect, useCallback } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  XMarkIcon,
  Bars3Icon,
  ChevronDownIcon,
  ChevronLeftIcon,
} from "@heroicons/react/24/outline";
import { IconButton } from "@material-tailwind/react";
import { motion } from "framer-motion";
import { useMaterialTailwindController, setOpenSidenav, setSidenavCollapsed } from "@/context";
import { useFilteredRoutes } from "@/utils/routeFilter";
import {
  ADMIN_ICON_SRC,
  ADMIN_LOGO_ICON_CLASS,
  ADMIN_LOGO_SRC,
  ADMIN_LOGO_WORDMARK_CLASS,
} from "@/constants/adminBrand";
import { Route } from "@/routes";

export interface SidenavProps {
  brandImg?: string;
  brandIconImg?: string;
  brandName?: string;
  routes: Route[];
}

function pathMatches(pathname: string, layout: string, pagePath: string): boolean {
  const full = `/${layout}${pagePath}`.replace(/\/+/g, "/");
  return pathname === full || pathname.startsWith(`${full}/`);
}

export function Sidenav({
  brandImg = ADMIN_LOGO_SRC,
  brandIconImg = ADMIN_ICON_SRC,
  brandName = "Arovis",
  routes,
}: SidenavProps): JSX.Element {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavType, openSidenav, sidenavCollapsed } = controller;
  const location = useLocation();
  const filteredRoutes = useFilteredRoutes(routes);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    routes.forEach((route) => {
      if (route.title) initial[route.title] = true;
    });
    return initial;
  });

  const isDark = sidenavType === "dark";
  const isGlass = sidenavType === "transparent";

  const toggleSection = useCallback((title: string): void => {
    setExpandedSections((prev) => ({ ...prev, [title]: !prev[title] }));
  }, []);

  useEffect(() => {
    const path = location.pathname;
    filteredRoutes.forEach((route) => {
      if (!route.title) return;
      const activeHere = route.pages.some(
        (p) => !p.hidden && p.path && pathMatches(path, route.layout, p.path)
      );
      if (activeHere) {
        setExpandedSections((prev) => ({ ...prev, [route.title!]: true }));
      }
    });
  }, [location.pathname, filteredRoutes]);

  /* ── Shell: premium card, layered depth ── */
  const shellClass = isDark
    ? [
        "border border-white/[0.08]",
        "bg-[linear-gradient(165deg,#0a1628_0%,#0c2138_45%,#0e3048_100%)]",
        "shadow-[0_25px_50px_-12px_rgba(0,0,0,0.45),inset_0_1px_0_0_rgba(255,255,255,0.06)]",
        "text-slate-100",
      ].join(" ")
    : isGlass
      ? [
          "border border-white/70",
          "bg-white/[0.72] backdrop-blur-2xl backdrop-saturate-150",
          "shadow-[0_20px_40px_-15px_rgba(15,23,42,0.15),inset_0_1px_0_0_rgba(255,255,255,0.9)]",
          "text-slate-800",
        ].join(" ")
      : [
          "border border-slate-200/90",
          "bg-[linear-gradient(180deg,#fafbfc_0%,#ffffff_55%,#f8fafc_100%)]",
          "shadow-[0_20px_45px_-18px_rgba(15,23,42,0.12),inset_0_1px_0_0_rgba(255,255,255,1)]",
          "text-slate-800",
        ].join(" ");

  /* Sits on the sidebar edge, half outside the rounded panel (wrapper is not overflow-hidden) */
  const collapseToggleWrapClass =
    "group pointer-events-auto absolute right-0 top-4 z-[70] hidden translate-x-1/2 xl:block";

  const collapseToggleClass = isDark
    ? [
        "flex h-7 w-7 items-center justify-center rounded-full",
        "border border-white/[0.14] bg-[linear-gradient(145deg,rgba(30,58,95,0.98)_0%,rgba(15,32,52,1)_100%)] text-white",
        "shadow-[0_6px_16px_-4px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.12)]",
        "transition-[transform,box-shadow,border-color] duration-200 ease-out",
        "hover:scale-105 hover:border-cyan-400/30 hover:shadow-[0_8px_20px_-6px_rgba(34,211,238,0.25)]",
        "active:scale-[0.94]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400/60",
      ].join(" ")
    : isGlass
      ? [
          "flex h-7 w-7 items-center justify-center rounded-full",
          "border border-white/90 bg-white/85 text-slate-700 backdrop-blur-md",
          "shadow-[0_6px_16px_-6px_rgba(15,23,42,0.18),inset_0_1px_0_0_rgba(255,255,255,1)]",
          "transition-[transform,box-shadow,border-color] duration-200 ease-out",
          "hover:scale-105 hover:border-blue-300/70 hover:text-blue-700 hover:shadow-[0_8px_20px_-8px_rgba(59,130,246,0.22)]",
          "active:scale-[0.94]",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500/50",
        ].join(" ")
      : [
          "flex h-7 w-7 items-center justify-center rounded-full",
          "border border-slate-300/90 bg-white text-blue-700",
          "shadow-[0_6px_16px_-8px_rgba(15,23,42,0.16),inset_0_1px_0_0_rgba(255,255,255,1)]",
          "transition-[transform,box-shadow,border-color,color] duration-200 ease-out",
          "hover:scale-105 hover:border-blue-400/50 hover:bg-blue-50/90 hover:text-blue-800 hover:shadow-[0_8px_20px_-8px_rgba(37,99,235,0.2)]",
          "active:scale-[0.94]",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500/45",
        ].join(" ");

  /* Dark chip to the right of the pin — always high contrast on light main area */
  const collapseToggleTooltipClass =
    "pointer-events-none absolute left-full top-1/2 z-[80] ml-2 -translate-y-1/2 whitespace-nowrap rounded-md border border-slate-600 !bg-[#0f172a] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide !text-white opacity-0 shadow-[0_4px_14px_rgba(0,0,0,0.35)] transition-opacity duration-200 group-hover:opacity-100";

  const railTooltipClass =
    "invisible absolute left-full top-1/2 z-[60] ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium capitalize text-white opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:opacity-100";

  /* Flat section label (no inner “card” chrome) */
  const sectionHeaderClass = isDark
    ? "flex w-full items-center gap-2 rounded-lg px-1 py-2 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-white/45 transition hover:bg-white/[0.04] hover:text-white/75"
    : "flex w-full items-center gap-2 rounded-lg px-1 py-2 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 transition hover:bg-slate-100/70 hover:text-slate-800";

  const submenuGuideClass = isDark
    ? "border-l border-dashed border-white/[0.08]"
    : "border-l border-dashed border-slate-200/70";

  const renderNavLink = (
    layout: string,
    path: string,
    name: string,
    icon: React.ReactNode,
    opts: { variant: "primary" | "nested" }
  ): JSX.Element => {
    const nested = opts.variant === "nested";

    const rowClasses = (isActive: boolean): string => {
      const base = "relative flex items-center transition-all duration-200 rounded-xl";
      if (sidenavCollapsed) {
        const on = isDark
          ? "justify-center px-0 py-2.5 bg-gradient-to-br from-blue-600/40 to-blue-900/30 text-white ring-inset ring-1 ring-white/15"
          : "justify-center px-0 py-2.5 bg-gradient-to-br from-blue-900 to-blue-600 text-white shadow-md ring-inset ring-1 ring-blue-500/25";
        const off = isDark
          ? "justify-center px-0 py-2.5 text-slate-400 hover:bg-white/[0.06] hover:text-white"
          : "justify-center px-0 py-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800";
        return `${base} ${isActive ? on : off}`;
      }
      if (nested) {
        if (isActive) {
          return isDark
            ? `${base} ml-0.5 gap-3 py-2 pl-2 pr-2.5 bg-white/[0.08] text-white shadow-sm ring-inset ring-1 ring-white/10 before:absolute before:left-0 before:top-1/2 before:h-[58%] before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-cyan-400 before:content-['']`
            : `${base} ml-0.5 gap-3 py-2 pl-2 pr-2.5 bg-blue-50/95 text-blue-950 shadow-sm ring-inset ring-1 ring-blue-200/90 before:absolute before:left-0 before:top-1/2 before:h-[58%] before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-blue-600 before:content-['']`;
        }
        return isDark
          ? `${base} ml-0.5 gap-3 py-2 pl-2 pr-2.5 text-slate-400/95 hover:bg-white/[0.05] hover:text-slate-200`
          : `${base} ml-0.5 gap-3 py-2 pl-2 pr-2.5 text-slate-600 hover:bg-slate-100/80 hover:text-slate-900`;
      }
      /* Primary — full-width “hero” row */
      if (isActive) {
        return isDark
          ? `${base} gap-3 py-2 pl-2 pr-2.5 bg-gradient-to-r from-blue-600/35 to-cyan-500/15 text-white shadow-[0_4px_20px_rgba(0,112,192,0.25)] ring-inset ring-1 ring-white/10`
          : `${base} gap-3 py-2 pl-2 pr-2.5 bg-gradient-to-r from-blue-900 to-blue-600 text-white shadow-[0_6px_20px_-4px_rgba(0,112,192,0.45)] ring-inset ring-1 ring-blue-500/25`;
      }
      return isDark
        ? `${base} gap-3 py-2 pl-2 pr-2.5 text-slate-300/90 hover:bg-white/[0.06] hover:text-white`
        : `${base} gap-3 py-2 pl-2 pr-2.5 text-slate-600 hover:bg-slate-100/90 hover:text-slate-900`;
    };

    const iconBoxClasses = (isActive: boolean): string => {
      const svg = "[&>svg]:h-[1.1rem] [&>svg]:w-[1.1rem] flex shrink-0 items-center justify-center rounded-lg";
      if (sidenavCollapsed) {
        return `${svg} h-9 w-9 ${isActive ? "text-white" : isDark ? "text-slate-400" : "text-slate-500"}`;
      }
      if (nested) {
        if (isActive) {
          return `${svg} h-8 w-8 ${isDark ? "bg-white/10 text-cyan-200" : "bg-blue-100 text-blue-700"}`;
        }
        return `${svg} h-8 w-8 ${isDark ? "bg-white/[0.04] text-slate-400" : "bg-slate-100/80 text-slate-500"}`;
      }
      if (isActive) {
        return `${svg} h-9 w-9 text-white`;
      }
      return `${svg} h-9 w-9 ${isDark ? "text-slate-300" : "text-slate-500"}`;
    };

    return (
      <NavLink
        to={`/${layout}${path}`}
        className="group relative block"
        title={sidenavCollapsed ? name : undefined}
      >
        {({ isActive }) => (
          <div className="relative">
            <span className={rowClasses(isActive)}>
              <span className={iconBoxClasses(isActive)}>{icon}</span>
              {!sidenavCollapsed && (
                <span
                  className={`min-w-0 flex-1 truncate ${nested ? "text-[13px] font-medium" : "text-sm font-semibold"}`}
                >
                  {name}
                </span>
              )}
            </span>
            {sidenavCollapsed && (
              <div className={railTooltipClass} role="tooltip">
                {name}
              </div>
            )}
          </div>
        )}
      </NavLink>
    );
  };

  return (
    <>
      {!openSidenav && (
        <IconButton
          variant="filled"
          color="blue"
          size="lg"
          className="fixed left-4 top-20 z-50 hidden rounded-full shadow-lg xl:block"
          onClick={() => setOpenSidenav(dispatch, true)}
        >
          <Bars3Icon className="h-6 w-6" />
        </IconButton>
      )}

      <div
        className={`${openSidenav ? "translate-x-0" : "-translate-x-80"
          } pointer-events-none fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] transition-[width,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] xl:translate-x-0 ${sidenavCollapsed ? "w-[4.5rem]" : "w-72"
          }`}
      >
        <aside
          id="admin-sidenav"
          className={`${shellClass} pointer-events-auto flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl`}
        >
          {/* Brand */}
          <div
            className={`relative flex-shrink-0 border-b ${isDark ? "border-white/[0.07]" : "border-slate-200/70"
              } bg-gradient-to-r ${isDark ? "from-white/[0.04] to-transparent" : "from-slate-50/80 to-transparent"}`}
          >
            <div
              className={`flex items-center py-2.5 ${sidenavCollapsed
                ? "min-h-[3.25rem] justify-between gap-2 px-2 xl:justify-center"
                : "min-h-[3.75rem] justify-between gap-2 px-3 pr-2"
                }`}
            >
              {sidenavCollapsed ? (
                <Link
                  to="/dashboard/home"
                  className="flex min-w-0 flex-1 items-center justify-center leading-none xl:flex-none"
                >
                  <img
                    src={brandIconImg}
                    alt={brandName}
                    width={40}
                    height={40}
                    decoding="async"
                    className={ADMIN_LOGO_ICON_CLASS}
                  />
                </Link>
              ) : (
                <Link
                  to="/dashboard/home"
                  className="flex min-w-0 flex-1 items-center leading-none"
                >
                  <img
                    src={brandImg}
                    alt={brandName}
                    width={240}
                    height={48}
                    decoding="async"
                    className={ADMIN_LOGO_WORDMARK_CLASS}
                  />
                </Link>
              )}

              <IconButton
                variant="text"
                size="sm"
                ripple={false}
                className={`shrink-0 rounded-xl xl:hidden ${isDark ? "text-white/80 hover:bg-white/10" : "text-slate-600 hover:bg-slate-100"}`}
                onClick={() => setOpenSidenav(dispatch, false)}
              >
                <XMarkIcon strokeWidth={2.5} className="h-5 w-5" />
              </IconButton>
            </div>
          </div>

        <nav
          className={`admin-sidenav-scroll flex-1 overflow-y-auto px-3 pb-4 pt-3 ${sidenavCollapsed ? "space-y-3" : "divide-y divide-slate-200/60 dark:divide-white/[0.07]"} ${isDark ? "admin-sidenav-scroll--dark" : ""}`}
          aria-label="Main navigation"
        >
          {filteredRoutes.map(({ layout, title, pages }, key) => {
            const isExpanded = title
              ? expandedSections[title] !== undefined
                ? expandedSections[title]
                : true
              : true;

            const visiblePages = pages.filter((p) => !p.hidden);

            const sectionPad = sidenavCollapsed ? "py-2 first:pt-0 last:pb-0" : "py-4 first:pt-1 last:pb-2";

            /* ── Standalone primary: Dashboard ── */
            if (!title) {
              return (
                <div key={key} className={sectionPad}>
                  {!sidenavCollapsed && (
                    <p
                      className={`mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.16em] ${isDark ? "text-white/35" : "text-slate-400"}`}
                    >
                      Overview
                    </p>
                  )}
                  <ul className="flex flex-col gap-0.5">
                    {visiblePages.map(({ icon, name, path }) => (
                      <li key={name}>{renderNavLink(layout, path, name, icon, { variant: "primary" })}</li>
                    ))}
                  </ul>
                </div>
              );
            }

            /* ── Grouped sections + nested items (one surface, no nested cards) ── */
            return (
              <div key={key} className={sectionPad}>
                {!sidenavCollapsed && (
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    onClick={() => toggleSection(title)}
                    className={sectionHeaderClass}
                  >
                    <span className={`min-w-0 flex-1 truncate ${isDark ? "text-white/55" : ""}`}>{title}</span>
                    <motion.span
                      initial={false}
                      animate={{ rotate: isExpanded ? 0 : -90 }}
                      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                      className="flex shrink-0 opacity-70"
                    >
                      <ChevronDownIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </motion.span>
                  </button>
                )}

                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                  style={{
                    gridTemplateRows: !sidenavCollapsed && !isExpanded ? "0fr" : "1fr",
                  }}
                >
                  <div className="min-h-0 overflow-hidden">
                    {!sidenavCollapsed ? (
                      <div className={`relative ml-0.5 mt-1 pl-3 pr-1 ${submenuGuideClass}`}>
                        <ul className="flex flex-col gap-0.5">
                          {visiblePages.map(({ icon, name, path }) => (
                            <li key={name}>{renderNavLink(layout, path, name, icon, { variant: "nested" })}</li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <ul className="flex flex-col gap-1.5 pt-1">
                        {visiblePages.map(({ icon, name, path }) => (
                          <li key={name}>{renderNavLink(layout, path, name, icon, { variant: "nested" })}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        <style>{`
          .admin-sidenav-scroll { scrollbar-width: thin; scrollbar-color: rgba(148, 163, 184, 0.4) transparent; }
          .admin-sidenav-scroll::-webkit-scrollbar { width: 5px; }
          .admin-sidenav-scroll::-webkit-scrollbar-track { background: transparent; margin: 8px 0; }
          .admin-sidenav-scroll::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.4); border-radius: 999px; }
          .admin-sidenav-scroll::-webkit-scrollbar-thumb:hover { background: rgba(100, 116, 139, 0.55); }
          .admin-sidenav-scroll--dark { scrollbar-color: rgba(255, 255, 255, 0.18) transparent; }
          .admin-sidenav-scroll--dark::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.18); }
          .admin-sidenav-scroll--dark::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }
        `}</style>
        </aside>

        <div className={collapseToggleWrapClass}>
          <button
            type="button"
            id="admin-sidenav-collapse-toggle"
            aria-label={sidenavCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!sidenavCollapsed}
            aria-controls="admin-sidenav"
            title={sidenavCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setSidenavCollapsed(dispatch, !sidenavCollapsed)}
            className={collapseToggleClass}
          >
            <motion.span
              initial={false}
              animate={{ rotate: sidenavCollapsed ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className="flex items-center justify-center will-change-transform"
            >
              <ChevronLeftIcon className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
            </motion.span>
          </button>
          <span className={collapseToggleTooltipClass} role="tooltip">
            {sidenavCollapsed ? "Expand" : "Collapse"}
          </span>
        </div>
      </div>
    </>
  );
}

Sidenav.displayName = "/src/widgets/layout/sidenav.tsx";

export default Sidenav;
