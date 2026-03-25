import React, { useMemo } from "react";
import { Routes, Route } from "react-router-dom";
import {
  Sidenav,
  DashboardNavbar,
  Footer,
} from "@/widgets/layout";
import routes from "@/routes";
import { useMaterialTailwindController } from "@/context";
import { useFilteredRoutes } from "@/utils/routeFilter";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export function Dashboard(): JSX.Element {
  const [controller] = useMaterialTailwindController();
  const { sidenavType, openSidenav } = controller;

  // Filter routes based on user permissions
  const filteredRoutes = useFilteredRoutes(routes);

  return (
    <div className="min-h-screen bg-blue-gray-50/50">
      <Sidenav routes={filteredRoutes} />
      <div
        className={`p-4 transition-[margin] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${openSidenav
          ? controller.sidenavCollapsed
            ? "xl:ml-[5.5rem]"
            : "xl:ml-[19rem]"
          : "xl:ml-4"
          }`}
      >
        <DashboardNavbar />
        <Routes>
          {/* Use all routes (not filtered) so we can show Access Denied for routes user doesn't have permission for */}
          {routes.map(
            ({ layout, pages }) =>
              layout === "dashboard" &&
              pages.map(({ path, element, permission }) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    <ProtectedRoute requiredPermission={permission}>
                      {element}
                    </ProtectedRoute>
                  }
                />
              ))
          )}
        </Routes>
        <div className="text-blue-gray-600">
          <Footer />
        </div>
      </div>
    </div>
  );
}

Dashboard.displayName = "/src/layout/dashboard.tsx";

export default Dashboard;