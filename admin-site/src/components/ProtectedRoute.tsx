import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Typography, Button } from '@material-tailwind/react';
import { ExclamationTriangleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredPermissions?: string[];
  requireAll?: boolean;
}

export function ProtectedRoute({
  children,
  requiredPermission,
  requiredPermissions,
  requireAll = false,
}: ProtectedRouteProps) {
  const { user, loading, hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  // Check single permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    // Show access denied error if user directly accesses URL without permission
    return (
      <div className="flex items-center justify-center min-h-screen bg-blue-gray-50/50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-red-100 p-4">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <Typography variant="h4" color="red" className="mb-2 font-bold">
            Access Denied
          </Typography>
          <Typography variant="paragraph" color="gray" className="mb-6">
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </Typography>
          <div className="flex justify-center">
            <Button
              color="blue-gray"
              variant="outlined"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Check multiple permissions
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAccess = requireAll
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);

    if (!hasAccess) {
      // Show access denied error if user directly accesses URL without permission
      return (
        <div className="flex items-center justify-center min-h-screen bg-blue-gray-50/50">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-red-100 p-4">
                <ExclamationTriangleIcon className="h-12 w-12 text-red-600" />
              </div>
            </div>
            <Typography variant="h4" color="red" className="mb-2 font-bold">
              Access Denied
            </Typography>
            <Typography variant="paragraph" color="gray" className="mb-6">
              You don't have permission to access this page. Please contact your administrator if you believe this is an error.
            </Typography>
            <div className="flex justify-center">
              <Button
                color="blue-gray"
                variant="outlined"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

