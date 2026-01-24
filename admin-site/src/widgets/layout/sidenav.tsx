import React, { useState, useMemo } from "react";
import { Link, NavLink } from "react-router-dom";
import { XMarkIcon, Bars3Icon, ChevronDownIcon, ChevronRightIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from "@heroicons/react/24/outline";
import {
  Avatar,
  Button,
  IconButton,
  Typography,
} from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav, setSidenavCollapsed } from "@/context";
import { useFilteredRoutes } from "@/utils/routeFilter";
import { Route, RoutePage } from "@/routes";

export interface SidenavProps {
  brandImg?: string;
  brandName?: string;
  routes: Route[];
}

export function Sidenav({ brandImg = "/img/logo-ct.png", brandName = "HMS Admin Panel", routes }: SidenavProps): JSX.Element {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav, sidenavCollapsed } = controller;

  // Filter routes based on user permissions
  const filteredRoutes = useFilteredRoutes(routes);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    // Initialize all sections as expanded by default for all roles
    const initial: Record<string, boolean> = {};
    routes.forEach((route) => {
      if (route.title) {
        initial[route.title] = true;
      }
    });
    return initial;
  });

  const sidenavTypes: Record<string, string> = {
    dark: "bg-gradient-to-br from-gray-800 to-gray-900",
    white: "bg-white shadow-sm",
    transparent: "bg-transparent",
  };

  const toggleSection = (title: string): void => {
    setExpandedSections(prev => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <>
      {/* Sidebar Toggle Button - Shows when sidebar is hidden */}
      {!openSidenav && (
        <IconButton
          variant="filled"
          color="blue"
          size="lg"
          className="fixed left-4 top-20 z-50 rounded-full shadow-lg xl:block hidden"
          onClick={() => setOpenSidenav(dispatch, true)}
        >
          <Bars3Icon className="h-6 w-6" />
        </IconButton>
      )}
      <aside
        className={`${sidenavTypes[sidenavType]} ${openSidenav ? "translate-x-0" : "-translate-x-80"
          } fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] ${sidenavCollapsed ? "w-20" : "w-72"
          } rounded-xl transition-all duration-300 xl:translate-x-0 border ${sidenavType === "dark" ? "border-white/10" : "border-blue-gray-100"
          } flex flex-col`}
      >
        {/* Header Section */}
        <div className={`relative flex-shrink-0 border-b ${sidenavType === "dark" ? "border-white/10" : "border-blue-gray-100"
          } py-4`}>
          <div className={`flex items-center ${sidenavCollapsed ? "justify-center px-2" : "justify-between px-4"
            }`}>
            {/* Logo */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm flex-shrink-0">
              <span className="text-white font-bold text-lg">H</span>
            </div>

            {/* Brand Name - Only visible when expanded */}
            {!sidenavCollapsed && (
              <Link to="/dashboard/home" className="flex-1 ml-2">
                <Typography
                  variant="h6"
                  color={sidenavType === "dark" ? "white" : "blue-gray"}
                  className="font-semibold text-base"
                >
                  {brandName}
                </Typography>
              </Link>
            )}

            {/* Close Button - Only for mobile */}
            <IconButton
              variant="text"
              size="sm"
              ripple={false}
              className={`rounded-lg xl:hidden ${sidenavType === "dark"
                ? "text-white hover:bg-white/10"
                : "text-blue-gray-700 hover:bg-blue-gray-100"
                }`}
              onClick={() => setOpenSidenav(dispatch, false)}
            >
              <XMarkIcon strokeWidth={2.5} className="h-5 w-5" />
            </IconButton>
          </div>
        </div>

        {/* Expand/Collapse Button - Positioned between sidebar and content */}
        <div className="absolute -right-3 top-5 z-50 xl:block hidden">
          <button
            onClick={() => setSidenavCollapsed(dispatch, !sidenavCollapsed)}
            className={`w-8 h-8 rounded-lg border shadow-md flex items-center justify-center transition-all ${sidenavType === "dark"
              ? "bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
              : "bg-gray-100 border-gray-300 hover:bg-gray-200 text-gray-700"
              }`}
          >
            {sidenavCollapsed ? (
              <ChevronDoubleRightIcon className="h-4 w-4" strokeWidth={2} />
            ) : (
              <ChevronDoubleLeftIcon className="h-4 w-4" strokeWidth={2} />
            )}
          </button>
        </div>

        {/* Scrollable Content */}
        <div
          className={`flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin ${sidenavType === 'dark' ? 'scrollbar-dark' : 'scrollbar-light'
            }`}
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: sidenavType === 'dark'
              ? 'rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05)'
              : '#cbd5e1 #f1f5f9',
          }}
        >
          <div className={`py-4 ${sidenavCollapsed ? "px-2" : "px-2"}`}>
            {filteredRoutes.map(({ layout, title, pages }, key) => {
              // Default to expanded (true) if section state doesn't exist - ensures all sections are open by default
              const isExpanded = title ? (expandedSections[title] !== undefined ? expandedSections[title] : true) : true;

              return (
                <div key={key} className={`${sidenavCollapsed ? "mb-3" : "mb-2"}`}>
                  {title ? (
                    <>
                      {/* Collapsible Section Header */}
                      {!sidenavCollapsed && (
                        <button
                          onClick={() => toggleSection(title)}
                          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg mb-1 transition-colors ${sidenavType === "dark"
                            ? "hover:bg-white/5 text-white"
                            : "hover:bg-blue-gray-50 text-blue-gray-700"
                            }`}
                        >
                          <Typography
                            variant="small"
                            color={sidenavType === "dark" ? "white" : "blue-gray"}
                            className="font-black uppercase opacity-75 text-xs tracking-wider"
                          >
                            {title}
                          </Typography>
                          {isExpanded ? (
                            <ChevronDownIcon className="h-4 w-4 opacity-75" />
                          ) : (
                            <ChevronRightIcon className="h-4 w-4 opacity-75" />
                          )}
                        </button>
                      )}

                      {/* Collapsible Section Content */}
                      {(!sidenavCollapsed ? isExpanded : true) && (
                        <ul className={`flex flex-col ${sidenavCollapsed ? "gap-2" : "gap-1"}`}>
                          {pages.filter(p => !p.hidden).map(({ icon, name, path }) => (
                            <li key={name}>
                              <NavLink to={`/${layout}${path}`}>
                                {({ isActive }) => (
                                  <div className="relative group">
                                    <Button
                                      variant={isActive ? "gradient" : "text"}
                                      color={
                                        (isActive
                                          ? (sidenavColor === "dark" ? "blue" : sidenavColor)
                                          : sidenavType === "dark"
                                            ? "white"
                                            : "blue-gray") as any
                                      }
                                      className={`flex items-center ${sidenavCollapsed
                                        ? "justify-center px-2 py-3 min-w-[48px]"
                                        : "gap-4 px-4"
                                        } capitalize transition-all rounded-lg ${isActive
                                          ? "shadow-md"
                                          : sidenavType === "dark"
                                            ? "hover:bg-white/5"
                                            : "hover:bg-blue-gray-50"
                                        }`}
                                      fullWidth={!sidenavCollapsed}
                                    >
                                      <span className={`${isActive ? "text-white" : ""} ${sidenavCollapsed ? "flex items-center justify-center" : ""
                                        }`}>
                                        {icon}
                                      </span>
                                      {!sidenavCollapsed && (
                                        <Typography
                                          color="inherit"
                                          className="font-medium capitalize text-sm"
                                        >
                                          {name}
                                        </Typography>
                                      )}
                                    </Button>
                                    {sidenavCollapsed && (
                                      <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none shadow-lg">
                                        {name}
                                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    /* Non-collapsible Section (Dashboard) */
                    <ul className={`flex flex-col ${sidenavCollapsed ? "gap-2" : "gap-1"}`}>
                      {pages.filter(p => !p.hidden).map(({ icon, name, path }) => (
                        <li key={name}>
                          <NavLink to={`/${layout}${path}`}>
                            {({ isActive }) => (
                              <div className="relative group">
                                <Button
                                  variant={isActive ? "gradient" : "text"}
                                  color={
                                    (isActive
                                      ? (sidenavColor === "dark" ? "blue" : sidenavColor)
                                      : sidenavType === "dark"
                                        ? "white"
                                        : "blue-gray") as any
                                  }
                                  className={`flex items-center ${sidenavCollapsed
                                    ? "justify-center px-2 py-3 min-w-[48px]"
                                    : "gap-4 px-4"
                                    } capitalize transition-all rounded-lg ${isActive
                                      ? "shadow-md"
                                      : sidenavType === "dark"
                                        ? "hover:bg-white/5"
                                        : "hover:bg-blue-gray-50"
                                    }`}
                                  fullWidth={!sidenavCollapsed}
                                >
                                  <span className={`${isActive ? "text-white" : ""} ${sidenavCollapsed ? "flex items-center justify-center" : ""
                                    }`}>
                                    {icon}
                                  </span>
                                  {!sidenavCollapsed && (
                                    <Typography
                                      color="inherit"
                                      className="font-medium capitalize text-sm"
                                    >
                                      {name}
                                    </Typography>
                                  )}
                                </Button>
                                {sidenavCollapsed && (
                                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none shadow-lg">
                                    {name}
                                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                                  </div>
                                )}
                              </div>
                            )}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
          {/* Bottom Spacer */}
          <div className="h-4" />
        </div>
      </aside>
    </>
  );
}

Sidenav.displayName = "/src/widgets/layout/sidenav.tsx";

export default Sidenav;

