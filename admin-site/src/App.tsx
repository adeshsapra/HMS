import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import { ProtectedRoute } from "@/components";
import { useAuth } from "@/context/AuthContext";
import { getFirstAccessiblePage } from "@/utils/getFirstAccessiblePage";

function AuthWrapper() {
  const { user, loading, permissions } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // If user is logged in and trying to access auth pages, redirect to first accessible page
  if (user && location.pathname.startsWith('/auth')) {
    const firstPage = getFirstAccessiblePage(permissions);
    return <Navigate to={firstPage || "/dashboard/home"} replace />;
  }
  
  return <Auth />;
}

function App(): JSX.Element {
  return (
    <Routes>
      <Route 
        path="/dashboard/*" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route path="/auth/*" element={<AuthWrapper />} />
      <Route path="*" element={<Navigate to="/auth/sign-in" replace />} />
    </Routes>
  );
}

export default App;

