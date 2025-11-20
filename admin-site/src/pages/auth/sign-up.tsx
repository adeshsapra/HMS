import React from "react";
import {
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";
import { Link } from "react-router-dom";
import { UserPlusIcon, LockClosedIcon, EnvelopeIcon, UserIcon, BuildingOfficeIcon } from "@heroicons/react/24/outline";

export function SignUp(): JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Image/Info */}
        <div className="hidden lg:block">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-3xl transform -rotate-3"></div>
            <div className="relative bg-white rounded-3xl p-8 shadow-2xl">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                    <UserPlusIcon className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Easy Registration</h3>
                    <p className="text-sm text-gray-600">Quick and simple account creation process</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                    <BuildingOfficeIcon className="h-6 w-6 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Hospital Management</h3>
                    <p className="text-sm text-gray-600">Complete control over your healthcare facility</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                    <svg className="h-6 w-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Secure & Reliable</h3>
                    <p className="text-sm text-gray-600">Your information is safe with us</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full mb-4">
              <UserPlusIcon className="h-8 w-8 text-white" />
            </div>
            <Typography variant="h3" className="font-bold text-gray-800 mb-2">
              Create Account
            </Typography>
            <Typography variant="paragraph" color="gray" className="text-base">
              Register to start managing your hospital operations
            </Typography>
          </div>

          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Typography variant="small" color="gray" className="mb-2 font-medium">
                  First Name
                </Typography>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    size="lg"
                    placeholder="John"
                    className="!border-gray-300 focus:!border-teal-500 pl-10"
                    labelProps={{
                      className: "hidden",
                    }}
                    crossOrigin={undefined}
                  />
                </div>
              </div>
              <div>
                <Typography variant="small" color="gray" className="mb-2 font-medium">
                  Last Name
                </Typography>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    size="lg"
                    placeholder="Doe"
                    className="!border-gray-300 focus:!border-teal-500 pl-10"
                    labelProps={{
                      className: "hidden",
                    }}
                    crossOrigin={undefined}
                  />
                </div>
              </div>
            </div>

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
                  placeholder="Create a strong password"
                  className="!border-gray-300 focus:!border-teal-500 pl-10"
                  labelProps={{
                    className: "hidden",
                  }}
                  crossOrigin={undefined}
                />
              </div>
            </div>

            <div>
              <Typography variant="small" color="gray" className="mb-2 font-medium">
                Confirm Password
              </Typography>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="password"
                  size="lg"
                  placeholder="Confirm your password"
                  className="!border-gray-300 focus:!border-teal-500 pl-10"
                  labelProps={{
                    className: "hidden",
                  }}
                  crossOrigin={undefined}
                />
              </div>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                I agree to the{" "}
                <Link to="#" className="text-teal-600 hover:text-teal-700 font-medium">
                  Terms and Conditions
                </Link>{" "}
                and{" "}
                <Link to="#" className="text-teal-600 hover:text-teal-700 font-medium">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-semibold py-3 rounded-lg shadow-md transition-all duration-200"
              fullWidth
            >
              Create Account
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or sign up with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outlined"
                className="flex items-center justify-center gap-2 border-gray-300 hover:bg-gray-50"
                fullWidth
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button
                variant="outlined"
                className="flex items-center justify-center gap-2 border-gray-300 hover:bg-gray-50"
                fullWidth
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z" />
                </svg>
                Microsoft
              </Button>
            </div>

            <Typography variant="small" className="text-center text-gray-600 mt-6">
              Already have an account?{" "}
              <Link to="/auth/sign-in" className="text-teal-600 hover:text-teal-700 font-semibold">
                Sign In
              </Link>
            </Typography>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUp;

