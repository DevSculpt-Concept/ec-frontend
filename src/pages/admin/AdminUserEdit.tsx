import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { adminNavItems } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { showToast } from "@/lib/toast";
import { useUserDetails, useUpdateUser } from "@/hooks/useAdmin";

export function AdminUserEdit() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const { data: userData, isLoading, isError } = useUserDetails(userId || "");
  const updateUserMutation = useUpdateUser();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    is_active: true,
  });

  // Populate form when data loads
  useEffect(() => {
    if (userData?.data?.user) {
      const user = userData.data.user;
      setFormData({
        full_name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        is_active: user.status === "Active",
      });
    }
  }, [userData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) return;

    try {
      await updateUserMutation.mutateAsync({
        userId,
        data: formData,
      });
      showToast.success("User profile updated successfully");
      navigate(`/admin/users/${userId}`);
    } catch (error) {
      showToast.error("Failed to update user", error instanceof Error ? error.message : "Please try again");
    }
  };

  return (
    <DashboardLayout title="Admin Dashboard" navItems={adminNavItems}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(`/admin/users/${userId}`)}
            className="cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>
        </div>

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        )}

        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700">Failed to load user details</h3>
            <Button
              variant="outline"
              onClick={() => navigate("/admin/users")}
              className="mt-4 cursor-pointer"
            >
              Go Back
            </Button>
          </div>
        )}

        {!isLoading && !isError && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Edit User Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="flex items-center mt-8">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">Active Account</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/admin/users/${userId}`)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="cursor-pointer"
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
