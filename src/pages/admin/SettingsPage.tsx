/* eslint-disable @typescript-eslint/no-explicit-any */
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { adminNavItems } from "@/components/layout/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader } from "@/components/ui/loader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Settings,
  Plus,
  Save,
  Shield,
  UserPlus,
  Mail,
  Phone,
  Lock,
  User,
  Check,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  usePlatformSettings,
  useBulkUpdateSettings,
  useAdminUsers,
  useCreateAdmin,
} from "@/hooks/useAdmin";
import { showToast } from "@/lib/toast";

type TabType = "platform" | "admins" | "emails";

const tabs = [
  { id: "platform" as TabType, label: "Platform Settings", icon: Settings },
  { id: "admins" as TabType, label: "Admin Accounts", icon: Shield },
  { id: "emails" as TabType, label: "Email SMTP Settings", icon: Mail },
];

// Helper to detect input type from value
const detectInputType = (value: string): "boolean" | "number" | "text" => {
  if (value === "true" || value === "false") return "boolean";
  if (!isNaN(Number(value)) && value.trim() !== "" && !value.includes("@") && !value.includes("+")) return "number";
  return "text";
};

// Helper to format setting key for display
const formatSettingKey = (key: string): string => {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("platform");
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [localSettings, setLocalSettings] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [, /* setEditingKey */] = useState<string | null>(null);

  // Admin creation form state
  const [adminForm, setAdminForm] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
  });

  // Fetch data
  const { data: settingsData, isLoading: settingsLoading, refetch: refetchSettings } = usePlatformSettings();
  const { data: adminsData, isLoading: adminsLoading, refetch: refetchAdmins } = useAdminUsers();

  // Mutations
  const bulkUpdateMutation = useBulkUpdateSettings();
  const createAdminMutation = useCreateAdmin();

  const settingsList = settingsData?.data?.settings || [];
  const admins = adminsData?.data?.admins || [];

  // Initialize local settings when data loads
  useEffect(() => {
    if (settingsData?.data?.settings) {
      const initial: Record<string, string> = {};
      settingsData.data.settings.forEach((setting: any) => {
        initial[setting.setting_key] = setting.setting_value;
      });
      setLocalSettings(initial);
      setHasChanges(false);
    }
  }, [settingsData]);

  const handleSettingChange = (key: string, value: string | boolean) => {
    const stringValue = typeof value === "boolean" ? (value ? "true" : "false") : value;
    setLocalSettings((prev) => ({
      ...prev,
      [key]: stringValue,
    }));
    setHasChanges(true);
  };

  const getSettingValue = (key: string): string => {
    if (localSettings[key] && localSettings[key] !== "") return localSettings[key];
    
    // Default values if not in DB
    const defaults: Record<string, string> = {
      smtp_sender_email: "info@curryfabulousfamily.com.ng",
      smtp_sender_name: "Curry Fabulous Family",
      smtp_host: "mail.curryfabulousfamily.com.ng",
      smtp_port: "465",
      smtp_user: "info@curryfabulousfamily.com.ng",
      smtp_pass: "f]yJ!=*Y6bqfJ5@=",
      smtp_min_interval: "60",
      smtp_daily_limit: "30",
    };
    
    return defaults[key] ?? "";
  };

  const getBooleanValue = (key: string): boolean => {
    const val = getSettingValue(key);
    return val === "true" || val === "1";
  };

  const handleSaveAllSettings = async () => {
    try {
      await bulkUpdateMutation.mutateAsync(localSettings);
      showToast.success("Settings saved successfully");
      setHasChanges(false);
      refetchSettings();
    } catch (error) {
      showToast.error("Failed to save settings", error instanceof Error ? error.message : "Please try again");
    }
  };

  const handleCreateAdmin = async () => {
    if (!adminForm.email || !adminForm.password || !adminForm.full_name) {
      showToast.error("Please fill in all required fields");
      return;
    }

    try {
      await createAdminMutation.mutateAsync(adminForm);
      showToast.success("Admin account created successfully");
      setShowCreateAdminModal(false);
      setAdminForm({ email: "", password: "", full_name: "", phone: "" });
      refetchAdmins();
    } catch (error) {
      showToast.error("Failed to create admin", error instanceof Error ? error.message : "Please try again");
    }
  };

  const renderSettingInput = (setting: any) => {
    const inputType = detectInputType(setting.setting_value);
    const value = getSettingValue(setting.setting_key);

    if (inputType === "boolean") {
      return (
        <div className="flex items-center gap-3">
          <Switch
            checked={getBooleanValue(setting.setting_key)}
            onCheckedChange={(checked) => handleSettingChange(setting.setting_key, checked)}
          />
          <span className={`text-sm font-medium ${getBooleanValue(setting.setting_key) ? "text-green-600" : "text-gray-500"}`}>
            {getBooleanValue(setting.setting_key) ? "Enabled" : "Disabled"}
          </span>
        </div>
      );
    }

    if (inputType === "number") {
      return (
        <Input
          type="number"
          value={value}
          onChange={(e) => handleSettingChange(setting.setting_key, e.target.value)}
          className="w-full max-w-xs"
        />
      );
    }

    return (
      <Input
        type="text"
        value={value}
        onChange={(e) => handleSettingChange(setting.setting_key, e.target.value)}
        className="w-full"
      />
    );
  };

  return (
    <DashboardLayout title="Admin Dashboard" navItems={adminNavItems}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
            <p className="text-gray-600 mt-2">
              Manage platform settings and admin accounts
            </p>
          </div>
          {activeTab === "platform" && hasChanges && (
            <Button
              onClick={handleSaveAllSettings}
              disabled={bulkUpdateMutation.isPending}
              className="cursor-pointer"
            >
              {bulkUpdateMutation.isPending ? (
                <Loader size="sm" className="mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Platform Settings Tab */}
        {activeTab === "platform" && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Platform Settings</h2>
                <p className="text-sm text-gray-500 mt-1">
                  All settings are automatically loaded from the database and editable
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchSettings()}
                className="cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            {settingsLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : settingsList.length === 0 ? (
              <div className="p-12 text-center">
                <Settings className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium text-gray-900">No settings found</p>
                <p className="text-sm text-gray-500 mt-1">Settings will appear here once added to the database</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {settingsList.map((setting: any) => (
                  <div
                    key={setting.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">
                            {formatSettingKey(setting.setting_key)}
                          </h3>
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-mono">
                            {setting.setting_key}
                          </span>
                        </div>
                        {setting.description && (
                          <p className="text-sm text-gray-500 mt-1">{setting.description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          Last updated: {new Date(setting.updated_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="lg:w-72 shrink-0">
                        {renderSettingInput(setting)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {hasChanges && (
              <div className="p-4 bg-yellow-50 border-t border-yellow-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-yellow-800">
                    You have unsaved changes
                  </p>
                  <Button
                    onClick={handleSaveAllSettings}
                    disabled={bulkUpdateMutation.isPending}
                    size="sm"
                  >
                    {bulkUpdateMutation.isPending ? "Saving..." : "Save All Changes"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Admin Accounts Tab */}
        {activeTab === "admins" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Admin Accounts</h2>
                  <p className="text-sm text-gray-500 mt-1">Manage administrator accounts for the platform</p>
                </div>
                <Button
                  onClick={() => setShowCreateAdminModal(true)}
                  className="cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Admin
                </Button>
              </div>

              {/* Admins List */}
              {adminsLoading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-lg" />
                  ))}
                </div>
              ) : admins.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium text-gray-900">No admin accounts found</p>
                  <p className="text-sm text-gray-500">Create your first admin account to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                  {admins.map((admin: any) => (
                    <div
                      key={admin.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {admin.profile_image_url ? (
                            <img
                              src={admin.profile_image_url}
                              alt={admin.full_name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <Shield className="w-6 h-6 text-primary" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {admin.full_name}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">{admin.email}</p>
                          {admin.phone && (
                            <p className="text-sm text-gray-500">{admin.phone}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                admin.is_active
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {admin.is_active ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  Active
                                </>
                              ) : (
                                "Inactive"
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-3">
                        Created: {new Date(admin.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Email Settings Tab */}
        {activeTab === "emails" && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Custom SMTP Configuration</h2>
              <p className="text-sm text-gray-500 mt-1">
                Configure your custom SMTP provider to send transactional emails.
              </p>
            </div>

            <div className="p-6 space-y-8">
              {/* Sender Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Sender Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Sender email address</label>
                    <Input 
                      placeholder="noreply@yourdomain.com"
                      value={getSettingValue("smtp_sender_email")}
                      onChange={(e) => handleSettingChange("smtp_sender_email", e.target.value)}
                    />
                    <p className="text-xs text-gray-400">The email address the emails are sent from.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Sender name</label>
                    <Input 
                      placeholder="Your Name"
                      value={getSettingValue("smtp_sender_name")}
                      onChange={(e) => handleSettingChange("smtp_sender_name", e.target.value)}
                    />
                    <p className="text-xs text-gray-400">Name displayed in the recipient's inbox.</p>
                  </div>
                </div>
              </div>

              {/* Server Settings */}
              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">SMTP Provider Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Host</label>
                    <Input 
                      placeholder="e.g. mail.curryfabulousfamily.com.ng"
                      value={getSettingValue("smtp_host")}
                      onChange={(e) => handleSettingChange("smtp_host", e.target.value)}
                    />
                    <p className="text-xs text-gray-400">Hostname or IP address of your SMTP server.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Port Number</label>
                    <Input 
                      type="number"
                      placeholder="465"
                      value={getSettingValue("smtp_port")}
                      onChange={(e) => handleSettingChange("smtp_port", e.target.value)}
                    />
                    <p className="text-xs text-gray-400">Common ports include 465 (SSL) and 587 (TLS).</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Username</label>
                    <Input 
                      placeholder="Username (usually your email)"
                      value={getSettingValue("smtp_user")}
                      onChange={(e) => handleSettingChange("smtp_user", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Password</label>
                    <Input 
                      type="password"
                      placeholder="••••••••"
                      value={getSettingValue("smtp_pass")}
                      onChange={(e) => handleSettingChange("smtp_pass", e.target.value)}
                    />
                    <p className="text-xs text-gray-400">Your SMTP credentials will always be encrypted.</p>
                  </div>
                </div>
              </div>

              {/* Usage Settings */}
              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Email Rate Limits</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Minimum Interval per User (seconds)</label>
                    <Input 
                      type="number"
                      placeholder="60"
                      value={getSettingValue("smtp_min_interval")}
                      onChange={(e) => handleSettingChange("smtp_min_interval", e.target.value)}
                    />
                    <p className="text-xs text-gray-400">Interval between emails to the same user.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Daily Sending Limit</label>
                    <Input 
                      type="number"
                      placeholder="30"
                      value={getSettingValue("smtp_daily_limit")}
                      onChange={(e) => handleSettingChange("smtp_daily_limit", e.target.value)}
                    />
                    <p className="text-xs text-gray-400">The rate limit for sending emails.</p>
                  </div>
                </div>
              </div>

              {/* Save Section */}
              <div className="pt-6 border-t flex justify-end gap-3">
                <Button variant="outline" onClick={() => refetchSettings()}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveAllSettings}
                  disabled={bulkUpdateMutation.isPending || !hasChanges}
                >
                  {bulkUpdateMutation.isPending ? "Saving..." : "Save Email Settings"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Admin Modal */}
      <Dialog open={showCreateAdminModal} onOpenChange={setShowCreateAdminModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Create Admin Account
            </DialogTitle>
            <DialogDescription>
              Create a new administrator account. This account will be auto-verified.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="John Doe"
                  value={adminForm.full_name}
                  onChange={(e) => setAdminForm((prev) => ({ ...prev, full_name: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm((prev) => ({ ...prev, password: e.target.value }))}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="+234 800 000 0000"
                  value={adminForm.phone}
                  onChange={(e) => setAdminForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShowCreateAdminModal(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateAdmin}
              disabled={createAdminMutation.isPending || !adminForm.email || !adminForm.password || !adminForm.full_name}
              className="cursor-pointer"
            >
              {createAdminMutation.isPending ? (
                <>
                  <Loader size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Admin
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
