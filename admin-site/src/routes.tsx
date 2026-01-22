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
  ClipboardDocumentListIcon,
  ListBulletIcon,
  DocumentChartBarIcon,
  ShieldCheckIcon,
  KeyIcon,
  LinkIcon,
} from "@heroicons/react/24/solid";
import {
  Home,
  Profile,
  Notifications,
  Prescriptions,
  MedicalRecords,
  PatientReports,
  Bills,
  Medicines,
  HealthPackages,
  HomeCare,
  Integrations,
} from "@/pages/dashboard";
import { SignIn } from "@/pages/auth";

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
import { Roles, Permissions, RolePermissions, UserRoles } from "@/pages/dashboard";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export interface RoutePage {
  icon: ReactElement;
  name: string;
  path: string;
  element: ReactElement;
  permission?: string; // Permission required to access this route
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
        permission: "view-dashboard",
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
        permission: "view-appointments",
      },
      {
        icon: <UserGroupIcon {...icon} />,
        name: "patients",
        path: "/patients",
        element: <Patients />,
        permission: "view-patients",
      },
      {
        icon: <BuildingOfficeIcon {...icon} />,
        name: "departments",
        path: "/departments",
        element: <Departments />,
        permission: "view-departments",
      },
      {
        icon: <BriefcaseIcon {...icon} />,
        name: "services",
        path: "/services",
        element: <Services />,
        permission: "view-services",
      },
      {
        icon: <UsersIcon {...icon} />,
        name: "staff",
        path: "/staff",
        element: <Staff />,
        permission: "view-staff",
      },
    ],
  },
  {
    title: "doctor menu",
    layout: "dashboard",
    pages: [
      {
        icon: <ClipboardDocumentListIcon {...icon} />,
        name: "prescriptions",
        path: "/prescriptions",
        element: <Prescriptions />,
        permission: "view-prescriptions",
      },
      // {
      //   icon: <PlusIcon {...icon} />,
      //   name: "medical records",
      //   path: "/medical-records",
      //   element: <MedicalRecords />,
      //   permission: "view-medical-records",
      // },
      {
        icon: <DocumentChartBarIcon {...icon} />,
        name: "patient reports",
        path: "/patient-reports",
        element: <PatientReports />,
        permission: "view-patient-reports",
      },
    ],
  },
  {
    title: "staff menu",
    layout: "dashboard",
    pages: [
      {
        icon: <ListBulletIcon {...icon} />,
        name: "manage bills",
        path: "/bills",
        element: <Bills />,
        permission: "view-bills",
      },
      {
        icon: <BeakerIcon {...icon} />,
        name: "medicines",
        path: "/medicines",
        element: <Medicines />,
        permission: "view-medicines",
      },
      {
        icon: <UserIcon {...icon} />,
        name: "doctors",
        path: "/doctors",
        element: <Doctors />,
        permission: "view-doctors",
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
        permission: "view-gallery",
      },
      {
        icon: <ChatBubbleLeftRightIcon {...icon} />,
        name: "testimonials",
        path: "/testimonials",
        element: <Testimonials />,
        permission: "view-testimonials",
      },
      {
        icon: <QuestionMarkCircleIcon {...icon} />,
        name: "faq",
        path: "/faq",
        element: <FAQ />,
        permission: "view-faq",
      },
      {
        icon: <EnvelopeIcon {...icon} />,
        name: "contact inquiries",
        path: "/contact-inquiries",
        element: <ContactInquiries />,
        permission: "view-contact-inquiries",
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "health packages",
        path: "/health-packages",
        element: <HealthPackages />,
        permission: "view-health-packages",
      },
      {
        icon: <HomeModernIcon {...icon} />,
        name: "home care",
        path: "/home-care",
        element: <HomeCare />,
        permission: "view-services", // Using general view-services for now
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
        permission: "view-billing-finance",
      },
      {
        icon: <CubeIcon {...icon} />,
        name: "inventory",
        path: "/inventory",
        element: <Inventory />,
        permission: "view-inventory",
      },
      {
        icon: <LinkIcon {...icon} />,
        name: "integrations",
        path: "/integrations",
        element: <Integrations />,
        permission: "view-settings",
      },
    ],
  },
  {
    title: "reports & settings",
    layout: "dashboard",
    pages: [
      {
        icon: <Cog6ToothIcon {...icon} />,
        name: "settings",
        path: "/settings",
        element: <Settings />,
        permission: "view-settings",
      },
    ],
  },
  {
    title: "coming soon",
    layout: "dashboard",
    pages: [
      {
        icon: <ChartBarIcon {...icon} />,
        name: "reports",
        path: "/reports",
        element: <Reports />,
        permission: "view-reports",
      },
      {
        icon: <BeakerIcon {...icon} />,
        name: "pharmacy",
        path: "/pharmacy",
        element: <Pharmacy />,
        permission: "view-pharmacy",
      },
      {
        icon: <BeakerIcon {...icon} />,
        name: "laboratory",
        path: "/laboratory",
        element: <Laboratory />,
        permission: "view-laboratory",
      },
      {
        icon: <HomeModernIcon {...icon} />,
        name: "rooms & beds",
        path: "/rooms",
        element: <Rooms />,
        permission: "view-rooms",
      },
      {
        icon: <ClockIcon {...icon} />,
        name: "schedules",
        path: "/schedules",
        element: <Schedules />,
        permission: "view-schedules",
      },
      {
        icon: <ExclamationTriangleIcon {...icon} />,
        name: "emergency",
        path: "/emergency",
        element: <Emergency />,
        permission: "view-emergency",
      },
    ],
  },
  {
    title: "role & permission management",
    layout: "dashboard",
    pages: [
      {
        icon: <ShieldCheckIcon {...icon} />,
        name: "roles",
        path: "/roles",
        element: <Roles />,
        permission: "view-roles",
      },
      {
        icon: <KeyIcon {...icon} />,
        name: "permissions",
        path: "/permissions",
        element: <Permissions />,
        permission: "view-permissions",
      },
      {
        icon: <ServerStackIcon {...icon} />,
        name: "role permissions",
        path: "/role-permissions",
        element: <RolePermissions />,
        permission: "manage-roles",
      },
      {
        icon: <UsersIcon {...icon} />,
        name: "user roles",
        path: "/user-roles",
        element: <UserRoles />,
        permission: "assign-roles",
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
        // Profile is accessible to all authenticated users
      },
      {
        icon: <BellIcon {...icon} />,
        name: "notifications",
        path: "/notifications",
        element: <Notifications />,
        permission: "view-notifications",
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
    ],
  },
];

export default routes;
