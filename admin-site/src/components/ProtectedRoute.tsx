import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Typography, Button } from '@material-tailwind/react';
import { ExclamationTriangleIcon, ArrowLeftIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

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

  // Strict Role Check: Patients are NEVER allowed in the admin panel
  if (user.role?.name?.toLowerCase() === 'patient') {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 overflow-hidden relative">
        {/* Background Decorative Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />

        <div className="max-w-md w-full relative">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse" />
                <div className="relative bg-gradient-to-br from-red-500 to-rose-600 p-5 rounded-3xl shadow-lg border border-red-400/50">
                  <ShieldCheckIcon className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>

            <Typography variant="h3" className="text-white font-black mb-3 tracking-tight">
              Access Restricted
            </Typography>

            <div className="h-1 w-12 bg-red-500 mx-auto mb-6 rounded-full" />

            <Typography className="text-blue-gray-200 font-medium mb-8 leading-relaxed">
              Administrative panel access is limited to authorized clinical and operational staff.
              Please use the Patient Portal for all personal healthcare management.
            </Typography>

            <div className="space-y-3">
              <Button
                size="lg"
                fullWidth
                color="white"
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/auth/sign-in';
                }}
                className="rounded-2xl py-4 font-black tracking-widest uppercase text-[11px] shadow-xl hover:scale-[1.02] transition-all"
              >
                Sign Out & Exit
              </Button>

              <button
                onClick={() => window.location.href = 'http://localhost:5173'}
                className="w-full py-3 text-blue-gray-400 hover:text-white transition-colors text-[11px] font-bold tracking-widest uppercase"
              >
                Return to Patient Portal
              </button>
            </div>
          </div>

          <Typography className="text-blue-gray-600 text-[10px] text-center mt-8 font-bold tracking-[0.2em] uppercase opacity-50">
            Secure Infrastructure • HMS v2.0
          </Typography>
        </div>
      </div>
    );
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

