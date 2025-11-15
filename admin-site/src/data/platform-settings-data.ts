export interface PlatformSettingsOption {
  checked: boolean;
  label: string;
}

export interface PlatformSettingsData {
  title: string;
  options: PlatformSettingsOption[];
}

export const platformSettingsData: PlatformSettingsData[] = [
  {
    title: "account",
    options: [
      {
        checked: true,
        label: "Email me when someone follows me",
      },
      {
        checked: false,
        label: "Email me when someone answers on my post",
      },
      {
        checked: true,
        label: "Email me when someone mentions me",
      },
    ],
  },
  {
    title: "application",
    options: [
      {
        checked: false,
        label: "New launches and projects",
      },
      {
        checked: true,
        label: "Monthly product updates",
      },
      {
        checked: false,
        label: "Subscribe to newsletter",
      },
    ],
  },
  {
    title: "alerts",
    options: [
      {
        checked: false,
        label: "Email me when someone follows me",
      },
    ],
  },
];

