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
  ExclamationTriangleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  UserCircleIcon,
  BellIcon,
  ClipboardDocumentListIcon,
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
  PatientReports,
  HealthPackages,
  HomeCare,
  Integrations,
  EmailTemplates,
  MedicalRecords,
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
import Emergency from "@/pages/dashboard/emergency";
import NotificationDetails from "@/pages/dashboard/notification-details";
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
  hidden?: boolean; // Whether to hide from sidebar
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
        name: "Dashboard",
        path: "/home",
        element: <Home />,
        permission: "view-dashboard",
      },
    ],
  },
  {
    title: "Patient Care Management",
    layout: "dashboard",
    pages: [
      {
        icon: <CalendarDaysIcon {...icon} />,
        name: "Appointments",
        path: "/appointments",
        element: <Appointments />,
        permission: "view-appointments",
      },
      {
        icon: <UserGroupIcon {...icon} />,
        name: "Patients",
        path: "/patients",
        element: <Patients />,
        permission: "view-patients",
      },
      {
        icon: <ClipboardDocumentListIcon {...icon} />,
        name: "Prescriptions",
        path: "/prescriptions",
        element: <Prescriptions />,
        permission: "view-prescriptions",
      },
      {
        icon: <DocumentChartBarIcon {...icon} />,
        name: "Patient Reports",
        path: "/patient-reports",
        element: <PatientReports />,
        permission: "view-patient-reports",
      },
      {
        icon: <ClipboardDocumentListIcon {...icon} />,
        name: "Medical Records",
        path: "/medical-records",
        element: <MedicalRecords />,
        permission: "view-medical-records",
      },
    ],
  },
  {
    title: "Hospital Administration",
    layout: "dashboard",
    pages: [
      {
        icon: <UserIcon {...icon} />,
        name: "Doctors",
        path: "/doctors",
        element: <Doctors />,
        permission: "view-doctors",
      },
      {
        icon: <UsersIcon {...icon} />,
        name: "Staff",
        path: "/staff",
        element: <Staff />,
        permission: "view-staff",
      },
      {
        icon: <BuildingOfficeIcon {...icon} />,
        name: "Departments",
        path: "/departments",
        element: <Departments />,
        permission: "view-departments",
      },
      {
        icon: <BriefcaseIcon {...icon} />,
        name: "Services",
        path: "/services",
        element: <Services />,
        permission: "view-services",
      },
      {
        icon: <HomeModernIcon {...icon} />,
        name: "Rooms & Beds",
        path: "/rooms",
        element: <Rooms />,
        permission: "view-rooms",
      },
      {
        icon: <ExclamationTriangleIcon {...icon} />,
        name: "Emergency",
        path: "/emergency",
        element: <Emergency />,
        permission: "view-emergency",
      },
    ],
  },
  {
    title: "Pharmacy & Laboratory",
    layout: "dashboard",
    pages: [
      {
        icon: <BeakerIcon {...icon} />,
        name: "Pharmacy",
        path: "/pharmacy",
        element: <Pharmacy />,
        permission: "view-pharmacy",
      },
      {
        icon: <BeakerIcon {...icon} />,
        name: "Laboratory",
        path: "/laboratory",
        element: <Laboratory />,
        permission: "view-laboratory",
      },
    ],
  },
  {
    title: "Billing & Supply Chain",
    layout: "dashboard",
    pages: [
      {
        icon: <CurrencyDollarIcon {...icon} />,
        name: "Billing & Finance",
        path: "/billing",
        element: <Billing />,
        permission: "view-billing-finance",
      },
      {
        icon: <CubeIcon {...icon} />,
        name: "Inventory",
        path: "/inventory",
        element: <Inventory />,
        permission: "view-inventory",
      },
    ],
  },
  {
    title: "Digital Hospital Services",
    layout: "dashboard",
    pages: [
      {
        icon: <HomeModernIcon {...icon} />,
        name: "Home Care",
        path: "/home-care",
        element: <HomeCare />,
        permission: "view-services",
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "Health Packages",
        path: "/health-packages",
        element: <HealthPackages />,
        permission: "view-health-packages",
      },
      {
        icon: <LinkIcon {...icon} />,
        name: "Integrations",
        path: "/integrations",
        element: <Integrations />,
        permission: "view-settings",
      },
    ],
  },
  {
    title: "Website & Communication",
    layout: "dashboard",
    pages: [
      {
        icon: <PhotoIcon {...icon} />,
        name: "Gallery",
        path: "/gallery",
        element: <Gallery />,
        permission: "view-gallery",
      },
      {
        icon: <ChatBubbleLeftRightIcon {...icon} />,
        name: "Testimonials",
        path: "/testimonials",
        element: <Testimonials />,
        permission: "view-testimonials",
      },
      {
        icon: <QuestionMarkCircleIcon {...icon} />,
        name: "FAQs",
        path: "/faq",
        element: <FAQ />,
        permission: "view-faq",
      },
      {
        icon: <EnvelopeIcon {...icon} />,
        name: "Contact Inquiries",
        path: "/contact-inquiries",
        element: <ContactInquiries />,
        permission: "view-contact-inquiries",
      },
      {
        icon: <EnvelopeIcon {...icon} />,
        name: "Email Templates",
        path: "/email-templates",
        element: <EmailTemplates />,
        permission: "view-email-templates",
      },
    ],
  },
  {
    title: "Reports & System Settings",
    layout: "dashboard",
    pages: [
      {
        icon: <ChartBarIcon {...icon} />,
        name: "Reports",
        path: "/reports",
        element: <Reports />,
        permission: "view-reports",
      },
      {
        icon: <Cog6ToothIcon {...icon} />,
        name: "Settings",
        path: "/settings",
        element: <Settings />,
        permission: "view-settings",
      },
    ],
  },
  {
    title: "Access Control",
    layout: "dashboard",
    pages: [
      {
        icon: <ShieldCheckIcon {...icon} />,
        name: "Roles",
        path: "/roles",
        element: <Roles />,
        permission: "view-roles",
      },
      {
        icon: <KeyIcon {...icon} />,
        name: "Permissions",
        path: "/permissions",
        element: <Permissions />,
        permission: "view-permissions",
      },
      {
        icon: <ServerStackIcon {...icon} />,
        name: "Role Permissions",
        path: "/role-permissions",
        element: <RolePermissions />,
        permission: "manage-roles",
      },
      {
        icon: <UsersIcon {...icon} />,
        name: "User Roles",
        path: "/user-roles",
        element: <UserRoles />,
        permission: "assign-roles",
      },
    ],
  },
  {
    title: "Account",
    layout: "dashboard",
    pages: [
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Profile",
        path: "/profile",
        element: <Profile />,
        // Profile is accessible to all authenticated users
      },
      {
        icon: <BellIcon {...icon} />,
        name: "Notifications",
        path: "/notifications",
        element: <Notifications />,
        permission: "view-notifications",
      },
      {
        icon: <BellIcon {...icon} />,
        name: "Notification Details",
        path: "/notifications/:id",
        element: <NotificationDetails />,
        hidden: true,
      },
    ],
  },
  {
    title: "Authentication",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "Sign In",
        path: "/sign-in",
        element: <SignIn />,
      },
    ],
  },
];

export default routes;
