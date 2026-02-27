import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Typography,
  Switch,
  Button,
  Progress,
  Chip,
  Input,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from "@material-tailwind/react";
import {
  BellIcon,
  CircleStackIcon,
  EnvelopeIcon,
  ArrowDownTrayIcon,
  PaperAirplaneIcon,
  ShieldExclamationIcon,
  Cog6ToothIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import apiService from "@/services/api";

type GeneralForm = {
  hospital_name: string;
  contact_email: string;
  phone: string;
  address: string;
  working_hours: string;
};

export default function Settings(): JSX.Element {
  const { showToast } = useToast();
  const { hasPermission } = useAuth();

  const [activeTab, setActiveTab] = useState<string>("general");

  const [general, setGeneral] = useState<GeneralForm>({
    hospital_name: "",
    contact_email: "",
    phone: "",
    address: "",
    working_hours: "",
  });
  const [generalLoaded, setGeneralLoaded] = useState(false);
  const [generalSaving, setGeneralSaving] = useState(false);

  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationLoaded, setNotificationLoaded] = useState(false);
  const [testNotificationLoading, setTestNotificationLoading] = useState(false);

  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState<boolean>(true);
  const [emailNotificationLoading, setEmailNotificationLoading] = useState(false);
  const [emailNotificationLoaded, setEmailNotificationLoaded] = useState(false);

  const [backupLoading, setBackupLoading] = useState(false);
  const [backupProgress, setBackupProgress] = useState<number | null>(null);
  const canManage = hasPermission("manage-settings");

  useEffect(() => {
    loadGeneralSettings();
    loadNotificationSetting();
    loadEmailNotificationSetting();
  }, []);

  async function loadGeneralSettings() {
    try {
      const res = await apiService.getGeneralSettings();
      if (res.status && res.data) {
        setGeneral({
          hospital_name: res.data.hospital_name ?? "",
          contact_email: res.data.contact_email ?? "",
          phone: res.data.phone ?? "",
          address: res.data.address ?? "",
          working_hours: res.data.working_hours ?? "",
        });
      }
    } catch (_) {
      showToast("Failed to load general settings", "error");
    } finally {
      setGeneralLoaded(true);
    }
  }

  async function handleSaveGeneralSettings() {
    if (!canManage) return;
    setGeneralSaving(true);
    try {
      const res = await apiService.updateGeneralSettings(general);
      if (res.status && res.data) {
        setGeneral({
          hospital_name: res.data.hospital_name ?? "",
          contact_email: res.data.contact_email ?? "",
          phone: res.data.phone ?? "",
          address: res.data.address ?? "",
          working_hours: res.data.working_hours ?? "",
        });
        showToast(res.message ?? "General settings saved", "success");
      } else {
        showToast("Failed to save general settings", "error");
      }
    } catch (e: any) {
      showToast(e?.message || "Failed to save general settings", "error");
    } finally {
      setGeneralSaving(false);
    }
  }

  async function loadNotificationSetting() {
    try {
      const res = await apiService.getNotificationCenterSetting();
      if (res.status && res.data?.enabled !== undefined) {
        setNotificationsEnabled(res.data.enabled);
      }
    } catch (_) {
      showToast("Failed to load notification setting", "error");
    } finally {
      setNotificationLoaded(true);
    }
  }

  async function loadEmailNotificationSetting() {
    try {
      const res = await apiService.getEmailNotificationSetting();
      if (res.status && res.data?.enabled !== undefined) {
        setEmailNotificationsEnabled(res.data.enabled);
      }
    } catch (_) {
      showToast("Failed to load email notification setting", "error");
    } finally {
      setEmailNotificationLoaded(true);
    }
  }

  async function handleNotificationToggle(enabled: boolean) {
    if (!canManage) return;
    setNotificationLoading(true);
    try {
      const res = await apiService.updateNotificationCenterSetting({ enabled });
      if (res.status && res.data?.enabled !== undefined) {
        setNotificationsEnabled(res.data.enabled);
        showToast(
          res.data.enabled ? "Notifications enabled" : "Notifications disabled",
          "success"
        );
      } else {
        showToast("Failed to update setting", "error");
      }
    } catch (e: any) {
      showToast(e?.message || "Failed to update setting", "error");
    } finally {
      setNotificationLoading(false);
    }
  }

  async function handleEmailNotificationToggle(enabled: boolean) {
    if (!canManage) return;
    setEmailNotificationLoading(true);
    try {
      const res = await apiService.updateEmailNotificationSetting({ enabled });
      if (res.status && res.data?.enabled !== undefined) {
        setEmailNotificationsEnabled(res.data.enabled);
        showToast(
          res.data.enabled ? "Email notifications enabled" : "Email notifications disabled",
          "success"
        );
      } else {
        showToast("Failed to update email setting", "error");
      }
    } catch (e: any) {
      showToast(e?.message || "Failed to update email setting", "error");
    } finally {
      setEmailNotificationLoading(false);
    }
  }

  async function handleSendTestNotification() {
    setTestNotificationLoading(true);
    try {
      const res = await apiService.sendTestNotification();
      if (res.status && res.message) {
        showToast(res.message, "success");
      } else {
        showToast("Test sent. Check notifications and admin inbox if email is on.", "success");
      }
    } catch (e: any) {
      showToast(e?.message || "Failed to send test notification", "error");
    } finally {
      setTestNotificationLoading(false);
    }
  }

  async function handleDownloadBackup() {
    if (!canManage) return;
    setBackupLoading(true);
    setBackupProgress(0);
    try {
      await apiService.downloadDatabaseBackup((percent) => setBackupProgress(percent));
      showToast("Database backup downloaded", "success");
    } catch (e: any) {
      showToast(e?.message || "Backup download failed", "error");
    } finally {
      setBackupLoading(false);
      setBackupProgress(null);
    }
  }

  return (
    <div className="min-h-screen relative">
      {/* Subtle background accent */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-400/5 blur-3xl" />
        <div className="absolute top-1/2 -left-20 h-72 w-72 rounded-full bg-indigo-400/5 blur-3xl" />
      </div>

      <div className="relative">
        {/* Page header */}
        <header className="mb-10 md:mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
              <Cog6ToothIcon className="h-6 w-6" strokeWidth={2} />
            </div>
            <div>
              <Typography variant="h3" className="font-bold text-blue-gray-900 tracking-tight">
                Settings
              </Typography>
              <Typography variant="small" className="text-blue-gray-500 font-medium">
                Control center
              </Typography>
            </div>
          </div>
          <Typography variant="paragraph" className="mt-2 text-blue-gray-600 max-w-2xl leading-relaxed">
            Configure hospital settings, notifications, email delivery, and backups. Changes take effect immediately.
          </Typography>
        </header>

        {/* Permission notice */}
        {!canManage && (
          <div className="mb-6 flex items-start gap-4 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50/50 px-5 py-4 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <ShieldExclamationIcon className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <Typography variant="small" className="font-bold text-amber-900">
                View only
              </Typography>
              <Typography variant="small" className="text-amber-800/90 mt-1 leading-relaxed">
                You need <span className="font-semibold text-amber-900">manage-settings</span> permission to change any setting or download backups.
              </Typography>
            </div>
          </div>
        )}

        {/* System Settings bar */}
        <div className="mb-0 rounded-t-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 shadow-lg">
          <Typography variant="h6" className="font-bold text-white tracking-wide">
            System Settings
          </Typography>
        </div>

        <Tabs value={activeTab} className="mt-0">
          <TabsHeader className="rounded-none border-x border-b border-blue-gray-100 bg-blue-gray-50/50 p-0 overflow-x-auto">
            <Tab
              value="general"
              onClick={() => setActiveTab("general")}
              className={`py-4 px-6 font-bold text-sm tracking-wide transition-colors ${activeTab === "general" ? "text-blue-600 border-b-2 border-blue-600 bg-white shadow-sm" : "text-blue-gray-600 hover:text-blue-700"}`}
            >
              General
            </Tab>
            <Tab
              value="notifications"
              onClick={() => setActiveTab("notifications")}
              className={`py-4 px-6 font-bold text-sm tracking-wide transition-colors ${activeTab === "notifications" ? "text-blue-600 border-b-2 border-blue-600 bg-white shadow-sm" : "text-blue-gray-600 hover:text-blue-700"}`}
            >
              Notifications
            </Tab>
            <Tab
              value="backup"
              onClick={() => setActiveTab("backup")}
              className={`py-4 px-6 font-bold text-sm tracking-wide transition-colors ${activeTab === "backup" ? "text-blue-600 border-b-2 border-blue-600 bg-white shadow-sm" : "text-blue-gray-600 hover:text-blue-700"}`}
            >
              Backup
            </Tab>
          </TabsHeader>

          <TabsBody className="rounded-b-2xl border border-t-0 border-blue-gray-100 bg-white shadow-xl shadow-blue-gray-900/5">
            {/* General tab */}
            <TabPanel value="general" className="p-6 md:p-8">
              <div className="max-w-2xl space-y-6">
                {generalLoaded ? (
                  <>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
                        <BuildingOffice2Icon className="h-6 w-6" strokeWidth={2} />
                      </div>
                      <div>
                        <Typography variant="h5" className="font-bold text-blue-gray-900">
                          Hospital information
                        </Typography>
                        <Typography variant="small" className="text-blue-gray-500">
                          Basic contact and business details
                        </Typography>
                      </div>
                    </div>
                    <Input
                      label="Hospital Name"
                      value={general.hospital_name}
                      onChange={(e) => setGeneral((g) => ({ ...g, hospital_name: e.target.value }))}
                      disabled={!canManage}
                      className="font-medium"
                      crossOrigin={undefined}
                    />
                    <Input
                      label="Email"
                      type="email"
                      value={general.contact_email}
                      onChange={(e) => setGeneral((g) => ({ ...g, contact_email: e.target.value }))}
                      disabled={!canManage}
                      className="font-medium"
                      crossOrigin={undefined}
                    />
                    <Input
                      label="Phone"
                      value={general.phone}
                      onChange={(e) => setGeneral((g) => ({ ...g, phone: e.target.value }))}
                      disabled={!canManage}
                      className="font-medium"
                      crossOrigin={undefined}
                    />
                    <Input
                      label="Address"
                      value={general.address}
                      onChange={(e) => setGeneral((g) => ({ ...g, address: e.target.value }))}
                      disabled={!canManage}
                      className="font-medium"
                      crossOrigin={undefined}
                    />
                    <Input
                      label="Working Hours"
                      value={general.working_hours}
                      onChange={(e) => setGeneral((g) => ({ ...g, working_hours: e.target.value }))}
                      disabled={!canManage}
                      className="font-medium"
                      crossOrigin={undefined}
                    />
                    {canManage && (
                      <Button
                        color="blue"
                        size="md"
                        className="mt-4 shadow-md shadow-blue-500/25"
                        onClick={handleSaveGeneralSettings}
                        disabled={generalSaving}
                      >
                        {generalSaving ? (
                          <>
                            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                            Saving…
                          </>
                        ) : (
                          "Save settings"
                        )}
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                  </div>
                )}
              </div>
            </TabPanel>

            {/* Notifications tab */}
            <TabPanel value="notifications" className="p-0">
              <Card className="overflow-hidden border-0 shadow-none rounded-none">
            <div className="relative border-b border-blue-gray-100/80 bg-gradient-to-br from-blue-50 via-indigo-50/30 to-white px-6 py-6 md:px-8 md:py-7">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.08),transparent)]" />
              <div className="relative flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
                    <BellIcon className="h-7 w-7" strokeWidth={2} />
                  </div>
                  <div>
                    <Typography variant="h5" className="font-bold text-blue-gray-900">
                      Notifications
                    </Typography>
                    <Typography variant="small" className="text-blue-gray-500 mt-1 font-medium">
                      In-app alerts and email delivery
                    </Typography>
                  </div>
                </div>
                {notificationLoaded && (
                  <Chip
                    size="sm"
                    value={notificationsEnabled ? "Active" : "Paused"}
                    color={notificationsEnabled ? "green" : "gray"}
                    className="font-semibold shadow-sm"
                  />
                )}
              </div>
            </div>
            <CardBody className="p-6 md:p-8 bg-white">
              <div className="space-y-6">
                {/* In-app row */}
                <div className="group flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-blue-gray-50/50 hover:bg-blue-gray-50/80 p-5 transition-colors duration-200 sm:gap-6">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-100/90 transition-colors">
                        <BellIcon className="h-5 w-5" strokeWidth={2} />
                      </div>
                      <div>
                        <Typography variant="h6" className="font-bold text-blue-gray-900">
                          In-app notifications
                        </Typography>
                        <Typography variant="small" className="text-blue-gray-500 mt-0.5">
                          In-app and broadcast alerts
                        </Typography>
                      </div>
                    </div>
                  </div>
                  {notificationLoaded ? (
                    <div className="flex items-center gap-3 shrink-0 pl-2">
                      <Switch
                        checked={notificationsEnabled}
                        onChange={(e) => handleNotificationToggle((e.target as HTMLInputElement).checked)}
                        disabled={!canManage || notificationLoading}
                        color="blue"
                        className="checked:bg-blue-600"
                        crossOrigin={undefined}
                      />
                      <Typography variant="small" className="font-bold text-blue-gray-700 w-10">
                        {notificationsEnabled ? "On" : "Off"}
                      </Typography>
                    </div>
                  ) : (
                    <div className="h-11 w-28 rounded-xl bg-blue-gray-200/60 animate-pulse shrink-0" />
                  )}
                </div>

                {/* Email row */}
                <div className="group flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-blue-gray-50/50 hover:bg-blue-gray-50/80 p-5 transition-colors duration-200 sm:gap-6">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 group-hover:bg-indigo-100/90 transition-colors">
                        <EnvelopeIcon className="h-5 w-5" strokeWidth={2} />
                      </div>
                      <div>
                        <Typography variant="h6" className="font-bold text-blue-gray-900">
                          Email notifications
                        </Typography>
                        <Typography variant="small" className="text-blue-gray-500 mt-0.5">
                          Welcome, credentials, and updates
                        </Typography>
                      </div>
                    </div>
                  </div>
                  {emailNotificationLoaded ? (
                    <div className="flex items-center gap-3 shrink-0 pl-2">
                      <Switch
                        checked={emailNotificationsEnabled}
                        onChange={(e) => handleEmailNotificationToggle((e.target as HTMLInputElement).checked)}
                        disabled={!canManage || emailNotificationLoading}
                        color="blue"
                        className="checked:bg-blue-600"
                        crossOrigin={undefined}
                      />
                      <Typography variant="small" className="font-bold text-blue-gray-700 w-10">
                        {emailNotificationsEnabled ? "On" : "Off"}
                      </Typography>
                    </div>
                  ) : (
                    <div className="h-11 w-28 rounded-xl bg-blue-gray-200/60 animate-pulse shrink-0" />
                  )}
                </div>

                {/* Test notification */}
                <div className="relative overflow-hidden rounded-2xl border border-blue-200/60 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 p-5 shadow-inner">
                  <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-blue-100/20 to-transparent pointer-events-none" />
                  <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <Typography variant="small" className="font-bold text-blue-gray-900">
                        Send test notification
                      </Typography>
                      <Typography variant="small" className="text-blue-gray-600 mt-1">
                        Sends an in-app notification to you (when on) and a test email to all admins (when email is on).
                      </Typography>
                    </div>
                    <Button
                      size="sm"
                      variant="filled"
                      color="blue"
                      className="flex items-center gap-2 shrink-0 shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30 transition-shadow"
                      onClick={handleSendTestNotification}
                      disabled={testNotificationLoading}
                    >
                      {testNotificationLoading ? (
                        <>
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Sending…
                        </>
                      ) : (
                        <>
                          <PaperAirplaneIcon className="h-4 w-4" />
                          Send test
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardBody>
              </Card>
            </TabPanel>

            {/* Backup tab */}
            <TabPanel value="backup" className="p-0">
              <Card className="overflow-hidden border-0 shadow-none rounded-none">
                <div className="relative border-b border-blue-gray-100/80 bg-gradient-to-br from-indigo-50/80 via-blue-50/50 to-white px-6 py-6 md:px-8 md:py-7">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.06),transparent)]" />
                  <div className="relative flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
                      <CircleStackIcon className="h-7 w-7" strokeWidth={2} />
                    </div>
                    <div>
                      <Typography variant="h5" className="font-bold text-blue-gray-900">
                        Database backup
                      </Typography>
                      <Typography variant="small" className="text-blue-gray-500 mt-1 font-medium">
                        Full SQL dump of all data
                      </Typography>
                    </div>
                  </div>
                </div>
                <CardBody className="p-6 md:p-8 bg-white">
                  <div className="space-y-6">
                    <Typography variant="paragraph" className="text-blue-gray-600 leading-relaxed">
                      Generate and download a complete database backup. The file includes all tables and data in standard SQL format for safe keeping or migration.
                    </Typography>

                    {backupProgress !== null && (
                      <div className="rounded-2xl border border-blue-200/60 bg-gradient-to-r from-blue-50 to-indigo-50/30 p-5 space-y-3 shadow-inner">
                        <div className="flex items-center justify-between">
                          <Typography variant="small" className="font-bold text-blue-800">
                            Downloading backup…
                          </Typography>
                          <Typography variant="small" className="font-black text-blue-700 tabular-nums">
                            {backupProgress}%
                          </Typography>
                        </div>
                        <Progress value={backupProgress} color="blue" className="h-2.5 bg-blue-100" />
                      </div>
                    )}

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 pt-1">
                      <Button
                        color="indigo"
                        size="md"
                        className="flex items-center gap-2.5 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-200"
                        onClick={handleDownloadBackup}
                        disabled={!canManage || backupLoading}
                      >
                        {backupLoading ? (
                          <>
                            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            {backupProgress !== null ? "Downloading…" : "Preparing…"}
                          </>
                        ) : (
                          <>
                            <ArrowDownTrayIcon className="h-5 w-5" />
                            Download backup
                          </>
                        )}
                      </Button>
                      {canManage && (
                        <Typography variant="small" className="text-blue-gray-500">
                          Secure download to your device
                        </Typography>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </TabPanel>
          </TabsBody>
        </Tabs>
      </div>
    </div>
  );
}
