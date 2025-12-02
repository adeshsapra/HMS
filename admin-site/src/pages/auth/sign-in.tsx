import React, { useState } from "react";
import {
  Input,
  Button,
  Typography,
  Alert,
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { HeartIcon, LockClosedIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/context/AuthContext";
import { getFirstAccessiblePage } from "@/utils/getFirstAccessiblePage";

export function SignIn(): JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, permissions } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userPermissions = await login(email, password);
      // Find first accessible page using permissions from login response
      const firstPage = getFirstAccessiblePage(userPermissions || permissions);
      navigate(firstPage || "/dashboard/home");
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full mb-4">
              <HeartIcon className="h-8 w-8 text-white" />
            </div>
            <Typography variant="h3" className="font-bold text-gray-800 mb-2">
              Welcome Back
            </Typography>
            <Typography variant="paragraph" color="gray" className="text-base">
              Sign in to access your HMS Admin Panel
            </Typography>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <Alert color="red" className="mb-4">
                {error}
              </Alert>
            )}
            <div>
              <Typography variant="small" color="gray" className="mb-2 font-medium">
                Email Address
              </Typography>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  size="lg"
                  placeholder="admin@hospital.com"
                  className="!border-gray-300 focus:!border-teal-500 pl-10"
                  labelProps={{
                    className: "hidden",
                  }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  crossOrigin={undefined}
                />
              </div>
            </div>

            <div>
              <Typography variant="small" color="gray" className="mb-2 font-medium">
                Password
              </Typography>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="password"
                  size="lg"
                  placeholder="Enter your password"
                  className="!border-gray-300 focus:!border-teal-500 pl-10"
                  labelProps={{
                    className: "hidden",
                  }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  crossOrigin={undefined}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                  Remember me
                </label>
              </div>
              <button type="button" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                Forgot Password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-semibold py-3 rounded-lg shadow-md transition-all duration-200"
              fullWidth
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>

        {/* Right Side - Image/Info */}
        <div className="hidden lg:block">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl transform rotate-3"></div>
            <div className="relative bg-white rounded-3xl p-8 shadow-2xl">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                    <HeartIcon className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Secure Access</h3>
                    <p className="text-sm text-gray-600">Your data is protected with enterprise-grade security</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                    <LockClosedIcon className="h-6 w-6 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">24/7 Support</h3>
                    <p className="text-sm text-gray-600">Round-the-clock assistance for all your needs</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                    <svg className="h-6 w-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Comprehensive Dashboard</h3>
                    <p className="text-sm text-gray-600">Manage all hospital operations from one place</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;

