import React from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Navbar,
  Typography,
  Button,
  IconButton,
  Breadcrumbs,
  Input,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
} from "@material-tailwind/react";
import {
  UserCircleIcon,
  Cog6ToothIcon,
  BellIcon,
  ClockIcon,
  CreditCardIcon,
  Bars3Icon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/solid";
import {
  useMaterialTailwindController,
  setOpenSidenav,
} from "@/context";
import { useAuth } from "@/context/AuthContext";
import { NotificationMenu } from "./notification-menu";
import AdminSearchModal from "../../components/AdminSearchModal";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export function DashboardNavbar(): JSX.Element {
  const [controller, dispatch] = useMaterialTailwindController();
  const { fixedNavbar, openSidenav } = controller;
  const { pathname } = useLocation();
  const [layout, page] = pathname.split("/").filter((el) => el !== "");
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/auth/sign-in");
  };

  return (
    <Navbar
      color={fixedNavbar ? "white" : "transparent"}
      className={`rounded-xl transition-all ${fixedNavbar
        ? "sticky top-4 z-40 py-3 shadow-md shadow-blue-gray-500/5"
        : "px-0 py-1"
        }`}
      fullWidth
      blurred={fixedNavbar}
    >
      <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center">
        <div className="capitalize">
          <Breadcrumbs
            className={`bg-transparent p-0 transition-all ${fixedNavbar ? "mt-1" : ""
              }`}
          >
            <Link to={`/${layout}`}>
              <Typography
                variant="small"
                color="blue-gray"
                className="font-normal opacity-50 transition-all hover:text-blue-500 hover:opacity-100"
              >
                {layout}
              </Typography>
            </Link>
            <Typography
              variant="small"
              color="blue-gray"
              className="font-normal"
            >
              {page}
            </Typography>
          </Breadcrumbs>
          <Typography variant="h6" color="blue-gray">
            {page}
          </Typography>
        </div>
        <div className="flex items-center gap-1">
          <IconButton
            variant="text"
            color="blue-gray"
            onClick={() => setIsSearchOpen(true)}
            className="group relative overflow-visible"
          >
            <div className="absolute inset-0 bg-blue-500/10 rounded-full scale-0 group-hover:scale-125 transition-transform duration-500 ease-out" />
            <MagnifyingGlassIcon className="h-5 w-5 text-blue-gray-900 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-300 relative z-10" />
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-blue-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-2xl z-50 transform translate-y-1 group-hover:translate-y-0 flex items-center gap-2 border border-white/10">
              <span className="text-[10px] font-black tracking-[0.15em] text-white uppercase leading-none">Search</span>
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-white/10 rounded border border-white/5">
                <span className="text-[10px] text-white/50 font-medium leading-none font-sans">⌘</span>
                <span className="text-[10px] text-white/50 font-black leading-none font-sans">K</span>
              </div>
            </div>
          </IconButton>

          <NotificationMenu />

          <IconButton
            variant="text"
            color="blue-gray"
            onClick={() => navigate("/dashboard/settings")}
            className="group"
          >
            <Cog6ToothIcon className="h-5 w-5 text-blue-gray-900 group-hover:rotate-45 transition-transform duration-500" />
          </IconButton>

          <IconButton
            variant="text"
            color="blue-gray"
            className="grid xl:hidden"
            onClick={() => setOpenSidenav(dispatch, !openSidenav)}
          >
            <Bars3Icon strokeWidth={3} className="h-6 w-6 text-blue-gray-500" />
          </IconButton>

          {user ? (
            <Menu>
              <MenuHandler>
                <div className="flex items-center ml-2">
                  <Button
                    variant="text"
                    color="blue-gray"
                    className="hidden items-center gap-2 px-3 py-1.5 xl:flex normal-case hover:bg-blue-gray-50/50 rounded-full transition-all"
                  >
                    <Avatar
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                      alt={user.name}
                      size="sm"
                      variant="circular"
                      className="border-2 border-blue-50"
                    />
                    <span className="hidden lg:block font-bold text-blue-gray-800">{user.name}</span>
                  </Button>
                  <IconButton
                    variant="text"
                    color="blue-gray"
                    className="grid xl:hidden"
                  >
                    <Avatar
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                      alt={user.name}
                      size="sm"
                      variant="circular"
                    />
                  </IconButton>
                </div>
              </MenuHandler>
              <MenuList className="w-56 p-2 border-0 shadow-2xl shadow-blue-gray-500/10">
                <div className="px-3 py-2 mb-2 border-b border-blue-gray-50 pb-3">
                  <Typography variant="small" className="font-bold text-blue-gray-900">
                    {user.name}
                  </Typography>
                  <Typography variant="small" color="gray" className="text-[11px] font-medium opacity-70">
                    {user.email}
                  </Typography>
                </div>

                <MenuItem onClick={() => navigate("/dashboard/profile")} className="flex items-center gap-3 rounded-lg">
                  <UserCircleIcon className="h-4 w-4 opacity-70" />
                  <Typography variant="small" className="font-medium">Profile</Typography>
                </MenuItem>

                <MenuItem onClick={() => navigate("/dashboard/settings")} className="flex items-center gap-3 rounded-lg">
                  <Cog6ToothIcon className="h-4 w-4 opacity-70" />
                  <Typography variant="small" className="font-medium">Settings</Typography>
                </MenuItem>

                <hr className="my-2 border-blue-gray-50" />

                <MenuItem onClick={handleLogout} className="flex items-center gap-3 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600">
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  <Typography variant="small" className="font-bold">
                    Logout
                  </Typography>
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Link to="/auth/sign-in">
              <Button
                variant="text"
                color="blue-gray"
                className="hidden items-center gap-1 px-4 xl:flex normal-case"
              >
                <UserCircleIcon className="h-5 w-5 text-blue-gray-500" />
                Sign In
              </Button>
              <IconButton
                variant="text"
                color="blue-gray"
                className="grid xl:hidden"
              >
                <UserCircleIcon className="h-5 w-5 text-blue-gray-500" />
              </IconButton>
            </Link>
          )}
        </div>
      </div>
      <AdminSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </Navbar>
  );
}

DashboardNavbar.displayName = "/src/widgets/layout/dashboard-navbar.tsx";

export default DashboardNavbar;

