/* eslint-disable @typescript-eslint/no-explicit-any */
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { adminNavItems } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  
  Square, // Keep Square as it's used in statsInfo
  Search as SearchIcon,
  MoreVertical,
  Eye,
  Users,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStats, useAllUsers, useUpdateUserStatus, useDeleteUser, useUpdateUser } from "@/hooks/useAdmin";
import { showToast } from "@/lib/toast";

type ConfirmAction = {
  type: 'suspend' | 'delete' | 'makeAdmin' | 'makeUser';
  userId: string;
  userName: string;
  currentState?: boolean;
} | null;

export function UserManagement() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState<'date'>('date');
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const { data: statsData, isLoading: statsLoading } = useUserStats();
  const { data: usersData, isLoading: usersLoading } = useAllUsers(page, 20, search, "all");
  const updateUserStatusMutation = useUpdateUserStatus();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  let users = (usersData?.data?.users || []) as any[];
  const pagination = usersData?.data?.pagination;

  // Sort users based on selected criteria
  users = [...users];
  // Note: Sorting by date is handled by backend or default sort order


  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    try {
      switch (confirmAction.type) {
        case 'suspend':
          await updateUserStatusMutation.mutateAsync({
            userId: confirmAction.userId,
            isActive: !confirmAction.currentState,
          });
          showToast.success(`User ${confirmAction.currentState ? 'suspended' : 'activated'} successfully`);
          break;
        case 'delete':
          await deleteUserMutation.mutateAsync(confirmAction.userId);
          showToast.success('User deleted successfully');
          break;
        case 'makeAdmin':
          await updateUserMutation.mutateAsync({
            userId: confirmAction.userId,
            data: { role: 'admin' },
          });
          showToast.success(`User ${confirmAction.userName} is now an Admin`);
          break;
        case 'makeUser':
          await updateUserMutation.mutateAsync({
            userId: confirmAction.userId,
            data: { role: 'user' },
          });
          showToast.success(`User ${confirmAction.userName} is now a standard User`);
          break;
      }
      setConfirmAction(null);
    } catch (error) {
      showToast.error('Action failed', error instanceof Error ? error.message : 'Please try again');
    }
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const statsInfo = statsData?.data ? [
    {
      label: "Total Users",
      value: (statsData.data.totalUsers || 0).toLocaleString(),
      change: `${statsData.data.totalUsersGrowth || '+0'} vs last month`,
      icon: Users,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      label: "Active Users",
      value: (statsData.data.activeUsers || 0).toLocaleString(),
      change: "Active in the last 30 days",
      icon: Users,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      label: "New Users Today",
      value: (statsData.data.newUsersToday || 0).toLocaleString(),
      change: "Joined today",
      icon: Square,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    
  ] : [];

  return (
    <>
      {/* Confirmation Dialog */}
      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              {confirmAction?.type === 'delete' && (
                <>Are you sure you want to delete <strong>{confirmAction.userName}</strong>? This action cannot be undone.</>
              )}
              {confirmAction?.type === 'suspend' && (
                <>Are you sure you want to {confirmAction.currentState ? 'suspend' : 'activate'} <strong>{confirmAction.userName}</strong>?</>
              )}
              {confirmAction?.type === 'makeAdmin' && (
                <>Are you sure you want to promote <strong>{confirmAction.userName}</strong> to <strong>Admin</strong>? This will give them full access to the system.</>
              )}
              {confirmAction?.type === 'makeUser' && (
                <>Are you sure you want to demote <strong>{confirmAction.userName}</strong> to a standard <strong>User</strong>? They will lose all administrative access.</>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmAction(null)}
              disabled={updateUserStatusMutation.isPending || updateUserMutation.isPending || deleteUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              disabled={updateUserStatusMutation.isPending || updateUserMutation.isPending || deleteUserMutation.isPending}
              className={confirmAction?.type === 'delete' ? 'bg-red-600 hover:bg-red-700 cursor-pointer' : 'cursor-pointer'}
            >
              {(updateUserStatusMutation.isPending || updateUserMutation.isPending || deleteUserMutation.isPending) ? (
                <>
                  <Loader size="sm" className="mr-2" />
                  Processing...
                </>
              ) : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DashboardLayout title="Admin Dashboard" navItems={adminNavItems}>
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {statsLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-lg" />
                ))}
              </>
            ) : (
              statsInfo.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-bold text-gray-900">
                          {stat.value}
                        </h3>
                      </div>
                      <div className={`${stat.iconBg} p-3 rounded-lg`}>
                        <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">{stat.change}</p>
                  </div>
                );
              })
            )}
          </div>

          {/* User Management Section */}
          <div className="bg-white rounded-lg p-4 sm:p-6">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  User Management
                </h1>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Search Bar */}
                  <div className="flex gap-2 flex-1">
                    <Input
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="flex-1"
                    />
                    <Button onClick={handleSearch} variant="outline" className="cursor-pointer">
                      <SearchIcon className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Status Filter */}
                  {/* <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPage(1);
                      }}
                      className="w-full sm:w-auto flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors appearance-none pr-8 cursor-pointer"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-500" />
                  </div> */}

                  {/* Sort By */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'date')}
                      className="w-full sm:w-auto flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors appearance-none pr-8 cursor-pointer"
                    >
                      <option value="date">Date (Newest)</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-500" />
                  </div>
                </div>
              </div>

              {/* User Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-[calc(100vh-500px)]">
                  <table className="w-full">
                    {/* Table Header */}
                    <thead className="bg-white border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          User
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          Phone
                        </th>
                        {/* <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          Status
                        </th> */}
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          Joined Date
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody className="bg-white">
                      {usersLoading ? (
                        <>
                          {[1, 2, 3, 4, 5].map((i) => (
                            <tr key={i} className="border-b border-gray-200">
                              <td className="px-6 py-4" colSpan={6}>
                                <Skeleton className="h-12 w-full" />
                              </td>
                            </tr>
                          ))}
                        </>
                      ) : users.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                            No users found
                          </td>
                        </tr>
                      ) : (
                        (users as any[]).filter((user) => user && user.id).map((user) => {
                          const initials = (user.name || "U")
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2);

                          return (
                            <tr
                              key={user.id}
                              className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  {user.profileImage ? (
                                    <img
                                      src={user.profileImage}
                                      alt={user.name}
                                      className="w-10 h-10 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">
                                      {initials}
                                    </div>
                                  )}
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm text-gray-900 font-medium">
                                        {user.name}
                                      </p>
                                      <span 
                                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                          user.role === 'admin' 
                                            ? 'bg-purple-100 text-purple-700' 
                                            : user.role === 'vendor'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-gray-100 text-gray-700'
                                        }`}
                                      >
                                        {user.role}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-900">{user.phone}</span>
                              </td>
                              {/* <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`text-sm font-medium ${user.status === "Active"
                                    ? "text-green-600"
                                    : "text-red-600"
                                    }`}
                                >
                                  {user.status}
                                </span>
                              </td> */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-900">{user.joinedDate}</span>
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="cursor-pointer">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem
                                      onClick={() => navigate(`/admin/users/${user.id}`)}
                                      className="cursor-pointer"
                                    >
                                      <Eye className="w-4 h-4 mr-2" />
                                      View Profile
                                    </DropdownMenuItem>

                                    {user.role !== 'admin' ? (
                                      <DropdownMenuItem
                                        onClick={() => setConfirmAction({
                                          type: 'makeAdmin',
                                          userId: user.id,
                                          userName: user.name
                                        })}
                                        className="cursor-pointer text-primary"
                                      >
                                        <Shield className="w-4 h-4 mr-2" />
                                        Make Admin
                                      </DropdownMenuItem>
                                    ) : (
                                      <DropdownMenuItem
                                        onClick={() => setConfirmAction({
                                          type: 'makeUser',
                                          userId: user.id,
                                          userName: user.name
                                        })}
                                        className="cursor-pointer text-orange-600"
                                      >
                                        <Users className="w-4 h-4 mr-2" />
                                        Make User
                                      </DropdownMenuItem>
                                    )}
                                    {/* <DropdownMenuItem
                                      onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                                      className="cursor-pointer"
                                    >
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit Profile
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator /> */}
                                    {/* <DropdownMenuItem
                                      onClick={() => setConfirmAction({
                                        type: 'suspend',
                                        userId: user.id,
                                        userName: user.name,
                                        currentState: user.status === 'Active'
                                      })}
                                      className="cursor-pointer"
                                    >
                                      <Ban className="w-4 h-4 mr-2" />
                                      {user.status === 'Active' ? 'Suspend' : 'Activate'}
                                    </DropdownMenuItem> */}
                                    {/* <DropdownMenuItem
                                      onClick={() => setConfirmAction({
                                        type: 'delete',
                                        userId: user.id,
                                        userName: user.name
                                      })}
                                      className="text-red-600 cursor-pointer"
                                    >
                                      <Trash className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem> */}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="p-4 flex items-center justify-between border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Showing {users.length} of {pagination.totalResults} users
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                      >
                        Previous
                      </Button>
                      <span className="px-4 py-2 text-sm text-gray-700">
                        Page {page} of {pagination.totalPages}
                      </span>
                      <Button
                        onClick={() => setPage(page + 1)}
                        disabled={page >= pagination.totalPages}
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
