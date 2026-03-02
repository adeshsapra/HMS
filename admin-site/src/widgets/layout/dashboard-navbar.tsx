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
        <div className="flex items-center">
          <div className="mr-auto md:mr-4 md:w-56">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-3 px-4 py-2 w-full rounded-xl bg-white/50 border border-blue-gray-100/50 text-blue-gray-400 hover:bg-white hover:border-blue-500/20 hover:shadow-lg hover:shadow-blue-500/5 transition-all text-sm group"
            >
              <MagnifyingGlassIcon className="h-4 w-4 group-hover:text-blue-500 transition-colors" />
              <span className="flex-1 text-left">Search...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold bg-blue-gray-50/50 border border-blue-gray-100 rounded text-blue-gray-300">⌘K</kbd>
            </button>
          </div>
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
                <div className="flex items-center">
                  <Button
                    variant="text"
                    color="blue-gray"
                    className="hidden items-center gap-2 px-4 xl:flex normal-case"
                  >
                    <Avatar
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                      alt={user.name}
                      size="sm"
                      variant="circular"
                      className="border-2 border-blue-gray-200"
                    />
                    <span className="hidden lg:block">{user.name}</span>
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
              <MenuList className="w-56">
                <MenuItem className="flex items-center gap-3">
                  <Avatar
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                    alt={user.name}
                    size="sm"
                    variant="circular"
                  />
                  <div className="flex flex-col">
                    <Typography variant="small" className="font-semibold">
                      {user.name}
                    </Typography>
                    <Typography variant="small" color="gray" className="text-xs">
                      {user.email}
                    </Typography>
                    {user.role && (
                      <Typography variant="small" color="blue-gray" className="text-xs capitalize">
                        {user.role.name}
                      </Typography>
                    )}
                  </div>
                </MenuItem>
                <hr className="my-2 border-blue-gray-100" />
                <MenuItem onClick={() => navigate("/dashboard/profile")}>
                  <div className="flex items-center gap-2">
                    <UserCircleIcon className="h-4 w-4" />
                    <Typography variant="small">Profile</Typography>
                  </div>
                </MenuItem>
                <MenuItem onClick={() => navigate("/dashboard/settings")}>
                  <div className="flex items-center gap-2">
                    <Cog6ToothIcon className="h-4 w-4" />
                    <Typography variant="small">Settings</Typography>
                  </div>
                </MenuItem>
                <hr className="my-2 border-blue-gray-100" />
                <MenuItem onClick={handleLogout}>
                  <div className="flex items-center gap-2 text-red-600">
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    <Typography variant="small" className="font-semibold">
                      Logout
                    </Typography>
                  </div>
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
          <NotificationMenu />
          <IconButton
            variant="text"
            color="blue-gray"
            onClick={() => navigate("/dashboard/settings")}
          >
            <Cog6ToothIcon className="h-5 w-5 text-blue-gray-500" />
          </IconButton>
        </div>
      </div>
      <AdminSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </Navbar>
  );
}

DashboardNavbar.displayName = "/src/widgets/layout/dashboard-navbar.tsx";

export default DashboardNavbar;

