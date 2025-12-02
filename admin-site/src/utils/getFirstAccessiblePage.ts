import routes from "@/routes";
import { Route, RoutePage } from "@/routes";

/**
 * Finds the first page the user has permission to access
 * @param permissions - Array of permission slugs the user has
 * @returns The path to the first accessible page, or null if none found
 */
export function getFirstAccessiblePage(permissions: string[]): string | null {
  // If no permissions, return null
  if (!permissions || permissions.length === 0) {
    return null;
  }

  // Helper function to check if user has permission for a page
  const hasPagePermission = (page: RoutePage): boolean => {
    // If page has no permission requirement, allow access (e.g., Profile page)
    if (!page.permission) {
      return true;
    }
    // Check if user has the required permission
    return permissions.includes(page.permission);
  };

  // Iterate through all routes
  for (const route of routes) {
    // Only check dashboard routes
    if (route.layout === "dashboard") {
      // Check each page in the route
      for (const page of route.pages) {
        if (hasPagePermission(page)) {
          // Return the first accessible page path
          return `/dashboard${page.path}`;
        }
      }
    }
  }

  // If no accessible page found, return null
  return null;
}

