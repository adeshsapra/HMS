import React, { useMemo } from "react";
import { Routes, Route } from "react-router-dom";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import { IconButton } from "@material-tailwind/react";
import {
  Sidenav,
  DashboardNavbar,
  Configurator,
  Footer,
} from "@/widgets/layout";
import routes from "@/routes";
import { useMaterialTailwindController, setOpenConfigurator } from "@/context";
import { useFilteredRoutes } from "@/utils/routeFilter";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export function Dashboard(): JSX.Element {
  const [controller] = useMaterialTailwindController();
  const { sidenavType, openSidenav } = controller;
  
  // Filter routes based on user permissions
  const filteredRoutes = useFilteredRoutes(routes);

  return (
    <div className="min-h-screen bg-blue-gray-50/50">
      <Sidenav
        routes={filteredRoutes}
        brandImg={
          sidenavType === "dark" ? "/img/logo-ct.png" : "/img/logo-ct-dark.png"
        }
      />
      <div className={`p-4 transition-all duration-300 ${
        openSidenav 
          ? (controller.sidenavCollapsed ? 'xl:ml-24' : 'xl:ml-80')
          : 'xl:ml-4'
      }`}>
        <DashboardNavbar />
        <Configurator />
        <IconButton
          size="lg"
          color="white"
          className="fixed bottom-8 right-8 z-40 rounded-full shadow-blue-gray-900/10"
          ripple={false}
          onClick={() => setOpenConfigurator(controller[1], true)}
        >
          <Cog6ToothIcon className="h-5 w-5" />
        </IconButton>
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

