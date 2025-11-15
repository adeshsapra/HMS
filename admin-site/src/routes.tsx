import React, { ReactElement } from "react";
import {
  HomeIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  UserIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  PhotoIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  EnvelopeIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  UsersIcon,
  CubeIcon,
  BeakerIcon,
  HomeModernIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  UserCircleIcon,
  BellIcon,
} from "@heroicons/react/24/solid";
import { Home, Profile, Notifications } from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";

// Import all HMS pages
import Appointments from "@/pages/dashboard/appointments";
import Patients from "@/pages/dashboard/patients";
import Doctors from "@/pages/dashboard/doctors";
import Departments from "@/pages/dashboard/departments";
import Services from "@/pages/dashboard/services";
import Gallery from "@/pages/dashboard/gallery";
import Testimonials from "@/pages/dashboard/testimonials";
import FAQ from "@/pages/dashboard/faq";
import ContactInquiries from "@/pages/dashboard/contact-inquiries";
import Billing from "@/pages/dashboard/billing";
import Settings from "@/pages/dashboard/settings";
import Reports from "@/pages/dashboard/reports";
import Staff from "@/pages/dashboard/staff";
import Inventory from "@/pages/dashboard/inventory";
import Pharmacy from "@/pages/dashboard/pharmacy";
import Laboratory from "@/pages/dashboard/laboratory";
import Rooms from "@/pages/dashboard/rooms";
import Schedules from "@/pages/dashboard/schedules";
import Emergency from "@/pages/dashboard/emergency";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export interface RoutePage {
  icon: ReactElement;
  name: string;
  path: string;
  element: ReactElement;
}

export interface Route {
  title?: string;
  layout: string;
  pages: RoutePage[];
}

export const routes: Route[] = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: "/home",
        element: <Home />,
      },
    ],
  },
  {
    title: "core management",
    layout: "dashboard",
    pages: [
      {
        icon: <CalendarDaysIcon {...icon} />,
        name: "appointments",
        path: "/appointments",
        element: <Appointments />,
      },
      {
        icon: <UserGroupIcon {...icon} />,
        name: "patients",
        path: "/patients",
        element: <Patients />,
      },
      {
        icon: <UserIcon {...icon} />,
        name: "doctors",
        path: "/doctors",
        element: <Doctors />,
      },
      {
        icon: <BuildingOfficeIcon {...icon} />,
        name: "departments",
        path: "/departments",
        element: <Departments />,
      },
      {
        icon: <BriefcaseIcon {...icon} />,
        name: "services",
        path: "/services",
        element: <Services />,
      },
      {
        icon: <UsersIcon {...icon} />,
        name: "staff",
        path: "/staff",
        element: <Staff />,
      },
    ],
  },
  {
    title: "content management",
    layout: "dashboard",
    pages: [
      {
        icon: <PhotoIcon {...icon} />,
        name: "gallery",
        path: "/gallery",
        element: <Gallery />,
      },
      {
        icon: <ChatBubbleLeftRightIcon {...icon} />,
        name: "testimonials",
        path: "/testimonials",
        element: <Testimonials />,
      },
      {
        icon: <QuestionMarkCircleIcon {...icon} />,
        name: "faq",
        path: "/faq",
        element: <FAQ />,
      },
      {
        icon: <EnvelopeIcon {...icon} />,
        name: "contact inquiries",
        path: "/contact-inquiries",
        element: <ContactInquiries />,
      },
    ],
  },
  {
    title: "operations",
    layout: "dashboard",
    pages: [
      {
        icon: <CurrencyDollarIcon {...icon} />,
        name: "billing & finance",
        path: "/billing",
        element: <Billing />,
      },
      {
        icon: <CubeIcon {...icon} />,
        name: "inventory",
        path: "/inventory",
        element: <Inventory />,
      },
      {
        icon: <BeakerIcon {...icon} />,
        name: "pharmacy",
        path: "/pharmacy",
        element: <Pharmacy />,
      },
      {
        icon: <BeakerIcon {...icon} />,
        name: "laboratory",
        path: "/laboratory",
        element: <Laboratory />,
      },
      {
        icon: <HomeModernIcon {...icon} />,
        name: "rooms & beds",
        path: "/rooms",
        element: <Rooms />,
      },
      {
        icon: <ClockIcon {...icon} />,
        name: "schedules",
        path: "/schedules",
        element: <Schedules />,
      },
      {
        icon: <ExclamationTriangleIcon {...icon} />,
        name: "emergency",
        path: "/emergency",
        element: <Emergency />,
      },
    ],
  },
  {
    title: "reports & settings",
    layout: "dashboard",
    pages: [
      {
        icon: <ChartBarIcon {...icon} />,
        name: "reports",
        path: "/reports",
        element: <Reports />,
      },
      {
        icon: <Cog6ToothIcon {...icon} />,
        name: "settings",
        path: "/settings",
        element: <Settings />,
      },
    ],
  },
  {
    title: "account",
    layout: "dashboard",
    pages: [
      {
        icon: <UserCircleIcon {...icon} />,
        name: "profile",
        path: "/profile",
        element: <Profile />,
      },
      {
        icon: <BellIcon {...icon} />,
        name: "notifications",
        path: "/notifications",
        element: <Notifications />,
      },
    ],
  },
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "sign up",
        path: "/sign-up",
        element: <SignUp />,
      },
    ],
  },
];

export default routes;

