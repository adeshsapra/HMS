import {
  UserGroupIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  UserPlusIcon,
  BuildingOfficeIcon,
  HeartIcon,
  ClockIcon,
  ChartBarIcon,
} from "@heroicons/react/24/solid";

export const statisticsCardsData = [
  {
    color: "blue",
    icon: UserGroupIcon,
    title: "Total Patients",
    value: "2,450",
    footer: {
      color: "text-green-500",
      value: "+12%",
      label: "than last month",
    },
  },
  {
    color: "green",
    icon: CalendarDaysIcon,
    title: "Today's Appointments",
    value: "48",
    footer: {
      color: "text-blue-500",
      value: "+8",
      label: "than yesterday",
    },
  },
  {
    color: "orange",
    icon: CurrencyDollarIcon,
    title: "Today's Revenue",
    value: "$12,450",
    footer: {
      color: "text-green-500",
      value: "+15%",
      label: "than last week",
    },
  },
  {
    color: "purple",
    icon: UserPlusIcon,
    title: "New Patients",
    value: "32",
    footer: {
      color: "text-green-500",
      value: "+5",
      label: "than yesterday",
    },
  },
  {
    color: "pink",
    icon: BuildingOfficeIcon,
    title: "Departments",
    value: "12",
    footer: {
      color: "text-blue-500",
      value: "Active",
      label: "all departments",
    },
  },
  {
    color: "red",
    icon: HeartIcon,
    title: "Doctors",
    value: "45",
    footer: {
      color: "text-green-500",
      value: "38 Available",
      label: "7 on leave",
    },
  },
  {
    color: "teal",
    icon: ClockIcon,
    title: "Pending Appointments",
    value: "15",
    footer: {
      color: "text-yellow-500",
      value: "Needs attention",
      label: "awaiting confirmation",
    },
  },
  {
    color: "indigo",
    icon: ChartBarIcon,
    title: "Monthly Revenue",
    value: "$245,000",
    footer: {
      color: "text-green-500",
      value: "+18%",
      label: "than last month",
    },
  },
];

export default statisticsCardsData;
