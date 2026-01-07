import { Route, RoutePage } from "@/routes";
import { useAuth } from "@/context/AuthContext";
import { getRoleBasedTitle } from "./roleBasedTitles";

/**
 * Filters routes based on user permissions and applies role-based titles
 * STRICT MODE: Only shows pages that user has explicit permission to access
 * Empty sections are automatically hidden
 */
export function useFilteredRoutes(routes: Route[]): Route[] {
  const { hasPermission, user, permissions, loading } = useAuth();

  // If user is not logged in or permissions are still loading, return empty routes
  if (!user || loading) {
    return [];
  }

  // Strict Security Check: Patients are NEVER allowed to access or see admin panel routes.
  // This ensures the sidebar and all navigation elements are completely hidden.
  if (user.role?.name?.toLowerCase() === 'patient') {
    return [];
  }

  // If user has no permissions, only show pages without permission requirement (like profile)
  if (!permissions || permissions.length === 0) {
    return routes
      .map((route) => {
        // Hide "Auth Pages" section when user is logged in
        if (route.layout === "auth") {
          return null;
        }

        const filteredPages = route.pages.filter((page: RoutePage) => {
          // Only allow pages without permission requirement
          return !page.permission;
        });

        if (filteredPages.length > 0) {
          const userRole = user.role?.name || null;
          return {
            ...route,
            // Apply role-based title even when user has no permissions
            title: route.title ? getRoleBasedTitle(route.title, userRole) : undefined,
            pages: filteredPages,
          };
        }
        return null;
      })
      .filter((route) => route !== null) as Route[];
  }

  const userRole = user.role?.name || null;

  return routes
    .map((route) => {
      // Hide "Auth Pages" section when user is logged in (it's only for auth layout)
      if (route.layout === "auth") {
        return null;
      }

      // Filter pages based on permissions - STRICT CHECK
      const filteredPages = route.pages.filter((page: RoutePage) => {
        // If page requires permission, user MUST have it - STRICT CHECK
        if (page.permission) {
          return hasPermission(page.permission);
        }

        // Pages without permission requirement (like profile) are accessible to all authenticated users
        // But only if user is authenticated (which we already checked)
        return true;
      });

      // Only include routes that have at least one accessible page
      // This automatically hides empty sections
      if (filteredPages.length > 0) {
        return {
          ...route,
          // Apply role-based title if section has a title
          title: route.title ? getRoleBasedTitle(route.title, userRole) : undefined,
          pages: filteredPages,
        };
      }
      return null;
    })
    .filter((route) => route !== null) as Route[];
}

